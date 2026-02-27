"""
Krishi Sakhi — Market Forecast Schemas.

Pydantic models for market price forecasting endpoints.
"""

from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class ForecastRequest(BaseModel):
    """Schema for POST /forecast — request a price forecast for a crop."""

    crop_name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Crop to forecast (e.g., Rice, Wheat, Cotton)",
    )
    state: Optional[str] = Field(
        default=None,
        description="State for regional pricing (e.g., Bihar, Punjab)",
    )
    mandi: Optional[str] = Field(
        default=None,
        description="Specific mandi for local pricing",
    )
    forecast_days: int = Field(
        default=180,
        ge=7,
        le=365,
        description="Number of days to forecast ahead (default: 180 = 6 months)",
    )


class PricePoint(BaseModel):
    """A single predicted price data point."""

    date: date
    predicted_price: float = Field(..., description="Predicted modal price in ₹/quintal")
    lower_bound: float = Field(..., description="Lower confidence bound")
    upper_bound: float = Field(..., description="Upper confidence bound")


class ForecastResponse(BaseModel):
    """
    Full response from POST /forecast.
    Contains historical prices, predicted prices, and advisory.
    """

    success: bool = True
    crop_name: str
    state: Optional[str] = None
    generated_at: datetime
    
    # Historical data (last 30 days for context)
    historical_prices: List[PricePoint] = Field(
        default_factory=list,
        description="Recent historical prices for chart context",
    )
    
    # Forecast
    forecast: List[PricePoint] = Field(
        ...,
        description="Predicted daily prices for the forecast period",
    )
    
    # Summary
    current_price: Optional[float] = Field(default=None, description="Latest known price ₹/quintal")
    predicted_harvest_price: Optional[float] = Field(default=None, description="Price at typical harvest time")
    price_trend: str = Field(
        ...,
        description="'rising' | 'falling' | 'stable' | 'volatile'",
    )
    volatility: Optional[float] = Field(
        default=None,
        ge=0, le=100,
        description="Price volatility score (0=stable, 100=highly volatile)",
    )
    
    # Planting advisory
    best_planting_window: Optional[str] = Field(
        default=None,
        description="Recommended planting period for maximum profit",
    )
    advisory: Optional[str] = Field(
        default=None,
        description="Natural language advisory about market conditions",
    )
    
    # Metadata
    model_version: str = "1.0.0"
    data_points_used: int = Field(default=0, description="Number of historical data points used for training")
