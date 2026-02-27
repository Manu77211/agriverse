"""
Krishi Sakhi — Farm Schemas.

Pydantic models for farm CRUD operations.
"""

from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class FarmCreateRequest(BaseModel):
    """Schema for POST /farm — create a new farm."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Farm name",
        examples=["My Rice Farm"],
    )
    district: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="District name",
        examples=["Patna"],
    )
    state: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="State name",
        examples=["Bihar"],
    )
    latitude: Optional[float] = Field(
        default=None,
        ge=-90, le=90,
        description="Farm latitude",
    )
    longitude: Optional[float] = Field(
        default=None,
        ge=-180, le=180,
        description="Farm longitude",
    )
    area_acres: Optional[float] = Field(
        default=None,
        gt=0, le=10000,
        description="Farm area in acres",
    )
    soil_type: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Soil type (e.g., Alluvial, Black, Red, Laterite)",
    )
    last_crop: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Last crop planted (for rotation logic)",
    )
    last_crop_season: Optional[str] = Field(
        default=None,
        description="Season of last crop",
        examples=["Kharif", "Rabi", "Zaid"],
    )


class FarmUpdateRequest(BaseModel):
    """Schema for PUT /farm/{farm_id} — update farm details."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=200)
    district: Optional[str] = Field(default=None, min_length=1, max_length=200)
    state: Optional[str] = Field(default=None, min_length=1, max_length=100)
    latitude: Optional[float] = Field(default=None, ge=-90, le=90)
    longitude: Optional[float] = Field(default=None, ge=-180, le=180)
    area_acres: Optional[float] = Field(default=None, gt=0, le=10000)
    soil_type: Optional[str] = Field(default=None, max_length=100)
    last_crop: Optional[str] = Field(default=None, max_length=100)
    last_crop_season: Optional[str] = None
    device_id: Optional[str] = Field(default=None, max_length=100)
    is_active: Optional[bool] = None


class FarmResponse(BaseModel):
    """Schema for a farm record returned from the database."""

    id: str
    owner_id: str
    name: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area_acres: Optional[float] = None
    soil_type: Optional[str] = None
    device_id: Optional[str] = None
    last_crop: Optional[str] = None
    last_crop_season: Optional[str] = None
    is_active: bool = True
    created_at: datetime
    updated_at: datetime


class FarmListResponse(BaseModel):
    """Response for GET /farm — list all user farms."""

    success: bool = True
    farms: List[FarmResponse]
    count: int
