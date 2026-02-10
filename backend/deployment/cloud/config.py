"""AWS Cloud deployment specific configuration."""
from pydantic_settings import BaseSettings
from typing import Optional, List


class CloudConfig(BaseSettings):
    """Configuration for AWS cloud deployment."""
    
    # AWS Credentials (use IAM roles in production)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"
    
    # S3 Storage
    S3_BUCKET_NAME: str = "safetyvision-media"
    S3_INCIDENTS_PREFIX: str = "incidents/"
    S3_VIDEOS_PREFIX: str = "videos/"
    S3_REPORTS_PREFIX: str = "reports/"
    S3_PRESIGNED_URL_EXPIRY: int = 3600
    
    # RDS Database
    DATABASE_URL: str = "postgresql+asyncpg://admin:password@safetyvision.xxxxx.us-east-1.rds.amazonaws.com:5432/safetyvision"
    RDS_SSL_MODE: str = "require"
    
    # ElastiCache Redis
    REDIS_URL: str = "redis://safetyvision.xxxxx.cache.amazonaws.com:6379/0"
    REDIS_SSL: bool = True
    
    # Lambda Functions
    LAMBDA_INFERENCE_ARN: str = ""
    LAMBDA_REPORT_GENERATOR_ARN: str = ""
    LAMBDA_NOTIFICATION_ARN: str = ""
    
    # SQS Queues
    SQS_INCIDENT_QUEUE_URL: str = ""
    SQS_PROCESSING_QUEUE_URL: str = ""
    
    # SNS Topics
    SNS_ALERT_TOPIC_ARN: str = ""
    SNS_REPORT_TOPIC_ARN: str = ""
    
    # CloudWatch
    CLOUDWATCH_LOG_GROUP: str = "/safetyvision/api"
    CLOUDWATCH_METRICS_NAMESPACE: str = "SafetyVision"
    
    # Cognito (User Authentication)
    COGNITO_USER_POOL_ID: str = ""
    COGNITO_CLIENT_ID: str = ""
    
    # API Gateway
    API_GATEWAY_STAGE: str = "prod"
    
    # Auto Scaling
    MIN_INSTANCES: int = 2
    MAX_INSTANCES: int = 10
    TARGET_CPU_UTILIZATION: int = 70
    
    # Multi-Region
    ENABLE_MULTI_REGION: bool = False
    SECONDARY_REGIONS: List[str] = []
    
    class Config:
        env_file = ".env.cloud"


cloud_config = CloudConfig()
