"""Edge Server Configuration."""
import os
from datetime import datetime
from pydantic_settings import BaseSettings


class EdgeConfig(BaseSettings):
    """Configuration for the Edge Server."""
    
    # Device identification
    edge_device_id: str = os.getenv("EDGE_DEVICE_ID", "edge-001")
    site_id: str = os.getenv("SITE_ID", "site-001")
    
    # Server settings
    port: int = int(os.getenv("EDGE_PORT", "8080"))
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # AI Inference settings
    model_path: str = os.getenv("MODEL_PATH", "./models/safety_detection.pt")
    model_name: str = os.getenv("MODEL_NAME", "YOLOv8-Safety")
    inference_device: str = os.getenv("INFERENCE_DEVICE", "cuda:0")  # cuda:0 or cpu
    confidence_threshold: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.85"))
    
    # Detection classes
    detection_classes: list = [
        "person",
        "hardhat",
        "no_hardhat", 
        "safety_vest",
        "no_safety_vest",
        "safety_glasses",
        "no_safety_glasses",
        "gloves",
        "no_gloves",
        "safety_boots",
        "vehicle",
        "forklift"
    ]
    
    # Storage settings
    storage_path: str = os.getenv("STORAGE_PATH", "./evidence")
    retention_days: int = int(os.getenv("RETENTION_DAYS", "30"))
    max_storage_gb: int = int(os.getenv("MAX_STORAGE_GB", "500"))
    
    # Cloud sync settings
    cloud_api_url: str = os.getenv("CLOUD_API_URL", "https://api.safetyvision.example.com")
    cloud_api_key: str = os.getenv("CLOUD_API_KEY", "")
    sync_interval: int = int(os.getenv("SYNC_INTERVAL", "30"))  # seconds
    sync_enabled: bool = os.getenv("SYNC_ENABLED", "true").lower() == "true"
    
    # Alert settings  
    alert_threshold: str = os.getenv("ALERT_THRESHOLD", "high")  # low, medium, high, critical
    alert_cooldown: int = int(os.getenv("ALERT_COOLDOWN", "60"))  # seconds between same alerts
    
    # Face blur settings
    face_blur_enabled: bool = os.getenv("FACE_BLUR_ENABLED", "true").lower() == "true"
    face_blur_strength: int = int(os.getenv("FACE_BLUR_STRENGTH", "30"))
    
    # Video settings
    video_clip_duration: int = int(os.getenv("VIDEO_CLIP_DURATION", "15"))  # seconds
    video_fps: int = int(os.getenv("VIDEO_FPS", "15"))
    video_quality: str = os.getenv("VIDEO_QUALITY", "720p")
    
    # Startup time
    start_time: datetime = datetime.utcnow()
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
