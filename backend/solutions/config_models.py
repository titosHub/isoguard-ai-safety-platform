"""Sector configuration models.

These configs define sector-specific settings such as AI models, RTSP streams,
zones/sites, feature toggles, reporting templates, and compliance rules.

This module is intentionally backend-first so analytics, reporting, and government
submission can all be driven by the same sector configuration.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SectorModelConfig(BaseModel):
    """AI model configuration for a sector.

    v2 notes:
    - Keep fields optional/defaulted so existing sector YAML remains valid.
    - Model "version" is sector-scoped (and can be overridden per-tenant later).
    """

    id: str
    name: str
    kind: str = Field(..., description="e.g. yolo, classifier, tracker")
    enabled: bool = True

    # Versioning / provenance
    version: str = '1'
    dataset_ref: Optional[str] = None
    metrics: Dict[str, Any] = {}  # precision/recall/etc.
    limitations: List[str] = []
    supported_camera_angles: List[str] = []

    # Optional model artifact path (local or remote), plus arbitrary model settings
    artifact: Optional[str] = None
    settings: Dict[str, Any] = {}


class SectorCameraConfig(BaseModel):
    """Camera stream configuration for a sector."""

    id: str
    name: str
    rtsp_url: str

    site_id: Optional[str] = None
    zone_id: Optional[str] = None

    enabled: bool = True
    tags: List[str] = []


class SectorZoneConfig(BaseModel):
    id: str
    name: str
    zone_type: str

    site_id: Optional[str] = None
    enabled: bool = True

    # Allow simple polygon definitions as list of points (optional)
    polygon: Optional[List[Dict[str, float]]] = None


class SectorRuleAppliesTo(BaseModel):
    """Scoping for a rule.

    Empty lists mean "all" within the tenant/sector.
    """

    sites: List[str] = []
    zones: List[str] = []
    cameras: List[str] = []


class SectorRuleActionConfig(BaseModel):
    """Action to run when a rule triggers.

    Scaffolding: we keep this declarative and interpret it in demo pipelines.
    """

    type: str  # create_violation|capture_image|save_video_clip|send_alert|report_entry|escalate
    params: Dict[str, Any] = {}


class SectorRuleConfig(BaseModel):
    """Safety rule definition (v2).

    detection_types are free-form strings (mapped to DetectionType / model outputs).

    Notes:
    - We keep the new v2 fields optional so existing YAML configs remain valid.
    - In production, tenant/site/zone/camera assignments should persist in DB.
    """

    id: str
    name: str
    description: str

    # Sector association (optional; config file implies sector_id)
    sector_id: Optional[str] = None

    # AI model ids used for this rule (optional; inferred by pipeline)
    ai_models: List[str] = []

    # Condition logic inputs
    detection_types: List[str]

    # Duration/time threshold (optional)
    duration_seconds: Optional[float] = Field(None, description="Trigger only if condition persists >= N seconds")

    # Time-of-day windows (optional)
    active_time_windows: List[Dict[str, Any]] = []  # e.g. {start: "22:00", end: "06:00", tz: "UTC"}

    severity: str = Field('high', description="critical|high|medium|low")

    # Example tags: OSHA, ISO45001, SECTION_54
    regulatory_tags: List[str] = []

    enabled: bool = True

    # Scope / assignments
    applies_to: Optional[SectorRuleAppliesTo] = None

    # Trigger actions (optional). If missing, pipelines can assume create_violation+capture_image.
    actions: List[SectorRuleActionConfig] = []

    # Versioning & governance (scaffold)
    version: str = '1'

    settings: Dict[str, Any] = {}


class SectorReportTemplateConfig(BaseModel):
    id: str
    name: str
    description: str

    # Supported: pdf, csv, json, xlsx
    formats: List[str] = ['pdf', 'csv', 'json', 'xlsx']

    # Arbitrary template settings (branding, sections, charts)
    settings: Dict[str, Any] = {}


class SectorFeatureToggles(BaseModel):
    reporting: bool = True
    government_submissions: bool = True
    rules_engine: bool = True


class SectorConfig(BaseModel):
    """Top-level sector configuration."""

    sector_id: str
    name: str
    version: str = '1'

    feature_toggles: SectorFeatureToggles = SectorFeatureToggles()

    ai_models: List[SectorModelConfig] = []
    cameras: List[SectorCameraConfig] = []
    zones: List[SectorZoneConfig] = []

    rules: List[SectorRuleConfig] = []
    report_templates: List[SectorReportTemplateConfig] = []
