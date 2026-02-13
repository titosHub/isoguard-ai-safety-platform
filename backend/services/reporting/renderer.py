"""Report rendering helpers.

Supports PDF, CSV, JSON, and XLSX outputs.

NOTE: Current implementation renders a simple executive/operational summary and
an incidents table. Sector branding/template customization can be layered via
SectorConfig.report_templates.settings.
"""

from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import json

import pandas as pd


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def _write_json(path: Path, payload: Dict[str, Any]) -> None:
    path.write_text(json.dumps(payload, indent=2, default=str), encoding='utf-8')


def _write_csv(path: Path, rows: List[Dict[str, Any]]) -> None:
    df = pd.DataFrame(rows)
    df.to_csv(path, index=False)


def _write_xlsx(path: Path, rows: List[Dict[str, Any]], sheet_name: str = 'data') -> None:
    df = pd.DataFrame(rows)
    with pd.ExcelWriter(path, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name=sheet_name[:31])


def _write_pdf(path: Path, payload: Dict[str, Any]) -> None:
    # Simple PDF summary via reportlab.
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen.canvas import Canvas

    c = Canvas(str(path), pagesize=letter)
    width, height = letter

    title = payload.get('title') or 'Report'
    sector_name = payload.get('sector_name') or payload.get('sector_id') or 'All'
    date_range = payload.get('date_range') or ''

    y = height - 60
    c.setFont('Helvetica-Bold', 16)
    c.drawString(50, y, title)
    y -= 20

    c.setFont('Helvetica', 11)
    c.drawString(50, y, f'Sector: {sector_name}')
    y -= 16
    if date_range:
        c.drawString(50, y, f'Date range: {date_range}')
        y -= 16

    c.drawString(50, y, f'Generated at: {datetime.utcnow().isoformat()}Z')
    y -= 24

    # Executive KPI block
    executive = payload.get('executive') or {}
    if executive:
        c.setFont('Helvetica-Bold', 12)
        c.drawString(50, y, 'Executive KPIs')
        y -= 18
        c.setFont('Helvetica', 10)
        for k in [
            'global_safety_score',
            'trir',
            'ltifr',
            'severity_index',
            'compliance_coverage_percent',
            'predictive_risk_probability',
            'days_since_fatality',
            'regulatory_exposure_index',
        ]:
            if k in executive:
                c.drawString(60, y, f"{k}: {executive.get(k)}")
                y -= 14
        y -= 8

    operational = payload.get('operational') or {}
    if operational:
        c.setFont('Helvetica-Bold', 12)
        c.drawString(50, y, 'Operational Summary')
        y -= 18
        c.setFont('Helvetica', 10)
        for k in ['live_alert_count', 'corrective_action_closure_rate', 'mttr_hours']:
            if k in operational:
                c.drawString(60, y, f"{k}: {operational.get(k)}")
                y -= 14
        y -= 8

    # Footer
    c.setFont('Helvetica-Oblique', 8)
    c.drawString(50, 30, 'IsoGuard.Ai • Generated report (demo renderer)')

    c.showPage()
    c.save()


def render_report(
    *,
    output_dir: Path,
    file_stem: str,
    fmt: str,
    payload: Dict[str, Any],
    table_rows: Optional[List[Dict[str, Any]]] = None,
    table_sheet_name: str = 'incidents',
) -> Path:
    """Render a report file and return its path."""

    ensure_dir(output_dir)

    fmt = fmt.lower().strip()
    table_rows = table_rows or []

    if fmt == 'pdf':
        path = output_dir / f'{file_stem}.pdf'
        _write_pdf(path, payload)
        return path

    if fmt == 'json':
        path = output_dir / f'{file_stem}.json'
        _write_json(path, payload)
        return path

    if fmt == 'csv':
        path = output_dir / f'{file_stem}.csv'
        _write_csv(path, table_rows)
        return path

    if fmt in ('xlsx', 'excel'):
        path = output_dir / f'{file_stem}.xlsx'
        _write_xlsx(path, table_rows, sheet_name=table_sheet_name)
        return path

    raise ValueError(f'Unsupported report format: {fmt}')
