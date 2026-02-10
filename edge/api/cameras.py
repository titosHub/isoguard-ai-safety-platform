"""Edge Camera API Routes."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from ..services import CameraConfig

router = APIRouter(prefix="/cameras", tags=["cameras"])


class CameraCreate(BaseModel):
    camera_id: str
    name: str
    stream_url: str
    site_id: str
    zone_id: Optional[str] = None
    policy_id: Optional[str] = None
    fps: int = 15
    enabled: bool = True


class CameraResponse(BaseModel):
    camera_id: str
    name: str
    is_running: bool
    error: Optional[str] = None
    fps: float = 0.0
    last_frame_time: Optional[str] = None


class CameraListResponse(BaseModel):
    cameras: List[CameraResponse]
    total: int
    active: int
    errors: int


def get_camera_manager():
    """Dependency to get camera manager from app state."""
    from ..main import app
    return app.state.camera_manager


@router.get("", response_model=CameraListResponse)
async def list_cameras(camera_manager=Depends(get_camera_manager)):
    """List all cameras and their status."""
    statuses = camera_manager.get_all_status()
    return CameraListResponse(
        cameras=[CameraResponse(**s) for s in statuses],
        total=camera_manager.camera_count,
        active=camera_manager.active_count,
        errors=camera_manager.error_count
    )


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(camera_id: str, camera_manager=Depends(get_camera_manager)):
    """Get status of a specific camera."""
    status = camera_manager.get_camera_status(camera_id)
    if not status:
        raise HTTPException(status_code=404, detail="Camera not found")
    return CameraResponse(**status)


@router.post("", response_model=dict)
async def add_camera(camera: CameraCreate, camera_manager=Depends(get_camera_manager)):
    """Add a new camera to processing."""
    config = CameraConfig(
        camera_id=camera.camera_id,
        name=camera.name,
        stream_url=camera.stream_url,
        site_id=camera.site_id,
        zone_id=camera.zone_id,
        policy_id=camera.policy_id,
        fps=camera.fps,
        enabled=camera.enabled
    )
    success = await camera_manager.add_camera(config)
    if not success:
        raise HTTPException(status_code=400, detail="Camera already exists")
    return {"message": "Camera added successfully", "camera_id": camera.camera_id}


@router.delete("/{camera_id}")
async def remove_camera(camera_id: str, camera_manager=Depends(get_camera_manager)):
    """Remove a camera from processing."""
    success = await camera_manager.remove_camera(camera_id)
    if not success:
        raise HTTPException(status_code=404, detail="Camera not found")
    return {"message": "Camera removed successfully"}


@router.post("/{camera_id}/start")
async def start_camera(camera_id: str, camera_manager=Depends(get_camera_manager)):
    """Start processing a camera."""
    try:
        await camera_manager.start_camera(camera_id)
        return {"message": "Camera started successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{camera_id}/stop")
async def stop_camera(camera_id: str, camera_manager=Depends(get_camera_manager)):
    """Stop processing a camera."""
    await camera_manager.stop_camera(camera_id)
    return {"message": "Camera stopped successfully"}
