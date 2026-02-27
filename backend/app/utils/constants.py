"""
Krishi Sakhi — Constants.

Centralized constants used across the backend.
Crop lists, soil types, Indian states, validation ranges.
"""

# ============================================================
# INDIAN STATES & UNION TERRITORIES
# ============================================================
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
    "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
]

# ============================================================
# SUPPORTED CROPS (XGBoost model output classes)
# Must match the Kaggle Crop Recommendation dataset labels
# ============================================================
SUPPORTED_CROPS = [
    "Rice", "Wheat", "Maize", "Chickpea", "Lentil",
    "Cotton", "Jute", "Sugarcane", "Coffee", "Coconut",
    "Banana", "Mango", "Grapes", "Apple", "Orange",
    "Papaya", "Pomegranate", "Watermelon", "Muskmelon",
    "Kidneybeans", "Pigeonpeas", "Mothbeans", "Mungbean",
    "Blackgram",
]

# ============================================================
# CROP SEASONS
# ============================================================
SEASONS = ["Kharif", "Rabi", "Zaid"]

# Kharif (June-October): Rice, Maize, Cotton, Sugarcane, Bajra, Jowar, Groundnut, Soybean
# Rabi (October-March): Wheat, Chickpea, Lentil, Mustard, Barley
# Zaid (March-June): Watermelon, Muskmelon, Cucumber, some vegetables

# ============================================================
# SOIL TYPES
# ============================================================
SOIL_TYPES = [
    "Alluvial",    # Indo-Gangetic plains
    "Black",       # Deccan Plateau (cotton soil)
    "Red",         # Eastern & Southern India
    "Laterite",    # Kerala, Karnataka, high rainfall areas
    "Sandy",       # Rajasthan, coastal areas
    "Clay",        # Low-lying areas
    "Loamy",       # Mixed — best for most crops
    "Saline",      # Coastal & irrigated areas with poor drainage
]

# ============================================================
# SENSOR VALIDATION RANGES
# Used by sensor_service.py for anomaly detection
# ============================================================
SENSOR_RANGES = {
    "soil_moisture": {"min": 0, "max": 100, "unit": "%"},
    "soil_temp": {"min": -10, "max": 60, "unit": "°C"},
    "soil_ec": {"min": 0, "max": 20, "unit": "dS/m"},
    "air_temp": {"min": -10, "max": 60, "unit": "°C"},
    "humidity": {"min": 0, "max": 100, "unit": "%"},
    "leaf_wetness": {"min": 0, "max": 1, "unit": "scale"},
    "battery_level": {"min": 0, "max": 100, "unit": "%"},
}

# ============================================================
# STRESS INDEX THRESHOLDS (FAO guidelines)
# ============================================================
STRESS_THRESHOLDS = {
    "low": 30,       # 0-30: Low stress (green)
    "moderate": 60,  # 31-60: Moderate stress (yellow)
    "high": 100,     # 61-100: High stress (red)
}

# ============================================================
# DISEASE RISK THRESHOLDS (Tom-Cast model)
# ============================================================
DISEASE_RISK_LEVELS = {
    "low": 20,       # 0-20: Low risk
    "moderate": 50,  # 21-50: Moderate risk
    "high": 80,      # 51-80: High risk
    "critical": 100, # 81-100: Critical — immediate action needed
}

# ============================================================
# EC THRESHOLDS (electrical conductivity for salinity)
# ============================================================
EC_THRESHOLDS = {
    "safe": 2.0,        # < 2 dS/m: No salinity problem
    "moderate": 4.0,    # 2-4 dS/m: Some sensitive crops affected
    "high": 8.0,        # 4-8 dS/m: Many crops affected
    "critical": 16.0,   # > 8 dS/m: Only tolerant crops survive
}

# ============================================================
# PRICE UNIT
# ============================================================
PRICE_UNIT = "INR/Quintal"

# ============================================================
# API RATE LIMITS
# ============================================================
SENSOR_UPLOAD_INTERVAL_MINUTES = 5
SENSOR_HEALTH_TIMEOUT_MINUTES = 15
