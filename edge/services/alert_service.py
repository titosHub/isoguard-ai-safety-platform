"""Alert Service for Real-time Notifications."""
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import uuid

logger = logging.getLogger(__name__)


class AlertService:
    """
    Manages alert generation and delivery.
    
    Features:
    - Configurable severity thresholds
    - Alert cooldown to prevent spam
    - Priority routing to cloud
    - Local alert queue for offline scenarios
    """
    
    SEVERITY_PRIORITY = {
        "critical": 4,
        "high": 3,
        "medium": 2,
        "low": 1
    }
    
    def __init__(
        self,
        cloud_sync,
        alert_threshold: str = "high",
        cooldown_seconds: int = 60
    ):
        self.cloud_sync = cloud_sync
        self.alert_threshold = alert_threshold
        self.cooldown_seconds = cooldown_seconds
        
        self._recent_alerts: Dict[str, datetime] = {}
        self._alert_counts: Dict[str, int] = defaultdict(int)
    
    def _should_alert(self, camera_id: str, detection_type: str, severity: str) -> bool:
        """Check if alert should be sent based on cooldown and threshold."""
        # Check severity threshold
        threshold_priority = self.SEVERITY_PRIORITY.get(self.alert_threshold, 2)
        alert_priority = self.SEVERITY_PRIORITY.get(severity, 1)
        
        if alert_priority < threshold_priority:
            return False
        
        # Check cooldown
        key = f"{camera_id}_{detection_type}"
        last_alert = self._recent_alerts.get(key)
        
        if last_alert:
            if datetime.utcnow() - last_alert < timedelta(seconds=self.cooldown_seconds):
                return False
        
        return True
    
    async def send_alert(
        self,
        detection_id: str,
        camera_id: str,
        site_id: str,
        violations: List[Dict[str, Any]],
        severity: str,
        timestamp: datetime
    ):
        """
        Send alert for detected violation.
        
        Args:
            detection_id: Unique detection ID
            camera_id: Source camera
            site_id: Site where violation occurred
            violations: List of violation details
            severity: Overall severity (critical, high, medium, low)
            timestamp: Detection timestamp
        """
        if not violations:
            return
        
        primary_violation = violations[0]["class"]
        
        if not self._should_alert(camera_id, primary_violation, severity):
            logger.debug(f"Alert suppressed (cooldown): {detection_id}")
            return
        
        # Create alert payload
        alert_data = {
            "id": str(uuid.uuid4()),
            "detection_id": detection_id,
            "camera_id": camera_id,
            "site_id": site_id,
            "type": primary_violation,
            "severity": severity,
            "timestamp": timestamp.isoformat(),
            "violations": violations,
            "acknowledged": False,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Update cooldown tracking
        key = f"{camera_id}_{primary_violation}"
        self._recent_alerts[key] = datetime.utcnow()
        self._alert_counts[key] += 1
        
        # Send to cloud
        await self.cloud_sync.send_alert(alert_data)
        
        logger.info(f"Alert sent: {alert_data['id']} - {primary_violation} ({severity})")
    
    def get_alert_stats(self) -> Dict[str, Any]:
        """Get alert statistics."""
        return {
            "total_alerts_sent": sum(self._alert_counts.values()),
            "alerts_by_type": dict(self._alert_counts),
            "threshold": self.alert_threshold,
            "cooldown_seconds": self.cooldown_seconds
        }
    
    def clear_cooldowns(self):
        """Clear all cooldown tracking."""
        self._recent_alerts.clear()
