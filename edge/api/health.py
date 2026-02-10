"""Edge Health and Sync API Routes."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    status: str
    device_id: str
    site_id: str
    uptime_seconds: float
    cameras: Dict[str, Any]
    storage: Dict[str, Any]
    ai_engine: Dict[str, Any]
    cloud_sync: Dict[str, Any]
    timestamp: str


class SyncStatus(BaseModel):
    connected: bool
    last_sync: Optional[str]
    pending_items: int
    failed_items: int
    sync_interval: int


def get_services():
    """Get all services from app state."""
    from ..main import app
    return {
        "camera_manager": app.state.camera_manager,
        "local_storage": app.state.local_storage,
        "ai_engine": app.state.ai_engine,
        "cloud_sync": app.state.cloud_sync,
        "config": app.state.config,
        "start_time": app.state.start_time
    }


@router.get("/health", response_model=HealthResponse)
async def health_check(services: dict = Depends(get_services)):
    """Get overall health status of the edge server."""
    camera_manager = services["camera_manager"]
    local_storage = services["local_storage"]
    ai_engine = services["ai_engine"]
    cloud_sync = services["cloud_sync"]
    config = services["config"]
    start_time = services["start_time"]
    
    uptime = (datetime.utcnow() - start_time).total_seconds()
    
    # Determine overall status
    status = "healthy"
    if camera_manager.error_count > 0:
        status = "degraded"
    if camera_manager.active_count == 0 and camera_manager.camera_count > 0:
        status = "unhealthy"
    
    return HealthResponse(
        status=status,
        device_id=config.EDGE_DEVICE_ID,
        site_id=config.SITE_ID,
        uptime_seconds=uptime,
        cameras={
            "total": camera_manager.camera_count,
            "active": camera_manager.active_count,
            "errors": camera_manager.error_count
        },
        storage={
            "path": str(local_storage.storage_path),
            "total_files": local_storage.file_count,
            "total_size_mb": round(local_storage.total_size_bytes / (1024 * 1024), 2),
            "retention_days": local_storage.retention_days
        },
        ai_engine={
            "model_loaded": ai_engine.model is not None,
            "device": ai_engine.device,
            "confidence_threshold": ai_engine.confidence_threshold,
            "total_inferences": ai_engine.inference_count,
            "total_detections": ai_engine.detection_count
        },
        cloud_sync={
            "api_url": cloud_sync.api_url,
            "connected": cloud_sync._connected,
            "pending_syncs": cloud_sync.pending_count,
            "last_sync": cloud_sync.last_sync_time.isoformat() if cloud_sync.last_sync_time else None
        },
        timestamp=datetime.utcnow().isoformat()
    )


@router.get("/sync/status", response_model=SyncStatus)
async def sync_status(services: dict = Depends(get_services)):
    """Get cloud sync status."""
    cloud_sync = services["cloud_sync"]
    config = services["config"]
    
    return SyncStatus(
        connected=cloud_sync._connected,
        last_sync=cloud_sync.last_sync_time.isoformat() if cloud_sync.last_sync_time else None,
        pending_items=cloud_sync.pending_count,
        failed_items=cloud_sync.failed_count,
        sync_interval=config.SYNC_INTERVAL
    )


@router.post("/sync/trigger")
async def trigger_sync(services: dict = Depends(get_services)):
    """Manually trigger a sync to cloud."""
    cloud_sync = services["cloud_sync"]
    local_storage = services["local_storage"]
    
    # Get unsynced evidence
    unsynced = local_storage.get_unsynced_evidence()
    
    synced_count = 0
    failed_count = 0
    
    for evidence in unsynced:
        try:
            await cloud_sync.sync_evidence(evidence)
            local_storage.mark_synced(evidence["detection_id"])
            synced_count += 1
        except Exception:
            failed_count += 1
    
    return {
        "message": "Sync completed",
        "synced": synced_count,
        "failed": failed_count,
        "remaining": cloud_sync.pending_count
    }
