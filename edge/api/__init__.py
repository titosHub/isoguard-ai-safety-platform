"""Edge API Routes."""
from fastapi import APIRouter
from .cameras import router as cameras_router
from .detections import router as detections_router
from .health import router as health_router

api_router = APIRouter(prefix="/api")

api_router.include_router(cameras_router)
api_router.include_router(detections_router)
api_router.include_router(health_router)

__all__ = ["api_router"]
