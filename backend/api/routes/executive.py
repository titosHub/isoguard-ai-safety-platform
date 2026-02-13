"""Executive governance API routes."""

from fastapi import APIRouter, Depends

from core.security import get_current_user
from models.schemas import ExecutiveBoardView
from services.entitlements_service import get_entitlements_for_user
from services.sector_analytics.registry import get_global_executive_overview

router = APIRouter()


@router.get("/overview", response_model=ExecutiveBoardView, summary="Global Executive Board View")
async def executive_overview(current_user: dict = Depends(get_current_user)):
    ent = get_entitlements_for_user(current_user)
    return await get_global_executive_overview(sector_ids=ent.entitled_sectors)
