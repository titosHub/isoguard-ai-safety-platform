"""AI Inference Engine for Safety Detection."""
import logging
import time
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from dataclasses import dataclass
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class Detection:
    """Single detection result."""
    class_name: str
    confidence: float
    bbox: List[int]  # [x1, y1, x2, y2]
    is_violation: bool
    severity: str  # critical, high, medium, low


@dataclass
class InferenceResult:
    """Complete inference result for a frame."""
    detections: List[Detection]
    frame_id: str
    timestamp: datetime
    inference_time_ms: float
    violations_found: int
    safety_score: float


class AIInferenceEngine:
    """
    AI Inference Engine for real-time safety detection.
    
    Runs YOLOv8 or custom models on GPU for fast inference.
    Detects PPE violations, proximity hazards, and zone breaches.
    """
    
    def __init__(
        self,
        model_path: str,
        device: str = "cuda:0",
        confidence_threshold: float = 0.85
    ):
        self.model_path = model_path
        self.device = device
        self.confidence_threshold = confidence_threshold
        self.model = None
        self._frame_count = 0
        self._total_inference_time = 0.0
        self._detections_by_date: Dict[date, int] = {}
        
        self._load_model()
    
    def _load_model(self):
        """Load the AI model."""
        try:
            # In production, load actual YOLO model:
            # from ultralytics import YOLO
            # self.model = YOLO(self.model_path)
            # self.model.to(self.device)
            
            logger.info(f"Model loaded: {self.model_path} on {self.device}")
            self.model = "loaded"  # Placeholder
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise
    
    @property
    def avg_fps(self) -> float:
        """Average inference FPS."""
        if self._frame_count == 0:
            return 0.0
        avg_time = self._total_inference_time / self._frame_count
        return 1000.0 / avg_time if avg_time > 0 else 0.0
    
    @property
    def detections_today(self) -> int:
        """Total detections today."""
        return self._detections_by_date.get(date.today(), 0)
    
    def infer(self, frame: np.ndarray, camera_id: str) -> InferenceResult:
        """
        Run inference on a single frame.
        
        Args:
            frame: BGR image as numpy array
            camera_id: Camera identifier
            
        Returns:
            InferenceResult with all detections
        """
        start_time = time.time()
        frame_id = f"{camera_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"
        
        # Run model inference
        # In production:
        # results = self.model(frame, conf=self.confidence_threshold)
        # raw_detections = results[0].boxes
        
        # Simulated detections for demo
        detections = self._simulate_detections(frame)
        
        inference_time = (time.time() - start_time) * 1000
        self._frame_count += 1
        self._total_inference_time += inference_time
        
        violations = [d for d in detections if d.is_violation]
        today = date.today()
        self._detections_by_date[today] = self._detections_by_date.get(today, 0) + len(violations)
        
        # Calculate safety score (100 - penalty for violations)
        safety_score = 100.0
        for v in violations:
            if v.severity == "critical":
                safety_score -= 25
            elif v.severity == "high":
                safety_score -= 15
            elif v.severity == "medium":
                safety_score -= 10
            else:
                safety_score -= 5
        safety_score = max(0, safety_score)
        
        return InferenceResult(
            detections=detections,
            frame_id=frame_id,
            timestamp=datetime.utcnow(),
            inference_time_ms=inference_time,
            violations_found=len(violations),
            safety_score=safety_score
        )
    
    def _simulate_detections(self, frame: np.ndarray) -> List[Detection]:
        """Simulate detections for demo purposes."""
        import random
        
        detections = []
        h, w = frame.shape[:2] if len(frame.shape) >= 2 else (720, 1280)
        
        # Always detect at least one person
        person_bbox = [
            random.randint(100, w//2),
            random.randint(50, h//3),
            random.randint(w//2, w-100),
            random.randint(h//2, h-50)
        ]
        detections.append(Detection(
            class_name="person",
            confidence=0.95 + random.random() * 0.04,
            bbox=person_bbox,
            is_violation=False,
            severity="low"
        ))
        
        # Random chance of violations
        if random.random() > 0.7:
            detections.append(Detection(
                class_name="no_hardhat",
                confidence=0.88 + random.random() * 0.10,
                bbox=[person_bbox[0]+10, person_bbox[1], person_bbox[0]+80, person_bbox[1]+60],
                is_violation=True,
                severity="high"
            ))
        
        if random.random() > 0.8:
            detections.append(Detection(
                class_name="no_safety_vest",
                confidence=0.85 + random.random() * 0.12,
                bbox=[person_bbox[0], person_bbox[1]+60, person_bbox[2], person_bbox[3]-100],
                is_violation=True,
                severity="medium"
            ))
        
        return detections
    
    def detect_zones(
        self,
        detections: List[Detection],
        zones: List[Dict[str, Any]]
    ) -> List[Detection]:
        """
        Check if any person detections are in restricted zones.
        
        Args:
            detections: List of detections from inference
            zones: List of zone definitions with polygons
            
        Returns:
            Additional zone violation detections
        """
        zone_violations = []
        
        person_detections = [d for d in detections if d.class_name == "person"]
        
        for person in person_detections:
            center_x = (person.bbox[0] + person.bbox[2]) // 2
            center_y = (person.bbox[1] + person.bbox[3]) // 2
            
            for zone in zones:
                if zone.get("zone_type") == "exclusion":
                    if self._point_in_polygon(center_x, center_y, zone["polygon"]):
                        zone_violations.append(Detection(
                            class_name="exclusion_zone_breach",
                            confidence=0.99,
                            bbox=person.bbox,
                            is_violation=True,
                            severity="critical"
                        ))
        
        return zone_violations
    
    def _point_in_polygon(self, x: int, y: int, polygon: List[Dict[str, int]]) -> bool:
        """Check if point is inside polygon using ray casting."""
        n = len(polygon)
        inside = False
        
        j = n - 1
        for i in range(n):
            xi, yi = polygon[i]["x"], polygon[i]["y"]
            xj, yj = polygon[j]["x"], polygon[j]["y"]
            
            if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
                inside = not inside
            j = i
        
        return inside
