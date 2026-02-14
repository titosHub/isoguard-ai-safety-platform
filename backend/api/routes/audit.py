"""Audit log API routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query

from core.security import get_current_user
from services.audit_log import list_events

router = APIRouter()


def _require_audit_role(user: dict) -> None:
    role = (user.get('role') or '').lower()
    if role not in ('admin', 'auditor'):
        raise HTTPException(status_code=403, detail='Insufficient permissions')


@router.get("", summary="List audit events")
async def list_audit_events(
    sector_id: str | None = Query(None),
    organization_id: str | None = Query(None),
    action: str | None = Query(None),
    limit: int = Query(200, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
):
    _require_audit_role(current_user)

    items = list_events(
        sector_id=sector_id,
        organization_id=organization_id,
        action=action,
        limit=limit,
    )

    return {
        'items': [
            {
                'id': e.id,
                'at': e.at.isoformat() + 'Z',
                'user_id': e.user_id,
                'email': e.email,
                'role': e.role,
                'sector_id': e.sector_id,
                'organization_id': e.organization_id,
                'action': e.action,
                'resource_type': e.resource_type,
                'resource_id': e.resource_id,
                'metadata': e.metadata,
            }
            for e in items
        ],
        'total': len(items),
    }
