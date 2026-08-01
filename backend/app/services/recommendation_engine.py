"""Recommendation Engine - ML Model + Mandi Price Integration"""
import os
import json
import joblib
import httpx
import logging
from datetime import datetime
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Constants
BIOTECH_VARIETIES = {
    "apple": {"variety": "Red Delicious", "traits": ["High yield", "Disease-resistant"]},
    "banana": {"variety": "Cavendish", "traits": ["High yield", "Cold-tolerant"]},
    "blackgram": {"variety": "PU-31", "traits": ["High yield", "Disease-resistant"]},
    "chickpea": {"variety": "JG-11", "traits": ["High yield", "Drought-tolerant"]},
    "coconut": {"variety": "Tall", "traits": ["High yield", "Long life"]},
    "coffee": {"variety": "Arabica", "traits": ["Premium quality", "Shade-tolerant"]},
    "cotton": {"variety": "DCH-32", "traits": ["High yield", "Disease-resistant"]},
    "grapes": {"variety": "Thompson Seedless", "traits": ["High yield", "Long shelf-life"]},
    "jute": {"variety": "JRO-524", "traits": ["High yield", "Pest-resistant"]},
    "kidneybeans": {"variety": "VL-63", "traits": ["High yield", "Early maturity"]},
    "lentil": {"variety": "L-4076", "traits": ["High yield", "Disease-resistant"]},
    "maize": {"variety": "DHM-117", "traits": ["High yield", "Pest-resistant"]},
    "mango": {"variety": "Alphonso", "traits": ["Premium price", "High yield"]},
    "mothbeans": {"variety": "RMO-40", "traits": ["Drought-tolerant", "Early maturity"]},
    "mungbean": {"variety": "ML-818", "traits": ["High yield", "Disease-resistant"]},
    "muskmelon": {"variety": "Pusa Madhuras", "traits": ["High yield", "Sweet taste"]},
    "orange": {"variety": "Jaffa", "traits": ["High yield", "Good taste"]},
    "papaya": {"variety": "Pusa Delicious", "traits": ["High yield", "Disease-resistant"]},
    "pigeonpeas": {"variety": "ICPL-87119", "traits": ["High yield", "Disease-resistant"]},
    "pomegranate": {"variety": "Bhagwa", "traits": ["High yield", "Premium price"]},
    "rice": {"variety": "Basmati-1121", "traits": ["Premium price", "High quality"]},
    "watermelon": {"variety": "Arka Jyoti", "traits": ["High yield", "Disease-resistant"]},
    "wheat": {"variety": "HD-2967", "traits": ["High yield", "Disease-resistant"]},
}

CROP_YIELDS = {
    "apple": 12.0, "banana": 40.0, "blackgram": 12.0, "chickpea": 15.0,
    "coconut": 80.0, "coffee": 2.5, "cotton": 15.0, "grapes": 20.0,
    "jute": 20.0, "kidneybeans": 12.0, "lentil": 10.0, "maize": 25.0,
    "mango": 10.0, "mothbeans": 8.0, "mungbean": 10.0, "muskmelon": 25.0,
    "orange": 30.0, "papaya": 35.0, "pigeonpeas": 8.0, "pomegranate": 15.0,
    "rice": 45.0, "watermelon": 25.0, "wheat": 35.0,
}

CULTIVATION_COSTS = {
    "apple": 80000, "banana": 60000, "blackgram": 12000, "chickpea": 15000,
    "coconut": 50000, "coffee": 100000, "cotton": 35000, "grapes": 120000,
    "jute": 25000, "kidneybeans": 20000, "lentil": 18000, "maize": 22000,
    "mango": 70000, "mothbeans": 15000, "mungbean": 18000, "muskmelon": 30000,
    "orange": 80000, "papaya": 50000, "pigeonpeas": 18000, "pomegranate": 100000,
    "rice": 28000, "watermelon": 35000, "wheat": 20000,
}

FALLBACK_MANDI_PRICES = {
    "apple": 3000, "banana": 1500, "blackgram": 4500, "chickpea": 4000,
    "coconut": 5000, "coffee": 15000, "cotton": 5500, "grapes": 6000,
    "jute": 3500, "kidneybeans": 4500, "lentil": 5000, "maize": 1800,
    "mango": 2500, "mothbeans": 3500, "mungbean": 4000, "muskmelon": 2500,
    "orange": 2000, "papaya": 2000, "pigeonpeas": 5500, "pomegranate": 8000,
    "rice": 2500, "watermelon": 1500, "wheat": 2000,
}


class RecommendationEngine:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.metadata = None
        self.price_cache = {}
        self.load_model()

    def load_model(self):
        """Load trained ML model"""
        try:
            model_path = "data/crop_model.joblib"
            encoder_path = "data/label_encoder.joblib"
            metadata_path = "data/model_metadata.json"
            
            if os.path.exists(model_path):
                self.model = joblib.load(model_path)
                self.label_encoder = joblib.load(encoder_path)
                with open(metadata_path) as f:
                    self.metadata = json.load(f)
                logger.info("Model loaded successfully")
            else:
                logger.warning("Model files not found")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")

    async def get_mandi_price(self, state: str, commodity: str) -> float:
        """Fetch mandi price from data.gov.in API"""
        cache_key = f"{state}:{commodity}"
        
        # Check cache
        if cache_key in self.price_cache:
            return self.price_cache[cache_key]
        
        try:
            api_key = os.getenv("MANDI_API_KEY", "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b")
            params = {
                "api-key": api_key,
                "format": "json",
                "limit": 1,
                "filters[State]": state,
                "filters[Commodity]": commodity
            }
            
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(
                    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a8645436022e",
                    params=params
                )
                
                if response.status_code == 200:
                    data = response.json()
                    records = data.get("records", [])
                    if records:
                        price = float(records[0].get("modal_price", 0))
                        if price > 0:
                            self.price_cache[cache_key] = price
                            return price
        except Exception as e:
            logger.warning(f"API error for {commodity}: {e}")
        
        # Fallback to hardcoded price
        fallback = FALLBACK_MANDI_PRICES.get(commodity.lower(), 2500)
        self.price_cache[cache_key] = fallback
        return fallback

    async def get_recommendation(self, n: float, p: float, k: float, 
                                  temp: float, humidity: float, ph: float, 
                                  rainfall: float, state: str = "Bihar") -> Dict:
        """Get crop recommendation using ML model"""
        if not self.model:
            return {"error": "Model not loaded"}
        
        # Prepare features
        features = [[n, p, k, temp, humidity, ph, rainfall]]
        
        # Get predictions
        probs = self.model.predict_proba(features)[0]
        top_indices = probs.argsort()[-5:][::-1]
        
        recommendations = []
        for idx in top_indices:
            crop = self.label_encoder.classes_[idx].lower()
            confidence = float(probs[idx])
            
            # Get mandi price
            price = await self.get_mandi_price(state, crop)
            
            # Calculate profitability
            yield_per_acre = CROP_YIELDS.get(crop, 10)
            cost_per_acre = CULTIVATION_COSTS.get(crop, 20000)
            profit = (yield_per_acre * price) - cost_per_acre
            
            variety = BIOTECH_VARIETIES.get(crop, {})
            
            recommendations.append({
                "crop": crop,
                "confidence": round(confidence, 3),
                "variety": variety.get("variety", "Standard"),
                "traits": variety.get("traits", []),
                "mandi_price": round(price, 2),
                "yield_per_acre": yield_per_acre,
                "cost_per_acre": cost_per_acre,
                "profit_per_acre": round(profit, 2),
            })
        
        return {
            "success": True,
            "recommendations": recommendations[:3],  # Top 3
            "model_version": self.metadata.get("version") if self.metadata else "1.0.0"
        }
