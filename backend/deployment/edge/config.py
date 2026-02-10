"""Edge deployment specific configuration."""
from pydantic_settings import BaseSettings
from typing import Optional


class EdgeConfig(BaseSettings):
    """Configuration for edge/on-premise deployment."""
    
    # Local Storage
    LOCAL_STORAGE_PATH: str = "/app/output"
    LOCAL_MODELS_PATH: str = "/app/models"
    LOCAL_CONFIGS_PATH: str = "/app/configs"
    
    # Database (local PostgreSQL or SQLite)
    DATABASE_URL: str = "sqlite+aiosqlite:///./safetyvision.db"
    
    # Redis (local)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # AI Engine (local GPU inference)
    USE_GPU: bool = True
    GPU_DEVICE: int = 0
    MODEL_PRECISION: str = "fp16"  # fp32, fp16, int8
    BATCH_SIZE: int = 4
    
    # Video Processing
    MAX_CONCURRENT_STREAMS: int = 8
    FRAME_BUFFER_SIZE: int = 30
    PROCESS_EVERY_N_FRAMES: int = 3
    
    # Offline Mode
    OFFLINE_MODE: bool = False
    SYNC_INTERVAL_MINUTES: int = 60
    
    # Local Alerts
    ENABLE_LOCAL_ALERTS: bool = True
    ALERT_SOUND_ENABLED: bool = True
    ALERT_LIGHT_ENABLED: bool = False
    
    # Retention
    INCIDENT_RETENTION_DAYS: int = 90
    VIDEO_RETENTION_DAYS: int = 30
    
    class Config:
        env_file = ".env.edge"


edge_config = EdgeConfig()
