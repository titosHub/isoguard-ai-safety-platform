"""Demo hierarchy store.

Scaffolding-only: generates a consistent hierarchy for
Sector → Organization → Site → Zone → Camera.

In production this should be backed by a database.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
import random
from typing import Dict, List, Optional

from solutions.registry import SUPPORTED_SECTORS


def _stable_rng(*parts: str) -> random.Random:
    seed = "|".join([p for p in parts if p])
    # Use a stable seed across runs.
    return random.Random(seed)


@dataclass
class Site:
    id: str
    name: str
    organization_id: str
    sector_id: str


@dataclass
class Zone:
    id: str
    name: str
    zone_type: str
    site_id: str
    organization_id: str
    sector_id: str


@dataclass
class Camera:
    id: str
    name: str
    stream_url: str
    site_id: str
    zone_id: str
    organization_id: str
    sector_id: str

    is_active: bool
    status: str
    fps: int
    latency_ms: int

    ai_enabled: bool = True
    rules_enabled: bool = True
    last_seen_at: Optional[str] = None


# Mutable in-memory store for camera toggles (ai_enabled/rules_enabled/is_active).
_CAMERA_OVERRIDES: Dict[str, Dict] = {}


def list_sites(*, sector_id: str, organization_id: str) -> List[Site]:
    if sector_id not in SUPPORTED_SECTORS:
        return []

    rng = _stable_rng("sites", sector_id, organization_id)
    count = 3

    # Some sector-flavored naming
    base_names = {
        'mining': ['Mine Alpha', 'Mine Beta', 'Mine Gamma'],
        'airport': ['Terminal A', 'Terminal B', 'Cargo Apron'],
        'border': ['North Gate', 'East Gate', 'River Crossing'],
        'smart_city': ['Downtown', 'Transit Hub', 'Stadium District'],
        'construction': ['Project Site A', 'Project Site B', 'Yard'],
        'manufacturing': ['Plant 1', 'Plant 2', 'Warehouse'],
        'warehouse': ['Distribution Center', 'Cold Storage', 'Loading Yard'],
        'health': ['Hospital Wing A', 'ER Entrance', 'ICU Corridor'],
        'agriculture': ['Barn', 'Silo Yard', 'Processing Shed'],
    }.get(sector_id, [f"{sector_id.title()} Site 1", f"{sector_id.title()} Site 2", f"{sector_id.title()} Site 3"])

    sites: List[Site] = []
    for i in range(count):
        sid = f"{sector_id}-site-{i+1:03d}"
        sites.append(
            Site(
                id=sid,
                name=base_names[i % len(base_names)],
                organization_id=organization_id,
                sector_id=sector_id,
            )
        )

    rng.shuffle(sites)
    return sites


def list_zones(*, sector_id: str, organization_id: str, site_id: str) -> List[Zone]:
    rng = _stable_rng("zones", sector_id, organization_id, site_id)

    # Sector-specific zone types (exclusion zones matter)
    zone_types = {
        'mining': ['underground', 'processing', 'exclusion', 'surface'],
        'airport': ['high_security', 'restricted', 'exclusion', 'public'],
        'border': ['restricted', 'exclusion', 'patrol'],
        'smart_city': ['public', 'restricted', 'exclusion'],
        'construction': ['exclusion', 'restricted', 'mandatory_ppe'],
        'manufacturing': ['restricted', 'mandatory_ppe', 'exclusion'],
        'warehouse': ['restricted', 'exclusion', 'traffic'],
        'health': ['restricted', 'public', 'exclusion'],
        'agriculture': ['mandatory_ppe', 'restricted', 'exclusion'],
    }.get(sector_id, ['restricted', 'exclusion'])

    zones: List[Zone] = []
    for i in range(6):
        zid = f"{site_id}-zone-{i+1:03d}"
        zt = zone_types[i % len(zone_types)]
        zones.append(
            Zone(
                id=zid,
                name=f"{zt.replace('_', ' ').title()} Zone {i+1}",
                zone_type=zt,
                site_id=site_id,
                organization_id=organization_id,
                sector_id=sector_id,
            )
        )

    rng.shuffle(zones)
    return zones


def _camera_override(camera_id: str) -> Dict:
    return _CAMERA_OVERRIDES.get(camera_id, {})


def patch_camera(*, camera_id: str, patch: Dict) -> Dict:
    prev = _CAMERA_OVERRIDES.get(camera_id, {})
    prev.update({k: v for k, v in patch.items() if v is not None})
    _CAMERA_OVERRIDES[camera_id] = prev
    return prev


def list_cameras(
    *,
    sector_id: str,
    organization_id: str,
    site_id: Optional[str] = None,
    zone_id: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 60,
) -> Dict:
    """List cameras with pagination.

    Scales to 1,000+ cameras by generating synthetic ids and returning a slice.
    """

    sites = list_sites(sector_id=sector_id, organization_id=organization_id)
    if site_id:
        sites = [s for s in sites if s.id == site_id]

    # Build a consistent pool size.
    total_cameras = 1000
    rng = _stable_rng("cameras", sector_id, organization_id)

    statuses = ['online', 'offline', 'warning']

    # Precompute zones per site for stable mapping
    zones_by_site = {s.id: list_zones(sector_id=sector_id, organization_id=organization_id, site_id=s.id) for s in sites}

    cameras: List[Camera] = []

    # Generate only what we need for this slice (but keep ids stable).
    end = min(skip + limit, total_cameras)
    for i in range(skip, end):
        s = sites[i % max(len(sites), 1)]
        zones = zones_by_site.get(s.id) or []
        z = zones[i % max(len(zones), 1)] if zones else None

        cid = f"{sector_id}-cam-{i+1:05d}"
        base_status = statuses[(i + len(sector_id)) % len(statuses)]

        ov = _camera_override(cid)

        cam = Camera(
            id=cid,
            name=f"Camera {i+1:05d}",
            stream_url=f"rtsp://127.0.0.1/{sector_id}/{cid}",
            site_id=s.id,
            zone_id=z.id if z else f"{s.id}-zone-001",
            organization_id=organization_id,
            sector_id=sector_id,
            is_active=bool(ov.get('is_active', True)),
            status=str(ov.get('status', base_status)),
            fps=int(ov.get('fps', 15 + (i % 10))),
            latency_ms=int(ov.get('latency_ms', 50 + (i % 80))),
            ai_enabled=bool(ov.get('ai_enabled', True)),
            rules_enabled=bool(ov.get('rules_enabled', True)),
            last_seen_at=ov.get('last_seen_at') or datetime.utcnow().isoformat() + 'Z',
        )

        cameras.append(cam)

    # Apply filters on the slice (for demo). In production, filter in query.
    def _ok(c: Camera) -> bool:
        if zone_id and c.zone_id != zone_id:
            return False
        if status and c.status != status:
            return False
        if search:
            q = search.lower().strip()
            if q not in c.id.lower() and q not in c.name.lower():
                return False
        return True

    cameras = [c for c in cameras if _ok(c)]

    return {
        'items': [c.__dict__ for c in cameras],
        'total': total_cameras,
        'skip': skip,
        'limit': limit,
    }
