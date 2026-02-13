"""Sector analytics plugin registry."""

from __future__ import annotations

from typing import Dict, List, Optional

from models.schemas import ExecutiveBoardView
from services.sector_analytics.base import DemoSectorAnalyticsPlugin, SectorAnalyticsPlugin
from solutions.registry import SUPPORTED_SECTORS


_PLUGINS: Dict[str, SectorAnalyticsPlugin] = {
    sector_id: DemoSectorAnalyticsPlugin(sector_id=sector_id)
    for sector_id in SUPPORTED_SECTORS
}


def get_plugin(sector_id: str) -> SectorAnalyticsPlugin:
    return _PLUGINS.get(sector_id) or DemoSectorAnalyticsPlugin(sector_id=sector_id)


async def get_global_executive_overview(
    *,
    sector_ids: Optional[List[str]] = None,
) -> ExecutiveBoardView:
    """Compute a global (cross-sector) executive overview.

    NOTE: In production, this should aggregate across organizations/sites with
    proper access control; this demo aggregates per-sector demo values.
    """

    sector_views: List[ExecutiveBoardView] = []

    ids = sector_ids or list(SUPPORTED_SECTORS)
    for sector_id in ids:
        plugin = get_plugin(sector_id)
        sector_views.append(await plugin.get_executive_view(days=30))

    if not sector_views:
        # Safe defaults
        return ExecutiveBoardView(
            global_safety_score=0.0,
            trir=0.0,
            ltifr=0.0,
            severity_index=0.0,
            compliance_coverage_percent=0.0,
            predictive_risk_probability=0.0,
            days_since_fatality=0,
            top_5_risk_sites=[],
            regulatory_exposure_index=0.0,
        )

    avg = lambda xs: sum(xs) / max(len(xs), 1)

    # Merge top risk sites across sectors (simple concat + sort)
    risk_sites = []
    for v in sector_views:
        risk_sites.extend(v.top_5_risk_sites)
    risk_sites = sorted(risk_sites, key=lambda s: -s.risk_score)[:5]

    return ExecutiveBoardView(
        global_safety_score=float(avg([v.global_safety_score for v in sector_views])),
        trir=float(avg([v.trir for v in sector_views])),
        ltifr=float(avg([v.ltifr for v in sector_views])),
        severity_index=float(avg([v.severity_index for v in sector_views])),
        compliance_coverage_percent=float(avg([v.compliance_coverage_percent for v in sector_views])),
        predictive_risk_probability=float(avg([v.predictive_risk_probability for v in sector_views])),
        days_since_fatality=int(avg([v.days_since_fatality for v in sector_views])),
        top_5_risk_sites=risk_sites,
        regulatory_exposure_index=float(avg([v.regulatory_exposure_index for v in sector_views])),
    )
