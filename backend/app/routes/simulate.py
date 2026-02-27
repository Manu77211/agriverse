"""
Krishi Sakhi — Simulation Routes.

Endpoint for comparing multiple crops side-by-side.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/simulate", tags=["Simulation"])


@router.post(
    "",
    summary="Compare multiple crops for a farm",
    description=(
        "Runs the decision engine for each candidate crop and returns "
        "a ranked comparison table with profitability, risk, and suitability scores."
    ),
)
async def simulate_crops():
    """
    POST /simulate
    
    TODO: Implement in Phase 7 (Task 26-27)
    """
    return {
        "success": True,
        "message": "Simulation endpoint ready — implementation coming in Phase 7",
        "comparisons": [],
    }
