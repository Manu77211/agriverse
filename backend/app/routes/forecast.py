"""
Krishi Sakhi — Forecast Routes.

Endpoints for market price forecasting.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.forecast import ForecastRequest, ForecastResponse

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.post(
    "",
    response_model=ForecastResponse,
    summary="Get market price forecast for a crop",
    description=(
        "Uses Facebook Prophet model trained on historical mandi price data "
        "to predict prices up to 12 months ahead. Returns daily predictions "
        "with confidence intervals."
    ),
)
async def get_forecast(payload: ForecastRequest):
    """
    POST /forecast
    
    TODO: Implement in Phase 6 (Task 23)
    """
    # Placeholder
    return ForecastResponse(
        crop_name=payload.crop_name,
        state=payload.state,
        generated_at=datetime.now(timezone.utc),
        forecast=[],
        price_trend="stable",
    )


@router.get(
    "/{crop_name}",
    response_model=ForecastResponse,
    summary="Quick forecast by crop name",
    description="Convenience GET endpoint for quick forecasts with default parameters.",
)
async def get_forecast_quick(crop_name: str, state: str | None = None):
    """
    GET /forecast/{crop_name}?state=Bihar
    
    Shortcut for quick lookups.
    
    TODO: Implement in Phase 6 (Task 23)
    """
    return ForecastResponse(
        crop_name=crop_name,
        state=state,
        generated_at=datetime.now(timezone.utc),
        forecast=[],
        price_trend="stable",
    )
