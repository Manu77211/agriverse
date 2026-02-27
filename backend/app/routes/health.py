"""
Krishi Sakhi — Health & Root Routes.

Basic endpoints that work without any external dependencies.
Used for deployment health checks and API discovery.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from app import __version__

router = APIRouter(tags=["Health"])


@router.get("/")
async def root():
    """API root — basic info about the service."""
    return {
        "service": "Krishi Sakhi API",
        "version": __version__,
        "status": "running",
        "docs": "/docs",
    }


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    Used by Railway/Docker/load balancers to verify the service is alive.
    Returns 200 if the server is running.
    """
    return {
        "status": "healthy",
        "version": __version__,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
