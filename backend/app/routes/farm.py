"""
Krishi Sakhi — Farm Routes.

CRUD endpoints for farm management.
"""

from fastapi import APIRouter, status

from app.schemas.farm import (
    FarmCreateRequest,
    FarmUpdateRequest,
    FarmResponse,
    FarmListResponse,
)

router = APIRouter(prefix="/farm", tags=["Farm"])


@router.get(
    "",
    response_model=FarmListResponse,
    summary="List all farms for the authenticated user",
)
async def list_farms():
    """
    GET /farm
    
    Returns all farms owned by the authenticated user (via JWT).
    RLS ensures data isolation.
    
    TODO: Implement in Phase 9 (Task 34)
    """
    return FarmListResponse(farms=[], count=0)


@router.post(
    "",
    response_model=FarmResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new farm",
)
async def create_farm(payload: FarmCreateRequest):
    """
    POST /farm
    
    Registers a new farm for the authenticated user.
    
    TODO: Implement in Phase 9 (Task 34)
    """
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    return FarmResponse(
        id="placeholder",
        owner_id="placeholder",
        name=payload.name,
        district=payload.district,
        state=payload.state,
        created_at=now,
        updated_at=now,
    )


@router.put(
    "/{farm_id}",
    response_model=FarmResponse,
    summary="Update farm details",
)
async def update_farm(farm_id: str, payload: FarmUpdateRequest):
    """
    PUT /farm/{farm_id}
    
    TODO: Implement in Phase 9 (Task 34)
    """
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc)
    return FarmResponse(
        id=farm_id,
        owner_id="placeholder",
        name=payload.name or "placeholder",
        district=payload.district or "placeholder",
        state=payload.state or "placeholder",
        created_at=now,
        updated_at=now,
    )


@router.delete(
    "/{farm_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a farm",
)
async def delete_farm(farm_id: str):
    """
    DELETE /farm/{farm_id}
    
    TODO: Implement in Phase 9 (Task 34)
    """
    return None
