# SafetyVision AWS Architecture

## Overview

SafetyVision uses a hybrid edge-cloud architecture where AI processing happens on-premises (edge) and data storage, analytics, and management happen in AWS (cloud).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INDUSTRIAL SITE                                 │
│  ┌──────────────┐    ┌──────────────────────────────────────────────────┐  │
│  │   Cameras    │───►│              EDGE SERVER (On-Premises)            │  │
│  │  (IP/RTSP)   │    │  ┌────────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  └──────────────┘    │  │ AI Inference│  │Face Blur │  │Local Storage │  │  │
│                      │  │   (YOLO)   │  │ (Privacy)│  │  (Evidence)  │  │  │
│                      │  └────────────┘  └──────────┘  └──────────────┘  │  │
│                      │                       │                           │  │
│                      │              ┌────────▼────────┐                  │  │
│                      │              │   Cloud Sync    │                  │  │
│                      └──────────────┴────────┬────────┴──────────────────┘  │
└──────────────────────────────────────────────┼──────────────────────────────┘
                                               │
                                    HTTPS (Encrypted)
                                               │
┌──────────────────────────────────────────────▼──────────────────────────────┐
│                              AWS CLOUD                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         API GATEWAY (HTTP API)                       │   │
│  │   /api/detections  /api/alerts  /api/evidence  /api/analytics       │   │
│  └───────────────────────────────┬─────────────────────────────────────┘   │
│                                  │                                          │
│  ┌──────────────────────────────▼────────────────────────────────────┐     │
│  │                        LAMBDA FUNCTIONS                            │     │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │     │
│  │  │  Detections  │  │    Alerts    │  │   Evidence   │            │     │
│  │  │   Handler    │  │   Handler    │  │   Handler    │            │     │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │     │
│  └─────────┼─────────────────┼─────────────────┼────────────────────┘     │
│            │                 │                 │                           │
│  ┌─────────▼─────────────────▼─────────────────▼───────────────────────┐  │
│  │                                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │  │
│  │  │   DynamoDB   │  │     RDS      │  │      S3      │              │  │
│  │  │  (Fast Read) │  │ (PostgreSQL) │  │  (Evidence)  │              │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │  │
│  │                                                                      │  │
│  │  ┌──────────────┐  ┌──────────────┐                                 │  │
│  │  │     SNS      │  │  CloudWatch  │                                 │  │
│  │  │   (Alerts)   │  │   (Logs)     │                                 │  │
│  │  └──────────────┘  └──────────────┘                                 │  │
│  │                                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    FRONTEND (S3 + CloudFront)                         │  │
│  │                    React Dashboard Application                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## AWS Services Used

### 1. API Gateway (HTTP API)
**Purpose**: RESTful API endpoint for all cloud communications

**Endpoints**:
| Method | Path | Lambda Handler | Description |
|--------|------|----------------|-------------|
| POST | /api/detections | receive_detection | Receive detection from edge |
| GET | /api/detections | get_detections | Query detections with filters |
| POST | /api/alerts | receive_alert | Receive alert from edge |
| GET | /api/alerts | get_alerts | Query alerts |
| PUT | /api/alerts/{id}/acknowledge | acknowledge_alert | Mark alert acknowledged |
| POST | /api/evidence/upload-url | get_upload_url | Get presigned S3 upload URL |
| GET | /api/evidence/{id}/url | get_evidence_url | Get presigned S3 download URL |
| GET | /api/analytics | get_analytics | Get analytics data |
| POST | /api/edge-devices | register_edge_device | Register edge device |
| POST | /api/edge-devices/{id}/heartbeat | heartbeat | Edge device heartbeat |

### 2. Lambda Functions
**Purpose**: Serverless compute for API logic

**Configuration**:
- Runtime: Python 3.11
- Memory: 256 MB
- Timeout: 30 seconds
- VPC: Connected to private subnets for RDS access

**Functions**:
- `safetyvision-receive-detection-{env}`
- `safetyvision-get-detections-{env}`
- `safetyvision-receive-alert-{env}`
- `safetyvision-get-alerts-{env}`
- `safetyvision-acknowledge-alert-{env}`
- `safetyvision-get-upload-url-{env}`
- `safetyvision-get-evidence-url-{env}`
- `safetyvision-get-analytics-{env}`
- `safetyvision-register-edge-{env}`
- `safetyvision-heartbeat-{env}`

### 3. S3 (Simple Storage Service)
**Purpose**: Evidence image/video storage

**Bucket**: `safetyvision-evidence-{env}-{account_id}`

**Structure**:
```
evidence/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── camera-001/
│   │   │   │   ├── detection-abc123.jpg
│   │   │   │   └── detection-def456.jpg
```

**Lifecycle Rules**:
- Standard → Glacier: 90 days
- Delete: 365 days

**Security**:
- Server-side encryption (AES-256)
- Presigned URLs for upload/download (1-hour expiry)
- CORS enabled for frontend

### 4. RDS (Aurora PostgreSQL Serverless)
**Purpose**: Primary database for complex queries and reporting

**Configuration**:
- Engine: Aurora PostgreSQL 13.9 (Serverless v1)
- Min Capacity: 2 ACUs
- Max Capacity: 16 ACUs
- Auto-pause: 5 minutes idle
- Data API enabled

**Tables**:
- `sites` - Facility/location definitions
- `zones` - Safety zones within sites
- `cameras` - Camera configurations
- `edge_devices` - Edge server registrations
- `detections` - All detection records
- `alerts` - Alert records
- `users` - User accounts
- `safety_policies` - Safety rule configurations
- `daily_stats` - Aggregated analytics

### 5. DynamoDB
**Purpose**: Fast reads for real-time queries

**Table**: `safetyvision-detections-{env}`

**Schema**:
- Partition Key: `detection_id`
- GSI: `site_id` + `timestamp`
- TTL: 90 days

**Use Cases**:
- Real-time detection lookups
- Recent detections dashboard
- Edge device sync status

### 6. SNS (Simple Notification Service)
**Purpose**: Alert notifications

**Topic**: `safetyvision-alerts-{env}`

**Subscribers**:
- Email (safety managers)
- SMS (critical alerts)
- Lambda (integrations)

**Trigger Conditions**:
- High severity alerts
- Critical severity alerts

### 7. CloudWatch
**Purpose**: Logging and monitoring

**Log Groups**:
- `/aws/lambda/safetyvision-*`
- `/aws/apigateway/safetyvision-*`

**Metrics**:
- Lambda invocations
- API Gateway requests
- Error rates

### 8. VPC
**Purpose**: Network isolation for RDS

**CIDR**: 10.0.0.0/16

**Subnets**:
- Private Subnet 1: 10.0.1.0/24
- Private Subnet 2: 10.0.2.0/24

## Data Flow

### 1. Detection Flow (Edge → Cloud)
```
Edge Server → API Gateway → Lambda → DynamoDB + RDS
                                   ↓
                              S3 (evidence)
```

### 2. Alert Flow
```
Edge Server → API Gateway → Lambda → RDS
                                   ↓
                              SNS (notifications)
```

### 3. Evidence Upload Flow
```
Edge Server → API Gateway → Lambda (get presigned URL)
           ↓
    S3 (direct upload with presigned URL)
```

### 4. Frontend Query Flow
```
React App → API Gateway → Lambda → RDS/DynamoDB
                               ↓
                          Response with data
```

## Deployment

### Prerequisites
1. AWS CLI configured
2. AWS SAM CLI installed
3. Docker (for local testing)

### Deploy CloudFormation Stack
```bash
cd cloud/cloudformation

# Package the template
sam build

# Deploy
sam deploy \
  --stack-name safetyvision-production \
  --parameter-overrides \
    Environment=production \
    DBUsername=safetyvision_admin \
    DBPassword=<secure-password> \
  --capabilities CAPABILITY_IAM \
  --resolve-s3
```

### Initialize Database
```bash
# Connect to RDS and run schema
psql -h <rds-endpoint> -U safetyvision_admin -d safetyvision -f cloud/database/schema.sql
```

## Edge Server Configuration

Set these environment variables on the edge server:
```bash
CLOUD_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com/production
CLOUD_API_KEY=<api-key>  # If using API key authentication
```

## Cost Estimation (Monthly)

| Service | Configuration | Estimated Cost |
|---------|---------------|----------------|
| API Gateway | 1M requests | $1.00 |
| Lambda | 1M invocations, 256MB | $3.00 |
| S3 | 100 GB storage | $2.30 |
| RDS Aurora | Serverless, low usage | $50.00 |
| DynamoDB | On-demand, 1M reads/writes | $1.50 |
| SNS | 10K notifications | $0.50 |
| CloudWatch | Logs + metrics | $5.00 |

**Total**: ~$65/month (varies with usage)

## Security Best Practices

1. **API Authentication**: Use API keys or Cognito for frontend
2. **Edge Authentication**: Use IAM credentials or API keys
3. **Data Encryption**: 
   - S3: AES-256 server-side encryption
   - RDS: Encrypted at rest
   - Transit: HTTPS only
4. **Network**: Lambda in VPC for RDS access
5. **Secrets**: Use Secrets Manager for credentials
6. **Logging**: CloudWatch for audit trail

## Scaling Considerations

- **Lambda**: Auto-scales to 1000 concurrent executions
- **RDS**: Aurora Serverless scales 2-16 ACUs automatically
- **DynamoDB**: On-demand mode, auto-scales
- **S3**: Unlimited storage
- **API Gateway**: 10,000 requests/second default limit
