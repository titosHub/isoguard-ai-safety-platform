"""API router initialization."""
from fastapi import APIRouter

from .routes import auth, incidents, analytics, cameras, sites, reports, forensics, media, admin, sectors, executive, government

router = APIRouter()

# Include all route modules
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(incidents.router, prefix="/incidents", tags=["Incidents"])
router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
router.include_router(cameras.router, prefix="/cameras", tags=["Cameras"])
router.include_router(sites.router, prefix="/sites", tags=["Sites"])
router.include_router(reports.router, prefix="/reports", tags=["Reports"])
router.include_router(forensics.router, prefix="/forensics", tags=["Forensics"])
router.include_router(media.router, prefix="/media", tags=["Media"])
router.include_router(admin.router, prefix="/admin", tags=["Admin"])
router.include_router(sectors.router, prefix="/sectors", tags=["Sectors"])
router.include_router(executive.router, prefix="/executive", tags=["Executive"])
router.include_router(government.router, prefix="/government", tags=["Government"])
