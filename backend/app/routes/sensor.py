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
from app.services import sensor_service

router = APIRouter(prefix="/sensor", tags=["Sensor"])


@router.post(
    "/upload",
    response_model=SensorUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload sensor data from Raspberry Pi",
    description=(
        "Receives a JSON payload from the Pi containing raw sensor readings. "
        "Validates device authentication, checks data ranges, stores in sensor_data table."
    ),
)
async def upload_sensor_data(payload: SensorUploadRequest):
    """
    POST /sensor/upload

    Called by Raspberry Pi every 5 minutes.
    Flow: validate device → validate data → store in DB → return status
    """
    readings = {
        "soil_moisture": payload.soil_moisture,
        "soil_temp": payload.soil_temp,
        "soil_ec": payload.soil_ec,
        "air_temp": payload.air_temp,
        "humidity": payload.humidity,
        "leaf_wetness": payload.leaf_wetness,
        "battery_level": payload.battery_level,
    }

    result = await sensor_service.process_upload(
        device_id=payload.device_id,
        device_secret=payload.device_secret,
        readings=readings,
    )

    return SensorUploadResponse(
        success=True,
        message="Sensor data received and stored",
        sensor_data_id=result["sensor_data_id"],
        farm_id=result["farm_id"],
        is_valid=result["is_valid"],
        warnings=result["warnings"],
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
    Returns online/offline/warning status + battery level + readings count.
    """
    result = await sensor_service.get_sensor_health(farm_id)

    return SensorHealthResponse(
        farm_id=result["farm_id"],
        device_id=result.get("device_id"),
        is_online=result["is_online"],
        last_reading_at=result.get("last_reading_at"),
        battery_level=result.get("battery_level"),
        readings_today=result["readings_today"],
        status=result["status"],
    )


@router.get(
    "/latest/{farm_id}",
    summary="Get the latest sensor reading for a farm",
)
async def get_latest(farm_id: str):
    """GET /sensor/latest/{farm_id} — most recent sensor reading."""
    readings = await sensor_service.get_latest_readings(farm_id, limit=1)
    if not readings:
        return {"success": True, "data": None, "message": "No sensor data found for this farm"}
    return {"success": True, "data": readings[0]}


@router.get(
    "/history/{farm_id}",
    summary="Get sensor reading history for a farm",
)
async def get_history(farm_id: str, hours: int = 24):
    """GET /sensor/history/{farm_id}?hours=24 — readings within last N hours."""
    readings = await sensor_service.get_sensor_history(farm_id, hours=hours)
    return {
        "success": True,
        "farm_id": farm_id,
        "hours": hours,
        "count": len(readings),
        "data": readings,
    }
