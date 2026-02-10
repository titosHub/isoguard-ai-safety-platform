"""Admin API routes for user and site management."""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query, Depends, Body
import random
import string

from models.schemas import (
    UserResponse, UserCreateAdmin, UserUpdateAdmin, UserListResponse,
    UserRole, SiteResponse, SiteCreate, SiteUpdate,
    ZoneResponse, ZoneCreate, ZoneUpdate,
    CameraResponse, CameraCreate, CameraUpdate
)
from core.security import get_current_user

router = APIRouter()


# Demo data
DEMO_USERS = [
    {
        "id": "usr-001",
        "email": "admin@company.com",
        "full_name": "John Admin",
        "role": UserRole.ADMIN,
        "organization_id": "org-001",
        "is_active": True,
        "site_ids": ["site-001", "site-002", "site-003"],
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "usr-002",
        "email": "safety@company.com",
        "full_name": "Jane Safety",
        "role": UserRole.SAFETY_OFFICER,
        "organization_id": "org-001",
        "is_active": True,
        "site_ids": ["site-001"],
        "created_at": datetime.now().isoformat()
    },
    {
        "id": "usr-003",
        "email": "operator@company.com",
        "full_name": "Bob Operator",
        "role": UserRole.OPERATOR,
        "organization_id": "org-001",
        "is_active": True,
        "site_ids": ["site-001", "site-002"],
        "created_at": datetime.now().isoformat()
    }
]

DEMO_SITES = [
    {"id": "site-001", "name": "Main Construction Site", "address": "123 Industrial Ave", "timezone": "America/New_York", "organization_id": "org-001", "is_active": True, "camera_count": 5, "created_at": datetime.now().isoformat()},
    {"id": "site-002", "name": "Warehouse Complex B", "address": "456 Storage Rd", "timezone": "America/New_York", "organization_id": "org-001", "is_active": True, "camera_count": 3, "created_at": datetime.now().isoformat()},
    {"id": "site-003", "name": "Manufacturing Plant", "address": "789 Factory Blvd", "timezone": "America/Chicago", "organization_id": "org-001", "is_active": True, "camera_count": 8, "created_at": datetime.now().isoformat()},
]

DEMO_ZONES = [
    {"id": "zone-001", "name": "Heavy Equipment Area", "zone_type": "exclusion", "site_id": "site-001", "camera_id": "cam-001", "polygon_coordinates": [{"x": 0, "y": 0}, {"x": 100, "y": 0}, {"x": 100, "y": 100}, {"x": 0, "y": 100}], "max_allowed": 0, "is_active": True},
    {"id": "zone-002", "name": "Loading Dock", "zone_type": "restricted", "site_id": "site-001", "camera_id": "cam-002", "polygon_coordinates": [], "max_allowed": 5, "is_active": True},
    {"id": "zone-003", "name": "Assembly Line", "zone_type": "mandatory_ppe", "site_id": "site-002", "camera_id": "cam-003", "polygon_coordinates": [], "max_allowed": 10, "is_active": True},
]

DEMO_CAMERAS = [
    {"id": "cam-001", "name": "Entrance Camera", "stream_url": "rtsp://192.168.1.100:554/stream1", "location_description": "Main Entrance", "site_id": "site-001", "policy_id": "policy-001", "is_active": True, "status": "online", "last_frame_at": datetime.now().isoformat()},
    {"id": "cam-002", "name": "Dock Camera", "stream_url": "rtsp://192.168.1.101:554/stream1", "location_description": "Loading Dock", "site_id": "site-001", "policy_id": "policy-001", "is_active": True, "status": "online", "last_frame_at": datetime.now().isoformat()},
    {"id": "cam-003", "name": "Line Camera 1", "stream_url": "rtsp://192.168.1.102:554/stream1", "location_description": "Assembly Line", "site_id": "site-002", "policy_id": "policy-002", "is_active": True, "status": "online", "last_frame_at": datetime.now().isoformat()},
    {"id": "cam-004", "name": "Storage Camera", "stream_url": "rtsp://192.168.1.103:554/stream1", "location_description": "Storage Area", "site_id": "site-003", "policy_id": "policy-001", "is_active": False, "status": "offline", "last_frame_at": None},
]


# ================== USER MANAGEMENT ==================

@router.get("/users", response_model=UserListResponse)
async def list_users(
    role: Optional[UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """List all users (admin only)."""
    filtered = DEMO_USERS.copy()
    
    if role:
        filtered = [u for u in filtered if u["role"] == role]
    if is_active is not None:
        filtered = [u for u in filtered if u["is_active"] == is_active]
    
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    items = filtered[start:end]
    
    return UserListResponse(items=items, total=total, page=page, page_size=page_size)


@router.post("/users", response_model=UserResponse)
async def create_user(
    user: UserCreateAdmin,
    current_user: dict = Depends(get_current_user)
):
    """Create a new user (admin only)."""
    # Check if email already exists
    if any(u["email"] == user.email for u in DEMO_USERS):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = {
        "id": f"usr-{''.join(random.choices(string.digits, k=3))}",
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "organization_id": user.organization_id,
        "is_active": True,
        "site_ids": user.site_ids or [],
        "created_at": datetime.now().isoformat()
    }
    DEMO_USERS.append(new_user)
    return new_user


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get user details."""
    for user in DEMO_USERS:
        if user["id"] == user_id:
            return user
    raise HTTPException(status_code=404, detail="User not found")


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update: UserUpdateAdmin,
    current_user: dict = Depends(get_current_user)
):
    """Update user (admin only)."""
    for user in DEMO_USERS:
        if user["id"] == user_id:
            if update.full_name is not None:
                user["full_name"] = update.full_name
            if update.role is not None:
                user["role"] = update.role
            if update.is_active is not None:
                user["is_active"] = update.is_active
            if update.site_ids is not None:
                user["site_ids"] = update.site_ids
            return user
    raise HTTPException(status_code=404, detail="User not found")


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete user (admin only)."""
    global DEMO_USERS
    original_len = len(DEMO_USERS)
    DEMO_USERS = [u for u in DEMO_USERS if u["id"] != user_id]
    
    if len(DEMO_USERS) == original_len:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted", "user_id": user_id}


# ================== SITE MANAGEMENT ==================

@router.get("/sites", response_model=List[SiteResponse])
async def list_sites_admin(
    current_user: dict = Depends(get_current_user)
):
    """List all sites."""
    return DEMO_SITES


@router.post("/sites", response_model=SiteResponse)
async def create_site(
    site: SiteCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new site."""
    new_site = {
        "id": f"site-{''.join(random.choices(string.digits, k=3))}",
        "name": site.name,
        "address": site.address,
        "timezone": site.timezone,
        "organization_id": site.organization_id,
        "is_active": True,
        "camera_count": 0,
        "created_at": datetime.now().isoformat()
    }
    DEMO_SITES.append(new_site)
    return new_site


@router.patch("/sites/{site_id}", response_model=SiteResponse)
async def update_site(
    site_id: str,
    update: SiteUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update site."""
    for site in DEMO_SITES:
        if site["id"] == site_id:
            if update.name is not None:
                site["name"] = update.name
            if update.address is not None:
                site["address"] = update.address
            if update.timezone is not None:
                site["timezone"] = update.timezone
            if update.is_active is not None:
                site["is_active"] = update.is_active
            return site
    raise HTTPException(status_code=404, detail="Site not found")


@router.delete("/sites/{site_id}")
async def delete_site(
    site_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete site."""
    global DEMO_SITES
    DEMO_SITES = [s for s in DEMO_SITES if s["id"] != site_id]
    return {"message": "Site deleted", "site_id": site_id}


# ================== ZONE MANAGEMENT ==================

@router.get("/zones", response_model=List[ZoneResponse])
async def list_zones(
    site_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List zones."""
    if site_id:
        return [z for z in DEMO_ZONES if z["site_id"] == site_id]
    return DEMO_ZONES


@router.post("/zones", response_model=ZoneResponse)
async def create_zone(
    zone: ZoneCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new zone."""
    new_zone = {
        "id": f"zone-{''.join(random.choices(string.digits, k=3))}",
        "name": zone.name,
        "zone_type": zone.zone_type,
        "site_id": zone.site_id,
        "camera_id": zone.camera_id,
        "polygon_coordinates": zone.polygon_coordinates,
        "max_allowed": zone.max_allowed,
        "is_active": True
    }
    DEMO_ZONES.append(new_zone)
    return new_zone


@router.patch("/zones/{zone_id}", response_model=ZoneResponse)
async def update_zone(
    zone_id: str,
    update: ZoneUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update zone."""
    for zone in DEMO_ZONES:
        if zone["id"] == zone_id:
            if update.name is not None:
                zone["name"] = update.name
            if update.zone_type is not None:
                zone["zone_type"] = update.zone_type
            if update.polygon_coordinates is not None:
                zone["polygon_coordinates"] = update.polygon_coordinates
            if update.max_allowed is not None:
                zone["max_allowed"] = update.max_allowed
            if update.is_active is not None:
                zone["is_active"] = update.is_active
            return zone
    raise HTTPException(status_code=404, detail="Zone not found")


@router.delete("/zones/{zone_id}")
async def delete_zone(
    zone_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete zone."""
    global DEMO_ZONES
    DEMO_ZONES = [z for z in DEMO_ZONES if z["id"] != zone_id]
    return {"message": "Zone deleted", "zone_id": zone_id}


# ================== CAMERA MANAGEMENT ==================

@router.get("/cameras", response_model=List[CameraResponse])
async def list_cameras_admin(
    site_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List cameras."""
    if site_id:
        return [c for c in DEMO_CAMERAS if c["site_id"] == site_id]
    return DEMO_CAMERAS


@router.post("/cameras", response_model=CameraResponse)
async def create_camera(
    camera: CameraCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new camera."""
    new_camera = {
        "id": f"cam-{''.join(random.choices(string.digits, k=3))}",
        "name": camera.name,
        "stream_url": camera.stream_url,
        "location_description": camera.location_description,
        "site_id": camera.site_id,
        "policy_id": camera.policy_id,
        "is_active": True,
        "status": "connecting",
        "last_frame_at": None
    }
    DEMO_CAMERAS.append(new_camera)
    
    # Update site camera count
    for site in DEMO_SITES:
        if site["id"] == camera.site_id:
            site["camera_count"] = len([c for c in DEMO_CAMERAS if c["site_id"] == camera.site_id])
    
    return new_camera


@router.patch("/cameras/{camera_id}", response_model=CameraResponse)
async def update_camera(
    camera_id: str,
    update: CameraUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update camera."""
    for camera in DEMO_CAMERAS:
        if camera["id"] == camera_id:
            if update.name is not None:
                camera["name"] = update.name
            if update.stream_url is not None:
                camera["stream_url"] = update.stream_url
            if update.location_description is not None:
                camera["location_description"] = update.location_description
            if update.is_active is not None:
                camera["is_active"] = update.is_active
                camera["status"] = "online" if update.is_active else "offline"
            if update.policy_id is not None:
                camera["policy_id"] = update.policy_id
            return camera
    raise HTTPException(status_code=404, detail="Camera not found")


@router.delete("/cameras/{camera_id}")
async def delete_camera_admin(
    camera_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete camera."""
    global DEMO_CAMERAS
    DEMO_CAMERAS = [c for c in DEMO_CAMERAS if c["id"] != camera_id]
    return {"message": "Camera deleted", "camera_id": camera_id}


# ================== ORGANIZATION OVERVIEW ==================

@router.get("/overview")
async def get_organization_overview(
    current_user: dict = Depends(get_current_user)
):
    """Get organization overview stats."""
    return {
        "total_users": len(DEMO_USERS),
        "active_users": len([u for u in DEMO_USERS if u["is_active"]]),
        "total_sites": len(DEMO_SITES),
        "active_sites": len([s for s in DEMO_SITES if s["is_active"]]),
        "total_zones": len(DEMO_ZONES),
        "total_cameras": len(DEMO_CAMERAS),
        "online_cameras": len([c for c in DEMO_CAMERAS if c["status"] == "online"]),
        "users_by_role": {
            "admin": len([u for u in DEMO_USERS if u["role"] == UserRole.ADMIN]),
            "safety_officer": len([u for u in DEMO_USERS if u["role"] == UserRole.SAFETY_OFFICER]),
            "operator": len([u for u in DEMO_USERS if u["role"] == UserRole.OPERATOR]),
            "viewer": len([u for u in DEMO_USERS if u["role"] == UserRole.VIEWER]),
        }
    }
