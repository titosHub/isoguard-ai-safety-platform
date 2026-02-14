"""Audit logging service (scaffold).

In production this should be persisted to a database and/or SIEM.

We use this to create an audit trail for RBAC-sensitive actions:
- Downloading original (non-blurred) evidence
- Changes to camera/rules/model assignments
- False-positive marking and assignments
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List, Optional


@dataclass
class AuditEvent:
    id: str
    at: datetime
    user_id: Optional[str]
    email: Optional[str]
    role: Optional[str]

    sector_id: Optional[str]
    organization_id: Optional[str]

    action: str
    resource_type: str
    resource_id: str

    metadata: Dict[str, Any]


_EVENTS: List[AuditEvent] = []


def log_event(
    *,
    user: dict,
    action: str,
    resource_type: str,
    resource_id: str,
    sector_id: Optional[str] = None,
    organization_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
) -> AuditEvent:
    evt = AuditEvent(
        id=f"audit-{len(_EVENTS)+1:06d}",
        at=datetime.utcnow(),
        user_id=user.get('user_id'),
        email=user.get('email'),
        role=user.get('role'),
        sector_id=sector_id,
        organization_id=organization_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata or {},
    )
    _EVENTS.append(evt)
    return evt


def list_events(
    *,
    sector_id: Optional[str] = None,
    organization_id: Optional[str] = None,
    action: Optional[str] = None,
    limit: int = 200,
) -> List[AuditEvent]:
    items = list(_EVENTS)

    if sector_id:
        items = [e for e in items if e.sector_id == sector_id]
    if organization_id:
        items = [e for e in items if e.organization_id == organization_id]
    if action:
        items = [e for e in items if e.action == action]

    return items[-limit:]
