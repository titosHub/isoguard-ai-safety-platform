"""Analytics service for safety metrics, KPIs, and predictive analytics."""
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from collections import defaultdict

from models.schemas import (
    SafetyScoreData, IncidentTrendData, LocationRiskData,
    KPIDashboardData, IncidentSeverity, ViolationType
)


class AnalyticsService:
    """Service for computing safety analytics and KPIs."""
    
    # Severity weights for risk scoring
    SEVERITY_WEIGHTS = {
        IncidentSeverity.CRITICAL: 10,
        IncidentSeverity.HIGH: 5,
        IncidentSeverity.MEDIUM: 2,
        IncidentSeverity.LOW: 1
    }
    
    # Industry benchmark values
    INDUSTRY_TRIR_BENCHMARK = 3.0
    INDUSTRY_LTIFR_BENCHMARK = 1.5
    
    def __init__(self):
        """Initialize analytics service."""
        pass
    
    async def calculate_safety_score(
        self,
        incidents: List[Dict],
        near_misses: List[Dict],
        corrective_actions: List[Dict],
        total_work_hours: float,
        period_days: int = 30
    ) -> SafetyScoreData:
        """Calculate comprehensive safety score with multiple KPIs."""
        
        # Calculate TRIR (Total Recordable Incident Rate)
        # Formula: (Number of incidents * 200,000) / Total hours worked
        recordable_incidents = len([i for i in incidents if i.get('is_recordable', True)])
        trir = (recordable_incidents * 200000) / max(total_work_hours, 1)
        
        # Calculate LTIFR (Lost Time Injury Frequency Rate)
        lost_time_incidents = len([i for i in incidents if i.get('lost_time_days', 0) > 0])
        ltifr = (lost_time_incidents * 1000000) / max(total_work_hours, 1)
        
        # Calculate severity-weighted incident index
        severity_index = sum(
            self.SEVERITY_WEIGHTS.get(IncidentSeverity(i.get('severity', 'low')), 1)
            for i in incidents
        ) / max(len(incidents), 1)
        
        # Calculate predictive risk probability using historical trends
        predictive_probability = await self._calculate_predictive_risk(incidents, period_days)
        
        # Calculate compliance coverage
        compliance_coverage = await self._calculate_compliance_coverage(corrective_actions)
        
        # Calculate overall safety score (0-100)
        # Higher is better - penalize for high TRIR, LTIFR, and severity
        trir_factor = max(0, 100 - (trir / self.INDUSTRY_TRIR_BENCHMARK * 30))
        ltifr_factor = max(0, 100 - (ltifr / self.INDUSTRY_LTIFR_BENCHMARK * 30))
        severity_factor = max(0, 100 - severity_index * 10)
        compliance_factor = compliance_coverage
        near_miss_factor = max(0, 100 - len(near_misses) * 2)
        
        overall_score = (
            trir_factor * 0.25 +
            ltifr_factor * 0.25 +
            severity_factor * 0.20 +
            compliance_factor * 0.15 +
            near_miss_factor * 0.15
        )
        
        # Determine trend
        trend = await self._calculate_trend(incidents, period_days)
        
        return SafetyScoreData(
            overall_score=round(overall_score, 1),
            trir=round(trir, 3),
            ltifr=round(ltifr, 3),
            severity_weighted_index=round(severity_index, 2),
            predictive_risk_probability=round(predictive_probability, 2),
            compliance_coverage=round(compliance_coverage, 1),
            trend=trend
        )
    
    async def _calculate_predictive_risk(
        self,
        incidents: List[Dict],
        period_days: int
    ) -> float:
        """Calculate predictive risk probability based on historical patterns."""
        if not incidents:
            return 0.1  # Base risk probability
        
        # Group incidents by day
        daily_counts = defaultdict(int)
        for incident in incidents:
            date = incident.get('detected_at', datetime.now()).date()
            daily_counts[date] += 1
        
        if not daily_counts:
            return 0.1
        
        # Calculate rolling average and variance
        counts = list(daily_counts.values())
        mean_incidents = np.mean(counts)
        std_incidents = np.std(counts) if len(counts) > 1 else 0
        
        # Simple exponential smoothing for prediction
        alpha = 0.3
        smoothed = counts[0]
        for count in counts[1:]:
            smoothed = alpha * count + (1 - alpha) * smoothed
        
        # Probability increases with higher smoothed value and variance
        base_probability = min(smoothed / 10, 1.0)
        variance_factor = min(std_incidents / 5, 0.3)
        
        return min(base_probability + variance_factor, 1.0)
    
    async def _calculate_compliance_coverage(
        self,
        corrective_actions: List[Dict]
    ) -> float:
        """Calculate compliance coverage based on corrective action completion."""
        if not corrective_actions:
            return 100.0
        
        completed = len([ca for ca in corrective_actions if ca.get('status') == 'completed'])
        overdue = len([
            ca for ca in corrective_actions
            if ca.get('status') != 'completed' and
            ca.get('due_date', datetime.now()) < datetime.now()
        ])
        
        completion_rate = (completed / len(corrective_actions)) * 100
        overdue_penalty = overdue * 5
        
        return max(0, completion_rate - overdue_penalty)
    
    async def _calculate_trend(
        self,
        incidents: List[Dict],
        period_days: int
    ) -> str:
        """Determine if safety is improving, stable, or declining."""
        if len(incidents) < 5:
            return "stable"
        
        # Split into two periods
        mid_point = datetime.now() - timedelta(days=period_days // 2)
        
        first_half = [i for i in incidents if i.get('detected_at', datetime.now()) < mid_point]
        second_half = [i for i in incidents if i.get('detected_at', datetime.now()) >= mid_point]
        
        first_rate = len(first_half) / max(period_days // 2, 1)
        second_rate = len(second_half) / max(period_days // 2, 1)
        
        change_ratio = (second_rate - first_rate) / max(first_rate, 0.1)
        
        if change_ratio < -0.15:
            return "improving"
        elif change_ratio > 0.15:
            return "declining"
        return "stable"
    
    async def get_incident_trends(
        self,
        incidents: List[Dict],
        period_days: int = 30,
        granularity: str = "daily"
    ) -> List[IncidentTrendData]:
        """Get incident trends over time."""
        trends = []
        
        # Group by date
        date_groups = defaultdict(lambda: {"count": 0, "severity": defaultdict(int)})
        
        for incident in incidents:
            date = incident.get('detected_at', datetime.now())
            if granularity == "daily":
                key = date.strftime("%Y-%m-%d")
            elif granularity == "weekly":
                key = f"Week {date.isocalendar()[1]}"
            else:
                key = date.strftime("%Y-%m")
            
            date_groups[key]["count"] += 1
            severity = incident.get('severity', 'low')
            date_groups[key]["severity"][severity] += 1
        
        # Convert to trend data
        for date_key, data in sorted(date_groups.items()):
            trends.append(IncidentTrendData(
                date=date_key,
                incident_count=data["count"],
                severity_breakdown=dict(data["severity"])
            ))
        
        return trends
    
    async def get_location_risk_analysis(
        self,
        incidents: List[Dict],
        sites: List[Dict],
        zones: List[Dict]
    ) -> List[LocationRiskData]:
        """Analyze risk by location/zone."""
        location_risks = []
        
        # Group incidents by site and zone
        site_incidents = defaultdict(list)
        zone_incidents = defaultdict(list)
        
        for incident in incidents:
            site_incidents[incident.get('site_id')].append(incident)
            if incident.get('zone_id'):
                zone_incidents[incident.get('zone_id')].append(incident)
        
        # Calculate risk for each site
        site_map = {s.get('id'): s for s in sites}
        zone_map = {z.get('id'): z for z in zones}
        
        for site_id, site_inc in site_incidents.items():
            site = site_map.get(site_id, {})
            
            # Calculate risk score based on frequency and severity
            severity_sum = sum(
                self.SEVERITY_WEIGHTS.get(IncidentSeverity(i.get('severity', 'low')), 1)
                for i in site_inc
            )
            risk_score = min(100, (len(site_inc) * 5) + (severity_sum * 2))
            
            # Get top violation types
            violation_counts = defaultdict(int)
            for inc in site_inc:
                violation_counts[inc.get('violation_type', 'unknown')] += 1
            
            top_violations = [
                {"type": k, "count": v}
                for k, v in sorted(violation_counts.items(), key=lambda x: -x[1])[:3]
            ]
            
            location_risks.append(LocationRiskData(
                site_id=site_id,
                site_name=site.get('name', 'Unknown Site'),
                zone_id=None,
                zone_name=None,
                incident_count=len(site_inc),
                risk_score=risk_score,
                top_violation_types=top_violations
            ))
        
        return sorted(location_risks, key=lambda x: -x.risk_score)
    
    async def get_root_cause_analysis(
        self,
        incidents: List[Dict]
    ) -> Dict[str, Any]:
        """Analyze root causes and contributing factors."""
        root_causes = defaultdict(int)
        contributing_factors = defaultdict(int)
        
        for incident in incidents:
            # Categorize by violation type patterns
            violation_type = incident.get('violation_type', '')
            
            if 'ppe' in violation_type.lower():
                root_causes['PPE Non-Compliance'] += 1
                contributing_factors['Training Gap'] += 1
                contributing_factors['Awareness'] += 1
            elif 'proximity' in violation_type.lower():
                root_causes['Unsafe Distance'] += 1
                contributing_factors['Spatial Awareness'] += 1
            elif 'zone' in violation_type.lower():
                root_causes['Zone Violation'] += 1
                contributing_factors['Signage/Barriers'] += 1
            
            # Time-based factors
            detected_at = incident.get('detected_at', datetime.now())
            hour = detected_at.hour
            if 6 <= hour < 14:
                contributing_factors['Morning Shift'] += 1
            elif 14 <= hour < 22:
                contributing_factors['Afternoon Shift'] += 1
            else:
                contributing_factors['Night Shift'] += 1
        
        return {
            "root_causes": dict(sorted(root_causes.items(), key=lambda x: -x[1])),
            "contributing_factors": dict(sorted(contributing_factors.items(), key=lambda x: -x[1])),
            "total_analyzed": len(incidents)
        }
    
    async def get_team_shift_analysis(
        self,
        incidents: List[Dict]
    ) -> Dict[str, Any]:
        """Analyze incidents by team and shift patterns."""
        shift_data = {
            "morning": {"count": 0, "severity_sum": 0},
            "afternoon": {"count": 0, "severity_sum": 0},
            "night": {"count": 0, "severity_sum": 0}
        }
        
        hourly_distribution = defaultdict(int)
        day_of_week = defaultdict(int)
        
        for incident in incidents:
            detected_at = incident.get('detected_at', datetime.now())
            hour = detected_at.hour
            severity_weight = self.SEVERITY_WEIGHTS.get(
                IncidentSeverity(incident.get('severity', 'low')), 1
            )
            
            # Shift categorization
            if 6 <= hour < 14:
                shift_data["morning"]["count"] += 1
                shift_data["morning"]["severity_sum"] += severity_weight
            elif 14 <= hour < 22:
                shift_data["afternoon"]["count"] += 1
                shift_data["afternoon"]["severity_sum"] += severity_weight
            else:
                shift_data["night"]["count"] += 1
                shift_data["night"]["severity_sum"] += severity_weight
            
            hourly_distribution[hour] += 1
            day_of_week[detected_at.strftime("%A")] += 1
        
        # Find highest risk shift
        highest_risk_shift = max(
            shift_data.items(),
            key=lambda x: x[1]["severity_sum"]
        )[0]
        
        return {
            "shift_breakdown": shift_data,
            "hourly_distribution": dict(sorted(hourly_distribution.items())),
            "day_of_week_distribution": day_of_week,
            "highest_risk_shift": highest_risk_shift
        }
    
    async def get_action_effectiveness(
        self,
        corrective_actions: List[Dict],
        incidents: List[Dict]
    ) -> Dict[str, Any]:
        """Track effectiveness of corrective actions."""
        if not corrective_actions:
            return {
                "closure_rate": 0,
                "average_time_to_close": 0,
                "recurrence_rate": 0,
                "effectiveness_scores": []
            }
        
        completed = [ca for ca in corrective_actions if ca.get('status') == 'completed']
        closure_rate = (len(completed) / len(corrective_actions)) * 100
        
        # Calculate average time to close
        close_times = []
        for ca in completed:
            if ca.get('completed_at') and ca.get('created_at'):
                delta = ca['completed_at'] - ca['created_at']
                close_times.append(delta.total_seconds() / 3600)  # Hours
        
        avg_close_time = np.mean(close_times) if close_times else 0
        
        # Calculate recurrence rate (incidents after corrective actions)
        recurrence_count = 0
        for ca in completed:
            incident_type = ca.get('incident_type')
            completed_at = ca.get('completed_at', datetime.now())
            
            recurring = [
                i for i in incidents
                if i.get('violation_type') == incident_type and
                i.get('detected_at', datetime.now()) > completed_at
            ]
            if recurring:
                recurrence_count += 1
        
        recurrence_rate = (recurrence_count / max(len(completed), 1)) * 100
        
        return {
            "closure_rate": round(closure_rate, 1),
            "average_time_to_close_hours": round(avg_close_time, 1),
            "recurrence_rate": round(recurrence_rate, 1),
            "total_actions": len(corrective_actions),
            "completed_actions": len(completed),
            "pending_actions": len(corrective_actions) - len(completed)
        }
    
    async def get_benchmark_comparison(
        self,
        safety_score: SafetyScoreData
    ) -> Dict[str, Any]:
        """Compare metrics against industry benchmarks."""
        return {
            "trir": {
                "current": safety_score.trir,
                "industry_benchmark": self.INDUSTRY_TRIR_BENCHMARK,
                "percentile": self._calculate_percentile(safety_score.trir, self.INDUSTRY_TRIR_BENCHMARK),
                "status": "above" if safety_score.trir > self.INDUSTRY_TRIR_BENCHMARK else "below"
            },
            "ltifr": {
                "current": safety_score.ltifr,
                "industry_benchmark": self.INDUSTRY_LTIFR_BENCHMARK,
                "percentile": self._calculate_percentile(safety_score.ltifr, self.INDUSTRY_LTIFR_BENCHMARK),
                "status": "above" if safety_score.ltifr > self.INDUSTRY_LTIFR_BENCHMARK else "below"
            },
            "overall_rating": self._get_rating(safety_score.overall_score)
        }
    
    def _calculate_percentile(self, current: float, benchmark: float) -> int:
        """Calculate percentile ranking compared to benchmark."""
        if current == 0:
            return 100
        ratio = benchmark / current
        return min(100, int(ratio * 50))
    
    def _get_rating(self, score: float) -> str:
        """Get rating based on score."""
        if score >= 90:
            return "Excellent"
        elif score >= 75:
            return "Good"
        elif score >= 60:
            return "Fair"
        elif score >= 40:
            return "Needs Improvement"
        return "Critical"


# Create singleton instance
analytics_service = AnalyticsService()
