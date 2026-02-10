"""Camera Manager Service."""
import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class CameraConfig:
    """Camera configuration."""
    camera_id: str
    name: str
    stream_url: str
    site_id: str
    zone_id: Optional[str] = None
    policy_id: Optional[str] = None
    fps: int = 15
    enabled: bool = True


class CameraStream:
    """Individual camera stream handler."""
    
    def __init__(self, config: CameraConfig):
        self.config = config
        self.is_running = False
        self.last_frame: Optional[np.ndarray] = None
        self.last_frame_time: Optional[datetime] = None
        self.error: Optional[str] = None
        self.fps_actual: float = 0.0
        self._capture = None
        self._task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the camera stream."""
        try:
            # In production with OpenCV:
            # self._capture = cv2.VideoCapture(self.config.stream_url)
            # if not self._capture.isOpened():
            #     raise Exception("Failed to open stream")
            
            self.is_running = True
            self.error = None
            logger.info(f"Camera {self.config.camera_id} started")
        except Exception as e:
            self.error = str(e)
            logger.error(f"Camera {self.config.camera_id} failed: {e}")
            raise
    
    async def stop(self):
        """Stop the camera stream."""
        self.is_running = False
        if self._capture:
            # self._capture.release()
            self._capture = None
        logger.info(f"Camera {self.config.camera_id} stopped")
    
    def get_frame(self) -> Optional[np.ndarray]:
        """Get the latest frame."""
        if not self.is_running:
            return None
        
        # In production:
        # ret, frame = self._capture.read()
        # if ret:
        #     self.last_frame = frame
        #     self.last_frame_time = datetime.utcnow()
        #     return frame
        
        # Simulated frame
        self.last_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        self.last_frame_time = datetime.utcnow()
        return self.last_frame


class CameraManager:
    """
    Manages all camera streams and coordinates processing.
    
    Responsibilities:
    - Start/stop camera streams
    - Route frames to AI inference
    - Handle detections and alerts
    - Manage recording buffers
    """
    
    def __init__(
        self,
        ai_engine,
        face_blur,
        local_storage,
        alert_service
    ):
        self.ai_engine = ai_engine
        self.face_blur = face_blur
        self.local_storage = local_storage
        self.alert_service = alert_service
        
        self._cameras: Dict[str, CameraStream] = {}
        self._processing_tasks: Dict[str, asyncio.Task] = {}
        self._zones: Dict[str, List[Dict[str, Any]]] = {}
    
    @property
    def camera_count(self) -> int:
        return len(self._cameras)
    
    @property
    def active_count(self) -> int:
        return sum(1 for c in self._cameras.values() if c.is_running)
    
    @property
    def error_count(self) -> int:
        return sum(1 for c in self._cameras.values() if c.error is not None)
    
    async def add_camera(self, config: CameraConfig) -> bool:
        """Add and start a camera."""
        if config.camera_id in self._cameras:
            logger.warning(f"Camera {config.camera_id} already exists")
            return False
        
        stream = CameraStream(config)
        self._cameras[config.camera_id] = stream
        
        if config.enabled:
            await self.start_camera(config.camera_id)
        
        return True
    
    async def remove_camera(self, camera_id: str) -> bool:
        """Remove a camera."""
        if camera_id not in self._cameras:
            return False
        
        await self.stop_camera(camera_id)
        del self._cameras[camera_id]
        return True
    
    async def start_camera(self, camera_id: str):
        """Start processing a camera."""
        if camera_id not in self._cameras:
            raise ValueError(f"Camera {camera_id} not found")
        
        stream = self._cameras[camera_id]
        await stream.start()
        
        # Start processing task
        task = asyncio.create_task(self._process_camera(camera_id))
        self._processing_tasks[camera_id] = task
    
    async def stop_camera(self, camera_id: str):
        """Stop processing a camera."""
        if camera_id in self._processing_tasks:
            self._processing_tasks[camera_id].cancel()
            del self._processing_tasks[camera_id]
        
        if camera_id in self._cameras:
            await self._cameras[camera_id].stop()
    
    async def stop_all(self):
        """Stop all cameras."""
        for camera_id in list(self._cameras.keys()):
            await self.stop_camera(camera_id)
    
    async def _process_camera(self, camera_id: str):
        """Main processing loop for a camera."""
        stream = self._cameras[camera_id]
        config = stream.config
        frame_interval = 1.0 / config.fps
        
        while stream.is_running:
            try:
                frame = stream.get_frame()
                if frame is None:
                    await asyncio.sleep(0.1)
                    continue
                
                # Run AI inference
                result = self.ai_engine.infer(frame, camera_id)
                
                # Check zone violations
                zones = self._zones.get(config.zone_id, [])
                if zones:
                    zone_violations = self.ai_engine.detect_zones(result.detections, zones)
                    result.detections.extend(zone_violations)
                
                # Process violations
                if result.violations_found > 0:
                    await self._handle_violation(camera_id, frame, result)
                
                await asyncio.sleep(frame_interval)
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Processing error for {camera_id}: {e}")
                stream.error = str(e)
                await asyncio.sleep(1)
    
    async def _handle_violation(self, camera_id: str, frame: np.ndarray, result):
        """Handle a detected violation."""
        stream = self._cameras[camera_id]
        config = stream.config
        
        # Apply face blur
        blurred_frame = self.face_blur.blur_faces(frame)
        
        # Save evidence
        detection_id = result.frame_id
        
        # Encode frame as JPEG (simulated)
        # In production: _, img_bytes = cv2.imencode('.jpg', blurred_frame)
        img_bytes = b"simulated_image_data"
        
        metadata = {
            "detection_id": detection_id,
            "camera_id": camera_id,
            "site_id": config.site_id,
            "timestamp": result.timestamp.isoformat(),
            "violations": [
                {
                    "class": d.class_name,
                    "confidence": d.confidence,
                    "severity": d.severity,
                    "bbox": d.bbox
                }
                for d in result.detections if d.is_violation
            ],
            "safety_score": result.safety_score
        }
        
        self.local_storage.save_image(
            img_bytes,
            camera_id,
            detection_id,
            metadata,
            blurred=True
        )
        
        # Send alert
        await self.alert_service.send_alert(
            detection_id=detection_id,
            camera_id=camera_id,
            site_id=config.site_id,
            violations=metadata["violations"],
            severity=max(v["severity"] for v in metadata["violations"]),
            timestamp=result.timestamp
        )
    
    def set_zones(self, zone_id: str, zones: List[Dict[str, Any]]):
        """Set zone definitions for a camera/area."""
        self._zones[zone_id] = zones
    
    def get_camera_status(self, camera_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a specific camera."""
        if camera_id not in self._cameras:
            return None
        
        stream = self._cameras[camera_id]
        return {
            "camera_id": camera_id,
            "name": stream.config.name,
            "is_running": stream.is_running,
            "error": stream.error,
            "fps": stream.fps_actual,
            "last_frame_time": stream.last_frame_time.isoformat() if stream.last_frame_time else None
        }
    
    def get_all_status(self) -> List[Dict[str, Any]]:
        """Get status of all cameras."""
        return [self.get_camera_status(cid) for cid in self._cameras.keys()]
