"""
SafetyVision Edge Server
========================
On-premises deployment for real-time AI inference, video processing, and local storage.
This runs on-site with GPU support for low-latency detection.

Architecture:
- Connects to IP cameras via RTSP
- Runs AI inference locally (YOLO/custom models)
- Applies face blur for privacy
- Stores evidence locally with optional cloud sync
- Sends alerts to cloud API
"""
import os
import asyncio
import logging
from datetime import datetime
from typing import Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

from config import EdgeConfig
from services.camera_manager import CameraManager
from services.ai_inference import AIInferenceEngine
from services.face_blur import FaceBlurService
from services.local_storage import LocalStorageService
from services.cloud_sync import CloudSyncService
from services.alert_service import AlertService
from api import cameras, detections, evidence, health, sync

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load configuration
config = EdgeConfig()

# Initialize services
camera_manager: Optional[CameraManager] = None
ai_engine: Optional[AIInferenceEngine] = None
face_blur: Optional[FaceBlurService] = None
local_storage: Optional[LocalStorageService] = None
cloud_sync: Optional[CloudSyncService] = None
alert_service: Optional[AlertService] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle management."""
    global camera_manager, ai_engine, face_blur, local_storage, cloud_sync, alert_service
    
    logger.info("Starting SafetyVision Edge Server...")
    
    # Initialize services
    local_storage = LocalStorageService(config.storage_path)
    face_blur = FaceBlurService()
    ai_engine = AIInferenceEngine(
        model_path=config.model_path,
        device=config.inference_device,
        confidence_threshold=config.confidence_threshold
    )
    cloud_sync = CloudSyncService(
        api_url=config.cloud_api_url,
        api_key=config.cloud_api_key,
        sync_interval=config.sync_interval
    )
    alert_service = AlertService(
        cloud_sync=cloud_sync,
        alert_threshold=config.alert_threshold
    )
    camera_manager = CameraManager(
        ai_engine=ai_engine,
        face_blur=face_blur,
        local_storage=local_storage,
        alert_service=alert_service
    )
    
    # Start background tasks
    asyncio.create_task(cloud_sync.start_sync_loop())
    
    logger.info(f"Edge server ready. Device: {config.edge_device_id}")
    
    yield
    
    # Cleanup
    logger.info("Shutting down Edge Server...")
    if camera_manager:
        await camera_manager.stop_all()
    if cloud_sync:
        await cloud_sync.stop()


# Create FastAPI app
app = FastAPI(
    title="SafetyVision Edge Server",
    description="On-premises AI inference and video processing",
    version="1.0.0",
    lifespan=lifespan
)

# CORS for local dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for local evidence access
os.makedirs(config.storage_path, exist_ok=True)
app.mount("/evidence", StaticFiles(directory=config.storage_path), name="evidence")

# Include API routers
app.include_router(health.router, prefix="/api/health", tags=["Health"])
app.include_router(cameras.router, prefix="/api/cameras", tags=["Cameras"])
app.include_router(detections.router, prefix="/api/detections", tags=["Detections"])
app.include_router(evidence.router, prefix="/api/evidence", tags=["Evidence"])
app.include_router(sync.router, prefix="/api/sync", tags=["Cloud Sync"])


@app.get("/")
async def root():
    """Edge server status."""
    return {
        "service": "SafetyVision Edge Server",
        "device_id": config.edge_device_id,
        "status": "running",
        "version": "1.0.0",
        "cloud_connected": cloud_sync.is_connected if cloud_sync else False,
        "active_cameras": camera_manager.active_count if camera_manager else 0,
        "inference_device": config.inference_device,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/status")
async def get_status():
    """Detailed edge server status."""
    return {
        "device_id": config.edge_device_id,
        "site_id": config.site_id,
        "uptime_seconds": (datetime.utcnow() - config.start_time).total_seconds(),
        "cameras": {
            "configured": camera_manager.camera_count if camera_manager else 0,
            "active": camera_manager.active_count if camera_manager else 0,
            "errors": camera_manager.error_count if camera_manager else 0
        },
        "inference": {
            "device": config.inference_device,
            "model": config.model_name,
            "fps_avg": ai_engine.avg_fps if ai_engine else 0,
            "detections_today": ai_engine.detections_today if ai_engine else 0
        },
        "storage": {
            "path": config.storage_path,
            "used_gb": local_storage.used_space_gb if local_storage else 0,
            "free_gb": local_storage.free_space_gb if local_storage else 0,
            "retention_days": config.retention_days
        },
        "cloud_sync": {
            "connected": cloud_sync.is_connected if cloud_sync else False,
            "last_sync": cloud_sync.last_sync_time if cloud_sync else None,
            "pending_uploads": cloud_sync.pending_count if cloud_sync else 0
        }
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=config.port,
        reload=config.debug,
        workers=1  # Single worker for GPU access
    )
