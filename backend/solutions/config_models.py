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
    """AI model configuration for a sector."""

    id: str
    name: str
    kind: str = Field(..., description="e.g. yolo, classifier, tracker")
    enabled: bool = True

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


class SectorRuleConfig(BaseModel):
    """Compliance rule definition.

    detection_types are free-form strings (mapped to DetectionType / model outputs).
    """

    id: str
    name: str
    description: str

    detection_types: List[str]
    severity: str = Field('high', description="critical|high|medium|low")

    # Example tags: OSHA, ISO45001, SECTION_54
    regulatory_tags: List[str] = []

    enabled: bool = True
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
