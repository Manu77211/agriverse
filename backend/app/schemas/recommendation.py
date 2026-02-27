"""
Krishi Sakhi — Recommendation Schemas.

Pydantic models for the crop recommendation pipeline.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    """
    Schema for POST /recommendation.
    Two modes:
      1. farm_id provided → uses latest sensor data from DB
      2. Manual input → farmer enters values directly (no Pi needed)
    """

    farm_id: Optional[str] = Field(
        default=None,
        description="Farm UUID. If provided, uses latest sensor data from this farm.",
    )

    # Manual input (used when no Pi / no farm_id)
    nitrogen: Optional[float] = Field(default=None, ge=0, le=200, description="Nitrogen content (kg/ha)")
    phosphorus: Optional[float] = Field(default=None, ge=0, le=200, description="Phosphorus content (kg/ha)")
    potassium: Optional[float] = Field(default=None, ge=0, le=200, description="Potassium content (kg/ha)")
    temperature: Optional[float] = Field(default=None, ge=-10, le=60, description="Temperature °C")
    humidity: Optional[float] = Field(default=None, ge=0, le=100, description="Humidity %")
    ph: Optional[float] = Field(default=None, ge=0, le=14, description="Soil pH")
    rainfall: Optional[float] = Field(default=None, ge=0, le=5000, description="Rainfall mm")

    # Context
    state: Optional[str] = Field(default=None, description="State name for variety matching")
    district: Optional[str] = Field(default=None, description="District for weather data")
    season: Optional[str] = Field(default=None, description="Kharif | Rabi | Zaid")


class CropPrediction(BaseModel):
    """A single crop prediction from the ML model."""

    crop_name: str
    confidence: float = Field(..., ge=0, le=1, description="Model confidence (0-1)")
    recommended_variety: Optional[str] = None
    variety_traits: Optional[List[str]] = None
    expected_price: Optional[float] = None
    profitability_score: Optional[float] = None


class DerivedMetricsResponse(BaseModel):
    """Derived metrics included in recommendation response."""

    stress_index: Optional[float] = None
    water_deficit_score: Optional[float] = None
    salinity_risk: Optional[float] = None
    disease_probability: Optional[float] = None
    crop_suitability: Optional[float] = None


class RecommendationResponse(BaseModel):
    """
    Full response from POST /recommendation.
    Contains top crop predictions, risk metrics, and advisory text.
    """

    success: bool = True
    farm_id: Optional[str] = None
    timestamp: datetime
    
    # ML predictions
    top_crops: List[CropPrediction] = Field(
        ...,
        min_length=1,
        max_length=5,
        description="Top 1-5 crop recommendations ranked by suitability",
    )
    
    # Risk analysis
    metrics: Optional[DerivedMetricsResponse] = None
    
    # Advisories
    irrigation_advisory: Optional[str] = None
    rotation_advisory: Optional[str] = None
    
    # Gemini AI supplementary analysis (natural language)
    ai_analysis: Optional[str] = None
    
    # Metadata
    model_version: str = "1.0.0"
    data_source: str = Field(
        ...,
        description="'sensor' | 'manual' — how the input data was obtained",
    )
