"""
Krishi Sakhi — Sensor Data Schemas.

Pydantic models for validating sensor data from Raspberry Pi uploads.
Enforces range constraints matching the database CHECK constraints.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class SensorUploadRequest(BaseModel):
    """
    Schema for POST /sensor/upload.
    Raspberry Pi sends this JSON every 5 minutes.
    """

    device_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique Raspberry Pi device identifier",
        examples=["PI-FARM-001"],
    )
    device_secret: str = Field(
        ...,
        min_length=1,
        description="Device authentication token (hashed)",
    )

    # Sensor readings — all optional since some sensors may fail
    soil_moisture: Optional[float] = Field(
        default=None,
        ge=0, le=100,
        description="Soil moisture percentage (0-100%)",
    )
    soil_temp: Optional[float] = Field(
        default=None,
        ge=-10, le=60,
        description="Soil temperature in °C (-10 to 60)",
    )
    soil_ec: Optional[float] = Field(
        default=None,
        ge=0, le=20,
        description="Soil electrical conductivity in dS/m (0-20)",
    )
    air_temp: Optional[float] = Field(
        default=None,
        ge=-10, le=60,
        description="Air temperature in °C (-10 to 60)",
    )
    humidity: Optional[float] = Field(
        default=None,
        ge=0, le=100,
        description="Air humidity percentage (0-100%)",
    )
    leaf_wetness: Optional[float] = Field(
        default=None,
        ge=0, le=1,
        description="Leaf wetness scale (0=dry, 1=fully wet)",
    )
    battery_level: Optional[float] = Field(
        default=None,
        ge=0, le=100,
        description="Raspberry Pi battery/power level (0-100%)",
    )

    @model_validator(mode="after")
    def at_least_one_reading(self) -> "SensorUploadRequest":
        """Ensure at least one sensor value is provided."""
        readings = [
            self.soil_moisture, self.soil_temp, self.soil_ec,
            self.air_temp, self.humidity, self.leaf_wetness,
        ]
        if all(v is None for v in readings):
            raise ValueError("At least one sensor reading must be provided")
        return self


class SensorDataResponse(BaseModel):
    """Schema for a single sensor data record returned from the database."""

    id: int
    farm_id: str
    timestamp: datetime
    soil_moisture: Optional[float] = None
    soil_temp: Optional[float] = None
    soil_ec: Optional[float] = None
    air_temp: Optional[float] = None
    humidity: Optional[float] = None
    leaf_wetness: Optional[float] = None
    battery_level: Optional[float] = None
    is_valid: bool = True


class SensorUploadResponse(BaseModel):
    """Response after successful sensor data upload."""

    success: bool = True
    message: str = "Sensor data received and stored"
    sensor_data_id: int = Field(..., description="ID of the stored sensor record")
    farm_id: str = Field(..., description="Farm the data was linked to")
    is_valid: bool = Field(..., description="Whether the reading passed anomaly detection")
    warnings: list[str] = Field(default_factory=list, description="Any data quality warnings")


class SensorHealthResponse(BaseModel):
    """Response for GET /sensor/health/{farm_id}."""

    farm_id: str
    device_id: Optional[str] = None
    is_online: bool = Field(..., description="True if Pi sent data in last 15 minutes")
    last_reading_at: Optional[datetime] = None
    battery_level: Optional[float] = None
    readings_today: int = Field(default=0, description="Number of readings received today")
    status: str = Field(..., description="online | offline | warning | unknown")
