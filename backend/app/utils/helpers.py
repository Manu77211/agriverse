"""
Krishi Sakhi — Helper Utilities.

Common helper functions used across the backend.
"""

from datetime import datetime, timezone
from typing import Any, Dict, Optional


def utc_now() -> datetime:
    """Get current UTC datetime (timezone-aware)."""
    return datetime.now(timezone.utc)


def safe_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    """Safely convert a value to float, returning default if conversion fails."""
    if value is None:
        return default
    try:
        result = float(value)
        return result
    except (ValueError, TypeError):
        return default


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a value between min and max."""
    return max(min_val, min(value, max_val))


def percentage_to_label(value: float) -> str:
    """Convert a 0-100 percentage to a human-readable risk label."""
    if value <= 20:
        return "Very Low"
    elif value <= 40:
        return "Low"
    elif value <= 60:
        return "Moderate"
    elif value <= 80:
        return "High"
    else:
        return "Critical"


def build_success_response(data: Dict[str, Any], message: str = "Success") -> Dict[str, Any]:
    """Build a standardized success response wrapper."""
    return {
        "success": True,
        "message": message,
        "data": data,
        "timestamp": utc_now().isoformat(),
    }


def mask_key(key: str) -> str:
    """Mask an API key for safe logging. Shows first 8 and last 4 chars."""
    if not key or len(key) < 16:
        return "***"
    return f"{key[:8]}...{key[-4:]}"
