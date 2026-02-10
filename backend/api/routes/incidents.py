"""Incidents management routes."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Depends
from models.schemas import (
    IncidentCreate, IncidentResponse, IncidentUpdate,
    IncidentSeverity, IncidentStatus, ViolationType
)
from core.security import get_current_user

router = APIRouter()


# Demo data for incidents
DEMO_INCIDENTS = [
    {
        "id": "inc-001",
        "violation_type": ViolationType.PPE_VIOLATION,
        "severity": IncidentSeverity.HIGH,
        "description": "Worker detected without hardhat in Zone A",
        "camera_id": "cam-001",
        "site_id": "site-001",
        "zone_id": "zone-001",
        "status": IncidentStatus.OPEN,
        "detected_objects": [{"type": "person", "confidence": 0.95}, {"type": "no_hardhat", "confidence": 0.88}],
        "frame_url": "/media/incidents/inc-001.jpg",
        "confidence_score": 0.88,
        "detected_at": datetime.now(),
        "resolved_at": None,
        "resolution_notes": None
    }
]


@router.get("", response_model=List[IncidentResponse])
async def list_incidents(
    site_id: Optional[str] = Query(None),
    camera_id: Optional[str] = Query(None),
    severity: Optional[IncidentSeverity] = Query(None),
    status: Optional[IncidentStatus] = Query(None),
    violation_type: Optional[ViolationType] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """List incidents with filtering options."""
    # TODO: Replace with actual database query
    filtered = DEMO_INCIDENTS
    
    if site_id:
        filtered = [i for i in filtered if i["site_id"] == site_id]
    if severity:
        filtered = [i for i in filtered if i["severity"] == severity]
    if status:
        filtered = [i for i in filtered if i["status"] == status]
    
    return filtered[skip:skip + limit]


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific incident by ID."""
    for incident in DEMO_INCIDENTS:
        if incident["id"] == incident_id:
            return incident
    raise HTTPException(status_code=404, detail="Incident not found")


@router.post("", response_model=IncidentResponse)
async def create_incident(
    incident: IncidentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new incident."""
    new_incident = {
        "id": f"inc-{len(DEMO_INCIDENTS) + 1:03d}",
        **incident.model_dump(),
        "status": IncidentStatus.OPEN,
        "detected_at": datetime.now(),
        "resolved_at": None,
        "resolution_notes": None
    }
    DEMO_INCIDENTS.append(new_incident)
    return new_incident


@router.patch("/{incident_id}", response_model=IncidentResponse)
async def update_incident(
    incident_id: str,
    update: IncidentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update an incident."""
    for i, incident in enumerate(DEMO_INCIDENTS):
        if incident["id"] == incident_id:
            if update.status:
                DEMO_INCIDENTS[i]["status"] = update.status
                if update.status == IncidentStatus.RESOLVED:
                    DEMO_INCIDENTS[i]["resolved_at"] = datetime.now()
            if update.severity:
                DEMO_INCIDENTS[i]["severity"] = update.severity
            if update.resolution_notes:
                DEMO_INCIDENTS[i]["resolution_notes"] = update.resolution_notes
            return DEMO_INCIDENTS[i]
    raise HTTPException(status_code=404, detail="Incident not found")


@router.get("/summary/counts")
async def get_incident_summary(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get incident summary counts."""
    return {
        "total": len(DEMO_INCIDENTS),
        "open": len([i for i in DEMO_INCIDENTS if i["status"] == IncidentStatus.OPEN]),
        "resolved": len([i for i in DEMO_INCIDENTS if i["status"] == IncidentStatus.RESOLVED]),
        "by_severity": {
            "critical": len([i for i in DEMO_INCIDENTS if i["severity"] == IncidentSeverity.CRITICAL]),
            "high": len([i for i in DEMO_INCIDENTS if i["severity"] == IncidentSeverity.HIGH]),
            "medium": len([i for i in DEMO_INCIDENTS if i["severity"] == IncidentSeverity.MEDIUM]),
            "low": len([i for i in DEMO_INCIDENTS if i["severity"] == IncidentSeverity.LOW])
        }
    }
