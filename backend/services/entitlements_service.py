"""Entitlements (subscription) service.

This is a demo in-memory entitlement model.

Core principle:
- All solutions exist, but access is granted per customer.
- UI locking is not sufficient; API routes must reject access too.

In production:
- Replace this with DB-backed subscription + entitlement checks.
- Consider embedding an entitlement version in JWT claims for cache invalidation.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Dict, List, Optional

from fastapi import HTTPException, status

from solutions.registry import SUPPORTED_SECTORS


@dataclass
class Entitlements:
    entitled_sectors: List[str]
    tier: str = 'starter'


# Demo mapping: user_id -> entitlements
# Default scenario requested: a customer with ONE subscribed solution.
_DEMO_ENTITLEMENTS_BY_USER_ID: Dict[str, Entitlements] = {
    'demo-user-id': Entitlements(entitled_sectors=['mining'], tier='starter'),
}

# Demo access requests store
_DEMO_ACCESS_REQUESTS: List[dict] = []


def get_entitlements_for_user(user: dict) -> Entitlements:
    user_id = user.get('user_id') or 'anonymous'
    return _DEMO_ENTITLEMENTS_BY_USER_ID.get(user_id, Entitlements(entitled_sectors=['mining'], tier='starter'))


def is_sector_entitled(user: dict, sector_id: str) -> bool:
    ent = get_entitlements_for_user(user)
    return sector_id in ent.entitled_sectors


def require_sector_entitlement(user: dict, sector_id: str) -> None:
    if sector_id not in SUPPORTED_SECTORS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Unknown sector')

    if not is_sector_entitled(user, sector_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Sector not included in subscription',
        )


def list_sectors_with_access(user: dict) -> List[dict]:
    ent = get_entitlements_for_user(user)
    items = []

    for sector_id in SUPPORTED_SECTORS:
        entitled = sector_id in ent.entitled_sectors
        items.append(
            {
                'sector_id': sector_id,
                'entitled': entitled,
                'access': 'active' if entitled else 'locked',
            }
        )

    return items


def create_access_request(
    *,
    user: dict,
    sector_id: str,
    message: Optional[str] = None,
) -> dict:
    req = {
        'id': f"req-{len(_DEMO_ACCESS_REQUESTS)+1:04d}",
        'user_id': user.get('user_id'),
        'email': user.get('email'),
        'sector_id': sector_id,
        'message': message,
        'created_at': datetime.utcnow().isoformat() + 'Z',
        'status': 'received',
    }
    _DEMO_ACCESS_REQUESTS.append(req)
    return req


def list_access_requests() -> List[dict]:
    return list(_DEMO_ACCESS_REQUESTS)
