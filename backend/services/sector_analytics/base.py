"""Sector analytics plugin interface.

This plugin layer allows each sector to have independent KPI computations while
sharing a consistent API contract.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Protocol

from models.schemas import ExecutiveBoardView, OperationalView, RiskSiteSummary
from services.analytics_service import analytics_service


class SectorAnalyticsPlugin(Protocol):
    sector_id: str

    async def get_executive_view(
        self,
        days: int = 30,
        site_ids: Optional[List[str]] = None,
    ) -> ExecutiveBoardView:
        ...

    async def get_operational_view(
        self,
        days: int = 30,
        site_ids: Optional[List[str]] = None,
    ) -> OperationalView:
        ...


@dataclass
class DemoSectorAnalyticsPlugin:
    """Default analytics plugin (demo implementation).

    This is intentionally simple and can be replaced by sector-specific plugins
    once real data sources are connected.
    """

    sector_id: str

    def _demo_incidents(self, days: int) -> List[Dict]:
        # Create sector-shaped incident data (demo) for analytics_service.
        base = {
            'mining': 18,
            'airport': 14,
            'border': 8,
            'smart_city': 10,
            'manufacturing': 12,
            'warehouse': 11,
            'health': 9,
            'construction': 13,
            'agriculture': 7,
        }.get(self.sector_id, 10)

        count = max(5, min(base, days))

        # Mix severities in a stable way.
        severities = ['low', 'medium', 'high', 'critical']
        incidents: List[Dict] = []
        for i in range(count):
            incidents.append(
                {
                    'severity': severities[(i + len(self.sector_id)) % len(severities)],
                    'detected_at': datetime.now() - timedelta(days=i),
                    'violation_type': 'ppe_violation',
                    'site_id': f'{self.sector_id}-site-{(i % 3) + 1:03d}',
                    'is_recordable': True,
                    'lost_time_days': 1 if (i % 9 == 0) else 0,
                }
            )
        return incidents

    async def get_executive_view(
        self,
        days: int = 30,
        site_ids: Optional[List[str]] = None,
    ) -> ExecutiveBoardView:
        incidents = self._demo_incidents(days)

        safety_score = await analytics_service.calculate_safety_score(
            incidents=incidents,
            near_misses=[],
            corrective_actions=[],
            total_work_hours=160000,
            period_days=days,
        )

        # Demo: derive risk sites from incident counts.
        site_counts: Dict[str, int] = {}
        for inc in incidents:
            site_counts[inc['site_id']] = site_counts.get(inc['site_id'], 0) + 1

        top_sites = sorted(site_counts.items(), key=lambda kv: -kv[1])[:5]
        top_5_risk_sites = [
            RiskSiteSummary(site_id=sid, site_name=sid, risk_score=float(cnt * 10))
            for sid, cnt in top_sites
        ]

        days_since_fatality = 120 + (len(self.sector_id) * 3)

        regulatory_exposure_index = max(
            0.0,
            min(
                100.0,
                (100.0 - float(safety_score.compliance_coverage))
                + float(safety_score.severity_weighted_index) * 4,
            ),
        )

        return ExecutiveBoardView(
            global_safety_score=float(safety_score.overall_score),
            trir=float(safety_score.trir),
            ltifr=float(safety_score.ltifr),
            severity_index=float(safety_score.severity_weighted_index),
            compliance_coverage_percent=float(safety_score.compliance_coverage),
            predictive_risk_probability=float(safety_score.predictive_risk_probability),
            days_since_fatality=int(days_since_fatality),
            top_5_risk_sites=top_5_risk_sites,
            regulatory_exposure_index=float(regulatory_exposure_index),
        )

    async def get_operational_view(
        self,
        days: int = 30,
        site_ids: Optional[List[str]] = None,
    ) -> OperationalView:
        incidents = self._demo_incidents(days)
        trends = await analytics_service.get_incident_trends(incidents, period_days=days, granularity='daily')

        # TODO: use real alert stream; demo = count of high/critical
        live_alert_count = len([i for i in incidents if i['severity'] in ('high', 'critical')])

        # Demo placeholders
        corrective_action_closure_rate = 85.0
        mttr_hours = 24.0

        return OperationalView(
            live_alert_count=int(live_alert_count),
            incident_trends=trends,
            location_risks=[],
            corrective_action_closure_rate=float(corrective_action_closure_rate),
            mttr_hours=float(mttr_hours),
        )
