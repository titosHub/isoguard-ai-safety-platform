"""Rules engine models.

The rules engine provides a compliance layer that maps raw detections/events into
sector-specific safety rules and regulatory tags.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class DetectionEvent(BaseModel):
    """A normalized event emitted by detection/incident pipelines."""

    event_id: str
    detected_at: datetime

    sector_id: Optional[str] = None

    site_id: Optional[str] = None
    zone_id: Optional[str] = None
    camera_id: Optional[str] = None

    # A list of detection type identifiers (aligned to sector config rules).
    detection_types: List[str] = []

    metadata: Dict[str, Any] = {}


class RuleEvaluationResult(BaseModel):
    rule_id: str
    rule_name: str

    triggered: bool
    matched_detection_types: List[str] = []

    severity: str
    regulatory_tags: List[str] = []

    details: Dict[str, Any] = {}


class EventRuleEvaluation(BaseModel):
    event_id: str
    results: List[RuleEvaluationResult] = []
