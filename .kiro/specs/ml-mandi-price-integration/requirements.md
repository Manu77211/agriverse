# Requirements Document: ML + Mandi Price Integration

## Introduction

This document specifies requirements for integrating automated ML model retraining with real-time Mandi price caching and market-driven crop recommendations in the Krishi Sakhi agricultural advisory system. The feature enhances the existing crop recommendation pipeline by incorporating three core capabilities:

1. **Automated ML Model Retraining** — Scheduled, autonomous retraining of the Random Forest classifier on historical recommendation and yield data
2. **Mandi Price Caching** — Efficient retrieval and 24–48 hour local caching of commodity prices from the data.gov.in API with fallback support
3. **Enhanced Frontend Presentation** — Extended CropRecommendationCard component to display biotech variety traits, profitability metrics, and market-driven ranking

The system shall maintain backward compatibility with existing sensor-based recommendation requests while extending support for location-based price queries.

---

## Glossary

- **ML Model** — Random Forest Classifier trained on soil features (N, P, K, pH) and climate parameters (temperature, humidity, rainfall) to predict suitable crops
- **Retraining** — Automated process of updating the ML model weights using new historical data without manual intervention
- **Mandi Price** — Agricultural commodity modal price (INR per quintal) from registered mandis, sourced from data.gov.in API
- **Mandi Price Cache** — In-memory or persistent store of modal prices with configurable TTL (24–48 hours) to minimize API calls
- **Profitability Score** — Expected profit per acre = (Yield per acre × Mandi Price per quintal) − Cultivation Cost
- **Biotech Variety** — High-yield, disease-resistant seed variety mapped to recommended crops with trait descriptions
- **CropRecommendationCard** — React component displaying individual crop recommendation with metrics, yields, profits, and traits
- **Crop Ranking** — Ordering of candidate crops by profitability score (highest to lowest) to prioritize farmer returns
- **Fallback Mandi Price** — Default hardcoded price used when real-time API call fails or data unavailable
- **State & District** — Geographic parameters for filtering location-specific mandi prices
- **Confidence Score** — ML model probability (0–1) indicating predicted crop suitability

---

## Requirements

### Requirement 1: Automated ML Model Retraining

**User Story:** As a crop specialist, I want the ML model to retrain automatically on a schedule using new historical data so that recommendations improve over time without manual intervention.

#### Acceptance Criteria

1. WHEN a retraining job is scheduled, THE Retraining Scheduler SHALL execute the job at a user-defined frequency (e.g., weekly, monthly)
2. THE Retraining Pipeline SHALL query the Recommendations Database for historical recommendation records from the past N days
3. WHILE collecting training data, THE Pipeline SHALL filter records where recommendation outcome (yield, price, farmer feedback) is recorded
4. THE Retraining Pipeline SHALL aggregate soil features (N, P, K, pH, temperature, humidity, rainfall) and label each record with the actual crop grown
5. WHEN training data is assembled, THE ML Retrainer SHALL split the dataset into training (80%) and validation (20%) sets
6. THE ML Retrainer SHALL train a new Random Forest Classifier instance with consistent hyperparameters (n_estimators=100, random_state=42)
7. WHEN validation accuracy is ≥ 85%, THE Retrainer SHALL save the new model and label encoder to persistent storage (joblib files)
8. IF validation accuracy < 85%, THEN THE Retrainer SHALL log a warning and retain the previous model version (no rollover)
9. WHEN a new model is saved, THE Retrainer SHALL timestamp the model file and update metadata (model_version, accuracy, retraining_date)
10. THE Retrainer SHALL send a notification (log entry + optional email) to the data team with retraining results, model metrics, and any anomalies detected

### Requirement 2: Mandi Price Caching with Fallback

**User Story:** As a system operator, I want Mandi prices to be cached locally for 24–48 hours so that the API response times are fast and the external API is not overloaded.

#### Acceptance Criteria

1. WHEN a crop recommendation request arrives, THE Price Fetcher SHALL check if a cached Mandi price exists for the requested State, District, and Commodity
2. IF a valid cache entry exists (TTL < 24 hours), THE Price Fetcher SHALL return the cached price without querying the external API
3. IF the cache entry has expired (TTL ≥ 24 hours), THE Price Fetcher SHALL query the data.gov.in API with the commodity name, state, and district filters
4. WHEN the API responds with records, THE Price Fetcher SHALL extract the modal_price field from the first matching record
5. IF modal_price is missing or zero, THE Price Fetcher SHALL apply a fallback price from the hardcoded FALLBACK_MANDI_PRICES dictionary
6. IF the API request times out (timeout > 3 seconds) or returns non-200 status, THE Price Fetcher SHALL log the error and return the fallback price
7. WHEN a valid price is retrieved, THE Cache Manager SHALL store the entry with a TTL of 24–48 hours (configurable)
8. THE Cache Manager SHALL support both in-memory cache (Redis or Python dict) and persistent cache (database table) for multi-instance deployments
9. IF no price record exists in the mandi API for a commodity, THE Price Fetcher SHALL return the hardcoded fallback price and log a data gap warning
10. THE Price Fetcher SHALL normalize commodity names (e.g., "Pigeonpeas" → "Arhar (Tur/Red Gram)") using a predefined mapping to match mandi API terminology

### Requirement 3: Profitability-Based Crop Ranking

**User Story:** As a farmer, I want crop recommendations ranked by expected profit per acre so that I can make economically optimal planting decisions.

#### Acceptance Criteria

1. WHEN a recommendation request is processed, THE Recommendation Engine SHALL retrieve ML predictions with crop names and confidence scores
2. FOR each predicted crop, THE Engine SHALL fetch the Mandi price using the Price Fetcher (Requirement 2)
3. FOR each predicted crop, THE Engine SHALL look up Expected Yield (quintals/acre) from the CROP_YIELDS lookup table
4. FOR each predicted crop, THE Engine SHALL look up Cultivation Cost (INR/acre) from the CULTIVATION_COSTS lookup table
5. THE Engine SHALL calculate Profitability Score = (Yield per acre × Mandi Price per quintal) − Cultivation Cost
6. THE Recommendation Engine SHALL sort candidate crops by Profitability Score in descending order (highest profit first)
7. THE Engine SHALL limit ranked results to the top 3 recommendations before returning to the frontend
8. WHEN a crop is ranked #1, THE Response Object SHALL include profitability_score and confidence score for display
9. IF two crops have equal profitability scores, THE Engine SHALL break ties using ML confidence score (higher confidence wins)
10. THE Response SHALL include the mandi price and expected yield in the details for each ranked crop for farmer transparency

### Requirement 4: Enhanced CropRecommendationCard Component

**User Story:** As a farmer viewing recommendations, I want to see biotech variety traits, water requirements, and profitability details in a visually rich card format so that I can quickly understand why each crop is recommended.

#### Acceptance Criteria

1. THE CropRecommendationCard Component SHALL display the following information for each ranked crop:
   - Crop name (e.g., "Rice (Swarna Sub-1)")
   - Recommended biotech variety and trait list (e.g., ["Submergence-tolerant", "High yield"])
   - Expected Profit per Acre (INR)
   - Expected Yield per Acre (quintals)
   - Market Price per kg (derived from modal price)
   - Suitability metrics (Soil Suitability %, Climate Match %, Market Demand %)
   - Water Requirement indicator (Low, Medium, High with visual drops)
   - Growth Duration (days)
   - Rank badge (🥇, 🥈, 🥉) positioned top-right
2. THE Component SHALL render progress bars for Soil Suitability, Climate Match, and Market Demand scores animated to fill on viewport entry
3. THE Component SHALL display an AI Insight section explaining why the crop is recommended (e.g., "High rainfall match + premium market price")
4. WHEN a user hovers over the card, THE Component SHALL apply a subtle scale-up animation (1.02×) and glow effect
5. THE Component SHALL use responsive grid layout (2 columns on mobile, 3 on tablet, responsive on desktop)
6. THE Component SHALL show Rank Badge with medal emoji (🥇 Gold, 🥈 Silver, 🥉 Bronze) for top 3 recommendations
7. THE Component SHALL render water requirement using a 3-drop icon indicator (filled drops = requirement level)
8. THE Component SHALL apply conditional styling based on profitability thresholds:
   - High profit (> ₹50k/acre) → green accent
   - Medium profit (₹20k–₹50k) → amber accent
   - Low profit (< ₹20k) → gray accent
9. THE Component SHALL include a "Learn More" button (optional) linking to detailed crop guide or variety datasheet
10. WHEN ranked crops are displayed, THE frontend SHALL sort the cards by rank (1, 2, 3 from left to right)

### Requirement 5: API Response Structure

**User Story:** As a frontend developer, I want the recommendation response to include structured data for profitability, varieties, and pricing so that I can render enhanced UI with minimal client-side computation.

#### Acceptance Criteria

1. THE POST /recommendation Endpoint SHALL return a RecommendationResponse object containing:
   - `success` (boolean)
   - `farm_id` (string, echoed from request)
   - `timestamp` (ISO 8601 UTC)
   - `top_crops` (list of CropPrediction objects)
   - `metrics` (DerivedMetricsResponse with stress_index, water_deficit, salinity_risk, disease_probability, crop_suitability)
   - `irrigation_advisory` (text)
   - `rotation_advisory` (text)
   - `ai_analysis` (text)
   - `model_version` (string, e.g., "1.1.0")
   - `data_source` ("manual" or "sensor")

2. EACH CropPrediction Object SHALL contain:
   - `crop_name` (string, formatted as "CropName (VarietyName)")
   - `confidence` (float, 0–1)
   - `recommended_variety` (string)
   - `variety_traits` (list of strings)
   - `expected_price` (float, INR per quintal)
   - `profitability_score` (float, INR per acre)
   - (Optional) `expected_yield` (float, quintals per acre)
   - (Optional) `cultivation_cost` (float, INR per acre)

3. WHEN profitability_score is calculated, THE response SHALL include this as the primary ranking metric in the top_crops list
4. THE Response SHALL include mandi_price_per_kg (derived from modal_price ÷ 100) for display in the frontend card
5. IF a crop has missing cultivation cost, THE Engine SHALL use a default value of 15000 INR and log a warning
6. THE Response SHALL be JSON-serializable and validated against Pydantic schema before transmission

### Requirement 6: Error Handling & Resilience

**User Story:** As a system operator, I want graceful error handling when Mandi APIs are unavailable or model files are missing so that recommendations continue to work reliably.

#### Acceptance Criteria

1. IF the Mandi API returns an error or timeout, THE Price Fetcher SHALL immediately fallback to hardcoded FALLBACK_MANDI_PRICES
2. IF the crop model (crop_model.joblib) cannot be loaded on startup, THE system SHALL log a warning and enable Rule-Based Fallback Mode
3. WHILE in Rule-Based Fallback Mode, THE Recommendation Engine SHALL use simple heuristic rules (e.g., IF rain > 180 && temp > 22 THEN rice)
4. WHEN a crop name from the ML model does not map to known constants, THE Engine SHALL apply the crop_mapping dictionary to normalize it
5. IF normalized crop name is still unknown, THE Engine SHALL skip the crop and continue with next candidate
6. WHEN an API timeout occurs, THE Price Fetcher SHALL log the error with timestamp, commodity name, and retry count
7. THE Cache Manager SHALL NOT cache failed API responses (status != 200) to avoid serving stale error states
8. IF retraining job fails, THE Scheduler SHALL log the failure and schedule a retry within 24 hours
9. IF validation accuracy during retraining is < 85%, THE system SHALL retain the previous model version and log a rollback event

### Requirement 7: Logging & Monitoring

**User Story:** As a data engineer, I want detailed logs of model retraining, price caching, and recommendation ranking so that I can debug issues and monitor system health.

#### Acceptance Criteria

1. THE Retrainer SHALL log the following at each retraining cycle:
   - Start timestamp, end timestamp, total training duration
   - Number of historical records retrieved, filtered, and used
   - Training/validation split counts
   - Model accuracy on validation set
   - Hyperparameters used
   - File paths of saved model and encoder

2. THE Price Fetcher SHALL log:
   - Cache hit/miss for each commodity query (state, district, commodity)
   - Mandi API request/response details (URL, status code, modal_price)
   - Fallback price usage events
   - Normalization mappings applied

3. THE Recommendation Engine SHALL log:
   - ML prediction probabilities for top 5 crops
   - Profitability score calculations (yield × price − cost)
   - Ranking order (final top 3)
   - Processing time (milliseconds)

4. ALL logs SHALL include structured fields: `timestamp`, `level` (INFO, WARN, ERROR), `module`, `function`, `message`, and optional `data` (dict)
5. Logs SHALL be written to a rotating file (e.g., logs/app.log) with max size 100MB and retention of 10 files

---

## Integration Points

### Backend Integration
- **Existing Route:** `POST /recommendation` (app/routes/recommendation.py)
  - Shall be enhanced to incorporate profitability scoring and mandi price caching
  - Shall continue to accept sensor-based or manual input (N, P, K, temperature, humidity, pH, rainfall, state, district, season)

- **New Scheduler Component:** `app/services/ml_retrainer.py`
  - Shall execute scheduled retraining jobs
  - Shall interface with Recommendations table for historical data
  - Shall save models to `backend/data/`

- **New Cache Component:** `app/services/mandi_price_cache.py`
  - Shall manage price cache with configurable TTL
  - Shall interface with data.gov.in API
  - Shall provide price lookup by (state, district, commodity)

### Frontend Integration
- **Enhanced Component:** `frontend/components/cards/CropRecommendationCard.tsx`
  - Shall render extended CropPrediction data structure
  - Shall display profitability metrics, biotech traits, and water requirements
  - Shall apply conditional styling based on profit thresholds

### Database Integration (Future)
- **New Table:** `recommendation_history` (state, district, crop_grown, yield_achieved, market_price, farmer_feedback, created_at)
  - Used as source for retraining data
  - Populated by farmer feedback or yield sensor readings

---

## Non-Functional Requirements

1. **Performance:** Cache lookup latency < 50ms; Recommendation API response time < 2 seconds (including Mandi price fetch)
2. **Availability:** System shall degrade gracefully when Mandi API is unavailable; fallback mode shall return recommendations within 1 second
3. **Scalability:** Mandi price cache shall support up to 10,000 concurrent price queries per hour
4. **Data Consistency:** Model retraining shall not affect live recommendation requests; new model shall be swapped atomically
5. **Retention:** Price cache TTL shall be 24–48 hours (configurable); historical recommendation logs retained for 2 years

