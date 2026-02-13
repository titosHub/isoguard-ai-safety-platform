"""Sector configuration and registry routes."""

from fastapi import APIRouter, Depends, HTTPException, Query

from core.security import get_current_user
from models.schemas import ExecutiveBoardView, OperationalView
from services.entitlements_service import list_sectors_with_access, require_sector_entitlement
from services.sector_analytics.registry import get_plugin
from services.rules_engine.engine import evaluate_events, list_sector_rules
from services.rules_engine.models import DetectionEvent
from solutions.loader import load_sector_config
from solutions.registry import SUPPORTED_SECTORS, list_sector_summaries

router = APIRouter()


@router.get("", summary="List supported sectors")
async def list_sectors(current_user: dict = Depends(get_current_user)):
    access_by_sector = {
        s['sector_id']: s for s in list_sectors_with_access(current_user)
    }

    items = []
    for summary in list_sector_summaries():
        a = access_by_sector.get(summary['sector_id'], {'entitled': False, 'access': 'locked'})
        items.append({**summary, **a})

    return {
        "items": items,
        "total": len(items),
    }


@router.get("/{sector_id}/config", summary="Get validated sector config")
async def get_sector_config(sector_id: str, current_user: dict = Depends(get_current_user)):
    require_sector_entitlement(current_user, sector_id)

    try:
        cfg = load_sector_config(sector_id)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Sector config not found")

    return cfg.model_dump()


@router.get("/{sector_id}/executive", response_model=ExecutiveBoardView, summary="Sector Executive Board View")
async def sector_executive_view(
    sector_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    plugin = get_plugin(sector_id)
    return await plugin.get_executive_view(days=days)


@router.get("/{sector_id}/operational", response_model=OperationalView, summary="Sector Operational View")
async def sector_operational_view(
    sector_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    plugin = get_plugin(sector_id)
    return await plugin.get_operational_view(days=days)


@router.get("/{sector_id}/rules", summary="List sector rules")
async def get_sector_rules(sector_id: str, current_user: dict = Depends(get_current_user)):
    require_sector_entitlement(current_user, sector_id)

    return {
        "sector_id": sector_id,
        "rules": list_sector_rules(sector_id),
    }


@router.post("/{sector_id}/rules/evaluate", summary="Evaluate events against sector rules")
async def evaluate_sector_rules(
    sector_id: str,
    events: list[DetectionEvent],
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)

    return {
        "sector_id": sector_id,
        "items": [e.model_dump() for e in evaluate_events(sector_id, events)],
    }
