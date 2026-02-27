"""
Krishi Sakhi — Sensor Routes.

Endpoints for Raspberry Pi sensor data ingestion and health monitoring.
These are THIN controllers — all business logic is in services/sensor_service.py.
"""

from fastapi import APIRouter, status

from app.schemas.sensor import (
    SensorUploadRequest,
    SensorUploadResponse,
    SensorHealthResponse,
)

router = APIRouter(prefix="/sensor", tags=["Sensor"])


@router.post(
    "/upload",
    response_model=SensorUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload sensor data from Raspberry Pi",
    description=(
        "Receives a JSON payload from the Pi containing raw sensor readings. "
        "Validates device authentication, checks data ranges, stores in sensor_data table, "
        "and triggers feature engineering to compute derived metrics."
    ),
)
async def upload_sensor_data(payload: SensorUploadRequest):
    """
    POST /sensor/upload
    
    Called by Raspberry Pi every 5 minutes.
    Flow: validate device → store raw data → compute derived metrics → return status
    
    TODO: Implement in Phase 3 (Task 9-10)
    """
    # Placeholder — will be implemented in Phase 3
    return SensorUploadResponse(
        success=True,
        message="Sensor upload endpoint ready — implementation coming in Phase 3",
        sensor_data_id=0,
        farm_id="placeholder",
        is_valid=True,
    )


@router.get(
    "/health/{farm_id}",
    response_model=SensorHealthResponse,
    summary="Check if a farm's Pi sensor is online",
    description=(
        "Returns the online status of the Raspberry Pi for a given farm. "
        "Online = sent data within last 15 minutes."
    ),
)
async def sensor_health(farm_id: str):
    """
    GET /sensor/health/{farm_id}
    
    Checks if the Pi sent data recently.
    
    TODO: Implement in Phase 3 (Task 11)
    """
    # Placeholder
    return SensorHealthResponse(
        farm_id=farm_id,
        is_online=False,
        status="unknown",
        readings_today=0,
    )
