"""Media upload and management API routes."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Depends, UploadFile, File, Form
import random
import string

from models.schemas import (
    MediaUploadRequest, MediaUploadResponse, MediaListResponse,
    MediaType, MediaPurpose, DetectionType
)
from core.security import get_current_user

router = APIRouter()


# Demo media storage
DEMO_MEDIA = []


@router.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    purpose: MediaPurpose = Form(...),
    description: Optional[str] = Form(None),
    site_id: Optional[str] = Form(None),
    zone_id: Optional[str] = Form(None),
    detection_type: Optional[str] = Form(None),
    labels: Optional[str] = Form(None),  # Comma-separated labels
    current_user: dict = Depends(get_current_user)
):
    """Upload media for analysis or AI training."""
    # Determine media type from file
    content_type = file.content_type or ""
    if "image" in content_type:
        media_type = MediaType.IMAGE
    elif "video" in content_type:
        media_type = MediaType.VIDEO
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload an image or video.")
    
    # Generate unique ID
    media_id = f"MED-{''.join(random.choices(string.ascii_uppercase + string.digits, k=10))}"
    
    # In production, you would:
    # 1. Save the file to edge storage or cloud (S3)
    # 2. Apply face blurring
    # 3. Generate thumbnail
    # 4. Queue for AI analysis if needed
    
    # Read file size
    file_content = await file.read()
    file_size = len(file_content)
    
    # Create media record
    media_record = {
        "id": media_id,
        "filename": file.filename,
        "original_url": f"/media/uploads/{media_id}_original.{file.filename.split('.')[-1]}",
        "blurred_url": f"/media/uploads/{media_id}_blurred.{file.filename.split('.')[-1]}",
        "thumbnail_url": f"/media/uploads/{media_id}_thumb.jpg",
        "media_type": media_type,
        "purpose": purpose,
        "file_size_bytes": file_size,
        "duration_seconds": 12.5 if media_type == MediaType.VIDEO else None,
        "uploaded_by": current_user.get("email", "User"),
        "uploaded_at": datetime.now().isoformat(),
        "analysis_status": "pending",
        "analysis_results": None,
        "site_id": site_id,
        "zone_id": zone_id,
        "detection_type": detection_type,
        "labels": labels.split(",") if labels else []
    }
    
    DEMO_MEDIA.append(media_record)
    
    return MediaUploadResponse(**media_record)


@router.get("", response_model=MediaListResponse)
async def list_media(
    purpose: Optional[MediaPurpose] = Query(None),
    media_type: Optional[MediaType] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """List uploaded media with filters."""
    filtered = DEMO_MEDIA.copy()
    
    if purpose:
        filtered = [m for m in filtered if m["purpose"] == purpose]
    if media_type:
        filtered = [m for m in filtered if m["media_type"] == media_type]
    
    # Pagination
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    items = filtered[start:end]
    
    return MediaListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{media_id}", response_model=MediaUploadResponse)
async def get_media(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get media details."""
    for media in DEMO_MEDIA:
        if media["id"] == media_id:
            return media
    raise HTTPException(status_code=404, detail="Media not found")


@router.post("/{media_id}/analyze")
async def analyze_media(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Trigger AI analysis on uploaded media."""
    for media in DEMO_MEDIA:
        if media["id"] == media_id:
            media["analysis_status"] = "processing"
            # In production, queue this for AI processing
            # Simulate analysis results
            media["analysis_results"] = {
                "detections": [
                    {"type": "person", "confidence": 0.96, "bbox": [100, 50, 200, 350]},
                    {"type": "no_hardhat", "confidence": 0.92, "bbox": [120, 50, 180, 100]}
                ],
                "safety_score": 65,
                "violations_found": 1,
                "processed_at": datetime.now().isoformat()
            }
            media["analysis_status"] = "completed"
            return {"message": "Analysis complete", "results": media["analysis_results"]}
    raise HTTPException(status_code=404, detail="Media not found")


@router.delete("/{media_id}")
async def delete_media(
    media_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete uploaded media."""
    global DEMO_MEDIA
    original_len = len(DEMO_MEDIA)
    DEMO_MEDIA = [m for m in DEMO_MEDIA if m["id"] != media_id]
    
    if len(DEMO_MEDIA) == original_len:
        raise HTTPException(status_code=404, detail="Media not found")
    
    return {"message": "Media deleted", "media_id": media_id}


@router.get("/{media_id}/download")
async def download_media(
    media_id: str,
    blurred: bool = Query(True, description="Download face-blurred version"),
    current_user: dict = Depends(get_current_user)
):
    """Download media file."""
    for media in DEMO_MEDIA:
        if media["id"] == media_id:
            url = media["blurred_url"] if blurred else media["original_url"]
            return {
                "message": "Download ready",
                "download_url": url,
                "filename": media["filename"],
                "blurred": blurred
            }
    raise HTTPException(status_code=404, detail="Media not found")


@router.get("/training/datasets")
async def list_training_datasets(
    current_user: dict = Depends(get_current_user)
):
    """List available training datasets."""
    training_media = [m for m in DEMO_MEDIA if m["purpose"] == MediaPurpose.TRAINING]
    
    # Group by detection type
    datasets = {}
    for media in training_media:
        dt = media.get("detection_type", "unknown")
        if dt not in datasets:
            datasets[dt] = {"count": 0, "total_size": 0, "items": []}
        datasets[dt]["count"] += 1
        datasets[dt]["total_size"] += media["file_size_bytes"]
        datasets[dt]["items"].append(media["id"])
    
    return {
        "total_training_items": len(training_media),
        "datasets": datasets
    }
