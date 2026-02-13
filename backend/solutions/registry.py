"""Backend sector registry.

This is the backend source of truth for supported sectors.
Frontend can query via the /sectors API.
"""

from __future__ import annotations

from typing import List, Dict, Any

from solutions.loader import load_sector_config


SUPPORTED_SECTORS = [
    'mining',
    'airport',
    'border',
    'smart_city',
    'manufacturing',
    'warehouse',
    'health',
    'construction',
    'agriculture',
]


def list_sector_summaries() -> List[Dict[str, Any]]:
    summaries: List[Dict[str, Any]] = []

    for sector_id in SUPPORTED_SECTORS:
        cfg = load_sector_config(sector_id)
        summaries.append(
            {
                'sector_id': cfg.sector_id,
                'name': cfg.name,
                'version': cfg.version,
                'feature_toggles': cfg.feature_toggles.model_dump(),
                'rule_count': len([r for r in cfg.rules if r.enabled]),
                'camera_count': len([c for c in cfg.cameras if c.enabled]),
                'report_template_count': len(cfg.report_templates),
            }
        )

    return summaries
