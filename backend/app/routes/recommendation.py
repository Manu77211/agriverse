"""
Krishi Sakhi — Recommendation Routes.

Endpoint for the full crop recommendation pipeline.
"""

from datetime import datetime, timezone

from fastapi import APIRouter

from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    CropPrediction,
)

router = APIRouter(prefix="/recommendation", tags=["Recommendation"])


@router.post(
    "",
    response_model=RecommendationResponse,
    summary="Get crop recommendation",
    description=(
        "Full recommendation pipeline: "
        "sensor data (or manual input) → feature engineering → XGBoost prediction → "
        "biotech variety matching → market forecast → decision engine → final recommendation."
    ),
)
async def get_recommendation(payload: RecommendationRequest):
    """
    POST /recommendation
    
    The core endpoint. Orchestrates the entire intelligence pipeline.
    
    TODO: Implement in Phase 5 (Task 19), Phase 7 (Task 24)
    """
    # Placeholder
    return RecommendationResponse(
        farm_id=payload.farm_id,
        timestamp=datetime.now(timezone.utc),
        top_crops=[
            CropPrediction(
                crop_name="Placeholder",
                confidence=0.0,
            )
        ],
        model_version="0.0.0",
        data_source="manual" if not payload.farm_id else "sensor",
    )
