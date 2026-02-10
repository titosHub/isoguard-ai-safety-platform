"""Forensics and Violations API routes."""
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query, Depends, Body
from fastapi.responses import FileResponse
import random
import string

from models.schemas import (
    ViolationResponse, ViolationComment, ViolationCommentCreate,
    ViolationEvidence, ForensicsSearchRequest, ForensicsSearchResponse,
    FalsePositiveRequest, DetectionType, IncidentSeverity, IncidentStatus,
    MediaType
)
from core.security import get_current_user

router = APIRouter()


# Demo data generator
def generate_demo_violations(count: int = 50) -> List[dict]:
    """Generate demo violation data."""
    sites = [
        {"id": "site-001", "name": "Main Construction Site"},
        {"id": "site-002", "name": "Warehouse Complex B"},
        {"id": "site-003", "name": "Manufacturing Plant"},
    ]
    zones = [
        {"id": "zone-001", "name": "Heavy Equipment Area", "site_id": "site-001"},
        {"id": "zone-002", "name": "Loading Dock", "site_id": "site-001"},
        {"id": "zone-003", "name": "Assembly Line", "site_id": "site-002"},
        {"id": "zone-004", "name": "Storage Area", "site_id": "site-003"},
    ]
    cameras = [
        {"id": "cam-001", "name": "Entrance Camera", "zone_id": "zone-001"},
        {"id": "cam-002", "name": "Dock Camera", "zone_id": "zone-002"},
        {"id": "cam-003", "name": "Line Camera 1", "zone_id": "zone-003"},
        {"id": "cam-004", "name": "Storage Camera", "zone_id": "zone-004"},
    ]
    
    violations = []
    for i in range(count):
        camera = random.choice(cameras)
        zone = next((z for z in zones if z["id"] == camera["zone_id"]), zones[0])
        site = next((s for s in sites if s["id"] == zone["site_id"]), sites[0])
        detection_type = random.choice(list(DetectionType))
        severity = random.choice(list(IncidentSeverity))
        status = random.choice(list(IncidentStatus))
        confidence = random.uniform(0.75, 0.99)
        detected_at = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        violations.append({
            "id": f"VIO-{i+1:05d}",
            "detection_type": detection_type,
            "severity": severity,
            "confidence_score": round(confidence, 3),
            "description": f"Detected {detection_type.value.replace('_', ' ')} violation",
            "camera_id": camera["id"],
            "camera_name": camera["name"],
            "site_id": site["id"],
            "site_name": site["name"],
            "zone_id": zone["id"],
            "zone_name": zone["name"],
            "status": status,
            "is_false_positive": random.random() < 0.05,
            "false_positive_reason": None,
            "false_positive_marked_by": None,
            "detected_objects": [
                {"type": "person", "confidence": round(random.uniform(0.85, 0.99), 2), "bbox": [100, 100, 200, 300]}
            ],
            "evidence": [
                {
                    "id": f"EVD-{i+1:05d}-001",
                    "violation_id": f"VIO-{i+1:05d}",
                    "media_type": MediaType.VIDEO if random.random() > 0.3 else MediaType.IMAGE,
                    "original_url": f"/media/evidence/{i+1:05d}_original.mp4",
                    "blurred_url": f"/media/evidence/{i+1:05d}_blurred.mp4",
                    "thumbnail_url": f"/media/evidence/{i+1:05d}_thumb.jpg",
                    "duration_seconds": round(random.uniform(10, 15), 1),
                    "file_size_bytes": random.randint(500000, 5000000),
                    "created_at": detected_at.isoformat()
                }
            ],
            "comments": [],
            "comment_count": 0,
            "detected_at": detected_at.isoformat(),
            "resolved_at": (detected_at + timedelta(hours=random.randint(1, 48))).isoformat() if status == IncidentStatus.RESOLVED else None,
            "resolved_by": "John Doe" if status == IncidentStatus.RESOLVED else None
        })
    
    return violations


# Store demo data in memory
DEMO_VIOLATIONS = generate_demo_violations(100)


@router.post("/search", response_model=ForensicsSearchResponse)
async def search_forensics(
    search: ForensicsSearchRequest = Body(...),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Search violations with advanced filters and pagination."""
    filtered = DEMO_VIOLATIONS.copy()
    
    # Apply filters
    if search.start_date:
        filtered = [v for v in filtered if datetime.fromisoformat(v["detected_at"]) >= search.start_date]
    if search.end_date:
        filtered = [v for v in filtered if datetime.fromisoformat(v["detected_at"]) <= search.end_date]
    if search.site_ids:
        filtered = [v for v in filtered if v["site_id"] in search.site_ids]
    if search.zone_ids:
        filtered = [v for v in filtered if v["zone_id"] in search.zone_ids]
    if search.camera_ids:
        filtered = [v for v in filtered if v["camera_id"] in search.camera_ids]
    if search.detection_types:
        filtered = [v for v in filtered if v["detection_type"] in search.detection_types]
    if search.severities:
        filtered = [v for v in filtered if v["severity"] in search.severities]
    if search.statuses:
        filtered = [v for v in filtered if v["status"] in search.statuses]
    if search.min_confidence:
        filtered = [v for v in filtered if v["confidence_score"] >= search.min_confidence]
    if search.max_confidence:
        filtered = [v for v in filtered if v["confidence_score"] <= search.max_confidence]
    if not search.include_false_positives:
        filtered = [v for v in filtered if not v["is_false_positive"]]
    if search.search_text:
        search_lower = search.search_text.lower()
        filtered = [v for v in filtered if search_lower in v.get("description", "").lower()]
    
    # Sort by date (newest first)
    filtered.sort(key=lambda x: x["detected_at"], reverse=True)
    
    # Pagination
    total = len(filtered)
    total_pages = (total + page_size - 1) // page_size
    start = (page - 1) * page_size
    end = start + page_size
    items = filtered[start:end]
    
    return ForensicsSearchResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1
    )


@router.get("/{violation_id}", response_model=ViolationResponse)
async def get_violation(
    violation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific violation with all details."""
    for violation in DEMO_VIOLATIONS:
        if violation["id"] == violation_id:
            return violation
    raise HTTPException(status_code=404, detail="Violation not found")


@router.post("/{violation_id}/comments", response_model=ViolationComment)
async def add_comment(
    violation_id: str,
    comment: ViolationCommentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a comment to a violation."""
    for violation in DEMO_VIOLATIONS:
        if violation["id"] == violation_id:
            new_comment = {
                "id": f"CMT-{''.join(random.choices(string.ascii_uppercase + string.digits, k=8))}",
                "violation_id": violation_id,
                "user_id": current_user["user_id"],
                "user_name": current_user.get("email", "User"),
                "content": comment.content,
                "created_at": datetime.now().isoformat(),
                "acknowledged": False,
                "acknowledged_by": None,
                "acknowledged_at": None
            }
            violation["comments"].append(new_comment)
            violation["comment_count"] = len(violation["comments"])
            return new_comment
    raise HTTPException(status_code=404, detail="Violation not found")


@router.post("/{violation_id}/comments/{comment_id}/acknowledge")
async def acknowledge_comment(
    violation_id: str,
    comment_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Acknowledge a comment."""
    for violation in DEMO_VIOLATIONS:
        if violation["id"] == violation_id:
            for comment in violation["comments"]:
                if comment["id"] == comment_id:
                    comment["acknowledged"] = True
                    comment["acknowledged_by"] = current_user.get("email", "User")
                    comment["acknowledged_at"] = datetime.now().isoformat()
                    return {"message": "Comment acknowledged", "comment": comment}
            raise HTTPException(status_code=404, detail="Comment not found")
    raise HTTPException(status_code=404, detail="Violation not found")


@router.post("/{violation_id}/false-positive")
async def mark_false_positive(
    violation_id: str,
    request: FalsePositiveRequest,
    current_user: dict = Depends(get_current_user)
):
    """Mark a violation as false positive."""
    for violation in DEMO_VIOLATIONS:
        if violation["id"] == violation_id:
            violation["is_false_positive"] = True
            violation["false_positive_reason"] = request.reason
            violation["false_positive_marked_by"] = current_user.get("email", "User")
            return {"message": "Marked as false positive", "violation_id": violation_id}
    raise HTTPException(status_code=404, detail="Violation not found")


@router.delete("/{violation_id}/false-positive")
async def unmark_false_positive(
    violation_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove false positive mark from a violation."""
    for violation in DEMO_VIOLATIONS:
        if violation["id"] == violation_id:
            violation["is_false_positive"] = False
            violation["false_positive_reason"] = None
            violation["false_positive_marked_by"] = None
            return {"message": "False positive mark removed", "violation_id": violation_id}
    raise HTTPException(status_code=404, detail="Violation not found")


@router.get("/{violation_id}/evidence/{evidence_id}/download")
async def download_evidence(
    violation_id: str,
    evidence_id: str,
    blurred: bool = Query(True, description="Download face-blurred version"),
    current_user: dict = Depends(get_current_user)
):
    """Download evidence file (blurred or original)."""
    # In production, this would return the actual file
    return {
        "message": "Download initiated",
        "violation_id": violation_id,
        "evidence_id": evidence_id,
        "blurred": blurred,
        "download_url": f"/media/download/{evidence_id}{'_blurred' if blurred else '_original'}.mp4"
    }


@router.get("/stats/summary")
async def get_forensics_stats(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get forensics statistics summary."""
    cutoff = datetime.now() - timedelta(days=days)
    recent = [v for v in DEMO_VIOLATIONS if datetime.fromisoformat(v["detected_at"]) >= cutoff]
    
    # Count by detection type
    by_type = {}
    for v in recent:
        dt = v["detection_type"].value if hasattr(v["detection_type"], 'value') else v["detection_type"]
        by_type[dt] = by_type.get(dt, 0) + 1
    
    # Count by severity
    by_severity = {}
    for v in recent:
        sev = v["severity"].value if hasattr(v["severity"], 'value') else v["severity"]
        by_severity[sev] = by_severity.get(sev, 0) + 1
    
    # High confidence (95%+) violations
    high_confidence = len([v for v in recent if v["confidence_score"] >= 0.95])
    
    return {
        "total_violations": len(recent),
        "by_detection_type": by_type,
        "by_severity": by_severity,
        "high_confidence_count": high_confidence,
        "high_confidence_percentage": round(high_confidence / max(len(recent), 1) * 100, 1),
        "false_positive_count": len([v for v in recent if v["is_false_positive"]]),
        "resolved_count": len([v for v in recent if v["status"] == IncidentStatus.RESOLVED or v["status"] == "resolved"]),
        "average_confidence": round(sum(v["confidence_score"] for v in recent) / max(len(recent), 1), 3)
    }
