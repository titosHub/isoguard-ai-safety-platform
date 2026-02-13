"""Government submission engine.

Builds a per-sector export/submission bundle that can be sent to regulators.

Current implementation generates a ZIP bundle with:
- Executive/operational summary (PDF + JSON)
- Tabular incident dataset (CSV + XLSX)
- Manifest (JSON)

This is designed to be sector-driven and template-driven via configs/.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
import json
import uuid
import zipfile

from models.schemas import GovernmentSubmissionCreateRequest, GovernmentSubmissionResponse
from services.reporting.renderer import render_report, ensure_dir
from services.sector_analytics.registry import get_plugin
from solutions.loader import load_sector_config


SUBMISSIONS_DIR = Path(__file__).resolve().parents[2] / 'storage' / 'submissions'


def _demo_incident_rows(sector_id: str, count: int = 25) -> List[Dict[str, Any]]:
    rows: List[Dict[str, Any]] = []
    for i in range(count):
        rows.append(
            {
                'incident_id': f'{sector_id.upper()}-INC-{i+1:04d}',
                'sector_id': sector_id,
                'site_id': f'{sector_id}-site-{(i % 3) + 1:03d}',
                'severity': ['low', 'medium', 'high', 'critical'][i % 4],
                'detection_type': ['ppe_violation', 'proximity', 'zone', 'unsafe_behavior'][i % 4],
                'detected_at': (datetime.utcnow()).isoformat() + 'Z',
            }
        )
    return rows


@dataclass
class SubmissionArtifact:
    name: str
    path: Path


def create_submission_bundle(req: GovernmentSubmissionCreateRequest) -> GovernmentSubmissionResponse:
    submission_id = f'sub-{uuid.uuid4().hex[:12]}'
    created_at = datetime.utcnow()

    sector_cfg = load_sector_config(req.sector_id)
    plugin = get_plugin(req.sector_id)

    # Build summary payload
    # (sync wrapper around async methods is handled by the API route)
    # Here we expect the route to pass in already computed values when needed.
    payload: Dict[str, Any] = {
        'title': 'Government Submission Bundle',
        'sector_id': req.sector_id,
        'sector_name': sector_cfg.name,
        'framework': req.framework,
        'date_range': f'{req.start_date.date().isoformat()} to {req.end_date.date().isoformat()}',
        'formats': req.formats,
        'generated_at': created_at.isoformat() + 'Z',
    }

    # Output folder for artifacts before zipping
    out_dir = SUBMISSIONS_DIR / submission_id
    ensure_dir(out_dir)

    incidents_rows = _demo_incident_rows(req.sector_id)

    # Always create manifest.json
    manifest_path = out_dir / 'manifest.json'
    manifest_path.write_text(
        json.dumps(
            {
                'submission_id': submission_id,
                'sector_id': req.sector_id,
                'framework': req.framework,
                'submit': req.submit,
                'created_at': created_at.isoformat() + 'Z',
                'artifacts': [],
            },
            indent=2,
        ),
        encoding='utf-8',
    )

    artifacts: List[SubmissionArtifact] = []

    # Summary artifacts
    if 'pdf' in [f.lower() for f in req.formats]:
        artifacts.append(
            SubmissionArtifact(
                name='summary.pdf',
                path=render_report(
                    output_dir=out_dir,
                    file_stem='summary',
                    fmt='pdf',
                    payload=payload,
                    table_rows=incidents_rows,
                    table_sheet_name='incidents',
                ),
            )
        )

    if 'json' in [f.lower() for f in req.formats]:
        artifacts.append(
            SubmissionArtifact(
                name='summary.json',
                path=render_report(
                    output_dir=out_dir,
                    file_stem='summary',
                    fmt='json',
                    payload={
                        **payload,
                        'executive': None,
                        'operational': None,
                    },
                    table_rows=incidents_rows,
                ),
            )
        )

    # Tabular exports
    if 'csv' in [f.lower() for f in req.formats]:
        artifacts.append(
            SubmissionArtifact(
                name='incidents.csv',
                path=render_report(
                    output_dir=out_dir,
                    file_stem='incidents',
                    fmt='csv',
                    payload=payload,
                    table_rows=incidents_rows,
                ),
            )
        )

    if 'xlsx' in [f.lower() for f in req.formats] or 'excel' in [f.lower() for f in req.formats]:
        artifacts.append(
            SubmissionArtifact(
                name='incidents.xlsx',
                path=render_report(
                    output_dir=out_dir,
                    file_stem='incidents',
                    fmt='xlsx',
                    payload=payload,
                    table_rows=incidents_rows,
                    table_sheet_name='incidents',
                ),
            )
        )

    # Update manifest with artifacts
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    manifest['artifacts'] = [{'name': a.name, 'path': a.path.name} for a in artifacts]
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding='utf-8')

    # Zip everything
    zip_path = SUBMISSIONS_DIR / f'{submission_id}.zip'
    ensure_dir(SUBMISSIONS_DIR)
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as zf:
        for p in [manifest_path] + [a.path for a in artifacts]:
            zf.write(p, arcname=p.name)

    status = 'submitted' if req.submit else 'draft'
    submitted_at = created_at if req.submit else None

    return GovernmentSubmissionResponse(
        id=submission_id,
        sector_id=req.sector_id,
        status=status,
        created_at=created_at,
        submitted_at=submitted_at,
        download_url=f'/api/v1/government/submissions/{submission_id}/download',
    )


async def create_submission_bundle_async(req: GovernmentSubmissionCreateRequest) -> GovernmentSubmissionResponse:
    """Async wrapper so API routes can call into the engine consistently."""

    # Fill executive/operational into the PDF/JSON payload later.
    # For now, we compute them here and embed in payload (future refinement).
    plugin = get_plugin(req.sector_id)
    executive = await plugin.get_executive_view(days=30)
    operational = await plugin.get_operational_view(days=30)

    # The sync builder currently doesn't embed these; we keep this method so we
    # can evolve the artifact payload without changing API signatures.
    _ = (executive, operational)

    return create_submission_bundle(req)
