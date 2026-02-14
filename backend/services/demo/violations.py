"""Demo violations store.

Scaffolding-only: keeps an in-memory violations list per (sector, organization),
with evidence artifacts stored on local disk.

Evidence policy in this scaffold:
- Always store both original and blurred artifacts.
- Original downloads are RBAC-protected at the API layer.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
import random
from typing import Any, Dict, List, Optional, Tuple

from PIL import Image, ImageDraw, ImageFilter, ImageFont

from solutions.loader import load_sector_config
from solutions.registry import SUPPORTED_SECTORS


EVIDENCE_DIR = Path(__file__).resolve().parents[2] / 'storage' / 'evidence'


def _ensure_dir(p: Path) -> None:
    p.mkdir(parents=True, exist_ok=True)


def _stable_rng(*parts: str) -> random.Random:
    seed = "|".join([p for p in parts if p])
    return random.Random(seed)


def _try_font() -> Optional[ImageFont.ImageFont]:
    try:
        return ImageFont.load_default()
    except Exception:
        return None


@dataclass
class Evidence:
    id: str
    media_type: str  # image|video
    original_path: str
    blurred_path: str
    thumbnail_path: str
    created_at: str


@dataclass
class Violation:
    id: str
    sector_id: str
    organization_id: str

    site_id: str
    zone_id: str
    camera_id: str

    rule_id: str
    rule_name: str

    severity: str
    status: str

    detected_at: str
    ai_confidence: float
    model_version: str

    acknowledged: bool = False
    acknowledged_by: Optional[str] = None

    assigned_to: Optional[str] = None
    is_false_positive: bool = False

    comments: List[Dict[str, Any]] = None  # populated on read
    evidence: List[Evidence] = None


# (sector_id, organization_id) -> violations list
_VIOLATIONS: Dict[Tuple[str, str], List[Violation]] = {}


def _evidence_paths(*, sector_id: str, organization_id: str, violation_id: str, evidence_id: str) -> Dict[str, Path]:
    root = EVIDENCE_DIR / sector_id / organization_id / violation_id
    _ensure_dir(root)
    return {
        'original': root / f"{evidence_id}_original.jpg",
        'blurred': root / f"{evidence_id}_blurred.jpg",
        'thumb': root / f"{evidence_id}_thumb.jpg",
    }


def _render_image(*, text: str, size: Tuple[int, int], bg: Tuple[int, int, int]) -> Image.Image:
    img = Image.new('RGB', size, bg)
    draw = ImageDraw.Draw(img)
    font = _try_font()

    # simple watermark text
    draw.rectangle((0, 0, size[0], 28), fill=(0, 0, 0))
    draw.text((8, 8), 'IsoGuard.Ai • Demo Evidence', fill=(255, 255, 255), font=font)

    draw.text((8, 50), text, fill=(255, 255, 255), font=font)

    # draw some fake boxes
    draw.rectangle((70, 120, 220, 330), outline=(255, 0, 0), width=3)
    draw.rectangle((260, 140, 420, 360), outline=(255, 165, 0), width=3)

    return img


def _write_evidence_images(*, sector_id: str, organization_id: str, violation_id: str, evidence_id: str, label: str) -> Evidence:
    paths = _evidence_paths(
        sector_id=sector_id,
        organization_id=organization_id,
        violation_id=violation_id,
        evidence_id=evidence_id,
    )

    base = _render_image(
        text=f"{violation_id}\n{label}",
        size=(960, 540),
        bg=(25, 25, 35),
    )

    # Thumbnail
    thumb = base.copy()
    thumb.thumbnail((480, 270))
    thumb.save(paths['thumb'], format='JPEG', quality=80)

    # Original
    base.save(paths['original'], format='JPEG', quality=90)

    # Blurred (demo: blur entire frame)
    blurred = base.filter(ImageFilter.GaussianBlur(radius=12))
    blurred.save(paths['blurred'], format='JPEG', quality=85)

    now = datetime.utcnow().isoformat() + 'Z'
    return Evidence(
        id=evidence_id,
        media_type='image',
        original_path=str(paths['original']),
        blurred_path=str(paths['blurred']),
        thumbnail_path=str(paths['thumb']),
        created_at=now,
    )


def _rule_pool(sector_id: str) -> List[Dict[str, Any]]:
    try:
        cfg = load_sector_config(sector_id)
        rules = [r.model_dump() for r in cfg.rules if r.enabled]
        return rules or []
    except Exception:
        return []


def _ensure_seeded(*, sector_id: str, organization_id: str) -> None:
    if sector_id not in SUPPORTED_SECTORS:
        return

    key = (sector_id, organization_id)
    if key in _VIOLATIONS:
        return

    rng = _stable_rng('violations', sector_id, organization_id)
    rules = _rule_pool(sector_id)

    severities = ['low', 'medium', 'high', 'critical']

    items: List[Violation] = []
    for i in range(200):
        vid = f"{sector_id.upper()}-VIO-{i+1:06d}"

        site_id = f"{sector_id}-site-{(i % 3) + 1:03d}"
        zone_id = f"{site_id}-zone-{(i % 6) + 1:03d}"
        camera_id = f"{sector_id}-cam-{(i % 1000) + 1:05d}"

        if rules:
            rule = rules[i % len(rules)]
            rule_id = rule['id']
            rule_name = rule['name']
            severity = (rule.get('severity') or 'high').lower()
        else:
            rule_id = f"{sector_id}-rule-generic"
            rule_name = "Generic Safety Rule"
            severity = severities[(i + len(sector_id)) % len(severities)]

        detected_at = (datetime.utcnow() - timedelta(hours=rng.randint(0, 240))).isoformat() + 'Z'

        evidence_id = f"EVD-{sector_id}-{i+1:06d}"
        ev = _write_evidence_images(
            sector_id=sector_id,
            organization_id=organization_id,
            violation_id=vid,
            evidence_id=evidence_id,
            label=rule_name,
        )

        items.append(
            Violation(
                id=vid,
                sector_id=sector_id,
                organization_id=organization_id,
                site_id=site_id,
                zone_id=zone_id,
                camera_id=camera_id,
                rule_id=rule_id,
                rule_name=rule_name,
                severity=severity,
                status='open',
                detected_at=detected_at,
                ai_confidence=round(0.75 + rng.random() * 0.24, 3),
                model_version=f"{sector_id}-model-v{1 + (i % 3)}",
                comments=[],
                evidence=[ev],
            )
        )

    # newest first
    items.sort(key=lambda v: v.detected_at, reverse=True)  # type: ignore
    _VIOLATIONS[key] = items


def _parse_iso_dt(s: str) -> Optional[datetime]:
    try:
        raw = (s or '').replace('Z', '')
        return datetime.fromisoformat(raw)
    except Exception:
        return None


def all_violations(*, sector_id: str, organization_id: str) -> List[Violation]:
    _ensure_seeded(sector_id=sector_id, organization_id=organization_id)
    return list(_VIOLATIONS.get((sector_id, organization_id), []))


def create_violation(
    *,
    sector_id: str,
    organization_id: str,
    site_id: str,
    zone_id: str,
    camera_id: str,
    rule_id: str,
    rule_name: str,
    severity: str,
    detected_at: str,
    ai_confidence: float = 0.9,
    model_version: str = 'demo-model-v1',
    label: Optional[str] = None,
) -> Violation:
    """Create and store a violation with disk evidence (scaffold)."""

    _ensure_seeded(sector_id=sector_id, organization_id=organization_id)
    key = (sector_id, organization_id)
    existing = _VIOLATIONS.get(key, [])

    next_num = len(existing) + 1
    vid = f"{sector_id.upper()}-VIO-{next_num:06d}"

    evidence_id = f"EVD-{sector_id}-{next_num:06d}"
    ev = _write_evidence_images(
        sector_id=sector_id,
        organization_id=organization_id,
        violation_id=vid,
        evidence_id=evidence_id,
        label=label or rule_name,
    )

    v = Violation(
        id=vid,
        sector_id=sector_id,
        organization_id=organization_id,
        site_id=site_id,
        zone_id=zone_id,
        camera_id=camera_id,
        rule_id=rule_id,
        rule_name=rule_name,
        severity=(severity or 'high').lower(),
        status='open',
        detected_at=detected_at,
        ai_confidence=float(ai_confidence),
        model_version=model_version,
        comments=[],
        evidence=[ev],
    )

    updated = [v] + existing
    _VIOLATIONS[key] = updated
    return v


def list_violations(
    *,
    sector_id: str,
    organization_id: str,
    site_id: Optional[str] = None,
    zone_id: Optional[str] = None,
    camera_id: Optional[str] = None,
    severity: Optional[str] = None,
    severities: Optional[List[str]] = None,
    status: Optional[str] = None,
    is_false_positive: Optional[bool] = None,
    acknowledged: Optional[bool] = None,
    q: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
) -> Dict:
    _ensure_seeded(sector_id=sector_id, organization_id=organization_id)
    key = (sector_id, organization_id)

    items = list(_VIOLATIONS.get(key, []))

    qn = (q or '').strip().lower() or None
    severity_set = set([(s or '').lower() for s in (severities or []) if s]) if severities else None
    if severity and not severity_set:
        severity_set = set([(severity or '').lower()])

    dt_from = _parse_iso_dt(date_from) if date_from else None
    dt_to = _parse_iso_dt(date_to) if date_to else None

    def ok(v: Violation) -> bool:
        if site_id and v.site_id != site_id:
            return False
        if zone_id and v.zone_id != zone_id:
            return False
        if camera_id and v.camera_id != camera_id:
            return False
        if severity_set and (v.severity or '').lower() not in severity_set:
            return False
        if status and v.status != status:
            return False
        if is_false_positive is not None and bool(v.is_false_positive) != bool(is_false_positive):
            return False
        if acknowledged is not None and bool(v.acknowledged) != bool(acknowledged):
            return False

        if dt_from or dt_to:
            vdt = _parse_iso_dt(v.detected_at)
            if vdt:
                if dt_from and vdt < dt_from:
                    return False
                if dt_to and vdt > dt_to:
                    return False

        if qn:
            hay = " ".join([
                v.id,
                v.rule_id,
                v.rule_name,
                v.site_id,
                v.zone_id,
                v.camera_id,
                v.severity,
                v.status,
            ]).lower()
            if qn not in hay:
                return False

        return True

    items = [v for v in items if ok(v)]
    total = len(items)
    sliced = items[skip : skip + limit]

    return {
        'items': [serialize_violation(v) for v in sliced],
        'total': total,
        'skip': skip,
        'limit': limit,
    }


def get_violation(*, sector_id: str, organization_id: str, violation_id: str) -> Optional[Violation]:
    _ensure_seeded(sector_id=sector_id, organization_id=organization_id)
    key = (sector_id, organization_id)

    for v in _VIOLATIONS.get(key, []):
        if v.id == violation_id:
            return v
    return None


def add_comment(*, violation: Violation, user: dict, content: str) -> Dict[str, Any]:
    comment = {
        'id': f"cmt-{int(datetime.utcnow().timestamp())}",
        'user_id': user.get('user_id'),
        'user_name': user.get('email') or 'User',
        'content': content,
        'created_at': datetime.utcnow().isoformat() + 'Z',
        'acknowledged': False,
    }
    violation.comments = (violation.comments or []) + [comment]
    return comment


def mark_false_positive(*, violation: Violation, user: dict, reason: str) -> None:
    violation.is_false_positive = True
    violation.status = 'investigating'
    add_comment(violation=violation, user=user, content=f"Marked false positive: {reason}")


def acknowledge(*, violation: Violation, user: dict) -> None:
    violation.acknowledged = True
    violation.acknowledged_by = user.get('email')
    if violation.status == 'open':
        violation.status = 'investigating'


def serialize_violation(v: Violation) -> Dict[str, Any]:
    # Evidence URLs are served by API routes; we provide ids and let the API compute URLs.
    ev_items = []
    for ev in v.evidence or []:
        ev_items.append(
            {
                'id': ev.id,
                'media_type': ev.media_type,
                'created_at': ev.created_at,
                'download_blurred_url': f"/api/v1/sectors/{v.sector_id}/evidence/{ev.id}/download?blurred=true",
                'download_original_url': f"/api/v1/sectors/{v.sector_id}/evidence/{ev.id}/download?blurred=false",
                'thumbnail_url': f"/api/v1/sectors/{v.sector_id}/evidence/{ev.id}/thumbnail",
            }
        )

    return {
        'id': v.id,
        'sector_id': v.sector_id,
        'organization_id': v.organization_id,
        'site_id': v.site_id,
        'zone_id': v.zone_id,
        'camera_id': v.camera_id,
        'rule_id': v.rule_id,
        'rule_name': v.rule_name,
        'severity': v.severity,
        'status': v.status,
        'detected_at': v.detected_at,
        'ai_confidence': v.ai_confidence,
        'model_version': v.model_version,
        'acknowledged': v.acknowledged,
        'acknowledged_by': v.acknowledged_by,
        'assigned_to': v.assigned_to,
        'is_false_positive': v.is_false_positive,
        'comment_count': len(v.comments or []),
        'comments': v.comments or [],
        'evidence': ev_items,
    }


def resolve_evidence_path(
    *,
    sector_id: str,
    organization_id: str,
    evidence_id: str,
    variant: str,
) -> Optional[Path]:
    """Resolve an evidence path by searching the demo store.

    Since evidence files are stored under violation folders, we scan for matches.
    """

    root = EVIDENCE_DIR / sector_id / organization_id
    if not root.exists():
        return None

    suffix = 'blurred' if variant == 'blurred' else 'original'
    matches = list(root.rglob(f"{evidence_id}_{suffix}.jpg"))
    return matches[0] if matches else None


def resolve_thumbnail_path(*, sector_id: str, organization_id: str, evidence_id: str) -> Optional[Path]:
    root = EVIDENCE_DIR / sector_id / organization_id
    if not root.exists():
        return None

    matches = list(root.rglob(f"{evidence_id}_thumb.jpg"))
    return matches[0] if matches else None
