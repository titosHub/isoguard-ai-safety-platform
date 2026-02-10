"""Site/Location management routes."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Depends
from models.schemas import SiteCreate, SiteResponse, ZoneCreate, ZoneResponse
from core.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[SiteResponse])
async def list_sites(
    organization_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List all sites."""
    return [
        SiteResponse(
            id="site-001",
            name="Main Construction Site",
            address="123 Industrial Ave, City, State 12345",
            timezone="America/New_York",
            organization_id="org-001",
            is_active=True,
            camera_count=5,
            created_at=datetime.now()
        )
    ]


@router.get("/{site_id}", response_model=SiteResponse)
async def get_site(
    site_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific site by ID."""
    return SiteResponse(
        id=site_id,
        name="Main Construction Site",
        address="123 Industrial Ave, City, State 12345",
        timezone="America/New_York",
        organization_id="org-001",
        is_active=True,
        camera_count=5,
        created_at=datetime.now()
    )


@router.post("", response_model=SiteResponse)
async def create_site(
    site: SiteCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new site."""
    return SiteResponse(
        id="site-new",
        name=site.name,
        address=site.address,
        timezone=site.timezone,
        organization_id=site.organization_id,
        is_active=True,
        camera_count=0,
        created_at=datetime.now()
    )


@router.get("/{site_id}/zones", response_model=List[ZoneResponse])
async def list_zones(
    site_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List all zones for a site."""
    return [
        ZoneResponse(
            id="zone-001",
            name="Heavy Equipment Area",
            zone_type="exclusion",
            polygon_coordinates=[
                {"x": 100, "y": 100},
                {"x": 400, "y": 100},
                {"x": 400, "y": 300},
                {"x": 100, "y": 300}
            ],
            max_allowed=0,
            site_id=site_id,
            camera_id="cam-001",
            is_active=True
        )
    ]


@router.post("/{site_id}/zones", response_model=ZoneResponse)
async def create_zone(
    site_id: str,
    zone: ZoneCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new zone for a site."""
    return ZoneResponse(
        id="zone-new",
        name=zone.name,
        zone_type=zone.zone_type,
        polygon_coordinates=zone.polygon_coordinates,
        max_allowed=zone.max_allowed,
        site_id=site_id,
        camera_id=zone.camera_id,
        is_active=True
    )


@router.get("/{site_id}/summary")
async def get_site_summary(
    site_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get site summary with key metrics."""
    return {
        "site_id": site_id,
        "total_cameras": 5,
        "active_cameras": 4,
        "total_zones": 3,
        "incidents_today": 2,
        "incidents_this_week": 8,
        "safety_score": 82.5,
        "compliance_rate": 94.0
    }
