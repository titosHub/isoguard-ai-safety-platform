"""Pydantic schemas for API request/response models."""
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from enum import Enum


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    SAFETY_OFFICER = "safety_officer"
    OPERATOR = "operator"
    VIEWER = "viewer"


class DetectionType(str, Enum):
    PPE_HARDHAT = "ppe_hardhat"
    PPE_VEST = "ppe_vest"
    PPE_MASK = "ppe_mask"
    PPE_GLOVES = "ppe_gloves"
    PPE_GOGGLES = "ppe_goggles"
    PROXIMITY_MACHINERY = "proximity_machinery"
    PROXIMITY_VEHICLE = "proximity_vehicle"
    EXCLUSION_ZONE = "exclusion_zone"
    UNSAFE_BEHAVIOR = "unsafe_behavior"
    FALL_HAZARD = "fall_hazard"
    FIRE_HAZARD = "fire_hazard"


class MediaType(str, Enum):
    IMAGE = "image"
    VIDEO = "video"


class MediaPurpose(str, Enum):
    EVIDENCE = "evidence"
    TRAINING = "training"
    INSPECTION = "inspection"
    ANALYSIS = "analysis"


class IncidentSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class IncidentStatus(str, Enum):
    OPEN = "open"
    INVESTIGATING = "investigating"
    RESOLVED = "resolved"
    CLOSED = "closed"


class ViolationType(str, Enum):
    PPE_VIOLATION = "ppe_violation"
    PROXIMITY_VIOLATION = "proximity_violation"
    EXCLUSION_ZONE = "exclusion_zone"
    UNSAFE_BEHAVIOR = "unsafe_behavior"
    EQUIPMENT_HAZARD = "equipment_hazard"


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole = UserRole.VIEWER


class UserCreate(UserBase):
    password: str
    organization_id: Optional[str] = None


class UserResponse(UserBase):
    id: str
    organization_id: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Organization Schemas
class OrganizationBase(BaseModel):
    name: str
    industry: str
    country: str


class OrganizationCreate(OrganizationBase):
    subscription_tier: str = "professional"


class OrganizationResponse(OrganizationBase):
    id: str
    subscription_tier: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Site/Location Schemas
class SiteBase(BaseModel):
    name: str
    address: str
    timezone: str = "UTC"


class SiteCreate(SiteBase):
    organization_id: str


class SiteResponse(SiteBase):
    id: str
    organization_id: str
    is_active: bool
    camera_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


# Zone Schemas
class ZoneBase(BaseModel):
    name: str
    zone_type: str  # exclusion, restricted, mandatory_ppe
    polygon_coordinates: List[Dict[str, float]]
    max_allowed: int = 0


class ZoneCreate(ZoneBase):
    site_id: str
    camera_id: str


class ZoneResponse(ZoneBase):
    id: str
    site_id: str
    camera_id: str
    is_active: bool
    
    class Config:
        from_attributes = True


# Camera Schemas
class CameraBase(BaseModel):
    name: str
    stream_url: str
    location_description: Optional[str] = None


class CameraCreate(CameraBase):
    site_id: str
    policy_id: Optional[str] = None


class CameraResponse(CameraBase):
    id: str
    site_id: str
    policy_id: Optional[str]
    is_active: bool
    status: str
    last_frame_at: Optional[datetime]
    
    class Config:
        from_attributes = True


# Incident Schemas
class IncidentBase(BaseModel):
    violation_type: ViolationType
    severity: IncidentSeverity
    description: Optional[str] = None


class IncidentCreate(IncidentBase):
    camera_id: str
    site_id: str
    zone_id: Optional[str] = None
    detected_objects: List[Dict[str, Any]] = []
    frame_url: Optional[str] = None
    confidence_score: float


class IncidentResponse(IncidentBase):
    id: str
    camera_id: str
    site_id: str
    zone_id: Optional[str]
    status: IncidentStatus
    detected_objects: List[Dict[str, Any]]
    frame_url: Optional[str]
    confidence_score: float
    detected_at: datetime
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    
    class Config:
        from_attributes = True


class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    severity: Optional[IncidentSeverity] = None
    resolution_notes: Optional[str] = None


# Near-Miss Schemas
class NearMissCreate(BaseModel):
    camera_id: str
    site_id: str
    near_miss_type: str
    description: Optional[str] = None
    involved_objects: List[Dict[str, Any]] = []
    frame_url: Optional[str] = None


class NearMissResponse(NearMissCreate):
    id: str
    detected_at: datetime
    reviewed: bool = False
    
    class Config:
        from_attributes = True


# Analytics Schemas
class DateRangeFilter(BaseModel):
    start_date: datetime
    end_date: datetime
    site_ids: Optional[List[str]] = None
    camera_ids: Optional[List[str]] = None


class IncidentTrendData(BaseModel):
    date: str
    incident_count: int
    severity_breakdown: Dict[str, int]


class LocationRiskData(BaseModel):
    site_id: str
    site_name: str
    zone_id: Optional[str]
    zone_name: Optional[str]
    incident_count: int
    risk_score: float
    top_violation_types: List[Dict[str, Any]]


class SafetyScoreData(BaseModel):
    overall_score: float
    trir: float  # Total Recordable Incident Rate
    ltifr: float  # Lost Time Injury Frequency Rate
    severity_weighted_index: float
    predictive_risk_probability: float
    compliance_coverage: float
    trend: str  # improving, stable, declining


class KPIDashboardData(BaseModel):
    safety_score: SafetyScoreData
    incident_trends: List[IncidentTrendData]
    location_risks: List[LocationRiskData]
    recent_incidents: List[IncidentResponse]
    near_miss_count: int
    corrective_action_closure_rate: float
    mean_time_to_detect: float
    mean_time_to_resolve: float


# Corrective Action Schemas
class CorrectiveActionBase(BaseModel):
    title: str
    description: str
    priority: str
    due_date: datetime
    assigned_to: Optional[str] = None


class CorrectiveActionCreate(CorrectiveActionBase):
    incident_id: str


class CorrectiveActionResponse(CorrectiveActionBase):
    id: str
    incident_id: str
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    effectiveness_score: Optional[float]
    
    class Config:
        from_attributes = True


# Report Schemas
class ReportRequest(BaseModel):
    report_type: str  # daily, weekly, monthly, custom
    start_date: datetime
    end_date: datetime
    site_ids: Optional[List[str]] = None
    include_charts: bool = True
    format: str = "pdf"  # pdf, xlsx, csv


class ReportResponse(BaseModel):
    id: str
    report_type: str
    status: str
    download_url: Optional[str]
    created_at: datetime
    completed_at: Optional[datetime]


# Authentication Schemas
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# =============================================================================
# VIOLATION & FORENSICS SCHEMAS
# =============================================================================

class ViolationComment(BaseModel):
    """Comment on a violation."""
    id: str
    violation_id: str
    user_id: str
    user_name: str
    content: str
    created_at: datetime
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None


class ViolationCommentCreate(BaseModel):
    """Create a new comment."""
    content: str


class ViolationEvidence(BaseModel):
    """Evidence attached to a violation."""
    id: str
    violation_id: str
    media_type: MediaType
    original_url: str  # Original high-res
    blurred_url: str  # Face-blurred version
    thumbnail_url: Optional[str] = None
    duration_seconds: Optional[float] = None  # For videos (10-15 sec)
    file_size_bytes: int
    created_at: datetime


class ViolationBase(BaseModel):
    """Base violation model."""
    detection_type: DetectionType
    severity: IncidentSeverity
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Detection confidence (0-1)")
    description: Optional[str] = None


class ViolationCreate(ViolationBase):
    """Create a new violation."""
    camera_id: str
    site_id: str
    zone_id: Optional[str] = None
    detected_objects: List[Dict[str, Any]] = []
    frame_data: Optional[str] = None  # Base64 encoded frame


class ViolationResponse(ViolationBase):
    """Full violation response."""
    id: str
    camera_id: str
    camera_name: str
    site_id: str
    site_name: str
    zone_id: Optional[str]
    zone_name: Optional[str]
    status: IncidentStatus
    is_false_positive: bool = False
    false_positive_reason: Optional[str] = None
    false_positive_marked_by: Optional[str] = None
    detected_objects: List[Dict[str, Any]]
    evidence: List[ViolationEvidence] = []
    comments: List[ViolationComment] = []
    comment_count: int = 0
    detected_at: datetime
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[str] = None
    
    class Config:
        from_attributes = True


class ViolationUpdate(BaseModel):
    """Update violation."""
    status: Optional[IncidentStatus] = None
    severity: Optional[IncidentSeverity] = None
    resolution_notes: Optional[str] = None


class FalsePositiveRequest(BaseModel):
    """Mark violation as false positive."""
    reason: str


# Forensics Search
class ForensicsSearchRequest(BaseModel):
    """Search parameters for forensics."""
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    site_ids: Optional[List[str]] = None
    zone_ids: Optional[List[str]] = None
    camera_ids: Optional[List[str]] = None
    detection_types: Optional[List[DetectionType]] = None
    severities: Optional[List[IncidentSeverity]] = None
    statuses: Optional[List[IncidentStatus]] = None
    min_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    max_confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    include_false_positives: bool = False
    search_text: Optional[str] = None  # Search in descriptions/comments


class ForensicsSearchResponse(BaseModel):
    """Paginated forensics search results."""
    items: List[ViolationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_previous: bool


# =============================================================================
# MEDIA UPLOAD SCHEMAS
# =============================================================================

class MediaUploadRequest(BaseModel):
    """Media upload metadata."""
    purpose: MediaPurpose
    media_type: MediaType
    description: Optional[str] = None
    site_id: Optional[str] = None
    zone_id: Optional[str] = None
    detection_type: Optional[DetectionType] = None  # For training data
    labels: Optional[List[str]] = []  # For AI training labels


class MediaUploadResponse(BaseModel):
    """Media upload response."""
    id: str
    filename: str
    original_url: str
    blurred_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    media_type: MediaType
    purpose: MediaPurpose
    file_size_bytes: int
    duration_seconds: Optional[float] = None
    uploaded_by: str
    uploaded_at: datetime
    analysis_status: str = "pending"  # pending, processing, completed, failed
    analysis_results: Optional[Dict[str, Any]] = None


class MediaListResponse(BaseModel):
    """Paginated media list."""
    items: List[MediaUploadResponse]
    total: int
    page: int
    page_size: int


# =============================================================================
# ADMIN & USER MANAGEMENT SCHEMAS
# =============================================================================

class UserCreateAdmin(BaseModel):
    """Admin user creation."""
    email: EmailStr
    full_name: str
    password: str
    role: UserRole
    organization_id: str
    site_ids: Optional[List[str]] = []  # Sites user can access


class UserUpdateAdmin(BaseModel):
    """Admin user update."""
    full_name: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    site_ids: Optional[List[str]] = None


class UserListResponse(BaseModel):
    """Paginated user list."""
    items: List[UserResponse]
    total: int
    page: int
    page_size: int


# =============================================================================
# SITE/ZONE/CAMERA MANAGEMENT SCHEMAS
# =============================================================================

class SiteUpdate(BaseModel):
    """Update site."""
    name: Optional[str] = None
    address: Optional[str] = None
    timezone: Optional[str] = None
    is_active: Optional[bool] = None


class ZoneUpdate(BaseModel):
    """Update zone."""
    name: Optional[str] = None
    zone_type: Optional[str] = None
    polygon_coordinates: Optional[List[Dict[str, float]]] = None
    max_allowed: Optional[int] = None
    is_active: Optional[bool] = None


class CameraUpdate(BaseModel):
    """Update camera."""
    name: Optional[str] = None
    stream_url: Optional[str] = None
    location_description: Optional[str] = None
    is_active: Optional[bool] = None
    policy_id: Optional[str] = None


# =============================================================================
# REPORT BUILDER SCHEMAS
# =============================================================================

class ReportBuilderRequest(BaseModel):
    """Dynamic report builder request."""
    title: str
    description: Optional[str] = None
    start_date: datetime
    end_date: datetime
    site_ids: Optional[List[str]] = None
    detection_types: Optional[List[DetectionType]] = None
    include_sections: List[str] = ["summary", "trends", "violations", "recommendations"]
    chart_types: List[str] = ["bar", "line", "pie"]
    group_by: str = "day"  # day, week, month
    format: str = "pdf"  # pdf, xlsx, html


class ReportBuilderResponse(BaseModel):
    """Report builder response."""
    id: str
    title: str
    status: str
    download_url: Optional[str] = None
    preview_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    completed_at: Optional[datetime] = None


# =============================================================================
# ALERT SCHEMAS
# =============================================================================

class AlertConfig(BaseModel):
    """Alert configuration."""
    id: str
    name: str
    detection_types: List[DetectionType]
    severity_threshold: IncidentSeverity
    confidence_threshold: float = 0.95
    site_ids: Optional[List[str]] = None
    zone_ids: Optional[List[str]] = None
    sound_enabled: bool = True
    visual_enabled: bool = True
    email_enabled: bool = False
    sms_enabled: bool = False
    recipients: List[str] = []
    is_active: bool = True


class AlertEvent(BaseModel):
    """Real-time alert event."""
    id: str
    violation_id: str
    alert_config_id: str
    detection_type: DetectionType
    severity: IncidentSeverity
    confidence: float
    site_name: str
    zone_name: Optional[str]
    camera_name: str
    thumbnail_url: Optional[str]
    triggered_at: datetime
    acknowledged: bool = False
    acknowledged_by: Optional[str] = None
