"""AWS Lambda Handlers for SafetyVision Cloud API."""
import json
import boto3
import os
from datetime import datetime, timedelta
from typing import Dict, Any
import uuid

# Initialize AWS clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')
rds_data = boto3.client('rds-data')
sns = boto3.client('sns')

# Environment variables
S3_BUCKET = os.environ.get('S3_BUCKET', 'safetyvision-evidence')
DYNAMODB_TABLE = os.environ.get('DYNAMODB_TABLE', 'safetyvision-detections')
RDS_CLUSTER_ARN = os.environ.get('RDS_CLUSTER_ARN')
RDS_SECRET_ARN = os.environ.get('RDS_SECRET_ARN')
RDS_DATABASE = os.environ.get('RDS_DATABASE', 'safetyvision')
SNS_TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')


def response(status_code: int, body: Any) -> Dict:
    """Create API Gateway response."""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,Authorization',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body, default=str)
    }


def execute_sql(sql: str, parameters: list = None) -> Dict:
    """Execute SQL against RDS PostgreSQL via Data API."""
    params = {
        'resourceArn': RDS_CLUSTER_ARN,
        'secretArn': RDS_SECRET_ARN,
        'database': RDS_DATABASE,
        'sql': sql
    }
    if parameters:
        params['parameters'] = parameters
    return rds_data.execute_statement(**params)


# ============= DETECTION HANDLERS =============

def receive_detection(event, context):
    """
    Receive detection from edge server.
    POST /api/detections
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        detection_id = body.get('detection_id', str(uuid.uuid4()))
        camera_id = body['camera_id']
        site_id = body['site_id']
        timestamp = body['timestamp']
        violations = body.get('violations', [])
        safety_score = body.get('safety_score', 100.0)
        edge_device_id = body.get('edge_device_id')
        
        # Store in DynamoDB for fast queries
        table = dynamodb.Table(DYNAMODB_TABLE)
        table.put_item(Item={
            'detection_id': detection_id,
            'camera_id': camera_id,
            'site_id': site_id,
            'timestamp': timestamp,
            'violations': violations,
            'safety_score': str(safety_score),
            'edge_device_id': edge_device_id,
            'created_at': datetime.utcnow().isoformat(),
            'ttl': int((datetime.utcnow() + timedelta(days=90)).timestamp())
        })
        
        # Also store in RDS for complex queries
        sql = """
            INSERT INTO detections (id, camera_id, site_id, timestamp, violations, safety_score, edge_device_id)
            VALUES (:id, :camera_id, :site_id, :timestamp, :violations::jsonb, :safety_score, :edge_device_id)
        """
        execute_sql(sql, [
            {'name': 'id', 'value': {'stringValue': detection_id}},
            {'name': 'camera_id', 'value': {'stringValue': camera_id}},
            {'name': 'site_id', 'value': {'stringValue': site_id}},
            {'name': 'timestamp', 'value': {'stringValue': timestamp}},
            {'name': 'violations', 'value': {'stringValue': json.dumps(violations)}},
            {'name': 'safety_score', 'value': {'doubleValue': safety_score}},
            {'name': 'edge_device_id', 'value': {'stringValue': edge_device_id or ''}}
        ])
        
        return response(201, {'detection_id': detection_id, 'message': 'Detection received'})
        
    except Exception as e:
        return response(500, {'error': str(e)})


def get_detections(event, context):
    """
    Get detections with filtering.
    GET /api/detections
    """
    try:
        params = event.get('queryStringParameters') or {}
        site_id = params.get('site_id')
        camera_id = params.get('camera_id')
        start_date = params.get('start_date')
        end_date = params.get('end_date')
        page = int(params.get('page', 1))
        page_size = int(params.get('page_size', 50))
        
        # Build SQL query
        conditions = []
        sql_params = []
        
        if site_id:
            conditions.append('site_id = :site_id')
            sql_params.append({'name': 'site_id', 'value': {'stringValue': site_id}})
        
        if camera_id:
            conditions.append('camera_id = :camera_id')
            sql_params.append({'name': 'camera_id', 'value': {'stringValue': camera_id}})
        
        if start_date:
            conditions.append('timestamp >= :start_date')
            sql_params.append({'name': 'start_date', 'value': {'stringValue': start_date}})
        
        if end_date:
            conditions.append('timestamp <= :end_date')
            sql_params.append({'name': 'end_date', 'value': {'stringValue': end_date}})
        
        where_clause = ' AND '.join(conditions) if conditions else '1=1'
        offset = (page - 1) * page_size
        
        sql = f"""
            SELECT id, camera_id, site_id, timestamp, violations, safety_score, created_at
            FROM detections
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT {page_size} OFFSET {offset}
        """
        
        result = execute_sql(sql, sql_params)
        
        detections = []
        for record in result.get('records', []):
            detections.append({
                'detection_id': record[0]['stringValue'],
                'camera_id': record[1]['stringValue'],
                'site_id': record[2]['stringValue'],
                'timestamp': record[3]['stringValue'],
                'violations': json.loads(record[4]['stringValue']),
                'safety_score': record[5]['doubleValue'],
                'created_at': record[6]['stringValue']
            })
        
        return response(200, {'detections': detections, 'page': page, 'page_size': page_size})
        
    except Exception as e:
        return response(500, {'error': str(e)})


# ============= EVIDENCE UPLOAD HANDLERS =============

def get_upload_url(event, context):
    """
    Generate presigned URL for evidence upload.
    POST /api/evidence/upload-url
    """
    try:
        body = json.loads(event.get('body', '{}'))
        detection_id = body['detection_id']
        camera_id = body['camera_id']
        content_type = body.get('content_type', 'image/jpeg')
        
        # Generate S3 key
        date_prefix = datetime.utcnow().strftime('%Y/%m/%d')
        s3_key = f"evidence/{date_prefix}/{camera_id}/{detection_id}.jpg"
        
        # Generate presigned URL
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': s3_key,
                'ContentType': content_type
            },
            ExpiresIn=3600  # 1 hour
        )
        
        return response(200, {
            'upload_url': presigned_url,
            's3_key': s3_key,
            'expires_in': 3600
        })
        
    except Exception as e:
        return response(500, {'error': str(e)})


def get_evidence_url(event, context):
    """
    Generate presigned URL for evidence download.
    GET /api/evidence/{detection_id}/url
    """
    try:
        detection_id = event['pathParameters']['detection_id']
        
        # Find the evidence in S3
        paginator = s3.get_paginator('list_objects_v2')
        for page in paginator.paginate(Bucket=S3_BUCKET, Prefix='evidence/'):
            for obj in page.get('Contents', []):
                if detection_id in obj['Key']:
                    presigned_url = s3.generate_presigned_url(
                        'get_object',
                        Params={'Bucket': S3_BUCKET, 'Key': obj['Key']},
                        ExpiresIn=3600
                    )
                    return response(200, {'download_url': presigned_url, 'expires_in': 3600})
        
        return response(404, {'error': 'Evidence not found'})
        
    except Exception as e:
        return response(500, {'error': str(e)})


# ============= ALERT HANDLERS =============

def receive_alert(event, context):
    """
    Receive alert from edge server.
    POST /api/alerts
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        alert_id = body.get('id', str(uuid.uuid4()))
        detection_id = body['detection_id']
        severity = body['severity']
        violations = body.get('violations', [])
        
        # Store alert in RDS
        sql = """
            INSERT INTO alerts (id, detection_id, camera_id, site_id, severity, violations, timestamp, acknowledged)
            VALUES (:id, :detection_id, :camera_id, :site_id, :severity, :violations::jsonb, :timestamp, false)
        """
        execute_sql(sql, [
            {'name': 'id', 'value': {'stringValue': alert_id}},
            {'name': 'detection_id', 'value': {'stringValue': detection_id}},
            {'name': 'camera_id', 'value': {'stringValue': body.get('camera_id', '')}},
            {'name': 'site_id', 'value': {'stringValue': body.get('site_id', '')}},
            {'name': 'severity', 'value': {'stringValue': severity}},
            {'name': 'violations', 'value': {'stringValue': json.dumps(violations)}},
            {'name': 'timestamp', 'value': {'stringValue': body.get('timestamp', datetime.utcnow().isoformat())}}
        ])
        
        # Send SNS notification for high/critical alerts
        if severity in ['high', 'critical'] and SNS_TOPIC_ARN:
            sns.publish(
                TopicArn=SNS_TOPIC_ARN,
                Subject=f'SafetyVision Alert: {severity.upper()}',
                Message=json.dumps({
                    'alert_id': alert_id,
                    'severity': severity,
                    'violations': violations,
                    'site_id': body.get('site_id'),
                    'camera_id': body.get('camera_id'),
                    'timestamp': body.get('timestamp')
                })
            )
        
        return response(201, {'alert_id': alert_id, 'message': 'Alert received'})
        
    except Exception as e:
        return response(500, {'error': str(e)})


def get_alerts(event, context):
    """
    Get alerts with filtering.
    GET /api/alerts
    """
    try:
        params = event.get('queryStringParameters') or {}
        acknowledged = params.get('acknowledged')
        severity = params.get('severity')
        site_id = params.get('site_id')
        
        conditions = []
        sql_params = []
        
        if acknowledged is not None:
            conditions.append('acknowledged = :acknowledged')
            sql_params.append({'name': 'acknowledged', 'value': {'booleanValue': acknowledged == 'true'}})
        
        if severity:
            conditions.append('severity = :severity')
            sql_params.append({'name': 'severity', 'value': {'stringValue': severity}})
        
        if site_id:
            conditions.append('site_id = :site_id')
            sql_params.append({'name': 'site_id', 'value': {'stringValue': site_id}})
        
        where_clause = ' AND '.join(conditions) if conditions else '1=1'
        
        sql = f"""
            SELECT id, detection_id, camera_id, site_id, severity, violations, timestamp, acknowledged
            FROM alerts
            WHERE {where_clause}
            ORDER BY timestamp DESC
            LIMIT 100
        """
        
        result = execute_sql(sql, sql_params)
        
        alerts = []
        for record in result.get('records', []):
            alerts.append({
                'alert_id': record[0]['stringValue'],
                'detection_id': record[1]['stringValue'],
                'camera_id': record[2]['stringValue'],
                'site_id': record[3]['stringValue'],
                'severity': record[4]['stringValue'],
                'violations': json.loads(record[5]['stringValue']),
                'timestamp': record[6]['stringValue'],
                'acknowledged': record[7]['booleanValue']
            })
        
        return response(200, {'alerts': alerts})
        
    except Exception as e:
        return response(500, {'error': str(e)})


def acknowledge_alert(event, context):
    """
    Acknowledge an alert.
    PUT /api/alerts/{alert_id}/acknowledge
    """
    try:
        alert_id = event['pathParameters']['alert_id']
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('user_id')
        
        sql = """
            UPDATE alerts 
            SET acknowledged = true, acknowledged_by = :user_id, acknowledged_at = :timestamp
            WHERE id = :alert_id
        """
        execute_sql(sql, [
            {'name': 'alert_id', 'value': {'stringValue': alert_id}},
            {'name': 'user_id', 'value': {'stringValue': user_id or ''}},
            {'name': 'timestamp', 'value': {'stringValue': datetime.utcnow().isoformat()}}
        ])
        
        return response(200, {'message': 'Alert acknowledged'})
        
    except Exception as e:
        return response(500, {'error': str(e)})


# ============= ANALYTICS HANDLERS =============

def get_analytics(event, context):
    """
    Get analytics data.
    GET /api/analytics
    """
    try:
        params = event.get('queryStringParameters') or {}
        site_id = params.get('site_id')
        days = int(params.get('days', 7))
        
        start_date = (datetime.utcnow() - timedelta(days=days)).isoformat()
        
        # Get violation counts by type
        sql_violations = """
            SELECT 
                jsonb_array_elements(violations)->>'class' as violation_type,
                COUNT(*) as count
            FROM detections
            WHERE timestamp >= :start_date
        """
        if site_id:
            sql_violations += " AND site_id = :site_id"
        sql_violations += " GROUP BY violation_type ORDER BY count DESC"
        
        params_list = [{'name': 'start_date', 'value': {'stringValue': start_date}}]
        if site_id:
            params_list.append({'name': 'site_id', 'value': {'stringValue': site_id}})
        
        violations_result = execute_sql(sql_violations, params_list)
        
        # Get daily counts
        sql_daily = """
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as detection_count,
                AVG(safety_score) as avg_safety_score
            FROM detections
            WHERE timestamp >= :start_date
        """
        if site_id:
            sql_daily += " AND site_id = :site_id"
        sql_daily += " GROUP BY DATE(timestamp) ORDER BY date"
        
        daily_result = execute_sql(sql_daily, params_list)
        
        violations_by_type = {}
        for record in violations_result.get('records', []):
            violations_by_type[record[0]['stringValue']] = int(record[1]['longValue'])
        
        daily_stats = []
        for record in daily_result.get('records', []):
            daily_stats.append({
                'date': record[0]['stringValue'],
                'detection_count': int(record[1]['longValue']),
                'avg_safety_score': round(record[2]['doubleValue'], 2)
            })
        
        return response(200, {
            'violations_by_type': violations_by_type,
            'daily_stats': daily_stats,
            'period_days': days
        })
        
    except Exception as e:
        return response(500, {'error': str(e)})


# ============= EDGE DEVICE HANDLERS =============

def register_edge_device(event, context):
    """
    Register an edge device.
    POST /api/edge-devices
    """
    try:
        body = json.loads(event.get('body', '{}'))
        
        device_id = body['device_id']
        site_id = body['site_id']
        name = body.get('name', device_id)
        
        sql = """
            INSERT INTO edge_devices (id, site_id, name, status, last_heartbeat, created_at)
            VALUES (:id, :site_id, :name, 'online', :timestamp, :timestamp)
            ON CONFLICT (id) DO UPDATE SET
                status = 'online',
                last_heartbeat = :timestamp
        """
        execute_sql(sql, [
            {'name': 'id', 'value': {'stringValue': device_id}},
            {'name': 'site_id', 'value': {'stringValue': site_id}},
            {'name': 'name', 'value': {'stringValue': name}},
            {'name': 'timestamp', 'value': {'stringValue': datetime.utcnow().isoformat()}}
        ])
        
        return response(200, {'device_id': device_id, 'message': 'Device registered'})
        
    except Exception as e:
        return response(500, {'error': str(e)})


def heartbeat(event, context):
    """
    Receive heartbeat from edge device.
    POST /api/edge-devices/{device_id}/heartbeat
    """
    try:
        device_id = event['pathParameters']['device_id']
        body = json.loads(event.get('body', '{}'))
        
        sql = """
            UPDATE edge_devices 
            SET last_heartbeat = :timestamp, 
                status = 'online',
                camera_count = :camera_count,
                active_cameras = :active_cameras
            WHERE id = :device_id
        """
        execute_sql(sql, [
            {'name': 'device_id', 'value': {'stringValue': device_id}},
            {'name': 'timestamp', 'value': {'stringValue': datetime.utcnow().isoformat()}},
            {'name': 'camera_count', 'value': {'longValue': body.get('camera_count', 0)}},
            {'name': 'active_cameras', 'value': {'longValue': body.get('active_cameras', 0)}}
        ])
        
        return response(200, {'message': 'Heartbeat received'})
        
    except Exception as e:
        return response(500, {'error': str(e)})
