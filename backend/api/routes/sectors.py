"""Sector configuration and registry routes."""

from datetime import datetime, timedelta

from fastapi import APIRouter, Body, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from core.security import get_current_user
from models.schemas import ExecutiveBoardView, OperationalView
from services.audit_log import log_event
from services.demo.ai_models import get_model_version, list_models as list_ai_models, patch_model as patch_ai_model
from services.demo.hierarchy import list_cameras, list_sites, list_zones, patch_camera
from services.demo.violations import (
    acknowledge,
    add_comment,
    all_violations,
    create_violation,
    get_violation,
    list_violations,
    mark_false_positive,
    resolve_evidence_path,
    resolve_thumbnail_path,
    serialize_violation,
)
from services.rules_engine.engine import evaluate_events, list_sector_rules
from services.entitlements_service import list_sectors_with_access, require_sector_entitlement
from services.sector_analytics.registry import get_plugin
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


@router.post(
    "/{sector_id}/rules/evaluate-and-create",
    summary="Evaluate events against sector rules and (optionally) create violations (scaffold)",
)
async def evaluate_and_create(
    sector_id: str,
    events: list[DetectionEvent],
    create_violations_on_trigger: bool = Query(True),
    current_user: dict = Depends(get_current_user),
):
    """Scaffold: bridges the rules engine into the violations workflow.

    - Evaluates events.
    - For each triggered rule, creates a violation + disk evidence if enabled.

    This is a demo endpoint to validate end-to-end wiring.
    """

    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    cfg = load_sector_config(sector_id)
    enabled_rules = [r for r in cfg.rules if r.enabled]

    created: list[dict] = []
    evaluations = []

    for ev in events:
        ev_detection_types = set([d for d in (ev.detection_types or []) if d])

        ev_eval = {'event_id': ev.event_id, 'results': []}

        for rule in enabled_rules:
            rule_types = set(rule.detection_types or [])
            matched = sorted(list(ev_detection_types.intersection(rule_types)))
            triggered = len(matched) > 0

            ev_eval['results'].append(
                {
                    'rule_id': rule.id,
                    'rule_name': rule.name,
                    'triggered': triggered,
                    'matched_detection_types': matched,
                    'severity': rule.severity,
                    'regulatory_tags': rule.regulatory_tags,
                    'ai_models': getattr(rule, 'ai_models', []) or [],
                    'duration_seconds': getattr(rule, 'duration_seconds', None),
                    'actions': [a.model_dump() for a in (getattr(rule, 'actions', []) or [])],
                    'details': {
                        'sector_id': sector_id,
                        'event_detected_at': ev.detected_at.isoformat(),
                    },
                }
            )

            if not (create_violations_on_trigger and triggered):
                continue

            # Determine scope; fallback to event values
            site_id = ev.site_id or f"{sector_id}-site-001"
            zone_id = ev.zone_id or f"{site_id}-zone-001"
            camera_id = ev.camera_id or f"{sector_id}-cam-00001"

            conf = float((ev.metadata or {}).get('confidence', 0.9))
            # Prefer explicit event metadata; else choose first rule model and resolve its sector-scoped version.
            explicit = (ev.metadata or {}).get('model_version')
            if explicit:
                model_version = str(explicit)
            else:
                mids = getattr(rule, 'ai_models', []) or []
                if mids:
                    mid = mids[0]
                    mv = get_model_version(sector_id=sector_id, organization_id=org_id, model_id=mid)
                    model_version = f"{mid}:v{mv}" if mv else f"{mid}:v1"
                else:
                    model_version = f"{sector_id}-model-v1"

            v = create_violation(
                sector_id=sector_id,
                organization_id=org_id,
                site_id=site_id,
                zone_id=zone_id,
                camera_id=camera_id,
                rule_id=rule.id,
                rule_name=rule.name,
                severity=rule.severity,
                detected_at=ev.detected_at.isoformat() + 'Z',
                ai_confidence=conf,
                model_version=model_version,
                label=rule.name,
            )

            created.append(serialize_violation(v))

            log_event(
                user=current_user,
                action='violation.created_from_rule',
                resource_type='violation',
                resource_id=v.id,
                sector_id=sector_id,
                organization_id=org_id,
                metadata={'event_id': ev.event_id, 'rule_id': rule.id},
            )

        evaluations.append(ev_eval)

    return {
        'sector_id': sector_id,
        'evaluations': evaluations,
        'created': created,
        'created_total': len(created),
    }


# =============================================================================
# SCAFFOLD: hierarchy + live monitoring (sites/zones/cameras)
# =============================================================================


def _demo_org_id(current_user: dict) -> str:
    # TODO: attach organization_id to JWT and enforce tenant-level RBAC.
    return 'org-001'


def _require_admin(user: dict) -> None:
    if (user.get('role') or '').lower() != 'admin':
        raise HTTPException(status_code=403, detail='Insufficient permissions')


@router.get("/{sector_id}/ai-models", summary="List AI models for sector (demo)")
async def sector_ai_models(sector_id: str, current_user: dict = Depends(get_current_user)):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    return {
        'items': list_ai_models(sector_id=sector_id, organization_id=org_id),
        'total': len(list_ai_models(sector_id=sector_id, organization_id=org_id)),
    }


@router.patch("/{sector_id}/ai-models/{model_id}", summary="Patch AI model settings for sector (demo)")
async def patch_sector_ai_model(
    sector_id: str,
    model_id: str,
    patch: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    _require_admin(current_user)

    org_id = _demo_org_id(current_user)
    out = patch_ai_model(sector_id=sector_id, organization_id=org_id, model_id=model_id, patch=patch)

    log_event(
        user=current_user,
        action='ai_model.patch',
        resource_type='ai_model',
        resource_id=model_id,
        sector_id=sector_id,
        organization_id=org_id,
        metadata={'patch': patch},
    )

    return {'model_id': model_id, 'patch': out}


@router.get("/{sector_id}/sites", summary="List sites (demo)")
async def sector_sites(sector_id: str, current_user: dict = Depends(get_current_user)):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    items = [s.__dict__ for s in list_sites(sector_id=sector_id, organization_id=org_id)]
    return {
        'items': items,
        'total': len(items),
    }


@router.get("/{sector_id}/sites/{site_id}/zones", summary="List zones for a site (demo)")
async def sector_site_zones(sector_id: str, site_id: str, current_user: dict = Depends(get_current_user)):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    items = [z.__dict__ for z in list_zones(sector_id=sector_id, organization_id=org_id, site_id=site_id)]
    return {
        'items': items,
        'total': len(items),
    }


@router.get("/{sector_id}/cameras", summary="List cameras (demo, paginated)")
async def sector_cameras(
    sector_id: str,
    site_id: str | None = Query(None),
    zone_id: str | None = Query(None),
    status: str | None = Query(None),
    search: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(60, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)
    return list_cameras(
        sector_id=sector_id,
        organization_id=org_id,
        site_id=site_id,
        zone_id=zone_id,
        status=status,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.patch("/{sector_id}/cameras/{camera_id}", summary="Patch camera flags (demo)")
async def patch_sector_camera(
    sector_id: str,
    camera_id: str,
    patch: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)

    # Simple RBAC: only admins can change camera settings.
    _require_admin(current_user)

    org_id = _demo_org_id(current_user)
    out = patch_camera(camera_id=camera_id, patch=patch)

    log_event(
        user=current_user,
        action='camera.patch',
        resource_type='camera',
        resource_id=camera_id,
        sector_id=sector_id,
        organization_id=org_id,
        metadata={'patch': patch},
    )

    return {'camera_id': camera_id, 'patch': out}


# =============================================================================
# SCAFFOLD: violations + evidence (disk)
# =============================================================================


@router.get("/{sector_id}/violations", summary="List violations (demo, with evidence)")
async def sector_violations(
    sector_id: str,
    site_id: str | None = Query(None),
    zone_id: str | None = Query(None),
    camera_id: str | None = Query(None),
    severity: str | None = Query(None),
    severities: list[str] | None = Query(None, description="Repeatable list or comma-separated"),
    status: str | None = Query(None),
    is_false_positive: bool | None = Query(None),
    acknowledged: bool | None = Query(None),
    q: str | None = Query(None, description="Search: id/rule/site/zone/camera/severity/status"),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    sev_list = []
    for s in severities or []:
        if not s:
            continue
        sev_list.extend([p.strip() for p in s.split(',') if p.strip()])

    return list_violations(
        sector_id=sector_id,
        organization_id=org_id,
        site_id=site_id,
        zone_id=zone_id,
        camera_id=camera_id,
        severity=severity,
        severities=sev_list or None,
        status=status,
        is_false_positive=is_false_positive,
        acknowledged=acknowledged,
        q=q,
        date_from=date_from,
        date_to=date_to,
        skip=skip,
        limit=limit,
    )


@router.get("/{sector_id}/violations/{violation_id}", summary="Get violation detail (demo)")
async def sector_violation_detail(
    sector_id: str,
    violation_id: str,
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)
    v = get_violation(sector_id=sector_id, organization_id=org_id, violation_id=violation_id)
    if not v:
        raise HTTPException(status_code=404, detail='Violation not found')
    return serialize_violation(v)


@router.post("/{sector_id}/violations/{violation_id}/acknowledge", summary="Acknowledge a violation (demo)")
async def acknowledge_violation(
    sector_id: str,
    violation_id: str,
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)
    v = get_violation(sector_id=sector_id, organization_id=org_id, violation_id=violation_id)
    if not v:
        raise HTTPException(status_code=404, detail='Violation not found')

    acknowledge(violation=v, user=current_user)
    log_event(
        user=current_user,
        action='violation.acknowledge',
        resource_type='violation',
        resource_id=violation_id,
        sector_id=sector_id,
        organization_id=org_id,
        metadata={},
    )
    return serialize_violation(v)


@router.post("/{sector_id}/violations/{violation_id}/comments", summary="Add a comment (demo)")
async def add_violation_comment(
    sector_id: str,
    violation_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)
    v = get_violation(sector_id=sector_id, organization_id=org_id, violation_id=violation_id)
    if not v:
        raise HTTPException(status_code=404, detail='Violation not found')

    content = (payload.get('content') or '').strip()
    if not content:
        raise HTTPException(status_code=400, detail='content is required')

    c = add_comment(violation=v, user=current_user, content=content)
    log_event(
        user=current_user,
        action='violation.comment',
        resource_type='violation',
        resource_id=violation_id,
        sector_id=sector_id,
        organization_id=org_id,
        metadata={'comment_id': c.get('id')},
    )
    return c


@router.post("/{sector_id}/violations/{violation_id}/false-positive", summary="Mark false positive (demo)")
async def false_positive_violation(
    sector_id: str,
    violation_id: str,
    payload: dict = Body(...),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)
    v = get_violation(sector_id=sector_id, organization_id=org_id, violation_id=violation_id)
    if not v:
        raise HTTPException(status_code=404, detail='Violation not found')

    reason = (payload.get('reason') or 'no reason').strip()
    mark_false_positive(violation=v, user=current_user, reason=reason)

    log_event(
        user=current_user,
        action='violation.false_positive',
        resource_type='violation',
        resource_id=violation_id,
        sector_id=sector_id,
        organization_id=org_id,
        metadata={'reason': reason},
    )

    return serialize_violation(v)


@router.get("/{sector_id}/evidence/{evidence_id}/thumbnail", summary="Get evidence thumbnail (demo)")
async def evidence_thumbnail(
    sector_id: str,
    evidence_id: str,
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    path = resolve_thumbnail_path(sector_id=sector_id, organization_id=org_id, evidence_id=evidence_id)
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail='Evidence not found')

    return FileResponse(path=str(path), media_type='image/jpeg', filename=path.name)


# =============================================================================
# SCAFFOLD: sector analytics (summary + trend)
# =============================================================================


@router.get("/{sector_id}/analytics/summary", summary="Sector analytics summary (demo)")
async def sector_analytics_summary(
    sector_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    # Violations
    items = all_violations(sector_id=sector_id, organization_id=org_id)
    cutoff = datetime.utcnow() - timedelta(days=days)

    recent = []
    for v in items:
        try:
            dt = datetime.fromisoformat(v.detected_at.replace('Z', ''))
            if dt >= cutoff:
                recent.append(v)
        except Exception:
            recent.append(v)

    by_severity: dict[str, int] = {}
    by_status: dict[str, int] = {}
    by_rule: dict[str, int] = {}

    for v in recent:
        by_severity[v.severity] = by_severity.get(v.severity, 0) + 1
        by_status[v.status] = by_status.get(v.status, 0) + 1
        by_rule[v.rule_name] = by_rule.get(v.rule_name, 0) + 1

    top_rules = sorted(by_rule.items(), key=lambda kv: kv[1], reverse=True)[:10]

    # Cameras (demo dataset size is 1000)
    cam_total = 1000
    # baseline distribution based on hierarchy generator rule
    online = cam_total // 3
    offline = cam_total // 3
    warning = cam_total - online - offline

    return {
        'sector_id': sector_id,
        'days': days,
        'violations': {
            'total': len(recent),
            'by_severity': by_severity,
            'by_status': by_status,
            'top_rules': [{'rule_name': n, 'count': c} for (n, c) in top_rules],
        },
        'cameras': {
            'total': cam_total,
            'online': online,
            'offline': offline,
            'warning': warning,
        },
    }


@router.get("/{sector_id}/analytics/trend", summary="Sector violations trend (demo)")
async def sector_analytics_trend(
    sector_id: str,
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    items = all_violations(sector_id=sector_id, organization_id=org_id)
    cutoff = datetime.utcnow() - timedelta(days=days)

    buckets: dict[str, int] = {}
    for v in items:
        try:
            dt = datetime.fromisoformat(v.detected_at.replace('Z', ''))
        except Exception:
            continue
        if dt < cutoff:
            continue

        key = dt.date().isoformat()
        buckets[key] = buckets.get(key, 0) + 1

    # Fill missing days
    out = []
    for i in range(days - 1, -1, -1):
        d = (datetime.utcnow() - timedelta(days=i)).date().isoformat()
        out.append({'date': d, 'count': buckets.get(d, 0)})

    return {
        'sector_id': sector_id,
        'days': days,
        'items': out,
    }


@router.get("/{sector_id}/evidence/{evidence_id}/download", summary="Download evidence (demo)")
async def download_evidence(
    sector_id: str,
    evidence_id: str,
    blurred: bool = Query(True),
    current_user: dict = Depends(get_current_user),
):
    require_sector_entitlement(current_user, sector_id)
    org_id = _demo_org_id(current_user)

    role = (current_user.get('role') or '').lower()
    if not blurred and role not in ('admin', 'auditor'):
        # Log attempted access
        log_event(
            user=current_user,
            action='evidence.download.denied',
            resource_type='evidence',
            resource_id=evidence_id,
            sector_id=sector_id,
            organization_id=org_id,
            metadata={'blurred': False},
        )
        raise HTTPException(status_code=403, detail='Original evidence requires admin/auditor role')

    variant = 'blurred' if blurred else 'original'
    path = resolve_evidence_path(
        sector_id=sector_id,
        organization_id=org_id,
        evidence_id=evidence_id,
        variant=variant,
    )
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail='Evidence not found')

    log_event(
        user=current_user,
        action='evidence.download',
        resource_type='evidence',
        resource_id=evidence_id,
        sector_id=sector_id,
        organization_id=org_id,
        metadata={'blurred': blurred},
    )

    return FileResponse(path=str(path), media_type='image/jpeg', filename=path.name)
