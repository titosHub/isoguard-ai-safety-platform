"""Analytics and reporting routes."""
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Query, Depends
from models.schemas import (
    DateRangeFilter, SafetyScoreData, IncidentTrendData,
    LocationRiskData, KPIDashboardData
)
from services.analytics_service import analytics_service
from core.security import get_current_user

router = APIRouter()


@router.get("/dashboard", response_model=KPIDashboardData)
async def get_dashboard_data(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get comprehensive dashboard data with all KPIs."""
    # Demo data - replace with actual database queries
    demo_incidents = [
        {"severity": "high", "detected_at": datetime.now() - timedelta(days=i), 
         "violation_type": "ppe_violation", "site_id": "site-001"}
        for i in range(15)
    ]
    
    safety_score = await analytics_service.calculate_safety_score(
        incidents=demo_incidents,
        near_misses=[],
        corrective_actions=[],
        total_work_hours=160000,
        period_days=days
    )
    
    trends = await analytics_service.get_incident_trends(demo_incidents, days)
    
    return KPIDashboardData(
        safety_score=safety_score,
        incident_trends=trends,
        location_risks=[],
        recent_incidents=[],
        near_miss_count=5,
        corrective_action_closure_rate=85.0,
        mean_time_to_detect=2.5,
        mean_time_to_resolve=24.0
    )


@router.get("/safety-score", response_model=SafetyScoreData)
async def get_safety_score(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get overall safety score and related KPIs."""
    # Demo implementation
    return SafetyScoreData(
        overall_score=78.5,
        trir=2.1,
        ltifr=0.8,
        severity_weighted_index=3.2,
        predictive_risk_probability=0.23,
        compliance_coverage=92.0,
        trend="improving"
    )


@router.get("/trends", response_model=List[IncidentTrendData])
async def get_incident_trends(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    granularity: str = Query("daily", regex="^(daily|weekly|monthly)$"),
    current_user: dict = Depends(get_current_user)
):
    """Get incident trends over time."""
    demo_incidents = [
        {"severity": "high", "detected_at": datetime.now() - timedelta(days=i)}
        for i in range(days)
    ]
    return await analytics_service.get_incident_trends(demo_incidents, days, granularity)


@router.get("/location-risks", response_model=List[LocationRiskData])
async def get_location_risks(
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get risk analysis by location/zone."""
    return [
        LocationRiskData(
            site_id="site-001",
            site_name="Main Construction Site",
            zone_id="zone-001",
            zone_name="Heavy Equipment Area",
            incident_count=12,
            risk_score=75.0,
            top_violation_types=[
                {"type": "ppe_violation", "count": 8},
                {"type": "proximity_violation", "count": 4}
            ]
        )
    ]


@router.get("/root-cause")
async def get_root_cause_analysis(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get root cause analysis for incidents."""
    demo_incidents = [
        {"violation_type": "ppe_violation", "detected_at": datetime.now()},
        {"violation_type": "proximity_violation", "detected_at": datetime.now()}
    ]
    return await analytics_service.get_root_cause_analysis(demo_incidents)


@router.get("/shift-analysis")
async def get_shift_analysis(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get incident analysis by shift and team."""
    demo_incidents = [
        {"severity": "high", "detected_at": datetime.now() - timedelta(hours=i * 3)}
        for i in range(24)
    ]
    return await analytics_service.get_team_shift_analysis(demo_incidents)


@router.get("/action-effectiveness")
async def get_action_effectiveness(
    days: int = Query(90, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get corrective action effectiveness metrics."""
    return {
        "closure_rate": 87.5,
        "average_time_to_close_hours": 48.0,
        "recurrence_rate": 12.3,
        "total_actions": 45,
        "completed_actions": 39,
        "pending_actions": 6
    }


@router.get("/benchmarks")
async def get_benchmarks(
    current_user: dict = Depends(get_current_user)
):
    """Get performance benchmarks comparison."""
    safety_score = SafetyScoreData(
        overall_score=78.5,
        trir=2.1,
        ltifr=0.8,
        severity_weighted_index=3.2,
        predictive_risk_probability=0.23,
        compliance_coverage=92.0,
        trend="improving"
    )
    return await analytics_service.get_benchmark_comparison(safety_score)


@router.get("/predictive")
async def get_predictive_analytics(
    site_id: Optional[str] = Query(None),
    days_ahead: int = Query(7, ge=1, le=30),
    current_user: dict = Depends(get_current_user)
):
    """Get predictive analytics and risk forecasting."""
    return {
        "forecast_period_days": days_ahead,
        "predicted_incident_probability": 0.35,
        "high_risk_periods": [
            {"day": "Monday", "shift": "morning", "risk_level": "high"},
            {"day": "Friday", "shift": "afternoon", "risk_level": "medium"}
        ],
        "recommended_actions": [
            "Increase supervision during Monday morning shift",
            "Conduct safety briefing before Friday afternoon shift"
        ],
        "confidence_level": 0.82
    }


@router.get("/near-miss-trends")
async def get_near_miss_trends(
    site_id: Optional[str] = Query(None),
    days: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user)
):
    """Get near-miss incident trends."""
    return {
        "total_near_misses": 23,
        "trend": "decreasing",
        "by_type": {
            "slip_trip": 8,
            "falling_object": 6,
            "equipment_malfunction": 5,
            "other": 4
        },
        "near_miss_to_incident_ratio": 10.5
    }
