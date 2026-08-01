# Design Document: ML + Mandi Price Integration

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Next.js)                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CropRecommendationCard Component (Enhanced)            │   │
│  │  - Profitability metrics display                         │   │
│  │  - Biotech variety traits                               │   │
│  │  - Water requirements indicator                         │   │
│  │  - Rank badges (🥇🥈🥉)                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────────────┘
                   │ HTTP POST /recommendation
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Recommendation Route Handler                         │     │
│  │  - Accept sensor/manual input (N,P,K,temp,hum...)    │     │
│  │  - Route to Recommendation Engine                     │     │
│  └────────────┬─────────────────────────────────────────┘     │
│               │                                                  │
│  ┌────────────▼──────────────────────────────────────────┐     │
│  │  Recommendation Engine Service                        │     │
│  │  - Orchestrate ML prediction + profitability scoring │     │
│  │  - Rank crops by profit                              │     │
│  │  - Format response                                    │     │
│  └────┬─────────────┬──────────────────┬───────────────┘     │
│       │             │                  │                      │
│  ┌────▼──┐  ┌──────▼──────┐  ┌───────▼────────┐              │
│  │ ML    │  │Mandi Price  │  │ Biotech Traits │              │
│  │Model  │  │Cache +      │  │& Yields Lookup │              │
│  │Predict│  │Fetcher      │  │                │              │
│  └───────┘  └──────┬──────┘  └────────────────┘              │
│                    │                                           │
│            ┌───────▼────────────┐                             │
│            │ Price Fetcher Svc  │                             │
│            │ - Check cache      │                             │
│            │ - API fallback     │                             │
│            │ - Normalization    │                             │
│            └───────┬────────────┘                             │
│                    │                                           │
└────────────────────┼──────────────────────────────────────────┘
                     │
        ┌────────────┴────────────────┐
        │                             │
        ▼                             ▼
┌──────────────────────┐   ┌──────────────────────────┐
│  Cache Layer         │   │  data.gov.in API         │
│  (Redis/Dict)        │   │  Mandi Prices            │
│  TTL: 24-48 hours    │   │  (Modal prices/Quintal)  │
│  Key: state:district │   │                          │
│  :commodity          │   │  Fallback: Hardcoded     │
│                      │   │  FALLBACK_MANDI_PRICES   │
└──────────────────────┘   └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│               ML RETRAINING PIPELINE (Scheduled)                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Retraining Scheduler                                     │   │
│  │ - Cron job (weekly/monthly configurable)                │   │
│  │ - Triggers ML Retrainer                                 │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                              │
│  ┌────────────────▼──────────────────────────────────────────┐  │
│  │ ML Retrainer Service                                      │  │
│  │ - Query historical recommendations                        │  │
│  │ - Build training dataset (features + labels)             │  │
│  │ - Train RandomForest (80/20 split)                       │  │
│  │ - Validate accuracy ≥ 85%                                │  │
│  │ - Save model atomically or rollback                      │  │
│  │ - Log metrics + send notification                        │  │
│  └────────────────┬──────────────────────────────────────────┘  │
│                   │                                              │
│  ┌────────────────▼──────────────────────────────────────────┐  │
│  │ Model Storage                                             │  │
│  │ - crop_model.joblib                                       │  │
│  │ - label_encoder.joblib                                    │  │
│  │ - model_metadata.json (version, accuracy, date)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Core Components

**Retraining Scheduler**
- Triggers scheduled retraining jobs at configurable intervals (weekly, monthly)
- Integrates with APScheduler or similar for job scheduling
- Maintains job logs and failure tracking

**ML Retrainer Service**
- Queries `recommendation_history` table for training data
- Splits data into training (80%) and validation (20%) sets
- Trains RandomForest classifier with fixed hyperparameters
- Validates model accuracy threshold (≥85%)
- Atomically swaps models or triggers rollback if validation fails

**Price Fetcher Service**
- Checks in-memory cache before querying external API
- Queries data.gov.in API with commodity name and location filters
- Normalizes crop names to match mandi terminology
- Returns fallback price if API fails or no record found
- Caches valid prices with TTL of 24–48 hours

**Mandi Price Cache**
- In-memory cache (Python dict with expiration) or Redis
- Key format: `{state}:{district}:{commodity}`
- Tracks cache hit/miss rates
- Supports cache invalidation and cleanup

**Recommendation Engine Service**
- Orchestrates ML prediction, price fetching, and profitability scoring
- Calculates: profitability_score = (yield × price) − cost
- Ranks crops by profitability score (descending)
- Returns top 3 recommendations with structured CropPrediction objects


## 2. Data Flow Diagrams

### 2.1 Recommendation Request Flow (Sensor → ML Prediction → Profitability → Response)

```
STEP 1: Request Arrival
┌──────────────────────────────────────┐
│ POST /recommendation (RecommendationRequest)
│ - nitrogen, phosphorus, potassium    │
│ - temperature, humidity, pH, rainfall│
│ - state, district, season, farm_id   │
└───────────────┬──────────────────────┘
                │
STEP 2: Input Validation & Defaults
┌───────────────▼──────────────────────┐
│ Apply defaults if values missing:    │
│ - N, P, K → 50, 45, 40 (if null)    │
│ - temp → 25°C                        │
│ - humidity → 70%                     │
│ - pH → 6.5                           │
│ - rainfall → 100mm                   │
│ - state → "Bihar", district → "Patna"
└───────────────┬──────────────────────┘
                │
STEP 3: ML Prediction
┌───────────────▼──────────────────────┐
│ IF model loaded:                     │
│   features = [N, P, K, temp, hum,pH, │
│               rainfall]              │
│   probs = model.predict_proba(fts)  │
│   top_5_crops = sort_by_prob(desc)  │
│ ELSE (fallback):                     │
│   Apply rule-based heuristics        │
│   e.g., IF rain>180 && temp>22       │
│         THEN rice (0.85)             │
└───────────────┬──────────────────────┘
                │
STEP 4: Candidate Crops Loop
┌───────────────▼──────────────────────┐
│ FOR each crop in top_5_candidates:   │
│                                      │
│  4a. Normalize crop name             │
│      rice → Rice, chickpea → Chickpea│
│                                      │
│  4b. Fetch Mandi Price               │
│      CALL Price Fetcher              │
│      → Check cache (hit/miss)        │
│      → Query API if expired          │
│      → Return fallback if failed     │
│                                      │
│  4c. Lookup biotech variety          │
│      variety = BIOTECH_VARIETIES     │
│      [mapped_crop]                   │
│                                      │
│  4d. Lookup yield & cost             │
│      yield = CROP_YIELDS[crop]       │
│      cost = CULTIVATION_COSTS[crop]  │
│                                      │
│  4e. Calculate profitability         │
│      revenue = yield × mandi_price   │
│      profit = revenue − cost         │
│                                      │
│  4f. Create CropPrediction object    │
│      {crop_name, confidence,         │
│       recommended_variety, traits,   │
│       expected_price,                │
│       profitability_score}           │
│                                      │
└───────────────┬──────────────────────┘
                │
STEP 5: Ranking & Filtering
┌───────────────▼──────────────────────┐
│ Sort all CropPrediction by           │
│ profitability_score (descending)     │
│ Break ties using confidence (desc)   │
│ LIMIT to top 3 recommendations       │
└───────────────┬──────────────────────┘
                │
STEP 6: Derived Metrics Calculation
┌───────────────▼──────────────────────┐
│ stress_index = 100 - (hum×0.6 + ...  │
│ water_deficit = 70 - (rain×0.4)      │
│ salinity_risk = 4.5 if pH>7.5 else1.2│
│ disease_prob = 35 + temp×0.5 if ...  │
│ crop_suitability = confidence × 100  │
└───────────────┬──────────────────────┘
                │
STEP 7: Advisory Generation
┌───────────────▼──────────────────────┐
│ Generate human-readable advisories:  │
│ - irrigation_advisory (from rainfall,│
│   humidity, crop water needs)        │
│ - rotation_advisory (crop rotation   │
│   with legumes for N fixation)       │
│ - ai_analysis (comprehensive summary │
│   with market outlook)               │
└───────────────┬──────────────────────┘
                │
STEP 8: Response Serialization
┌───────────────▼──────────────────────┐
│ RecommendationResponse {             │
│   success: true,                     │
│   farm_id: request.farm_id,          │
│   timestamp: now(),                  │
│   top_crops: [ranked 3 crops],       │
│   metrics: derived_metrics,          │
│   irrigation/rotation/ai advisories, │
│   model_version: "1.1.0",            │
│   data_source: "sensor" or "manual"  │
│ }                                    │
└───────────────┬──────────────────────┘
                │
STEP 9: Response Transmission
┌───────────────▼──────────────────────┐
│ HTTP 200 JSON Response to Frontend   │
│ (Validation: Pydantic schema)        │
└──────────────────────────────────────┘
```

### 2.2 Mandi Price Cache Flow

```
Price Lookup Request
│
├─ CHECK CACHE: key = "state:district:commodity"
│
├─ CACHE HIT (TTL < 24h)
│  └─> Return cached_price (log: "cache_hit")
│      └─> ✓ Fast path (~10ms)
│
└─ CACHE MISS or EXPIRED
   │
   ├─ NORMALIZE commodity name
   │  (Pigeonpeas → Arhar (Tur/Red Gram))
   │
   ├─ QUERY API: data.gov.in/resource
   │  Params: api-key, state, district, commodity
   │  Timeout: 3 seconds
   │
   ├─ RESPONSE handling:
   │  ├─ 200 OK + records found
   │  │  └─> Extract modal_price from records[0]
   │  │      ├─ Price > 0 → Cache + Return (log: "api_hit")
   │  │      └─ Price == 0 → Fallback (log: "zero_price")
   │  │
   │  ├─ Status != 200 → Fallback (log: "api_error")
   │  │
   │  └─ Timeout > 3s → Fallback (log: "api_timeout")
   │
   └─ FALLBACK: Return FALLBACK_MANDI_PRICES[commodity]
      (log: "fallback_used", commodity, reason)

CACHE STRUCTURE:
{
  "Bihar:Patna:Rice": {
    "price": 3000,
    "timestamp": 2024-01-15 10:30:00 UTC,
    "ttl_seconds": 86400,  # 24 hours
    "source": "api"
  },
  ...
}
```

### 2.3 ML Retraining Flow

```
SCHEDULED EVENT (Weekly/Monthly)
│
├─ RETRIEVE TRAINING DATA
│  └─ Query recommendation_history table:
│     SELECT N, P, K, temp, humidity, pH, rainfall,
│             crop_grown, yield_achieved, market_price
│     WHERE created_at >= NOW() - N_DAYS
│     AND yield_achieved IS NOT NULL
│
├─ DATA PREPARATION
│  ├─ Filter records with complete features + labels
│  ├─ Extract features: [N, P, K, temp, hum, pH, rain]
│  ├─ Extract labels: [crop_grown]
│  ├─ Log: "Training records collected: X"
│
├─ TRAIN/VALIDATION SPLIT
│  ├─ features_train (80%), features_val (20%)
│  ├─ labels_train (80%), labels_val (20%)
│  ├─ Log: "Split: 80/20"
│
├─ MODEL TRAINING
│  ├─ RandomForestClassifier(n_estimators=100, random_state=42)
│  ├─ model.fit(features_train, labels_train)
│  ├─ Log: "Model training complete"
│
├─ VALIDATION
│  ├─ predictions = model.predict(features_val)
│  ├─ accuracy = accuracy_score(labels_val, predictions)
│  ├─ Log: "Validation accuracy: X%"
│  │
│  ├─ IF accuracy >= 85%:
│  │  ├─ SAVE new model:
│  │  │  ├─ joblib.dump(model, "crop_model.joblib")
│  │  │  ├─ joblib.dump(label_encoder, "label_encoder.joblib")
│  │  │  └─ Save metadata: {version, accuracy, date}
│  │  ├─ Log: "Model saved (v1.2.0, 87% acc)"
│  │  ├─ NOTIFY: "Retraining successful, new model deployed"
│  │
│  └─ IF accuracy < 85%:
│     ├─ ROLLBACK: Keep previous model version
│     ├─ Log: "WARN: Accuracy 82% < 85%, rollback"
│     ├─ NOTIFY: "Retraining failed, threshold not met"
│
└─ COMPLETE: Retraining cycle ended
```


## 3. Component Design

### 3.1 Service Classes & Interfaces

#### A. RecommendationEngine Service

```python
# File: app/services/recommendation_engine.py

from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    CropPrediction,
    DerivedMetricsResponse
)
from app.services.price_fetcher import PriceFetcherService
from app.services.ml_retrainer import MLRetrainerService
import joblib

class RecommendationEngine:
    """
    Orchestrates ML prediction, price fetching, biotech lookup, and 
    profitability ranking.
    """
    
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.price_fetcher = PriceFetcherService()
        self.biotech_varieties = BIOTECH_VARIETIES  # Constant dict
        self.crop_yields = CROP_YIELDS
        self.cultivation_costs = CULTIVATION_COSTS
        self.water_requirements = WATER_REQUIREMENTS
        self.load_model()
    
    def load_model(self) -> None:
        """Load trained ML model and label encoder from disk."""
        try:
            self.model = joblib.load("data/crop_model.joblib")
            self.label_encoder = joblib.load("data/label_encoder.joblib")
            logger.info("Models loaded successfully")
        except Exception as e:
            logger.warning(f"Model load failed: {e}, fallback mode enabled")
            self.model = None
            self.label_encoder = None
    
    async def get_recommendation(
        self, 
        request: RecommendationRequest
    ) -> RecommendationResponse:
        """
        Main orchestration method:
        1. Normalize inputs
        2. Run ML prediction
        3. Fetch prices for candidates
        4. Calculate profitability
        5. Rank and filter top 3
        6. Generate advisories
        """
        # Normalize inputs
        features = self._normalize_inputs(request)
        
        # ML Prediction
        candidates = await self._predict_crops(features)
        
        # Enrich with prices & biotech
        enriched = await self._enrich_candidates(
            candidates, 
            request.state, 
            request.district
        )
        
        # Calculate profitability & rank
        ranked = self._calculate_profitability_and_rank(enriched)
        
        # Generate derived metrics
        metrics = self._calculate_derived_metrics(features)
        
        # Generate advisories
        advisories = self._generate_advisories(features, ranked)
        
        return RecommendationResponse(
            success=True,
            farm_id=request.farm_id,
            timestamp=datetime.now(timezone.utc),
            top_crops=ranked[:3],
            metrics=metrics,
            irrigation_advisory=advisories["irrigation"],
            rotation_advisory=advisories["rotation"],
            ai_analysis=advisories["ai"],
            model_version="1.1.0",
            data_source="sensor" if request.farm_id else "manual"
        )
    
    def _normalize_inputs(self, request: RecommendationRequest) -> Tuple:
        """Apply defaults and normalize input values."""
        N = request.nitrogen or 50.0
        P = request.phosphorus or 45.0
        K = request.potassium or 40.0
        temp = request.temperature or 25.0
        hum = request.humidity or 70.0
        ph = request.ph or 6.5
        rain = request.rainfall or 100.0
        
        logger.info(f"Inputs normalized: N={N}, P={P}, K={K}, "
                   f"temp={temp}, hum={hum}, pH={ph}, rain={rain}")
        
        return (N, P, K, temp, hum, ph, rain)
    
    async def _predict_crops(
        self, 
        features: Tuple
    ) -> List[Dict[str, float]]:
        """
        Run ML prediction or fallback rule-based classification.
        
        Returns: [{"crop": name, "confidence": 0.0-1.0}, ...]
        """
        if self.model is not None:
            N, P, K, temp, hum, ph, rain = features
            feature_array = np.array([[N, P, K, temp, hum, ph, rain]])
            
            probs = self.model.predict_proba(feature_array)[0]
            top_indices = np.argsort(probs)[::-1]
            
            candidates = []
            for idx in top_indices[:5]:  # Top 5 candidates
                prob = float(probs[idx])
                if prob > 0.01 or len(candidates) < 5:
                    crop_name = str(self.label_encoder.classes_[idx])
                    candidates.append({"crop": crop_name, "confidence": prob})
            
            logger.info(f"ML prediction: {[c['crop'] for c in candidates]}")
            return candidates
        else:
            return self._rule_based_fallback(features)
    
    def _rule_based_fallback(self, features: Tuple) -> List[Dict]:
        """Heuristic-based fallback when model unavailable."""
        N, P, K, temp, hum, ph, rain = features
        
        results = []
        if rain > 180 and temp > 22 and hum > 80:
            results = [
                {"crop": "rice", "confidence": 0.85},
                {"crop": "jute", "confidence": 0.65}
            ]
        elif temp < 25 and rain < 100:
            results = [
                {"crop": "wheat", "confidence": 0.80},
                {"crop": "chickpea", "confidence": 0.70}
            ]
        elif temp > 25 and hum < 50:
            results = [
                {"crop": "cotton", "confidence": 0.75}
            ]
        else:
            results = [{"crop": "maize", "confidence": 0.80}]
        
        logger.info(f"Rule-based fallback: {[c['crop'] for c in results]}")
        return results
    
    async def _enrich_candidates(
        self,
        candidates: List[Dict],
        state: str,
        district: str
    ) -> List[Dict]:
        """
        Enrich each candidate with:
        - Normalized crop name
        - Mandi price
        - Biotech variety
        - Yield & cost
        """
        enriched = []
        
        for item in candidates:
            raw_crop = item["crop"]
            mapped_crop = self._map_crop_name(raw_crop)
            
            # Fetch mandi price
            mandi_price = await self.price_fetcher.get_price(
                state, 
                district, 
                mapped_crop
            )
            
            # Lookup yield & cost
            yield_per_acre = self.crop_yields.get(mapped_crop, 12.0)
            cost_per_acre = self.cultivation_costs.get(mapped_crop, 15000)
            
            # Biotech variety
            biotech = self.biotech_varieties.get(
                mapped_crop,
                {"variety": f"{mapped_crop} Hybrid", "traits": []}
            )
            
            enriched.append({
                **item,
                "mapped_crop": mapped_crop,
                "mandi_price": mandi_price,
                "yield": yield_per_acre,
                "cost": cost_per_acre,
                "biotech_variety": biotech["variety"],
                "traits": biotech["traits"]
            })
        
        return enriched
    
    def _map_crop_name(self, raw_crop: str) -> str:
        """Normalize lowercase model output to proper format."""
        mapping = {
            "rice": "Rice", "wheat": "Wheat", "maize": "Maize",
            # ... complete mapping
        }
        return mapping.get(raw_crop.lower(), raw_crop.capitalize())
    
    def _calculate_profitability_and_rank(
        self,
        enriched: List[Dict]
    ) -> List[CropPrediction]:
        """
        Calculate: profit = (yield × price) − cost
        Rank by profitability (descending), break ties by confidence
        """
        for item in enriched:
            revenue = item["yield"] * item["mandi_price"]
            profit = revenue - item["cost"]
            item["profitability_score"] = profit
        
        # Sort by profit (desc), then confidence (desc)
        enriched.sort(
            key=lambda x: (x["profitability_score"], x["confidence"]),
            reverse=True
        )
        
        # Convert to CropPrediction objects
        predictions = []
        for item in enriched:
            pred = CropPrediction(
                crop_name=f"{item['mapped_crop']} ({item['biotech_variety']})",
                confidence=item["confidence"],
                recommended_variety=item["biotech_variety"],
                variety_traits=item["traits"],
                expected_price=item["mandi_price"],
                profitability_score=item["profitability_score"]
            )
            predictions.append(pred)
        
        logger.info(f"Ranked crops: {[p.crop_name for p in predictions[:3]]}")
        return predictions
    
    def _calculate_derived_metrics(
        self,
        features: Tuple
    ) -> DerivedMetricsResponse:
        """Calculate stress index, water deficit, disease probability, etc."""
        N, P, K, temp, hum, ph, rain = features
        
        stress_index = round(max(0, 100 - (hum * 0.6 + rain * 0.2)), 1)
        water_deficit = round(max(0, 70 - rain * 0.4), 1)
        salinity_risk = round(4.5 if ph > 7.5 else 1.2, 1)
        disease_prob = round(35.0 + temp * 0.5 if hum > 70 else 15.0, 1)
        crop_suitability = 70.0  # Default
        
        return DerivedMetricsResponse(
            stress_index=stress_index,
            water_deficit_score=water_deficit,
            salinity_risk=salinity_risk,
            disease_probability=disease_prob,
            crop_suitability=crop_suitability
        )
    
    def _generate_advisories(
        self,
        features: Tuple,
        ranked: List[CropPrediction]
    ) -> Dict[str, str]:
        """Generate human-readable irrigation, rotation, and AI advisories."""
        N, P, K, temp, hum, ph, rain = features
        
        best_crop = ranked[0].crop_name.split(' ')[0] if ranked else "crops"
        
        irrigation = (
            f"Based on rainfall ({rain}mm) and soil moisture, "
            f"maintain moderate watering. {best_crop} requires "
            f"careful irrigation during flowering stage."
        )
        
        rotation = (
            f"Rotate {best_crop} with legumes (Chickpea/Lentil) "
            f"in Rabi to rebuild soil nitrogen naturally."
        )
        
        ai_analysis = (
            f"Top recommendation: {ranked[0].crop_name} "
            f"(Confidence: {ranked[0].confidence*100:.0f}%). "
            f"Expected market price: ₹{ranked[0].expected_price:.0f}/Quintal. "
            f"Expected profit: ₹{ranked[0].profitability_score:.0f}/acre."
        )
        
        return {
            "irrigation": irrigation,
            "rotation": rotation,
            "ai": ai_analysis
        }
```

#### B. Price Fetcher Service

```python
# File: app/services/price_fetcher.py

import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

class PriceFetcherService:
    """
    Manages Mandi price fetching with caching and fallback.
    """
    
    def __init__(self, cache_ttl_hours: int = 24):
        self.cache: Dict[str, Dict] = {}
        self.cache_ttl = cache_ttl_hours * 3600  # Convert to seconds
        self.api_key = os.getenv("MANDI_API_KEY")
        self.api_url = "https://api.data.gov.in/resource"
        self.resource_id = "9ef84268-d588-465a-a308-a8645436022e"
    
    async def get_price(
        self,
        state: str,
        district: str,
        commodity: str
    ) -> float:
        """
        Fetch Mandi price with caching:
        1. Check cache validity
        2. Query API if expired
        3. Apply fallback if API fails
        4. Store in cache
        """
        cache_key = f"{state}:{district}:{commodity}"
        
        # Cache lookup
        if cache_key in self.cache:
            entry = self.cache[cache_key]
            age = (datetime.utcnow() - entry["timestamp"]).total_seconds()
            
            if age < self.cache_ttl:
                logger.info(f"Cache HIT: {cache_key}")
                return entry["price"]
            else:
                logger.info(f"Cache EXPIRED: {cache_key} (age: {age}s)")
        
        # Query API
        price = await self._query_mandi_api(state, district, commodity)
        
        # Store in cache
        self.cache[cache_key] = {
            "price": price,
            "timestamp": datetime.utcnow(),
            "source": "api" if price > 0 else "fallback"
        }
        
        return price
    
    async def _query_mandi_api(
        self,
        state: str,
        district: str,
        commodity: str
    ) -> float:
        """Query data.gov.in API for modal price."""
        
        # Normalize commodity name
        normalized = self._normalize_commodity(commodity)
        
        params = {
            "api-key": self.api_key,
            "format": "json",
            "limit": 10,
            "filters[State]": state,
            "filters[District]": district,
            "filters[Commodity]": normalized
        }
        
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                response = await client.get(self.api_url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    records = data.get("records", [])
                    
                    if records:
                        modal_price_str = records[0].get("modal_price", "0")
                        modal_price = float(modal_price_str)
                        
                        if modal_price > 0:
                            logger.info(
                                f"API HIT: {commodity} in {district} → "
                                f"₹{modal_price}/Quintal"
                            )
                            return modal_price
                    
                    logger.warning(
                        f"No records found: {commodity}, {district}"
                    )
                else:
                    logger.error(
                        f"API error {response.status_code}: {state}, "
                        f"{district}, {commodity}"
                    )
        
        except asyncio.TimeoutError:
            logger.error(f"API timeout: {commodity}")
        except Exception as e:
            logger.error(f"API exception: {e}")
        
        # Fallback to hardcoded price
        fallback = FALLBACK_MANDI_PRICES.get(commodity, 2500.0)
        logger.info(f"FALLBACK: {commodity} → ₹{fallback}/Quintal")
        return fallback
    
    def _normalize_commodity(self, crop_name: str) -> str:
        """Map crop name to official mandi terminology."""
        mapping = {
            "Pigeonpeas": "Arhar (Tur/Red Gram)",
            "Mungbean": "Green Gram (Moong)",
            "Blackgram": "Black Gram (Urd Beans)",
            "Chickpea": "Bengal Gram(Gram)",
            "Lentil": "Masur Dal",
            # ... more mappings
        }
        return mapping.get(crop_name, crop_name)
    
    def clear_cache(self) -> None:
        """Clear all cached prices (for testing/admin)."""
        self.cache.clear()
        logger.info("Price cache cleared")
    
    def get_cache_stats(self) -> Dict:
        """Return cache statistics."""
        return {
            "cached_entries": len(self.cache),
            "total_ttl_hours": self.cache_ttl / 3600
        }
```

#### C. ML Retrainer Service

```python
# File: app/services/ml_retrainer.py

from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import logging
import json

logger = logging.getLogger(__name__)

class MLRetrainerService:
    """
    Handles scheduled ML model retraining with validation and atomic updates.
    """
    
    def __init__(self, db_session=None):
        self.db = db_session
        self.model_dir = "data"
        self.min_accuracy_threshold = 0.85
    
    async def retrain_model(self, days_history: int = 90) -> Dict:
        """
        Main retraining orchestration:
        1. Query historical data
        2. Prepare training/validation sets
        3. Train model
        4. Validate accuracy
        5. Save or rollback
        """
        logger.info(f"Retraining started (history: {days_history} days)")
        start_time = datetime.utcnow()
        
        try:
            # Step 1: Fetch training data
            training_data = await self._fetch_training_data(days_history)
            if len(training_data) < 100:
                logger.warning(
                    f"Insufficient data: {len(training_data)} records"
                )
                return {"success": False, "reason": "insufficient_data"}
            
            logger.info(f"Training records: {len(training_data)}")
            
            # Step 2: Prepare data
            X, y = self._prepare_training_data(training_data)
            X_train, X_val, y_train, y_val = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            logger.info(
                f"Train: {len(X_train)}, Validation: {len(X_val)}"
            )
            
            # Step 3: Train model
            model, label_encoder = self._train_model(X_train, y_train)
            
            # Step 4: Validate
            y_pred = model.predict(X_val)
            accuracy = accuracy_score(y_val, y_pred)
            
            logger.info(f"Validation accuracy: {accuracy*100:.2f}%")
            
            # Step 5: Save or rollback
            if accuracy >= self.min_accuracy_threshold:
                self._save_model(model, label_encoder, accuracy)
                
                elapsed = (datetime.utcnow() - start_time).total_seconds()
                result = {
                    "success": True,
                    "accuracy": round(accuracy, 4),
                    "duration_seconds": elapsed,
                    "records_used": len(training_data)
                }
                
                logger.info(f"Retraining complete: {result}")
                return result
            else:
                logger.warning(
                    f"Accuracy {accuracy*100:.2f}% below threshold "
                    f"{self.min_accuracy_threshold*100:.0f}%. Rollback."
                )
                return {
                    "success": False,
                    "reason": "low_accuracy",
                    "accuracy": round(accuracy, 4)
                }
        
        except Exception as e:
            logger.error(f"Retraining failed: {e}", exc_info=True)
            return {"success": False, "reason": f"exception: {e}"}
    
    async def _fetch_training_data(
        self,
        days_history: int
    ) -> pd.DataFrame:
        """Query recommendation_history table for training data."""
        cutoff_date = datetime.utcnow() - timedelta(days=days_history)
        
        # SQL query (pseudo-code, actual DB query depends on ORM)
        query = f"""
        SELECT N, P, K, temperature, humidity, ph, rainfall,
               crop_grown, yield_achieved, market_price
        FROM recommendation_history
        WHERE created_at >= '{cutoff_date}'
        AND crop_grown IS NOT NULL
        AND yield_achieved IS NOT NULL
        ORDER BY created_at DESC
        """
        
        # Execute with actual DB session
        df = pd.read_sql(query, self.db)
        return df
    
    def _prepare_training_data(
        self,
        training_data: pd.DataFrame
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """Extract features and labels from training data."""
        
        features = training_data[[
            'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'
        ]]
        
        labels = training_data['crop_grown'].astype(str).str.lower()
        
        logger.info(f"Unique crops: {labels.nunique()}")
        
        return features, labels
    
    def _train_model(
        self,
        X_train: pd.DataFrame,
        y_train: pd.Series
    ) -> Tuple:
        """Train RandomForest classifier."""
        
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y_train)
        
        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42,
            n_jobs=-1,
            max_depth=20,
            min_samples_split=10
        )
        
        model.fit(X_train, y_encoded)
        
        logger.info(
            f"Model trained: {len(label_encoder.classes_)} classes, "
            f"{model.n_features_in_} features"
        )
        
        return model, label_encoder
    
    def _save_model(
        self,
        model,
        label_encoder,
        accuracy: float
    ) -> None:
        """Save model, encoder, and metadata atomically."""
        
        model_path = f"{self.model_dir}/crop_model.joblib"
        encoder_path = f"{self.model_dir}/label_encoder.joblib"
        metadata_path = f"{self.model_dir}/model_metadata.json"
        
        # Save to temp files first, then atomic rename
        import tempfile
        import shutil
        
        with tempfile.TemporaryDirectory() as tmpdir:
            # Write to temp
            joblib.dump(model, f"{tmpdir}/model_temp.joblib")
            joblib.dump(label_encoder, f"{tmpdir}/encoder_temp.joblib")
            
            # Atomic rename
            shutil.move(f"{tmpdir}/model_temp.joblib", model_path)
            shutil.move(f"{tmpdir}/encoder_temp.joblib", encoder_path)
        
        # Save metadata
        metadata = {
            "model_version": "1.2.0",
            "accuracy": accuracy,
            "retraining_date": datetime.utcnow().isoformat(),
            "n_classes": model.n_classes_,
            "n_features": model.n_features_in_
        }
        
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        logger.info(f"Model saved: {model_path}")
```


### 3.2 Cache Structure & Key Design

#### Mandi Price Cache Schema

```python
# In-Memory Cache Structure (Python dict)
PRICE_CACHE = {
    # Key format: "state:district:commodity"
    "Bihar:Patna:Rice": {
        "price": 3000.0,          # INR per quintal
        "timestamp": datetime(...), # When cached
        "ttl_seconds": 86400,     # 24 hours
        "source": "api",          # "api" or "fallback"
    },
    "Maharashtra:Nashik:Onion": {
        "price": 2500.0,
        "timestamp": datetime(...),
        "ttl_seconds": 86400,
        "source": "api",
    },
    # ... more entries
}

# Redis Cache Alternative (if multi-instance deployment)
# Key: "mandi:price:{state}:{district}:{commodity}"
# Value: JSON {"price": X, "source": "api"/"fallback"}
# TTL: 24-48 hours (configurable in Redis EXPIRE)
```

#### Cache Operations

```python
class CacheKeyBuilder:
    """Build and validate cache keys."""
    
    @staticmethod
    def build_price_key(state: str, district: str, commodity: str) -> str:
        """Normalized cache key."""
        # Normalize strings: trim, lowercase
        return f"{state.strip()}:{district.strip()}:{commodity.strip()}"
    
    @staticmethod
    def is_key_valid(key: str) -> bool:
        """Check if cache key format is valid."""
        parts = key.split(':')
        return len(parts) == 3 and all(p.strip() for p in parts)

class CacheExpiration:
    """Check and manage cache expiration."""
    
    @staticmethod
    def is_expired(timestamp, ttl_seconds: int = 86400) -> bool:
        """Check if cache entry has exceeded TTL."""
        age = (datetime.utcnow() - timestamp).total_seconds()
        return age >= ttl_seconds
    
    @staticmethod
    def cleanup_expired(cache: Dict) -> int:
        """Remove expired entries from cache."""
        expired_keys = [
            k for k, v in cache.items()
            if CacheExpiration.is_expired(v["timestamp"])
        ]
        for k in expired_keys:
            del cache[k]
        return len(expired_keys)
```

### 3.3 Model Versioning Strategy

```
Model Versioning File Structure:

backend/data/
├── crop_model.joblib          # Current active model (binary)
├── label_encoder.joblib        # Current active encoder (binary)
├── model_metadata.json         # Metadata (version, accuracy, date)
├── models_archive/
│   ├── crop_model_v1.0.0.joblib
│   ├── crop_model_v1.1.0.joblib
│   ├── crop_model_v1.2.0.joblib
│   └── model_metadata_v1.2.0.json
└── retraining_logs/
    ├── retrain_2024-01-15.log
    ├── retrain_2024-01-22.log
    └── retrain_2024-01-29.log

Model Metadata Structure (JSON):
{
  "model_version": "1.2.0",
  "accuracy": 0.8742,
  "retraining_date": "2024-01-29T10:30:00Z",
  "n_classes": 22,
  "n_features": 7,
  "training_records": 2150,
  "hyperparameters": {
    "n_estimators": 100,
    "max_depth": 20,
    "min_samples_split": 10,
    "random_state": 42
  },
  "class_distribution": {
    "rice": 180,
    "wheat": 165,
    "cotton": 155,
    ...
  }
}
```

#### Version Rollback Logic

```python
class ModelVersionManager:
    """Manage model versions and rollback."""
    
    def __init__(self, model_dir: str = "data"):
        self.model_dir = model_dir
        self.archive_dir = f"{model_dir}/models_archive"
    
    def get_current_version(self) -> str:
        """Read current model version from metadata."""
        with open(f"{self.model_dir}/model_metadata.json") as f:
            metadata = json.load(f)
        return metadata["model_version"]
    
    def save_current_as_backup(self, new_version: str) -> str:
        """Before overwriting, back up current model."""
        current_version = self.get_current_version()
        
        import shutil
        shutil.copy(
            f"{self.model_dir}/crop_model.joblib",
            f"{self.archive_dir}/crop_model_v{current_version}.joblib"
        )
        shutil.copy(
            f"{self.model_dir}/label_encoder.joblib",
            f"{self.archive_dir}/label_encoder_v{current_version}.joblib"
        )
        
        logger.info(f"Backup created: v{current_version}")
        return current_version
    
    def rollback_to_version(self, target_version: str) -> bool:
        """Restore a previous model version."""
        try:
            import shutil
            
            # Restore from archive
            shutil.copy(
                f"{self.archive_dir}/crop_model_v{target_version}.joblib",
                f"{self.model_dir}/crop_model.joblib"
            )
            shutil.copy(
                f"{self.archive_dir}/label_encoder_v{target_version}.joblib",
                f"{self.model_dir}/label_encoder.joblib"
            )
            
            logger.info(f"Rollback complete: v{target_version}")
            return True
        except Exception as e:
            logger.error(f"Rollback failed: {e}")
            return False
```

### 3.4 Frontend Component: Enhanced CropRecommendationCard

```typescript
// File: frontend/components/cards/CropRecommendationCard.tsx

import React, { useEffect, useRef } from 'react';
import { CropPrediction, DerivedMetricsResponse } from '@/types/recommendation';

interface CropRecommendationCardProps {
  crop: CropPrediction;
  rank: number;  // 1, 2, or 3
  metrics?: DerivedMetricsResponse;
}

const getRankBadge = (rank: number): string => {
  const badges = { 1: '🥇', 2: '🥈', 3: '🥉' };
  return badges[rank] || '';
};

const getWaterIndicator = (requirement: string): React.ReactNode => {
  const dropCounts = {
    'Low': 1,
    'Medium': 2,
    'High': 3
  };
  const drops = dropCounts[requirement] || 2;
  return '💧'.repeat(drops);
};

const getProfitColor = (profit: number): string => {
  if (profit > 50000) return 'border-green-500 bg-green-50';
  if (profit > 20000) return 'border-amber-500 bg-amber-50';
  return 'border-gray-300 bg-gray-50';
};

export const CropRecommendationCard: React.FC<CropRecommendationCardProps> = ({
  crop,
  rank,
  metrics
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Intersection Observer for animation trigger
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Trigger progress bar animation
          entry.target.classList.add('animate-fill');
        }
      },
      { threshold: 0.5 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const profitColor = getProfitColor(crop.profitability_score);
  const soilSuitability = Math.min(crop.confidence * 100, 100);
  const climateMatch = Math.max(70 + (metrics?.crop_suitability || 0) - 50, 40);
  const marketDemand = 75; // Placeholder
  
  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-lg border-2 p-6 shadow-md
        transition-all duration-300 hover:scale-102 hover:shadow-lg
        ${profitColor}
      `}
    >
      {/* Rank Badge */}
      <div className="absolute top-4 right-4 text-3xl">
        {getRankBadge(rank)}
      </div>
      
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {crop.crop_name}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          Variety: {crop.recommended_variety}
        </p>
        
        {/* Traits */}
        <div className="flex flex-wrap gap-1">
          {crop.variety_traits.slice(0, 3).map((trait, i) => (
            <span
              key={i}
              className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Expected Profit */}
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600">Expected Profit/Acre</p>
          <p className="text-xl font-bold text-green-700">
            ₹{(crop.profitability_score / 1000).toFixed(1)}k
          </p>
        </div>
        
        {/* Market Price */}
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600">Market Price</p>
          <p className="text-xl font-bold text-blue-700">
            ₹{crop.expected_price.toFixed(0)}/Quin
          </p>
        </div>
        
        {/* ML Confidence */}
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600">Confidence</p>
          <p className="text-xl font-bold text-purple-700">
            {(crop.confidence * 100).toFixed(0)}%
          </p>
        </div>
        
        {/* Water Requirement */}
        <div className="bg-white p-3 rounded">
          <p className="text-xs text-gray-600">Water Need</p>
          <p className="text-lg">{getWaterIndicator('Medium')}</p>
        </div>
      </div>
      
      {/* Suitability Progress Bars */}
      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Soil Suitability</span>
            <span className="font-semibold">{soilSuitability.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-green-500 h-full rounded-full animate-fill-bar"
              style={{ width: `${soilSuitability}%`, animationDelay: '0s' }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Climate Match</span>
            <span className="font-semibold">{climateMatch.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full animate-fill-bar"
              style={{ width: `${climateMatch}%`, animationDelay: '0.1s' }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-600">Market Demand</span>
            <span className="font-semibold">{marketDemand.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full animate-fill-bar"
              style={{ width: `${marketDemand}%`, animationDelay: '0.2s' }}
            />
          </div>
        </div>
      </div>
      
      {/* AI Insight Section */}
      <div className="bg-white p-3 rounded mb-4 border-l-4 border-blue-400">
        <p className="text-xs font-semibold text-gray-700 mb-1">🤖 AI Insight</p>
        <p className="text-sm text-gray-600">
          High rainfall match + premium market price in your region makes
          this crop economically optimal. Biotech variety offers 20%+ 
          yield boost with reduced pest pressure.
        </p>
      </div>
      
      {/* Footer Button */}
      <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">
        Learn More
      </button>
    </div>
  );
};

// CSS Animation for progress bars (in globals.css)
// @keyframes fill-bar {
//   from { width: 0; }
//   to { width: var(--width); }
// }
// .animate-fill-bar {
//   animation: fill-bar 1.2s ease-out forwards;
// }
```


## 4. Database Queries & Cache Key Design

### 4.1 Recommendation History Query (for Retraining)

```sql
-- Query to fetch training data from recommendation_history table

SELECT 
  rh.id,
  rh.farm_id,
  rh.nitrogen as N,
  rh.phosphorus as P,
  rh.potassium as K,
  rh.temperature,
  rh.humidity,
  rh.ph,
  rh.rainfall,
  rh.crop_grown,
  rh.yield_achieved,
  rh.market_price,
  rh.created_at
FROM recommendation_history rh
WHERE 
  rh.created_at >= NOW() - INTERVAL '90 days'
  AND rh.crop_grown IS NOT NULL
  AND rh.yield_achieved IS NOT NULL
  AND rh.yield_achieved > 0
ORDER BY rh.created_at DESC;

-- With state/district filter:
SELECT 
  rh.*,
  f.state,
  f.district
FROM recommendation_history rh
JOIN farm f ON rh.farm_id = f.id
WHERE 
  rh.created_at >= NOW() - INTERVAL '90 days'
  AND rh.crop_grown IS NOT NULL
  AND f.state = 'Bihar'
  AND f.district = 'Patna'
ORDER BY rh.created_at DESC;
```

### 4.2 Database Schema Extension

```sql
-- New table for recommendation history (training data source)
CREATE TABLE recommendation_history (
  id SERIAL PRIMARY KEY,
  farm_id UUID NOT NULL,
  
  -- Soil features
  nitrogen FLOAT NOT NULL,
  phosphorus FLOAT NOT NULL,
  potassium FLOAT NOT NULL,
  ph FLOAT NOT NULL,
  
  -- Climate features
  temperature FLOAT NOT NULL,
  humidity FLOAT NOT NULL,
  rainfall FLOAT NOT NULL,
  
  -- Recommendation data
  recommended_crop VARCHAR(50) NOT NULL,
  recommended_variety VARCHAR(100),
  
  -- Outcome (populated by farmer feedback/sensors)
  crop_grown VARCHAR(50),
  yield_achieved FLOAT,         -- Quintals/acre
  market_price FLOAT,           -- INR/Quintal
  farmer_feedback TEXT,
  
  -- Metadata
  data_source VARCHAR(20),      -- 'sensor' or 'manual'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (farm_id) REFERENCES farm(id),
  INDEX idx_created_at (created_at),
  INDEX idx_crop_grown (crop_grown),
  INDEX idx_farm_id (farm_id)
);

-- Model metadata table (versioning)
CREATE TABLE model_metadata (
  id SERIAL PRIMARY KEY,
  model_version VARCHAR(10) NOT NULL UNIQUE,
  accuracy FLOAT NOT NULL,
  n_classes INT,
  n_features INT,
  training_records INT,
  retraining_date TIMESTAMP NOT NULL,
  hyperparameters JSON,
  class_distribution JSON,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price cache log (audit trail)
CREATE TABLE price_cache_log (
  id SERIAL PRIMARY KEY,
  state VARCHAR(50) NOT NULL,
  district VARCHAR(50) NOT NULL,
  commodity VARCHAR(50) NOT NULL,
  price FLOAT NOT NULL,
  source VARCHAR(10),           -- 'api' or 'fallback'
  cache_hit BOOLEAN,
  api_response_time_ms INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_commodity (commodity)
);
```

### 4.3 Cache Key Design Patterns

```python
# Cache Key Patterns for Different Use Cases

# 1. Mandi Price Cache
CACHE_KEY_PRICE = "{state}:{district}:{commodity}"
# Example: "Bihar:Patna:Rice"

# 2. ML Model Predictions (optional, for caching model output)
CACHE_KEY_PREDICTION = "pred:{farm_id}:{timestamp_hour}"
# Example: "pred:farm_abc123:2024-01-15-10"
# TTL: 1 hour (predictions age quickly)

# 3. Derived Metrics Cache (optional)
CACHE_KEY_METRICS = "metrics:{farm_id}:{season}"
# Example: "metrics:farm_abc123:kharif_2024"
# TTL: 24 hours

# 4. API Rate Limit Tracking
CACHE_KEY_RATE_LIMIT = "rate_limit:{api_service}:{time_window}"
# Example: "rate_limit:mandi_api:2024-01-15-10-00"

class CacheKeyBuilder:
    """Build normalized cache keys."""
    
    @staticmethod
    def price_key(state: str, district: str, commodity: str) -> str:
        """Build cache key for Mandi price."""
        normalized = [s.strip().lower() for s in [state, district, commodity]]
        return f"price:{':'.join(normalized)}"
    
    @staticmethod
    def prediction_key(farm_id: str, hour: int) -> str:
        """Build cache key for ML prediction."""
        return f"pred:{farm_id}:{hour}"
    
    @staticmethod
    def metrics_key(farm_id: str, season: str) -> str:
        """Build cache key for derived metrics."""
        return f"metrics:{farm_id}:{season}"
    
    @staticmethod
    def is_expired(created_at: datetime, ttl_seconds: int) -> bool:
        """Check if cache entry expired."""
        age = (datetime.utcnow() - created_at).total_seconds()
        return age >= ttl_seconds
```

### 4.4 Indexed Query Performance

```sql
-- Optimize retraining query with proper indexes
CREATE INDEX idx_recommendation_history_created_at 
  ON recommendation_history(created_at DESC);

CREATE INDEX idx_recommendation_history_crop_grown 
  ON recommendation_history(crop_grown);

CREATE INDEX idx_recommendation_history_farm_id 
  ON recommendation_history(farm_id);

-- Sample retraining query with EXPLAIN
EXPLAIN ANALYZE
SELECT 
  nitrogen, phosphorus, potassium, 
  temperature, humidity, ph, rainfall, 
  crop_grown
FROM recommendation_history
WHERE created_at >= NOW() - INTERVAL '90 days'
AND crop_grown IS NOT NULL
ORDER BY created_at DESC;

-- Expected: Sequential scan on recommendation_history with index
-- Estimated rows: ~500-2000 depending on historical volume
```

## 5. Error Handling Flows

### 5.1 Graceful Degradation Flowchart

```
Request: /recommendation
│
├─ LOAD ML MODEL
│  │
│  ├─ Model exists + loads successfully
│  │  └─> Use ML predictions
│  │
│  └─ Model missing or load fails
│     └─> ⚠️  FALLBACK TO RULE-BASED (log warning)
│         └─> CONTINUE with heuristic rules
│
├─ FOR each candidate crop:
│  │
│  ├─ FETCH MANDI PRICE
│  │  │
│  │  ├─ Cache hit (TTL valid)
│  │  │  └─> Use cached price (fast path)
│  │  │
│  │  ├─ Cache miss/expired
│  │  │  │
│  │  │  ├─ Query API (timeout: 3s)
│  │  │  │  ├─ 200 + records
│  │  │  │  │  ├─ Price > 0 → Use + cache
│  │  │  │  │  └─ Price == 0 → ⚠️  FALLBACK
│  │  │  │  │
│  │  │  │  ├─ Non-200 status
│  │  │  │  │  └─> ⚠️  FALLBACK (log error)
│  │  │  │  │
│  │  │  │  └─ Timeout > 3s
│  │  │  │     └─> ⚠️  FALLBACK (log timeout)
│  │  │  │
│  │  │  └─ FALLBACK MANDI PRICES[commodity]
│  │  │     └─> Use hardcoded price + cache
│  │  │
│  │  └─ Log: {timestamp, commodity, status, price, source}
│  │
│  └─ CONTINUE to profitability calculation
│
├─ CALCULATE PROFITABILITY (all prices available)
│  └─> Rank crops by profit score
│
└─ RETURN response (success: true)
   └─> 200 JSON with top 3 recommendations


Error States Handled:
┌────────────────────────────────────┐
│ 1. Model Load Failure             │
│    → Log warning                   │
│    → Continue with fallback rules  │
│    → System remains operational    │
│                                    │
│ 2. API Timeout                     │
│    → Return cached price if exists │
│    → Else return fallback price    │
│    → Log retry count               │
│                                    │
│ 3. Zero/Invalid Price              │
│    → Use fallback price            │
│    → Log data gap                  │
│    → Monitor for API issues        │
│                                    │
│ 4. Crop Name Not Recognized        │
│    → Apply crop_mapping            │
│    → Skip if unmapped              │
│    → Continue with next crop       │
│                                    │
│ 5. Retraining Failure              │
│    → Log failure with reason       │
│    → Retain previous model version │
│    → Schedule retry within 24h     │
│                                    │
│ 6. Low Validation Accuracy         │
│    → Skip model save               │
│    → Log rollback event            │
│    → Keep stable model in prod     │
└────────────────────────────────────┘
```

### 5.2 Exception Handling Patterns

```python
# Pattern 1: API Call with Timeout & Fallback
async def fetch_price_with_fallback(state, district, commodity):
    """Fetch price with multi-level fallback."""
    
    try:
        # Try cache first (fastest)
        cached = price_cache.get(f"{state}:{district}:{commodity}")
        if cached and not is_expired(cached):
            logger.info("Cache hit")
            return cached["price"]
        
        # Try API (with timeout)
        async with httpx.AsyncClient(timeout=3.0) as client:
            response = await client.get(
                api_url,
                params={"state": state, "district": district, ...},
                timeout=3.0
            )
            
            if response.status_code == 200:
                data = response.json()
                price = float(data["records"][0]["modal_price"])
                
                if price > 0:
                    # Cache and return
                    cache_price(state, district, commodity, price)
                    return price
    
    except asyncio.TimeoutError:
        logger.warning(f"API timeout: {commodity}")
    except httpx.RequestError as e:
        logger.warning(f"API request error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
    
    # Fallback to hardcoded price
    fallback_price = FALLBACK_MANDI_PRICES.get(commodity, 2500)
    logger.info(f"Using fallback price: ₹{fallback_price}/Quin")
    
    # Cache fallback price (but mark as fallback)
    cache_price(state, district, commodity, fallback_price, source="fallback")
    
    return fallback_price


# Pattern 2: Model Loading with Graceful Degradation
def load_ml_model():
    """Load model with fallback to rule-based."""
    
    try:
        model = joblib.load("data/crop_model.joblib")
        encoder = joblib.load("data/label_encoder.joblib")
        
        # Verify model is usable
        if not hasattr(model, 'predict_proba'):
            raise ValueError("Invalid model format")
        
        logger.info("ML model loaded successfully")
        return model, encoder, "ml"
    
    except FileNotFoundError:
        logger.warning("Model files not found")
        return None, None, "rule-based"
    except Exception as e:
        logger.error(f"Model load error: {e}")
        return None, None, "rule-based"


# Pattern 3: Retraining with Validation & Rollback
async def retrain_model_safe():
    """Retrain with validation and rollback if needed."""
    
    try:
        # Fetch training data
        training_data = await fetch_historical_data(days=90)
        if len(training_data) < 100:
            logger.warning("Insufficient training data")
            return {"status": "skipped", "reason": "insufficient_data"}
        
        # Train new model
        new_model, new_encoder = train_random_forest(training_data)
        
        # Validate
        val_accuracy = validate_model(new_model, new_encoder)
        logger.info(f"Validation accuracy: {val_accuracy*100:.2f}%")
        
        if val_accuracy < 0.85:
            logger.warning(f"Low accuracy: {val_accuracy*100:.2f}%")
            return {"status": "rejected", "accuracy": val_accuracy}
        
        # Save with backup
        backup_current_model()
        save_model(new_model, new_encoder)
        
        logger.info("Retraining complete and deployed")
        return {"status": "success", "accuracy": val_accuracy}
    
    except Exception as e:
        logger.error(f"Retraining failed: {e}", exc_info=True)
        # Restore previous model on failure
        try:
            restore_previous_model()
            logger.info("Previous model restored")
        except:
            logger.error("Critical: Could not restore previous model")
        
        return {"status": "failed", "error": str(e)}
```

### 5.3 Logging Strategy

```python
# Structured Logging Configuration

import logging
import json
from datetime import datetime

class StructuredLogger:
    """Log in structured JSON format for easy parsing."""
    
    def __init__(self, name: str):
        self.logger = logging.getLogger(name)
    
    def log_event(
        self,
        level: str,
        module: str,
        function: str,
        message: str,
        **kwargs
    ):
        """Log with structured fields."""
        
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": level,
            "module": module,
            "function": function,
            "message": message,
            "data": kwargs
        }
        
        log_json = json.dumps(log_entry)
        
        if level == "INFO":
            self.logger.info(log_json)
        elif level == "WARNING":
            self.logger.warning(log_json)
        elif level == "ERROR":
            self.logger.error(log_json)
        else:
            self.logger.debug(log_json)

# Usage Examples:
logger = StructuredLogger(__name__)

# Mandi price fetching
logger.log_event(
    "INFO",
    "price_fetcher",
    "get_price",
    "Cache hit for Mandi price",
    state="Bihar",
    district="Patna",
    commodity="Rice",
    price=3000,
    cache_age_seconds=3600
)

# ML model deployment
logger.log_event(
    "INFO",
    "ml_retrainer",
    "retrain_model",
    "Model retraining complete",
    model_version="1.2.0",
    accuracy=0.8742,
    training_records=2150,
    validation_accuracy=0.8650,
    duration_seconds=45
)

# API error
logger.log_event(
    "ERROR",
    "price_fetcher",
    "_query_mandi_api",
    "API request timeout",
    state="Maharashtra",
    district="Nashik",
    commodity="Onion",
    timeout_seconds=3,
    retry_count=1
)
```


## 6. Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Price Cache Coherence

*For any* state, district, and commodity tuple, if a Mandi price is cached, then retrieving the cached price within the TTL window shall return the same price value that was originally fetched and cached.

**Validates: Requirements 2.1, 2.2, 2.7**

### Property 2: Fallback Price Availability

*For any* state, district, and commodity combination that fails the external API query (timeout, error status, or zero price), the system shall return a valid fallback price from the FALLBACK_MANDI_PRICES dictionary or a computed default, ensuring recommendations never fail due to price lookup unavailability.

**Validates: Requirements 2.5, 2.6, 6.1**

### Property 3: Profitability Ranking Determinism

*For any* set of candidate crops with known Mandi prices, yields, and cultivation costs, the profitability calculation (yield × price − cost) and subsequent ranking by descending profitability score shall be deterministic and reproducible across identical inputs.

**Validates: Requirements 3.5, 3.6, 3.9**

### Property 4: Top 3 Crop Filtering

*For any* candidate crop list of any length, the recommendation engine shall return exactly 3 or fewer crops (limited by top_crops list size), ranked by profitability score in descending order, with all ranks preserved relative to profitability values.

**Validates: Requirements 3.7, 4.10**

### Property 5: ML Model Prediction Non-Decreasing Confidence

*For any* valid feature input (N, P, K, temperature, humidity, pH, rainfall), the ML model prediction probabilities for all classes shall be non-negative, sum to 1.0 (after normalization), and the top K predicted crops shall have confidence scores in descending order.

**Validates: Requirements 1.6, 3.2**

### Property 6: Retraining Accuracy Threshold Enforcement

*For any* retraining cycle, if the validation accuracy on the held-out set (20% of training data) is less than 85%, the system shall not overwrite the current production model, and the previous model version shall remain active and unchanged.

**Validates: Requirements 1.7, 1.8, 6.9**

### Property 7: Biotech Variety Consistency

*For any* recommended crop name in the top_crops response, the associated biotech variety object (variety name + traits list) shall match the entry retrieved from the BIOTECH_VARIETIES constant dictionary using the normalized crop name as the key.

**Validates: Requirements 3.3, 4.1, 5.2**

### Property 8: Crop Name Normalization Idempotence

*For any* crop name string from the ML model prediction (lowercase, single or double-word), applying the crop name mapping once shall produce a normalized name that, when mapped again, produces the same result (i.e., the mapping is idempotent).

**Validates: Requirements 2.10, 3.4, 6.4**

### Property 9: Response Serialization Completeness

*For any* successful recommendation request, the returned RecommendationResponse object shall contain all required fields (success, farm_id, timestamp, top_crops, metrics, advisories, model_version, data_source) and be JSON-serializable without errors.

**Validates: Requirements 5.1, 5.6**

### Property 10: Price Cache TTL Expiration Correctness

*For any* cached Mandi price entry with a known cache timestamp and TTL of 24–48 hours, the cache entry shall be considered expired when the current time exceeds (cache_timestamp + TTL), and shall be considered valid when the current time is less than (cache_timestamp + TTL).

**Validates: Requirements 2.2, 2.7, 2.8**

### Property 11: Retraining Data Completeness Filter

*For any* retraining job, all records retrieved from recommendation_history with crop_grown IS NOT NULL and yield_achieved IS NOT NULL shall be included in the training dataset, and no valid records shall be filtered out unless they violate the specified completeness criteria.

**Validates: Requirements 1.3, 1.4**

### Property 12: Error Logging Presence

*For any* system failure event (model load failure, API timeout, fallback price usage, retraining rejection), the system shall emit a structured log entry with timestamp, error level, module name, function name, and relevant context data.

**Validates: Requirements 6.2, 6.6, 7.1, 7.2, 7.3**

---

## 7. Integration Points

### 7.1 Backend Route Integration

```python
# File: app/routes/recommendation.py (Enhanced)

from app.services.recommendation_engine import RecommendationEngine
from app.services.ml_retrainer import MLRetrainerService
from app.services.price_fetcher import PriceFetcherService

router = APIRouter(prefix="/recommendation", tags=["Recommendation"])

# Initialize services
recommendation_engine = RecommendationEngine()
price_fetcher = PriceFetcherService()

@router.post(
    "",
    response_model=RecommendationResponse,
    summary="Get crop recommendation with profitability ranking"
)
async def get_recommendation(payload: RecommendationRequest):
    """
    Enhanced recommendation endpoint:
    - ML prediction with profitability scoring
    - Mandi price caching with fallback
    - Top 3 crops ranked by expected profit
    """
    return await recommendation_engine.get_recommendation(payload)

@router.post(
    "/retrain",
    summary="Trigger manual model retraining"
)
async def trigger_retrain(days_history: int = 90):
    """Manual trigger for retraining (admin endpoint)."""
    retrainer = MLRetrainerService(db_session=db.session)
    result = await retrainer.retrain_model(days_history)
    return result
```

### 7.2 Scheduler Integration (APScheduler)

```python
# File: app/scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from app.services.ml_retrainer import MLRetrainerService
import logging

logger = logging.getLogger(__name__)

def setup_scheduler(db_session):
    """Initialize background scheduler for retraining."""
    
    scheduler = BackgroundScheduler()
    
    async def scheduled_retrain():
        """Run retraining job."""
        retrainer = MLRetrainerService(db_session=db_session)
        result = await retrainer.retrain_model(days_history=90)
        logger.info(f"Scheduled retrain complete: {result}")
    
    # Schedule weekly retraining (every Monday at 2 AM UTC)
    scheduler.add_job(
        scheduled_retrain,
        'cron',
        day_of_week='mon',
        hour=2,
        minute=0,
        id='weekly_model_retrain'
    )
    
    scheduler.start()
    logger.info("Scheduler initialized with weekly retraining job")
    
    return scheduler

# In app/main.py
from app.scheduler import setup_scheduler

@app.on_event("startup")
async def startup_event():
    """Initialize scheduler on app startup."""
    scheduler = setup_scheduler(db.session)
    app.state.scheduler = scheduler

@app.on_event("shutdown")
async def shutdown_event():
    """Shutdown scheduler on app shutdown."""
    if hasattr(app.state, 'scheduler'):
        app.state.scheduler.shutdown()
```

### 7.3 Frontend Integration

```typescript
// File: frontend/hooks/useRecommendation.ts

import { useState, useEffect } from 'react';
import { RecommendationResponse, CropPrediction } from '@/types/recommendation';

export const useRecommendation = (farmInputs: RecommendationRequest) => {
  const [recommendations, setRecommendations] = useState<CropPrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/recommendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(farmInputs)
        });
        
        if (!response.ok) throw new Error('API request failed');
        
        const data: RecommendationResponse = await response.json();
        setRecommendations(data.top_crops);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (farmInputs) {
      fetchRecommendations();
    }
  }, [farmInputs]);
  
  return { recommendations, loading, error };
};

// Usage in component
const Dashboard: React.FC = () => {
  const [inputs, setInputs] = useState<RecommendationRequest>({...});
  const { recommendations, loading, error } = useRecommendation(inputs);
  
  return (
    <div>
      {loading && <Spinner />}
      {error && <ErrorAlert message={error} />}
      <div className="grid grid-cols-3 gap-4">
        {recommendations.map((crop, idx) => (
          <CropRecommendationCard 
            key={idx}
            crop={crop}
            rank={idx + 1}
          />
        ))}
      </div>
    </div>
  );
};
```

### 7.4 Configuration & Environment

```python
# File: app/config.py

import os
from typing import Optional

class Settings:
    """Application configuration."""
    
    # ML Model Settings
    MODEL_PATH: str = os.getenv("MODEL_PATH", "data/crop_model.joblib")
    ENCODER_PATH: str = os.getenv("ENCODER_PATH", "data/label_encoder.joblib")
    MODEL_MIN_ACCURACY: float = float(os.getenv("MODEL_MIN_ACCURACY", "0.85"))
    
    # Mandi Price Settings
    MANDI_API_KEY: str = os.getenv("MANDI_API_KEY", "")
    MANDI_API_URL: str = os.getenv(
        "MANDI_API_URL",
        "https://api.data.gov.in/resource"
    )
    MANDI_RESOURCE_ID: str = os.getenv(
        "MANDI_RESOURCE_ID",
        "9ef84268-d588-465a-a308-a8645436022e"
    )
    
    # Cache Settings
    CACHE_TTL_HOURS: int = int(os.getenv("CACHE_TTL_HOURS", "24"))
    CACHE_TYPE: str = os.getenv("CACHE_TYPE", "memory")  # 'memory' or 'redis'
    REDIS_URL: Optional[str] = os.getenv("REDIS_URL")
    
    # Retraining Settings
    RETRAIN_DAYS_HISTORY: int = int(os.getenv("RETRAIN_DAYS_HISTORY", "90"))
    RETRAIN_SCHEDULE: str = os.getenv("RETRAIN_SCHEDULE", "0 2 * * 1")  # Cron format
    
    # Logging Settings
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_DIR: str = os.getenv("LOG_DIR", "logs")

settings = Settings()
```

```bash
# File: backend/.env.example

# ML Model Configuration
MODEL_PATH=data/crop_model.joblib
ENCODER_PATH=data/label_encoder.joblib
MODEL_MIN_ACCURACY=0.85

# Mandi API Configuration
MANDI_API_KEY=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b
MANDI_API_URL=https://api.data.gov.in/resource

# Cache Configuration
CACHE_TTL_HOURS=24
CACHE_TYPE=memory
# REDIS_URL=redis://localhost:6379

# Retraining Configuration
RETRAIN_DAYS_HISTORY=90
RETRAIN_SCHEDULE=0 2 * * 1  # Monday 2 AM UTC

# Logging
LOG_LEVEL=INFO
LOG_DIR=logs
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (Example-Based)

- Test individual service functions with concrete examples
- Verify edge cases (zero price, empty features, null values)
- Mock external dependencies (API, database, cache)

### 8.2 Property-Based Tests

- See Correctness Properties section (Section 6)
- Verify universal properties hold across randomized inputs
- Use fast-check or Hypothesis to generate test cases

### 8.3 Integration Tests

- End-to-end recommendation flow with database
- Actual Mandi API calls (with rate limiting)
- Model retraining with historical data

### 8.4 Performance & Load Tests

- Cache hit/miss latency benchmarks (target: <50ms)
- Recommendation response time (target: <2 seconds)
- Concurrent price queries (target: 10k/hour)

---

## 9. Deployment Considerations

### 9.1 Database Migrations

```sql
-- Add new tables and indexes
ALTER TABLE farm ADD COLUMN last_recommendation_id UUID;

CREATE TABLE recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farm(id) ON DELETE CASCADE,
  nitrogen FLOAT NOT NULL,
  phosphorus FLOAT NOT NULL,
  potassium FLOAT NOT NULL,
  ph FLOAT NOT NULL,
  temperature FLOAT NOT NULL,
  humidity FLOAT NOT NULL,
  rainfall FLOAT NOT NULL,
  recommended_crop VARCHAR(50) NOT NULL,
  crop_grown VARCHAR(50),
  yield_achieved FLOAT,
  market_price FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_farm_id (farm_id)
);

CREATE TABLE model_metadata (
  id SERIAL PRIMARY KEY,
  model_version VARCHAR(10) NOT NULL UNIQUE,
  accuracy FLOAT NOT NULL,
  retraining_date TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT FALSE
);
```

### 9.2 Backward Compatibility

- Existing `/recommendation` endpoint accepts same input schema
- New fields in response (profitability_score, traits) are optional in client
- Fallback to rule-based works if model unavailable

### 9.3 Monitoring & Alerts

- Monitor model accuracy trend over time
- Alert if retraining fails 3 times in a row
- Alert if cache hit rate < 60%
- Alert if Mandi API availability < 95%
