"""Camera management routes."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Depends
from models.schemas import CameraCreate, CameraResponse
from core.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[CameraResponse])
async def list_cameras(
    site_id: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List all cameras."""
    return [
        CameraResponse(
            id="cam-001",
            name="Main Entrance Camera",
            stream_url="rtsp://192.168.1.100:554/stream1",
            location_description="Building A - Main Entrance",
            site_id="site-001",
            policy_id="policy-001",
            is_active=True,
            status="online",
            last_frame_at=datetime.now()
        )
    ]


@router.get("/{camera_id}", response_model=CameraResponse)
async def get_camera(
    camera_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific camera by ID."""
    return CameraResponse(
        id=camera_id,
        name="Main Entrance Camera",
        stream_url="rtsp://192.168.1.100:554/stream1",
        location_description="Building A - Main Entrance",
        site_id="site-001",
        policy_id="policy-001",
        is_active=True,
        status="online",
        last_frame_at=datetime.now()
    )


@router.post("", response_model=CameraResponse)
async def create_camera(
    camera: CameraCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new camera."""
    return CameraResponse(
        id="cam-new",
        name=camera.name,
        stream_url=camera.stream_url,
        location_description=camera.location_description,
        site_id=camera.site_id,
        policy_id=camera.policy_id,
        is_active=True,
        status="connecting",
        last_frame_at=None
    )


@router.delete("/{camera_id}")
async def delete_camera(
    camera_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a camera."""
    return {"message": f"Camera {camera_id} deleted successfully"}


@router.get("/{camera_id}/status")
async def get_camera_status(
    camera_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get camera status and health metrics."""
    return {
        "camera_id": camera_id,
        "status": "online",
        "fps": 25,
        "resolution": "1920x1080",
        "last_detection_at": datetime.now(),
        "detections_today": 42,
        "uptime_percentage": 99.5
    }
