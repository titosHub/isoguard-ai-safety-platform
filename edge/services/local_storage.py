"""Local Storage Service for Evidence Management."""
import os
import json
import shutil
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from pathlib import Path
import hashlib

logger = logging.getLogger(__name__)


class LocalStorageService:
    """
    Local storage management for evidence files.
    
    Handles:
    - Saving images and videos with metadata
    - Retention policy enforcement
    - Storage space monitoring
    - Evidence organization by date/camera
    """
    
    def __init__(self, storage_path: str, retention_days: int = 30):
        self.storage_path = Path(storage_path)
        self.retention_days = retention_days
        
        # Create directory structure
        self.storage_path.mkdir(parents=True, exist_ok=True)
        (self.storage_path / "images").mkdir(exist_ok=True)
        (self.storage_path / "videos").mkdir(exist_ok=True)
        (self.storage_path / "metadata").mkdir(exist_ok=True)
        (self.storage_path / "pending_sync").mkdir(exist_ok=True)
        
        logger.info(f"Local storage initialized at {self.storage_path}")
    
    @property
    def used_space_gb(self) -> float:
        """Get used storage space in GB."""
        total_size = 0
        for dirpath, dirnames, filenames in os.walk(self.storage_path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total_size += os.path.getsize(fp)
        return total_size / (1024 ** 3)
    
    @property
    def free_space_gb(self) -> float:
        """Get free storage space in GB."""
        stat = shutil.disk_usage(self.storage_path)
        return stat.free / (1024 ** 3)
    
    def save_image(
        self,
        image_data: bytes,
        camera_id: str,
        detection_id: str,
        metadata: Dict[str, Any],
        blurred: bool = True
    ) -> str:
        """
        Save an image with metadata.
        
        Args:
            image_data: Image bytes (JPEG)
            camera_id: Camera identifier
            detection_id: Detection/violation ID
            metadata: Detection metadata
            blurred: Whether faces are blurred
            
        Returns:
            Path to saved image
        """
        date_folder = datetime.utcnow().strftime("%Y/%m/%d")
        folder_path = self.storage_path / "images" / date_folder / camera_id
        folder_path.mkdir(parents=True, exist_ok=True)
        
        suffix = "_blurred" if blurred else "_original"
        filename = f"{detection_id}{suffix}.jpg"
        file_path = folder_path / filename
        
        # Save image
        with open(file_path, "wb") as f:
            f.write(image_data)
        
        # Save metadata
        meta_path = self.storage_path / "metadata" / f"{detection_id}.json"
        metadata["image_path"] = str(file_path)
        metadata["saved_at"] = datetime.utcnow().isoformat()
        metadata["file_hash"] = hashlib.sha256(image_data).hexdigest()
        
        with open(meta_path, "w") as f:
            json.dump(metadata, f, indent=2, default=str)
        
        # Mark for sync
        sync_marker = self.storage_path / "pending_sync" / f"{detection_id}.json"
        with open(sync_marker, "w") as f:
            json.dump({"type": "image", "path": str(file_path), "metadata": metadata}, f)
        
        logger.debug(f"Saved image: {file_path}")
        return str(file_path)
    
    def save_video_clip(
        self,
        video_data: bytes,
        camera_id: str,
        detection_id: str,
        metadata: Dict[str, Any],
        duration_seconds: int = 15
    ) -> str:
        """
        Save a video clip with metadata.
        
        Args:
            video_data: Video bytes (MP4)
            camera_id: Camera identifier
            detection_id: Detection/violation ID
            metadata: Detection metadata
            duration_seconds: Clip duration
            
        Returns:
            Path to saved video
        """
        date_folder = datetime.utcnow().strftime("%Y/%m/%d")
        folder_path = self.storage_path / "videos" / date_folder / camera_id
        folder_path.mkdir(parents=True, exist_ok=True)
        
        filename = f"{detection_id}.mp4"
        file_path = folder_path / filename
        
        with open(file_path, "wb") as f:
            f.write(video_data)
        
        # Update metadata
        meta_path = self.storage_path / "metadata" / f"{detection_id}.json"
        if meta_path.exists():
            with open(meta_path, "r") as f:
                existing_meta = json.load(f)
            existing_meta["video_path"] = str(file_path)
            existing_meta["video_duration"] = duration_seconds
        else:
            existing_meta = metadata
            existing_meta["video_path"] = str(file_path)
            existing_meta["video_duration"] = duration_seconds
        
        with open(meta_path, "w") as f:
            json.dump(existing_meta, f, indent=2, default=str)
        
        logger.debug(f"Saved video: {file_path}")
        return str(file_path)
    
    def get_evidence(self, detection_id: str) -> Optional[Dict[str, Any]]:
        """Get evidence metadata by detection ID."""
        meta_path = self.storage_path / "metadata" / f"{detection_id}.json"
        if meta_path.exists():
            with open(meta_path, "r") as f:
                return json.load(f)
        return None
    
    def list_pending_sync(self) -> List[Dict[str, Any]]:
        """List all evidence pending cloud sync."""
        pending = []
        sync_path = self.storage_path / "pending_sync"
        
        for f in sync_path.glob("*.json"):
            with open(f, "r") as fp:
                pending.append(json.load(fp))
        
        return pending
    
    def mark_synced(self, detection_id: str):
        """Mark evidence as synced to cloud."""
        sync_marker = self.storage_path / "pending_sync" / f"{detection_id}.json"
        if sync_marker.exists():
            sync_marker.unlink()
    
    def enforce_retention(self):
        """Delete evidence older than retention period."""
        cutoff_date = datetime.utcnow() - timedelta(days=self.retention_days)
        deleted_count = 0
        
        for folder in ["images", "videos"]:
            folder_path = self.storage_path / folder
            for year_dir in folder_path.iterdir():
                if not year_dir.is_dir():
                    continue
                for month_dir in year_dir.iterdir():
                    if not month_dir.is_dir():
                        continue
                    for day_dir in month_dir.iterdir():
                        if not day_dir.is_dir():
                            continue
                        try:
                            dir_date = datetime.strptime(
                                f"{year_dir.name}/{month_dir.name}/{day_dir.name}",
                                "%Y/%m/%d"
                            )
                            if dir_date < cutoff_date:
                                shutil.rmtree(day_dir)
                                deleted_count += 1
                        except ValueError:
                            continue
        
        if deleted_count > 0:
            logger.info(f"Retention cleanup: deleted {deleted_count} old folders")
        
        return deleted_count
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage statistics."""
        image_count = sum(1 for _ in (self.storage_path / "images").rglob("*.jpg"))
        video_count = sum(1 for _ in (self.storage_path / "videos").rglob("*.mp4"))
        
        return {
            "used_gb": round(self.used_space_gb, 2),
            "free_gb": round(self.free_space_gb, 2),
            "image_count": image_count,
            "video_count": video_count,
            "pending_sync": len(self.list_pending_sync()),
            "retention_days": self.retention_days
        }
