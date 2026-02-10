"""Main FastAPI application entry point."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import structlog

from core.config import settings
from api import router as api_router

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown."""
    # Startup
    logger.info("Starting SafetyVision AI Platform", version=settings.APP_VERSION)
    
    # Initialize database connections, AI models, etc.
    # await init_database()
    # await load_ai_models()
    
    yield
    
    # Shutdown
    logger.info("Shutting down SafetyVision AI Platform")
    # await close_database()


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## SafetyVision AI Platform
    
    AI-Powered Vision Platform for Industrial Safety - providing real-time safety monitoring,
    violation detection, predictive analytics, and comprehensive reporting.
    
    ### Features
    - 🎥 Real-time video stream analysis
    - 🦺 PPE detection and compliance
    - 🚧 Exclusion zone monitoring
    - 📊 Advanced analytics and KPIs
    - 📈 Predictive risk assessment
    - 📋 Compliance reporting (ISO 45001, OSHA)
    """,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT
    }


# Include API router (both versioned and non-versioned for frontend compatibility)
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router, prefix="/api")


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle uncaught exceptions."""
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        workers=1 if settings.DEBUG else settings.WORKERS
    )
