# Tasks: ML Model Training + Mandi Price Integration

## Task 1: Train ML Crop Recommendation Model
**Status:** Not Started  
**Type:** Core Implementation  
**Description:** Train an XGBoost/RandomForest model on the existing crop dataset (data/Crop_recommendation.csv) using soil features (N, P, K, pH) and climate parameters (temperature, humidity, rainfall). Save the trained model and label encoder as joblib files for production use.

**What It Does:**
- Load data/Crop_recommendation.csv with 2,200 training examples
- Extract features: [N, P, K, temperature, humidity, pH, rainfall]
- Extract labels: [crop]
- Split data 80% train / 20% validation
- Train XGBoost classifier with consistent hyperparameters (n_estimators=100, random_state=42)
- Validate model accuracy ≥ 85%
- Save model and label encoder to backend/data/

**Definition of Done:**
- [ ] Model file saved: backend/data/crop_model.joblib
- [ ] Label encoder saved: backend/data/label_encoder.joblib
- [ ] Model metadata file: backend/data/model_metadata.json (version, accuracy, date)
- [ ] Model accuracy on validation set ≥ 85%
- [ ] Backend can load and use model for predictions
- [ ] Test prediction with sample soil/climate values returns top 5 crops with confidence scores

---

## Task 2: Implement Price Fetcher Service
**Status:** Not Started  
**Type:** Service Layer  
**Depends:** (None)  
**Description:** Create the PriceFetcherService that handles Mandi price fetching from data.gov.in API with in-memory caching (TTL: 24-48 hours) and fallback to hardcoded prices.

**What It Does:**
- Checks in-memory cache before querying API
- Queries data.gov.in API with crop/state/district filters
- Normalizes commodity names to match API terminology
- Returns fallback price if API fails or times out
- Caches valid prices with configurable TTL
- Logs all operations (cache hits/misses, API calls, fallbacks)

**Definition of Done:**
- [ ] Service file created: app/services/price_fetcher.py
- [ ] get_price(state, district, commodity) method works
- [ ] Cache check returns cached price for valid entries (< 24h old)
- [ ] API query returns real mandi prices when cache expired
- [ ] Fallback price returned when API fails/times out (3s timeout)
- [ ] Commodity name normalization working (e.g., "Pigeonpeas" → "Arhar")
- [ ] Logging tracks cache hits/misses, API calls, fallbacks
- [ ] FALLBACK_MANDI_PRICES constant defined in constants.py

---

## Task 3: Implement Recommendation Engine Service
**Status:** Not Started  
**Type:** Service Layer  
**Depends:** Task 1, Task 2  
**Description:** Create the RecommendationEngine service that orchestrates ML predictions, price fetching, biotech variety lookup, and profitability ranking.

**What It Does:**
- Loads trained ML model and label encoder
- Accepts sensor/manual input (N, P, K, temp, humidity, pH, rainfall, state, district)
- Applies sensible defaults if values missing
- Runs ML prediction to get top 5 crop candidates
- For each candidate: fetches mandi price, looks up biotech variety, yield, and cost
- Calculates profitability: (yield × price) − cost
- Ranks crops by profitability (descending), breaks ties by confidence
- Limits results to top 3 recommendations
- Calculates derived metrics (stress index, water deficit, disease probability)
- Generates human-readable advisories (irrigation, rotation, AI analysis)
- Returns structured RecommendationResponse

**Definition of Done:**
- [ ] Service file created: app/services/recommendation_engine.py
- [ ] load_model() loads crop_model.joblib and label_encoder.joblib
- [ ] get_recommendation(request) returns RecommendationResponse
- [ ] _predict_crops() returns top 5 candidates from ML or fallback rules
- [ ] _enrich_candidates() fetches prices and biotech data for each crop
- [ ] _calculate_profitability_and_rank() correctly ranks by profit
- [ ] Top 3 recommendations returned with all metadata
- [ ] Derived metrics calculated correctly
- [ ] Advisories generated with sensible text
- [ ] Unit tests pass (test_recommendation_engine.py)

---

## Task 4: Update RecommendationRequest & RecommendationResponse Schemas
**Status:** Not Started  
**Type:** Data Structures  
**Depends:** (None)  
**Description:** Define Pydantic schemas for the recommendation request/response to support ML predictions, mandi prices, profitability scoring, and biotech variety traits.

**What It Does:**
- Update RecommendationRequest schema to accept all required fields
- Create CropPrediction schema with profitability, traits, price, yield, cost
- Create DerivedMetricsResponse schema (stress, water deficit, disease, salinity)
- Update RecommendationResponse schema with top_crops array and advisories

**Definition of Done:**
- [ ] RecommendationRequest schema file: app/schemas/recommendation.py
- [ ] Fields: nitrogen, phosphorus, potassium, temperature, humidity, pH, rainfall, state, district, farm_id, season
- [ ] CropPrediction schema with: crop_name, confidence, variety, traits, price, profitability_score, yield, cost
- [ ] DerivedMetricsResponse with: stress_index, water_deficit_score, salinity_risk, disease_probability, crop_suitability
- [ ] RecommendationResponse with: success, farm_id, timestamp, top_crops[], metrics, advisories
- [ ] All schemas validate correctly with test data
- [ ] All optional fields have sensible defaults

---

## Task 5: Create Biotech Varieties & Yields Constants
**Status:** Not Started  
**Type:** Data Constants  
**Depends:** (None)  
**Description:** Create comprehensive lookup tables for biotech varieties, expected yields, cultivation costs, and water requirements for all major crops.

**What It Does:**
- Define BIOTECH_VARIETIES dictionary: crop → {variety_name, traits[]}
- Define CROP_YIELDS dictionary: crop → quintals per acre
- Define CULTIVATION_COSTS dictionary: crop → INR per acre
- Define WATER_REQUIREMENTS dictionary: crop → "Low" | "Medium" | "High"
- Define FALLBACK_MANDI_PRICES dictionary: crop → default price (INR/quintal)

**Example entries:**
```
BIOTECH_VARIETIES = {
    "Rice": {
        "variety": "Swarna Sub-1",
        "traits": ["Submergence-tolerant", "High yield", "Disease-resistant"]
    },
    ...
}

CROP_YIELDS = {
    "Rice": 45.0,      # quintals per acre
    "Wheat": 35.0,
    "Maize": 25.0,
    ...
}

CULTIVATION_COSTS = {
    "Rice": 18000,      # INR per acre
    "Wheat": 12000,
    "Maize": 10000,
    ...
}
```

**Definition of Done:**
- [ ] Constants file created: app/utils/constants.py (or extended)
- [ ] BIOTECH_VARIETIES covers all major crops (Rice, Wheat, Maize, Chickpea, Lentil, etc.)
- [ ] Each variety has 3-5 relevant traits
- [ ] CROP_YIELDS populated with realistic values (5-50 quintals/acre)
- [ ] CULTIVATION_COSTS populated with realistic values (₹5K-30K/acre)
- [ ] WATER_REQUIREMENTS populated for all crops
- [ ] FALLBACK_MANDI_PRICES covers all major crops (₹1500-5000/quintal)
- [ ] All dictionaries contain at least 15 major crops
- [ ] Used correctly in Recommendation Engine

---

## Task 6: Update /recommendation Route Handler
**Status:** Not Started  
**Type:** API Endpoint  
**Depends:** Task 3, Task 4  
**Description:** Update the existing POST /recommendation route to use the new RecommendationEngine service with ML predictions and profitability scoring.

**What It Does:**
- Accept RecommendationRequest (sensor/manual input)
- Call RecommendationEngine.get_recommendation()
- Return RecommendationResponse with top 3 ranked crops
- Handle errors gracefully (missing fields, model load failure, API timeout)
- Log all requests and responses

**Definition of Done:**
- [ ] Route handler in app/routes/recommendation.py updated
- [ ] Accepts POST /recommendation with RecommendationRequest
- [ ] Returns HTTP 200 with RecommendationResponse on success
- [ ] Returns HTTP 400 with error message on invalid input
- [ ] Returns HTTP 503 with fallback response if model unavailable
- [ ] All errors logged with context
- [ ] Response time < 2 seconds (including mandi price fetch)
- [ ] Integration test passes: sensor data → recommendation with profitability

---

## Task 7: Implement ML Retrainer Service (Scheduled)
**Status:** Not Started  
**Type:** Service Layer  
**Depends:** Task 1  
**Description:** Create the MLRetrainerService that automatically retrains the model on a schedule using historical recommendation data with validation thresholds.

**What It Does:**
- Queries recommendation_history table for training data (past N days)
- Filters records where yield/outcome is recorded
- Builds training dataset: [N, P, K, temp, humidity, pH, rainfall] → crop
- Splits 80% train / 20% validation
- Trains new RandomForest with consistent hyperparameters
- Validates accuracy ≥ 85%
- Atomically saves new model or rolls back if validation fails
- Logs detailed retraining metrics
- Sends notification on success/failure

**Definition of Done:**
- [ ] Service file created: app/services/ml_retrainer.py
- [ ] query_training_data() retrieves historical recommendations
- [ ] build_training_set() extracts features and labels
- [ ] train_model() trains RandomForest (n_estimators=100, random_state=42)
- [ ] validate_model() checks accuracy ≥ 85%
- [ ] save_model_atomically() swaps model or rolls back
- [ ] Log metrics: records collected, accuracy, duration, model version
- [ ] Handles edge cases (no data, validation failure, file I/O error)
- [ ] Can be triggered manually or via scheduler
- [ ] Unit tests pass (test_ml_retrainer.py)

---

## Task 8: Create Retraining Scheduler Job
**Status:** Not Started  
**Type:** Background Job  
**Depends:** Task 7  
**Description:** Set up APScheduler to run ML retraining at configurable intervals (e.g., weekly) in the FastAPI application.

**What It Does:**
- Initialize APScheduler on FastAPI app startup
- Schedule MLRetrainer job to run weekly (configurable)
- Log scheduler startup and job executions
- Handle job failures gracefully (retry logic)
- Expose scheduler endpoints (e.g., GET /admin/retraining/status)

**Definition of Done:**
- [ ] Scheduler configured in app/main.py
- [ ] Job runs weekly (or as configured in .env)
- [ ] Job execution logged with start/end times and results
- [ ] Failed jobs logged with error details
- [ ] GET /admin/retraining/status endpoint returns last run info
- [ ] Manual trigger available: POST /admin/retraining/run
- [ ] Works in production (doesn't block FastAPI startup)

---

## Task 9: Update Frontend CropRecommendationCard Component
**Status:** Not Started  
**Type:** Frontend UI  
**Depends:** Task 6 (new API response format)  
**Description:** Enhance the CropRecommendationCard component to display profitability metrics, biotech varieties, traits, and rank badges.

**What It Does:**
- Display profitability score (expected profit per acre in ₹)
- Show biotech variety name and 3-5 relevant traits
- Display expected yield (quintals/acre) and market price (₹/quintal)
- Show suitability metrics (soil %, climate %, market demand %) with animated progress bars
- Add rank badge (🥇🥈🥉) positioned top-right
- Add water requirement indicator (1-3 filled drops)
- Conditional styling: green for high profit (>₹50K), amber for medium, gray for low
- Add "Learn More" button (optional)
- Responsive grid layout (2 cols mobile, 3 cols tablet)
- Hover animation: scale 1.02x + glow effect

**Definition of Done:**
- [ ] Component file: frontend/components/cards/CropRecommendationCard.tsx
- [ ] Displays all profitability and trait data from API
- [ ] Profit color coding working (green/amber/gray)
- [ ] Rank badges render correctly
- [ ] Water requirement drops display correctly
- [ ] Progress bars animate on viewport entry
- [ ] Hover effects applied
- [ ] Responsive layout tested on mobile/tablet/desktop
- [ ] Component accepts updated CropPrediction prop type
- [ ] Unit tests pass (CropRecommendationCard.test.tsx)

---

## Task 10: Replace Mock Mandi Prices with Real API
**Status:** Not Started  
**Type:** Integration  
**Depends:** Task 2  
**Description:** Replace hardcoded mock mandi price data in the frontend and backend with real data.gov.in API calls (with fallback).

**What It Does:**
- Remove hardcoded MOCK_MARKET_PRICES from frontend
- Update frontend API calls to use mandi prices from backend response
- Verify backend Price Fetcher correctly fetches real prices
- Test with real data.gov.in API key
- Verify fallback prices work when API unavailable

**Definition of Done:**
- [ ] Mock price constants removed from codebase
- [ ] Frontend displays real mandi prices in recommendation cards
- [ ] Backend successfully fetches from data.gov.in API
- [ ] Cache TTL working (24-48 hours)
- [ ] Fallback prices used when API down
- [ ] Integration test: API call → price fetched → card displayed
- [ ] Prices update correctly when cache expires
- [ ] No hardcoded prices remain (except fallback in constants)

---

## Task 11: Add Mandi Price Cache & Monitoring
**Status:** Not Started  
**Type:** Observability  
**Depends:** Task 2  
**Description:** Implement cache statistics and monitoring endpoints to track mandi price cache performance.

**What It Does:**
- Expose GET /admin/cache/stats endpoint showing cache hit/miss rates
- Track total API calls vs cache hits saved
- Expose GET /admin/cache/clear (admin only) to force refresh
- Log cache operations at INFO level

**Definition of Done:**
- [ ] GET /admin/cache/stats returns: cached_entries, hit_rate, miss_count, total_ttl_hours
- [ ] GET /admin/cache/clear clears cache and returns confirmation
- [ ] Cache hit/miss rates logged and trackable
- [ ] Admin endpoints secured with auth check
- [ ] Monitoring data persisted (optional: database)
- [ ] Integration test passes

---

## Task 12: Create Comprehensive Tests for ML & Pricing
**Status:** Not Started  
**Type:** Quality Assurance  
**Depends:** Task 1-6  
**Description:** Write unit and integration tests for model training, price fetching, recommendation engine, and API endpoints.

**What It Does:**
- Unit tests for MLRetrainer (train/validate/save)
- Unit tests for PriceFetcher (cache, API, fallback)
- Unit tests for RecommendationEngine (predict, rank, advisories)
- Integration test: sensor input → ML prediction → price fetch → ranked response
- Test error handling and fallback scenarios
- Test schema validation

**Definition of Done:**
- [ ] Test file: backend/tests/test_ml_retrainer.py (≥80% coverage)
- [ ] Test file: backend/tests/test_price_fetcher.py (≥80% coverage)
- [ ] Test file: backend/tests/test_recommendation_engine.py (≥80% coverage)
- [ ] Test file: backend/tests/test_recommendation_api.py (integration tests)
- [ ] All tests pass: pytest backend/tests/
- [ ] Coverage report shows ≥85% coverage for core services
- [ ] Mock data fixtures created for testing
- [ ] Error scenarios tested (API timeout, no data, invalid input)

---

## Task 13: Add Data.gov.in API Key Configuration
**Status:** Not Started  
**Type:** Configuration  
**Depends:** (None)  
**Description:** Set up environment variable configuration for data.gov.in API key with sensible defaults and documentation.

**What It Does:**
- Add MANDI_API_KEY to backend/.env.example
- Document the API key setup in README
- Provide sample API key (579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b) as default
- Load API key in config.py with validation

**Definition of Done:**
- [ ] MANDI_API_KEY added to backend/.env.example
- [ ] Default API key provided in comments
- [ ] config.py validates MANDI_API_KEY on startup
- [ ] Documentation added to README
- [ ] Errors logged if API key missing (falls back to hardcoded prices)
- [ ] API key never logged or exposed in responses

---

## Task 14: Update Frontend API Integration
**Status:** Not Started  
**Type:** Frontend Integration  
**Depends:** Task 6, Task 9  
**Description:** Update frontend API calls to consume new recommendation endpoint with profitability data.

**What It Does:**
- Update /api/analyze route (if exists) or create new endpoint calling Python backend
- Pass sensor/manual data to Python backend /recommendation endpoint
- Parse response with profitability, traits, mandi prices
- Update dashboard to display profits and prices
- Test with real backend responses

**Definition of Done:**
- [ ] Frontend API client updated: frontend/lib/api.ts or similar
- [ ] POST request to backend /recommendation working
- [ ] Response parsing for top_crops[] with profitability data
- [ ] Dashboard displays profitability scores in cards
- [ ] Market prices display real mandi data
- [ ] Error handling for API failures
- [ ] Integration test: submit sensor data → display recommendation with profit

---

## Task 15: Documentation & Deployment Guide
**Status:** Not Started  
**Type:** Documentation  
**Depends:** All tasks  
**Description:** Write deployment guide, API documentation, and troubleshooting guide for ML model and mandi price integration.

**What It Does:**
- API documentation for new fields in /recommendation endpoint
- Setup guide for training ML model
- Troubleshooting guide (model not loading, API timeout, cache issues)
- Deployment checklist
- Configuration reference

**Definition of Done:**
- [ ] API docs: backend/DEPLOYMENT.md or similar
- [ ] Quick start guide included
- [ ] Environment variables documented
- [ ] Troubleshooting section with common issues
- [ ] Example requests/responses shown
- [ ] Cache management guide
- [ ] Model update procedures documented

---

## Summary

**Total Tasks:** 15  
**Core Implementation:** Tasks 1-7 (Mandatory)  
**Frontend/Integration:** Tasks 8-10 (Important)  
**Testing & Quality:** Tasks 11-12 (Important)  
**Configuration & Docs:** Tasks 13-15 (Important)  

**Estimated Effort:** 40-50 hours  
**Timeline:** 1-2 weeks with focused execution  

**Execution Order:**
1. Task 1 → Train model (blocking)
2. Task 2 → Price fetcher (independent)
3. Task 5 → Constants (independent)
4. Task 4 → Schemas (independent)
5. Task 3 → Recommendation engine (depends 1,2,4,5)
6. Task 6 → Update route (depends 3,4)
7. Task 7 → ML retrainer (depends 1)
8. Task 8 → Scheduler (depends 7)
9. Task 9 → Frontend cards (depends 6)
10. Task 10 → Remove mock data (depends 2,9)
11. Task 11 → Cache monitoring (depends 2)
12. Task 12 → Tests (depends 1-6)
13. Task 13 → Config (independent, can do anytime)
14. Task 14 → Frontend integration (depends 6,9)
15. Task 15 → Documentation (final)
