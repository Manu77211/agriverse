"""
Krishi Sakhi — Sensor Service.

Business logic for sensor data ingestion, validation, and retrieval.
This is the CORE service that handles all sensor-related operations.

Flow:
    1. Pi sends JSON → POST /sensor/upload
    2. Route calls sensor_service.process_upload()
    3. Service validates device → validates data ranges → stores in DB
    4. Returns status + any warnings

Uses Supabase admin client (service_role key) to bypass RLS 
since sensor uploads are authenticated via device_secret, not user JWT.
"""

from datetime import datetime, timezone, timedelta
from typing import Optional

from app.database import get_supabase_admin
from app.middleware.logger import get_logger
from app.middleware.error_handler import AppError
from app.utils.constants import SENSOR_RANGES

logger = get_logger(__name__)


async def authenticate_device(device_id: str, device_secret: str) -> dict:
    """
    Verify that a device_id + device_secret pair is valid.
    Returns the farm record if authenticated, raises AppError if not.
    """
    supabase = get_supabase_admin()

    result = (
        supabase.table("farms")
        .select("id, owner_id, name, device_id, device_secret, is_active")
        .eq("device_id", device_id)
        .execute()
    )

    if not result.data:
        logger.warning("device_auth_failed", device_id=device_id, reason="device_not_found")
        raise AppError(
            message=f"Device '{device_id}' not registered. Register it via /farm first.",
            status_code=401,
            error_code="DEVICE_NOT_FOUND",
        )

    farm = result.data[0]

    # Check device secret matches
    if farm.get("device_secret") != device_secret:
        logger.warning("device_auth_failed", device_id=device_id, reason="invalid_secret")
        raise AppError(
            message="Invalid device secret",
            status_code=401,
            error_code="INVALID_DEVICE_SECRET",
        )

    # Check farm is active
    if not farm.get("is_active", True):
        raise AppError(
            message="Farm is deactivated",
            status_code=403,
            error_code="FARM_INACTIVE",
        )

    logger.info("device_authenticated", device_id=device_id, farm_id=farm["id"])
    return farm


def validate_sensor_readings(data: dict) -> tuple[bool, list[str]]:
    """
    Check sensor values against physical limits.
    Returns (is_valid, list_of_warnings).
    
    A reading is marked invalid if ANY value is wildly out of range
    (indicates sensor malfunction). Minor anomalies just produce warnings.
    """
    warnings = []
    is_valid = True

    for field, limits in SENSOR_RANGES.items():
        value = data.get(field)
        if value is None:
            continue

        min_val = limits["min"]
        max_val = limits["max"]
        unit = limits["unit"]

        # Hard fail: physically impossible values
        if value < min_val - 10 or value > max_val + 10:
            warnings.append(
                f"{field}={value}{unit} is physically impossible "
                f"(valid: {min_val}-{max_val}). Sensor may be broken."
            )
            is_valid = False
        # Soft warning: edge of normal range
        elif value < min_val or value > max_val:
            warnings.append(
                f"{field}={value}{unit} is outside normal range "
                f"({min_val}-{max_val}). Check sensor calibration."
            )

    return is_valid, warnings


async def store_sensor_data(farm_id: str, data: dict, is_valid: bool) -> int:
    """
    Insert a sensor reading into the sensor_data table.
    Returns the ID of the inserted row.
    """
    supabase = get_supabase_admin()

    row = {
        "farm_id": farm_id,
        "soil_moisture": data.get("soil_moisture"),
        "soil_temp": data.get("soil_temp"),
        "soil_ec": data.get("soil_ec"),
        "air_temp": data.get("air_temp"),
        "humidity": data.get("humidity"),
        "leaf_wetness": data.get("leaf_wetness"),
        "battery_level": data.get("battery_level"),
        "is_valid": is_valid,
    }

    result = supabase.table("sensor_data").insert(row).execute()

    if not result.data:
        raise AppError(
            message="Failed to store sensor data",
            status_code=500,
            error_code="DB_INSERT_FAILED",
        )

    sensor_data_id = result.data[0]["id"]
    logger.info(
        "sensor_data_stored",
        sensor_data_id=sensor_data_id,
        farm_id=farm_id,
        is_valid=is_valid,
    )
    return sensor_data_id


async def process_upload(
    device_id: str,
    device_secret: str,
    readings: dict,
) -> dict:
    """
    Full sensor upload pipeline:
        1. Authenticate device
        2. Validate readings
        3. Store in database
        4. Return result

    This is the main entry point called by the route handler.
    """
    # Step 1: Authenticate
    farm = await authenticate_device(device_id, device_secret)
    farm_id = farm["id"]

    # Step 2: Validate
    is_valid, warnings = validate_sensor_readings(readings)

    if warnings:
        logger.warning(
            "sensor_data_warnings",
            farm_id=farm_id,
            device_id=device_id,
            warnings=warnings,
        )

    # Step 3: Store
    sensor_data_id = await store_sensor_data(farm_id, readings, is_valid)

    # Step 4: Check battery
    battery = readings.get("battery_level")
    if battery is not None and battery < 20:
        warnings.append(f"Low battery: {battery}%. Charge the device soon.")

    return {
        "sensor_data_id": sensor_data_id,
        "farm_id": farm_id,
        "is_valid": is_valid,
        "warnings": warnings,
    }


async def get_sensor_health(farm_id: str) -> dict:
    """
    Check if a farm's Pi sensor is online.
    Online = sent data within the last 15 minutes.
    """
    supabase = get_supabase_admin()

    # Get farm info
    farm_result = (
        supabase.table("farms")
        .select("id, device_id")
        .eq("id", farm_id)
        .execute()
    )

    if not farm_result.data:
        raise AppError(
            message=f"Farm '{farm_id}' not found",
            status_code=404,
            error_code="FARM_NOT_FOUND",
        )

    farm = farm_result.data[0]

    # Get latest sensor reading
    latest_result = (
        supabase.table("sensor_data")
        .select("timestamp, battery_level")
        .eq("farm_id", farm_id)
        .order("timestamp", desc=True)
        .limit(1)
        .execute()
    )

    # Count readings today
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    ).isoformat()

    count_result = (
        supabase.table("sensor_data")
        .select("id", count="exact")
        .eq("farm_id", farm_id)
        .gte("timestamp", today_start)
        .execute()
    )

    readings_today = count_result.count if count_result.count else 0

    # Determine status
    if not latest_result.data:
        return {
            "farm_id": farm_id,
            "device_id": farm.get("device_id"),
            "is_online": False,
            "last_reading_at": None,
            "battery_level": None,
            "readings_today": readings_today,
            "status": "no_data",
        }

    latest = latest_result.data[0]
    last_reading_at = datetime.fromisoformat(latest["timestamp"].replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    minutes_since = (now - last_reading_at).total_seconds() / 60

    if minutes_since <= 15:
        status = "online"
    elif minutes_since <= 60:
        status = "warning"
    else:
        status = "offline"

    return {
        "farm_id": farm_id,
        "device_id": farm.get("device_id"),
        "is_online": minutes_since <= 15,
        "last_reading_at": latest["timestamp"],
        "battery_level": latest.get("battery_level"),
        "readings_today": readings_today,
        "status": status,
    }


async def get_latest_readings(farm_id: str, limit: int = 1) -> list[dict]:
    """Get the most recent sensor readings for a farm."""
    supabase = get_supabase_admin()

    result = (
        supabase.table("sensor_data")
        .select("*")
        .eq("farm_id", farm_id)
        .order("timestamp", desc=True)
        .limit(limit)
        .execute()
    )

    return result.data if result.data else []


async def get_sensor_history(
    farm_id: str,
    hours: int = 24,
) -> list[dict]:
    """Get sensor readings for a farm within the last N hours."""
    supabase = get_supabase_admin()

    since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()

    result = (
        supabase.table("sensor_data")
        .select("*")
        .eq("farm_id", farm_id)
        .gte("timestamp", since)
        .order("timestamp", desc=False)
        .execute()
    )

    return result.data if result.data else []
