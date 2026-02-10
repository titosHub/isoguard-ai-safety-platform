"""Edge Detection API Routes."""
from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter(prefix="/detections", tags=["detections"])


class DetectionItem(BaseModel):
    detection_id: str
    camera_id: str
    site_id: str
    timestamp: str
    violations: List[dict]
    safety_score: float
    synced: bool


class DetectionListResponse(BaseModel):
    detections: List[DetectionItem]
    total: int
    page: int
    page_size: int


def get_local_storage():
    """Dependency to get local storage from app state."""
    from ..main import app
    return app.state.local_storage


@router.get("", response_model=DetectionListResponse)
async def list_detections(
    camera_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    storage=Depends(get_local_storage)
):
    """List recent detections from local storage."""
    # Get all evidence files
    all_evidence = []
    
    for camera in storage.list_cameras():
        if camera_id and camera != camera_id:
            continue
        evidence_list = storage.list_evidence(camera)
        all_evidence.extend(evidence_list)
    
    # Sort by timestamp descending
    all_evidence.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
    
    # Filter by date if provided
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        all_evidence = [e for e in all_evidence 
                       if datetime.fromisoformat(e.get("timestamp", "1970-01-01")) >= start_dt]
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        all_evidence = [e for e in all_evidence 
                       if datetime.fromisoformat(e.get("timestamp", "2099-01-01")) <= end_dt]
    
    # Paginate
    total = len(all_evidence)
    start = (page - 1) * page_size
    end = start + page_size
    page_evidence = all_evidence[start:end]
    
    return DetectionListResponse(
        detections=[DetectionItem(
            detection_id=e.get("detection_id", ""),
            camera_id=e.get("camera_id", ""),
            site_id=e.get("site_id", ""),
            timestamp=e.get("timestamp", ""),
            violations=e.get("violations", []),
            safety_score=e.get("safety_score", 0.0),
            synced=e.get("synced", False)
        ) for e in page_evidence],
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{detection_id}")
async def get_detection(detection_id: str, storage=Depends(get_local_storage)):
    """Get a specific detection by ID."""
    # Search across all cameras
    for camera in storage.list_cameras():
        metadata_path = storage.storage_path / camera / f"{detection_id}_metadata.json"
        if metadata_path.exists():
            import json
            with open(metadata_path) as f:
                return json.load(f)
    
    raise HTTPException(status_code=404, detail="Detection not found")


@router.get("/{detection_id}/image")
async def get_detection_image(detection_id: str, storage=Depends(get_local_storage)):
    """Get the image for a detection."""
    from fastapi.responses import FileResponse
    
    for camera in storage.list_cameras():
        image_path = storage.storage_path / camera / f"{detection_id}_blurred.jpg"
        if image_path.exists():
            return FileResponse(image_path, media_type="image/jpeg")
        
        # Try original if blurred doesn't exist
        image_path = storage.storage_path / camera / f"{detection_id}.jpg"
        if image_path.exists():
            return FileResponse(image_path, media_type="image/jpeg")
    
    raise HTTPException(status_code=404, detail="Image not found")
