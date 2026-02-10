"""Cloud Sync Service for Edge-to-Cloud Communication."""
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import aiohttp

logger = logging.getLogger(__name__)


class CloudSyncService:
    """
    Handles synchronization between edge server and cloud API.
    
    Responsibilities:
    - Upload violation alerts in real-time
    - Batch upload evidence (images/videos) to S3
    - Sync camera status and health metrics
    - Download policy updates from cloud
    """
    
    def __init__(
        self,
        api_url: str,
        api_key: str,
        sync_interval: int = 30
    ):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.sync_interval = sync_interval
        
        self._is_connected = False
        self._last_sync_time: Optional[datetime] = None
        self._pending_queue: List[Dict[str, Any]] = []
        self._running = False
        self._session: Optional[aiohttp.ClientSession] = None
    
    @property
    def is_connected(self) -> bool:
        return self._is_connected
    
    @property
    def last_sync_time(self) -> Optional[str]:
        return self._last_sync_time.isoformat() if self._last_sync_time else None
    
    @property
    def pending_count(self) -> int:
        return len(self._pending_queue)
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
            )
        return self._session
    
    async def start_sync_loop(self):
        """Start the background sync loop."""
        self._running = True
        logger.info("Cloud sync loop started")
        
        while self._running:
            try:
                await self._sync_cycle()
            except Exception as e:
                logger.error(f"Sync cycle error: {e}")
                self._is_connected = False
            
            await asyncio.sleep(self.sync_interval)
    
    async def stop(self):
        """Stop the sync loop."""
        self._running = False
        if self._session:
            await self._session.close()
        logger.info("Cloud sync stopped")
    
    async def _sync_cycle(self):
        """Perform one sync cycle."""
        session = await self._get_session()
        
        # Check connectivity
        try:
            async with session.get(f"{self.api_url}/health", timeout=5) as resp:
                self._is_connected = resp.status == 200
        except Exception:
            self._is_connected = False
            return
        
        # Process pending queue
        if self._pending_queue:
            await self._process_queue()
        
        self._last_sync_time = datetime.utcnow()
    
    async def _process_queue(self):
        """Process pending items in queue."""
        session = await self._get_session()
        
        processed = []
        for item in self._pending_queue[:10]:  # Process max 10 at a time
            try:
                if item["type"] == "alert":
                    await self._send_alert(session, item["data"])
                elif item["type"] == "evidence":
                    await self._upload_evidence(session, item["data"])
                elif item["type"] == "metric":
                    await self._send_metric(session, item["data"])
                processed.append(item)
            except Exception as e:
                logger.error(f"Failed to process queue item: {e}")
        
        for item in processed:
            self._pending_queue.remove(item)
    
    async def send_alert(self, alert_data: Dict[str, Any]):
        """
        Send real-time alert to cloud (queued if offline).
        
        Args:
            alert_data: Alert information including detection details
        """
        self._pending_queue.append({
            "type": "alert",
            "data": alert_data,
            "queued_at": datetime.utcnow().isoformat()
        })
        
        # Try immediate send if connected
        if self._is_connected:
            try:
                session = await self._get_session()
                await self._send_alert(session, alert_data)
                # Remove from queue if successful
                self._pending_queue = [
                    q for q in self._pending_queue 
                    if q["data"].get("id") != alert_data.get("id")
                ]
            except Exception as e:
                logger.warning(f"Immediate alert send failed, queued: {e}")
    
    async def _send_alert(self, session: aiohttp.ClientSession, data: Dict[str, Any]):
        """Send alert to cloud API."""
        async with session.post(
            f"{self.api_url}/api/alerts",
            json=data,
            timeout=10
        ) as resp:
            if resp.status not in (200, 201):
                raise Exception(f"Alert send failed: {resp.status}")
            logger.debug(f"Alert sent: {data.get('id')}")
    
    async def upload_evidence(
        self,
        evidence_path: str,
        metadata: Dict[str, Any],
        presigned_url: Optional[str] = None
    ):
        """
        Upload evidence file to S3 via presigned URL.
        
        Args:
            evidence_path: Local path to evidence file
            metadata: Evidence metadata
            presigned_url: Optional presigned S3 URL
        """
        self._pending_queue.append({
            "type": "evidence",
            "data": {
                "path": evidence_path,
                "metadata": metadata,
                "presigned_url": presigned_url
            },
            "queued_at": datetime.utcnow().isoformat()
        })
    
    async def _upload_evidence(self, session: aiohttp.ClientSession, data: Dict[str, Any]):
        """Upload evidence to S3."""
        # Get presigned URL if not provided
        presigned_url = data.get("presigned_url")
        if not presigned_url:
            async with session.post(
                f"{self.api_url}/api/evidence/upload-url",
                json={"filename": data["metadata"].get("filename", "evidence.jpg")},
                timeout=10
            ) as resp:
                if resp.status != 200:
                    raise Exception("Failed to get upload URL")
                result = await resp.json()
                presigned_url = result["upload_url"]
        
        # Upload file to S3
        with open(data["path"], "rb") as f:
            async with session.put(
                presigned_url,
                data=f.read(),
                headers={"Content-Type": "application/octet-stream"},
                timeout=60
            ) as resp:
                if resp.status not in (200, 204):
                    raise Exception(f"S3 upload failed: {resp.status}")
        
        # Confirm upload
        async with session.post(
            f"{self.api_url}/api/evidence/confirm",
            json=data["metadata"],
            timeout=10
        ) as resp:
            if resp.status not in (200, 201):
                raise Exception("Failed to confirm upload")
        
        logger.debug(f"Evidence uploaded: {data['path']}")
    
    async def _send_metric(self, session: aiohttp.ClientSession, data: Dict[str, Any]):
        """Send metric to cloud."""
        async with session.post(
            f"{self.api_url}/api/metrics",
            json=data,
            timeout=10
        ) as resp:
            if resp.status not in (200, 201):
                raise Exception(f"Metric send failed: {resp.status}")
    
    async def send_heartbeat(self, status: Dict[str, Any]):
        """Send edge server heartbeat to cloud."""
        try:
            session = await self._get_session()
            async with session.post(
                f"{self.api_url}/api/edge/heartbeat",
                json=status,
                timeout=5
            ) as resp:
                return resp.status == 200
        except Exception:
            return False
    
    async def get_policy_updates(self) -> Optional[Dict[str, Any]]:
        """Fetch policy updates from cloud."""
        try:
            session = await self._get_session()
            async with session.get(
                f"{self.api_url}/api/policies/updates",
                timeout=10
            ) as resp:
                if resp.status == 200:
                    return await resp.json()
        except Exception as e:
            logger.warning(f"Failed to get policy updates: {e}")
        return None
