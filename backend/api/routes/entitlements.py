"""Entitlements (subscription) API routes."""

from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from core.security import get_current_user
from services.entitlements_service import (
    create_access_request,
    get_entitlements_for_user,
    list_access_requests,
    list_sectors_with_access,
)

router = APIRouter()


class AccessRequestCreate(BaseModel):
    sector_id: str
    message: Optional[str] = None


@router.get("/me", summary="Get my entitlements")
async def get_my_entitlements(current_user: dict = Depends(get_current_user)):
    ent = get_entitlements_for_user(current_user)

    entitled = set(ent.entitled_sectors)
    locked = [s['sector_id'] for s in list_sectors_with_access(current_user) if not s['entitled']]

    return {
        'tier': ent.tier,
        'entitled_sectors': list(entitled),
        'locked_sectors': locked,
        'sectors': list_sectors_with_access(current_user),
    }


@router.post("/requests", summary="Request access to a locked solution")
async def request_solution_access(
    req: AccessRequestCreate,
    current_user: dict = Depends(get_current_user),
):
    if not req.sector_id:
        raise HTTPException(status_code=400, detail='sector_id is required')

    return create_access_request(user=current_user, sector_id=req.sector_id, message=req.message)


@router.get("/requests", summary="List my access requests")
async def list_my_access_requests(current_user: dict = Depends(get_current_user)):
    uid = current_user.get('user_id')
    return [r for r in list_access_requests() if r.get('user_id') == uid]
