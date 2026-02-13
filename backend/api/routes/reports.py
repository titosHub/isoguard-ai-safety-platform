"""Reports generation routes."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse

from core.security import get_current_user
from models.schemas import ReportRequest, ReportResponse
from services.entitlements_service import require_sector_entitlement
from services.reporting.renderer import render_report
from services.sector_analytics.registry import get_plugin
from solutions.loader import load_sector_config

router = APIRouter()

REPORTS_DIR = Path(__file__).resolve().parents[2] / 'storage' / 'reports'

# In-memory store (demo). Replace with DB persistence.
_REPORTS: Dict[str, Dict] = {}


def _demo_incident_rows(sector_id: Optional[str], count: int = 25) -> List[Dict]:
    sid = sector_id or 'global'
    rows: List[Dict] = []
    for i in range(count):
        rows.append(
            {
                'incident_id': f'{sid.upper()}-INC-{i+1:04d}',
                'sector_id': sid,
                'site_id': f'{sid}-site-{(i % 3) + 1:03d}',
                'severity': ['low', 'medium', 'high', 'critical'][i % 4],
                'detection_type': ['ppe_violation', 'proximity', 'zone', 'unsafe_behavior'][i % 4],
                'detected_at': datetime.utcnow().isoformat() + 'Z',
            }
        )
    return rows


@router.post("", response_model=ReportResponse)
async def generate_report(
    report: ReportRequest,
    current_user: dict = Depends(get_current_user),
):
    """Generate a new report.

    Demo implementation: renders the report synchronously and stores the artifact
    on local disk.
    """

    report_id = f"report-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    fmt = report.format.lower().strip()

    sector_name = None
    if report.sector_id:
        require_sector_entitlement(current_user, report.sector_id)

        try:
            cfg = load_sector_config(report.sector_id)
            sector_name = cfg.name
        except FileNotFoundError:
            # Allow report generation even if config is missing
            sector_name = report.sector_id

    executive = None
    operational = None
    if report.sector_id:
        plugin = get_plugin(report.sector_id)
        executive = (await plugin.get_executive_view(days=30)).model_dump()
        operational = (await plugin.get_operational_view(days=30)).model_dump()

    payload = {
        'title': f"{report.report_type.title()} Report",
        'sector_id': report.sector_id,
        'sector_name': sector_name,
        'date_range': f"{report.start_date.date().isoformat()} to {report.end_date.date().isoformat()}",
        'executive': executive,
        'operational': operational,
        'generated_at': datetime.utcnow().isoformat() + 'Z',
    }

    rows = _demo_incident_rows(report.sector_id)

    out_path = render_report(
        output_dir=REPORTS_DIR,
        file_stem=report_id,
        fmt=fmt,
        payload=payload,
        table_rows=rows,
        table_sheet_name='incidents',
    )

    _REPORTS[report_id] = {
        'id': report_id,
        'user_id': current_user.get('user_id'),
        'sector_id': report.sector_id,
        'report_type': report.report_type,
        'format': fmt,
        'path': str(out_path),
        'created_at': datetime.utcnow(),
        'completed_at': datetime.utcnow(),
    }

    return ReportResponse(
        id=report_id,
        report_type=report.report_type,
        status='completed',
        download_url=f"/api/v1/reports/{report_id}/download",
        created_at=_REPORTS[report_id]['created_at'],
        completed_at=_REPORTS[report_id]['completed_at'],
    )


@router.get("", response_model=List[ReportResponse])
async def list_reports(
    report_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    items = [r for r in _REPORTS.values() if r.get('user_id') == current_user.get('user_id')]

    if report_type:
        items = [r for r in items if r.get('report_type') == report_type]

    sliced = items[skip : skip + limit]

    return [
        ReportResponse(
            id=r['id'],
            report_type=r['report_type'],
            status='completed',
            download_url=f"/api/v1/reports/{r['id']}/download",
            created_at=r['created_at'],
            completed_at=r['completed_at'],
        )
        for r in sliced
    ]


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    r = _REPORTS.get(report_id)
    if not r or r.get('user_id') != current_user.get('user_id'):
        raise HTTPException(status_code=404, detail='Report not found')

    return ReportResponse(
        id=r['id'],
        report_type=r['report_type'],
        status='completed',
        download_url=f"/api/v1/reports/{r['id']}/download",
        created_at=r['created_at'],
        completed_at=r['completed_at'],
    )


@router.get("/{report_id}/download")
async def download_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    r = _REPORTS.get(report_id)
    if not r or r.get('user_id') != current_user.get('user_id'):
        raise HTTPException(status_code=404, detail='Report not found')

    path = Path(r['path'])
    if not path.exists():
        raise HTTPException(status_code=404, detail='Report artifact not found')

    # Basic content-type mapping
    media_type = {
        'pdf': 'application/pdf',
        'csv': 'text/csv',
        'json': 'application/json',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }.get(r.get('format'), 'application/octet-stream')

    return FileResponse(
        path=str(path),
        filename=path.name,
        media_type=media_type,
    )


@router.get("/templates/list")
async def list_report_templates(
    sector_id: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    """List available report templates.

    If sector_id is provided, returns templates from that sector config.
    """

    if sector_id:
        require_sector_entitlement(current_user, sector_id)

        try:
            cfg = load_sector_config(sector_id)
            return [t.model_dump() for t in cfg.report_templates]
        except FileNotFoundError:
            raise HTTPException(status_code=404, detail='Sector config not found')

    # Global fallback: union of common templates.
    return [
        {
            'id': 'template-daily',
            'name': 'Daily Safety Report',
            'description': 'Daily summary of incidents, near-misses, and KPIs',
            'formats': ['pdf', 'csv', 'json', 'xlsx'],
        },
        {
            'id': 'template-weekly',
            'name': 'Weekly Safety Report',
            'description': 'Weekly analysis with trends and recommendations',
            'formats': ['pdf', 'csv', 'json', 'xlsx'],
        },
        {
            'id': 'template-monthly',
            'name': 'Monthly Executive Report',
            'description': 'Executive summary for leadership review',
            'formats': ['pdf', 'csv', 'json', 'xlsx'],
        },
        {
            'id': 'template-compliance',
            'name': 'Compliance Report',
            'description': 'ISO 45001 and OSHA compliance documentation',
            'formats': ['pdf', 'csv', 'json', 'xlsx'],
        },
    ]


@router.get("/scheduled")
async def list_scheduled_reports(current_user: dict = Depends(get_current_user)):
    """List scheduled report configurations (demo stub)."""
    return []
