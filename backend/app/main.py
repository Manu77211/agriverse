"""
Krishi Sakhi — FastAPI Entry Point.

This is the main application file. It:
    1. Initializes the FastAPI app
    2. Configures CORS (frontend ↔ backend communication)
    3. Sets up structured logging
    4. Registers global error handlers
    5. Mounts all route modules
    6. Adds startup/shutdown lifecycle events

Run with:
    uvicorn app.main:app --reload --port 8000
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import get_settings
from app.middleware.logger import setup_logging, get_logger
from app.middleware.error_handler import register_error_handlers

# Route modules
from app.routes.health import router as health_router
from app.routes.sensor import router as sensor_router
from app.routes.recommendation import router as recommendation_router
from app.routes.forecast import router as forecast_router
from app.routes.farm import router as farm_router
from app.routes.simulate import router as simulate_router


logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifecycle manager.
    Code before `yield` runs on startup.
    Code after `yield` runs on shutdown.
    """
    # ---------- STARTUP ----------
    settings = get_settings()
    setup_logging()
    
    logger.info(
        "server_starting",
        version=__version__,
        environment=settings.app_env,
        port=settings.app_port,
        supabase_url=settings.supabase_url[:40] + "..." if settings.supabase_url else "NOT SET",
        cors_origins=settings.cors_origin_list,
    )

    # Verify critical config
    if not settings.supabase_url:
        logger.warning("supabase_not_configured", message="SUPABASE_URL is not set — database features will fail")
    if not settings.gemini_api_key:
        logger.warning("gemini_not_configured", message="GEMINI_API_KEY is not set — AI analysis will be unavailable")

    logger.info("server_ready", message="Krishi Sakhi API is ready to serve requests")

    yield  # App is running

    # ---------- SHUTDOWN ----------
    logger.info("server_shutting_down")


# ============================================================
# CREATE APP
# ============================================================
app = FastAPI(
    title="Krishi Sakhi API",
    description=(
        "AI-powered agricultural advisory system. "
        "Provides crop recommendations, market forecasting, "
        "sensor data analysis, and farm management."
    ),
    version=__version__,
    lifespan=lifespan,
    docs_url="/docs",          # Swagger UI
    redoc_url="/redoc",        # ReDoc
    openapi_url="/openapi.json",
)


# ============================================================
# CORS MIDDLEWARE
# ============================================================
# Required for frontend (Vercel) to communicate with backend (Railway)
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ERROR HANDLERS
# ============================================================
register_error_handlers(app)


# ============================================================
# ROUTES
# ============================================================
# Each router is a separate module with its own prefix and tags.
# All routes are versioned implicitly (v1 via prefix).
# Add /api/v1 prefix when ready for multi-version support.

app.include_router(health_router)
app.include_router(sensor_router)
app.include_router(recommendation_router)
app.include_router(forecast_router)
app.include_router(farm_router)
app.include_router(simulate_router)
