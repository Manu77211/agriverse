-- ============================================================
-- KRISHI SAKHI — Database Schema
-- PostgreSQL (Supabase)
-- Version: 1.0.0
-- Created: 2026-02-27
-- ============================================================
-- 
-- TABLES:
--   1. profiles        — Extended user data (linked to Supabase Auth)
--   2. farms           — Farm details, location, linked Pi device
--   3. sensor_data     — Raw sensor readings from Raspberry Pi
--   4. derived_metrics — Computed stress indices, disease risk, etc.
--   5. crop_varieties  — Biotech variety lookup table (ICAR data)
--   6. market_prices   — Historical mandi price data
--   7. recommendation_log — Every recommendation saved for tracking
--
-- ROW LEVEL SECURITY:
--   - Farmers can only access their own farms, sensor data, metrics, recommendations
--   - Market prices and crop varieties are publicly readable
--   - Device-authenticated writes for sensor_data
--
-- EXECUTION ORDER:
--   Run this file top-to-bottom in Supabase SQL Editor.
--   Supabase Auth (auth.users) must already exist (it does by default).
-- ============================================================


-- ============================================================
-- 1. PROFILES
-- ============================================================
-- Extends Supabase Auth user with app-specific fields.
-- Linked to auth.users via id (UUID).
-- 'role' determines access level: farmer (default), admin, investor.
-- 'language' stores preferred UI language for i18n.
-- ============================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'admin', 'investor')),
    language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'hi', 'ta', 'te', 'kn', 'mr', 'pa', 'bn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: fires after every new auth.users row
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. FARMS
-- ============================================================
-- Each user (farmer) can have multiple farms.
-- 'device_id' is the unique identifier for the Raspberry Pi unit.
-- 'device_secret' is a hashed token the Pi uses to authenticate sensor uploads.
-- 'last_crop' stores what was planted last season (for crop rotation logic).
-- ============================================================

CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_acres DOUBLE PRECISION CHECK (area_acres > 0 AND area_acres <= 10000),
    soil_type TEXT,
    device_id TEXT UNIQUE,
    device_secret TEXT,
    last_crop TEXT,
    last_crop_season TEXT CHECK (last_crop_season IN ('Kharif', 'Rabi', 'Zaid')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_farms_owner ON farms(owner_id);
CREATE INDEX idx_farms_device ON farms(device_id);


-- ============================================================
-- 3. SENSOR_DATA
-- ============================================================
-- Raw readings from Raspberry Pi, received via POST /sensor/upload.
-- One row per reading (every 5 minutes per farm).
-- 
-- Value ranges (for validation):
--   soil_moisture:  0 - 100    (percentage)
--   soil_temp:     -10 - 60    (°C)
--   soil_ec:        0 - 20     (dS/m, electrical conductivity)
--   air_temp:      -10 - 60    (°C)
--   humidity:       0 - 100    (percentage)
--   leaf_wetness:   0 - 1      (scale, 0=dry, 1=fully wet)
--   battery_level:  0 - 100    (percentage, Pi power status)
--
-- 'is_valid' is set to FALSE if the sensor_service detects anomalies
-- (e.g., soil_moisture = -5, which is physically impossible).
-- ============================================================

CREATE TABLE IF NOT EXISTS sensor_data (
    id BIGSERIAL PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soil_moisture DOUBLE PRECISION CHECK (soil_moisture >= 0 AND soil_moisture <= 100),
    soil_temp DOUBLE PRECISION CHECK (soil_temp >= -10 AND soil_temp <= 60),
    soil_ec DOUBLE PRECISION CHECK (soil_ec >= 0 AND soil_ec <= 20),
    air_temp DOUBLE PRECISION CHECK (air_temp >= -10 AND air_temp <= 60),
    humidity DOUBLE PRECISION CHECK (humidity >= 0 AND humidity <= 100),
    leaf_wetness DOUBLE PRECISION CHECK (leaf_wetness >= 0 AND leaf_wetness <= 1),
    battery_level DOUBLE PRECISION CHECK (battery_level >= 0 AND battery_level <= 100),
    is_valid BOOLEAN NOT NULL DEFAULT TRUE
);

-- Primary query pattern: get latest readings for a farm
CREATE INDEX idx_sensor_farm_time ON sensor_data(farm_id, timestamp DESC);
-- For batch analysis: get all readings in a date range
CREATE INDEX idx_sensor_timestamp ON sensor_data(timestamp DESC);


-- ============================================================
-- 4. DERIVED_METRICS
-- ============================================================
-- Computed by feature_engineering.py after each sensor reading.
-- Links back to the raw sensor_data row via sensor_data_id.
--
-- Indices (all 0-100 scale):
--   stress_index:          Combined soil stress score
--                          Formula: weighted(moisture_deficit, pH_deviation, temp_stress)
--   water_deficit_score:   How much water the crop is lacking
--                          Formula: (ETc - effective_rainfall) / ETc × 100
--   salinity_risk:         Risk from high electrical conductivity
--                          Formula: (EC_measured / EC_threshold) × 100
--   disease_probability:   Fungal disease risk
--                          Formula: Tom-Cast model (leaf_wetness_hours × temp × humidity)
--   crop_suitability:      How suitable conditions are for current/recommended crop
--                          Formula: composite of all above factors
-- ============================================================

CREATE TABLE IF NOT EXISTS derived_metrics (
    id BIGSERIAL PRIMARY KEY,
    sensor_data_id BIGINT NOT NULL REFERENCES sensor_data(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stress_index DOUBLE PRECISION CHECK (stress_index >= 0 AND stress_index <= 100),
    water_deficit_score DOUBLE PRECISION CHECK (water_deficit_score >= 0 AND water_deficit_score <= 100),
    salinity_risk DOUBLE PRECISION CHECK (salinity_risk >= 0 AND salinity_risk <= 100),
    disease_probability DOUBLE PRECISION CHECK (disease_probability >= 0 AND disease_probability <= 100),
    crop_suitability DOUBLE PRECISION CHECK (crop_suitability >= 0 AND crop_suitability <= 100)
);

CREATE INDEX idx_metrics_farm_time ON derived_metrics(farm_id, timestamp DESC);
CREATE INDEX idx_metrics_sensor ON derived_metrics(sensor_data_id);


-- ============================================================
-- 5. CROP_VARIETIES
-- ============================================================
-- Biotech variety lookup table. Compiled from ICAR catalogs.
-- NOT ML — this is a filtering/matching table.
--
-- Flow:
--   1. XGBoost predicts "Rice" as best crop
--   2. Query this table: WHERE crop_name='Rice' AND 'Bihar' = ANY(suitable_states)
--   3. Filter by tolerance levels based on derived_metrics
--   4. Return best variety: "Swarna Sub-1 (Flood-tolerant)"
--
-- tolerance values: 'Low', 'Medium', 'High'
-- suitable_states: PostgreSQL TEXT array, e.g., {'Bihar','Odisha','West Bengal'}
-- suitable_seasons: TEXT array, e.g., {'Kharif','Rabi'}
-- ============================================================

CREATE TABLE IF NOT EXISTS crop_varieties (
    id SERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    variety_name TEXT NOT NULL,
    source TEXT,                                -- e.g., 'ICAR', 'SAU', 'KVK'
    drought_tolerance TEXT CHECK (drought_tolerance IN ('Low', 'Medium', 'High')),
    salinity_tolerance TEXT CHECK (salinity_tolerance IN ('Low', 'Medium', 'High')),
    disease_resistance TEXT CHECK (disease_resistance IN ('Low', 'Medium', 'High')),
    flood_tolerance TEXT CHECK (flood_tolerance IN ('Low', 'Medium', 'High')),
    yield_potential TEXT CHECK (yield_potential IN ('Low', 'Medium', 'High')),
    growth_duration_days INT CHECK (growth_duration_days > 0 AND growth_duration_days <= 730),
    water_requirement TEXT CHECK (water_requirement IN ('Low', 'Medium', 'High')),
    suitable_states TEXT[] NOT NULL DEFAULT '{}',
    suitable_seasons TEXT[] NOT NULL DEFAULT '{}',
    min_temp DOUBLE PRECISION,
    max_temp DOUBLE PRECISION,
    optimal_ph_min DOUBLE PRECISION,
    optimal_ph_max DOUBLE PRECISION,
    traits TEXT[],                              -- e.g., {'Pest-resistant', 'High yield'}
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_varieties_crop ON crop_varieties(crop_name);
CREATE INDEX idx_varieties_states ON crop_varieties USING GIN(suitable_states);
CREATE INDEX idx_varieties_seasons ON crop_varieties USING GIN(suitable_seasons);


-- ============================================================
-- 6. MARKET_PRICES
-- ============================================================
-- Historical mandi price data. Source: data.gov.in + Agmarknet scraper.
-- One row per crop per mandi per date.
--
-- Prices are in ₹/quintal (standard Indian agricultural unit).
--   min_price:   Lowest price observed that day
--   max_price:   Highest price observed that day
--   modal_price: Most frequently traded price (best estimate of "actual" price)
--
-- Used by Facebook Prophet to train per-crop price forecasting models.
-- ============================================================

CREATE TABLE IF NOT EXISTS market_prices (
    id BIGSERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    variety TEXT,
    mandi_name TEXT,
    state TEXT,
    district TEXT,
    date DATE NOT NULL,
    min_price DOUBLE PRECISION CHECK (min_price >= 0),
    max_price DOUBLE PRECISION CHECK (max_price >= 0),
    modal_price DOUBLE PRECISION CHECK (modal_price >= 0),
    price_unit TEXT NOT NULL DEFAULT 'INR/Quintal',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_crop_date ON market_prices(crop_name, date DESC);
CREATE INDEX idx_market_state ON market_prices(state, crop_name);
CREATE INDEX idx_market_date ON market_prices(date DESC);

-- Prevent duplicate entries for same crop+mandi+date
CREATE UNIQUE INDEX idx_market_unique ON market_prices(crop_name, mandi_name, date)
    WHERE mandi_name IS NOT NULL;


-- ============================================================
-- 7. RECOMMENDATION_LOG
-- ============================================================
-- Every recommendation saved. Critical for:
--   1. Tracking accuracy over time (did the prediction hold?)
--   2. Showing farmer their history
--   3. Training better models from real-world outcomes
--   4. Investor metrics: "We've made X recommendations across Y farms"
--
-- 'full_response' stores the complete decision engine JSON output.
-- 'sensor_snapshot' stores the sensor values at recommendation time.
-- 'model_version' tracks which model version made this prediction.
-- 'actual_outcome' is filled later when harvest data is available.
-- ============================================================

CREATE TABLE IF NOT EXISTS recommendation_log (
    id BIGSERIAL PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recommended_crop TEXT NOT NULL,
    recommended_variety TEXT,
    confidence_score DOUBLE PRECISION CHECK (confidence_score >= 0 AND confidence_score <= 1),
    disease_risk DOUBLE PRECISION,
    expected_price DOUBLE PRECISION,
    profitability_score DOUBLE PRECISION,
    irrigation_advisory TEXT,
    full_response JSONB,
    sensor_snapshot JSONB,
    model_version TEXT,
    -- Outcome tracking (filled post-harvest)
    actual_crop_planted TEXT,
    actual_yield DOUBLE PRECISION,
    actual_price_received DOUBLE PRECISION,
    farmer_feedback TEXT,
    outcome_recorded_at TIMESTAMPTZ
);

CREATE INDEX idx_rec_farm_time ON recommendation_log(farm_id, timestamp DESC);
CREATE INDEX idx_rec_crop ON recommendation_log(recommended_crop);
CREATE INDEX idx_rec_full_response ON recommendation_log USING GIN(full_response);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Ensures Farmer A cannot see Farmer B's data.
-- Supabase Auth provides auth.uid() — the logged-in user's UUID.
-- ============================================================

-- PROFILES: Users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- FARMS: Users can only CRUD their own farms
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own farms"
    ON farms FOR SELECT
    USING (owner_id = auth.uid());

CREATE POLICY "Users can create own farms"
    ON farms FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update own farms"
    ON farms FOR UPDATE
    USING (owner_id = auth.uid());

CREATE POLICY "Users can delete own farms"
    ON farms FOR DELETE
    USING (owner_id = auth.uid());

-- SENSOR_DATA: Users can only see data from their own farms
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sensor data"
    ON sensor_data FOR SELECT
    USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

-- Sensor uploads use service_role key (Pi authentication), not user JWT
-- So we need a separate policy for inserts via API
CREATE POLICY "Service can insert sensor data"
    ON sensor_data FOR INSERT
    WITH CHECK (TRUE);  -- Backend validates device_secret before inserting

-- DERIVED_METRICS: Users can only see metrics from their own farms
ALTER TABLE derived_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own derived metrics"
    ON derived_metrics FOR SELECT
    USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

CREATE POLICY "Service can insert derived metrics"
    ON derived_metrics FOR INSERT
    WITH CHECK (TRUE);  -- Backend computes and inserts

-- CROP_VARIETIES: Public read access (everyone can see variety data)
ALTER TABLE crop_varieties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crop varieties"
    ON crop_varieties FOR SELECT
    USING (TRUE);

-- Only admins can modify variety data (via Supabase dashboard or admin API)
CREATE POLICY "Admins can modify crop varieties"
    ON crop_varieties FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- MARKET_PRICES: Public read access (everyone can see prices)
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read market prices"
    ON market_prices FOR SELECT
    USING (TRUE);

CREATE POLICY "Service can insert market prices"
    ON market_prices FOR INSERT
    WITH CHECK (TRUE);  -- Backend scraper inserts prices

-- RECOMMENDATION_LOG: Users can only see their own recommendations
ALTER TABLE recommendation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
    ON recommendation_log FOR SELECT
    USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

CREATE POLICY "Service can insert recommendations"
    ON recommendation_log FOR INSERT
    WITH CHECK (TRUE);  -- Backend inserts after generating recommendation


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-update 'updated_at' timestamp on profiles and farms
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER farms_updated_at
    BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- SEED DATA: Initial Crop Varieties (from ICAR)
-- ============================================================
-- This is starter data. More varieties added via admin panel or CSV import.
-- ============================================================

INSERT INTO crop_varieties (crop_name, variety_name, source, drought_tolerance, salinity_tolerance, disease_resistance, flood_tolerance, yield_potential, growth_duration_days, water_requirement, suitable_states, suitable_seasons, min_temp, max_temp, optimal_ph_min, optimal_ph_max, traits) VALUES
-- Rice varieties
('Rice', 'Swarna Sub-1', 'ICAR', 'Low', 'Medium', 'Medium', 'High', 'High', 120, 'High', ARRAY['Bihar','Odisha','West Bengal','Jharkhand','Assam'], ARRAY['Kharif'], 20, 37, 5.5, 7.5, ARRAY['Submergence-tolerant','High yield','14 days underwater survival']),
('Rice', 'Pusa Basmati 1121', 'ICAR-IARI', 'Low', 'Low', 'Medium', 'Low', 'High', 135, 'High', ARRAY['Punjab','Haryana','Uttar Pradesh','Uttarakhand'], ARRAY['Kharif'], 20, 35, 6.0, 7.5, ARRAY['Premium quality','Long grain','Export grade']),
('Rice', 'IR-64 Drt', 'IRRI', 'High', 'Medium', 'Medium', 'Low', 'Medium', 110, 'Medium', ARRAY['Tamil Nadu','Andhra Pradesh','Karnataka','Telangana'], ARRAY['Kharif','Rabi'], 22, 38, 5.5, 7.0, ARRAY['Drought-tolerant','Water-efficient','Stable yield']),
('Rice', 'Sahbhagi Dhan', 'ICAR', 'High', 'Low', 'Medium', 'Low', 'Medium', 105, 'Low', ARRAY['Jharkhand','Chhattisgarh','Odisha','Madhya Pradesh'], ARRAY['Kharif'], 20, 38, 5.0, 7.5, ARRAY['Drought-tolerant','Rain-fed areas','Low input']),

-- Wheat varieties
('Wheat', 'HD-3086', 'ICAR-IARI', 'Medium', 'Low', 'High', 'Low', 'High', 130, 'Medium', ARRAY['Punjab','Haryana','Uttar Pradesh','Rajasthan','Madhya Pradesh'], ARRAY['Rabi'], 10, 25, 6.0, 8.0, ARRAY['High yield','Rust-resistant','Bread wheat']),
('Wheat', 'DBW-187', 'ICAR', 'High', 'Medium', 'Medium', 'Low', 'Medium', 120, 'Low', ARRAY['Rajasthan','Madhya Pradesh','Gujarat','Maharashtra'], ARRAY['Rabi'], 12, 30, 6.5, 8.5, ARRAY['Heat-tolerant','Early maturing','Restricted irrigation']),
('Wheat', 'PBW-725', 'PAU', 'Medium', 'Low', 'High', 'Low', 'High', 135, 'Medium', ARRAY['Punjab','Haryana'], ARRAY['Rabi'], 8, 22, 6.5, 7.5, ARRAY['Rust-resistant','High protein','Bold grain']),

-- Cotton varieties
('Cotton', 'BT Cotton Bollgard II', 'Mahyco-Monsanto', 'Medium', 'Low', 'High', 'Low', 'High', 180, 'Medium', ARRAY['Maharashtra','Gujarat','Telangana','Andhra Pradesh','Madhya Pradesh','Rajasthan'], ARRAY['Kharif'], 25, 40, 6.0, 8.0, ARRAY['Pest-resistant','Bollworm-resistant','High yield']),
('Cotton', 'Hybrid DCH-32', 'UAS Dharwad', 'High', 'Low', 'Medium', 'Low', 'Medium', 170, 'Medium', ARRAY['Punjab','Haryana','Rajasthan'], ARRAY['Kharif'], 25, 42, 6.5, 8.0, ARRAY['Drought-tolerant','Long staple','Export quality']),

-- Maize varieties
('Maize', 'DHM-117', 'ICAR', 'Low', 'Low', 'High', 'Low', 'High', 90, 'Medium', ARRAY['Karnataka','Andhra Pradesh','Telangana','Tamil Nadu'], ARRAY['Kharif','Rabi'], 20, 35, 5.5, 7.5, ARRAY['Hybrid','High yield','Disease-resistant']),
('Maize', 'NK-6240', 'Syngenta', 'High', 'Medium', 'Medium', 'Low', 'Medium', 95, 'Low', ARRAY['Rajasthan','Madhya Pradesh','Gujarat','Maharashtra'], ARRAY['Kharif'], 22, 40, 6.0, 8.0, ARRAY['Drought-tolerant','Heat-tolerant','Water-efficient']),

-- Soybean varieties
('Soybean', 'JS-335', 'JNKVV', 'Medium', 'Low', 'High', 'Low', 'High', 100, 'Low', ARRAY['Madhya Pradesh','Maharashtra','Rajasthan'], ARRAY['Kharif'], 20, 35, 6.0, 7.5, ARRAY['High yield','Disease-resistant','Bold seed']),

-- Sugarcane varieties
('Sugarcane', 'Co-0238', 'IISR', 'Low', 'Medium', 'High', 'Low', 'High', 365, 'High', ARRAY['Uttar Pradesh','Maharashtra','Karnataka','Tamil Nadu'], ARRAY['Kharif'], 20, 40, 6.0, 8.0, ARRAY['High sucrose','Disease-resistant','High tonnage']),

-- Lentil varieties
('Lentil', 'Pusa Vaibhav', 'ICAR-IARI', 'Medium', 'Low', 'High', 'Low', 'High', 120, 'Low', ARRAY['Uttar Pradesh','Madhya Pradesh','Bihar','Rajasthan'], ARRAY['Rabi'], 10, 28, 6.0, 8.0, ARRAY['High yield','Wilt-resistant','Bold grain']),

-- Chickpea varieties
('Chickpea', 'Pusa 362', 'ICAR-IARI', 'Medium', 'Low', 'High', 'Low', 'High', 120, 'Low', ARRAY['Madhya Pradesh','Maharashtra','Rajasthan','Karnataka'], ARRAY['Rabi'], 10, 30, 6.0, 8.0, ARRAY['Wilt-resistant','High yield','Desi type']),
('Chickpea', 'JG-11', 'JNKVV', 'High', 'Low', 'Medium', 'Low', 'Medium', 110, 'Low', ARRAY['Rajasthan','Karnataka','Andhra Pradesh','Telangana'], ARRAY['Rabi'], 12, 32, 6.5, 8.5, ARRAY['Kabuli type','Premium quality','Export grade']),

-- Mustard varieties
('Mustard', 'Pusa Bold', 'ICAR-IARI', 'Medium', 'Low', 'Medium', 'Low', 'High', 100, 'Low', ARRAY['Rajasthan','Haryana','Uttar Pradesh','Madhya Pradesh'], ARRAY['Rabi'], 10, 25, 6.0, 8.0, ARRAY['High oil content','Early maturing','Bold seed']),

-- Groundnut varieties
('Groundnut', 'TAG-24', 'BARC', 'High', 'Medium', 'Medium', 'Low', 'Medium', 110, 'Low', ARRAY['Gujarat','Rajasthan','Andhra Pradesh','Tamil Nadu'], ARRAY['Kharif'], 22, 38, 6.0, 7.5, ARRAY['Drought-tolerant','High oil content','Bunch type']),

-- Bajra (Pearl Millet) varieties
('Bajra', 'HHB-67 Improved', 'HAU', 'High', 'High', 'Medium', 'Low', 'High', 75, 'Low', ARRAY['Rajasthan','Haryana','Gujarat','Maharashtra','Karnataka'], ARRAY['Kharif'], 25, 42, 6.5, 8.5, ARRAY['Drought-tolerant','Salinity-tolerant','Short duration','Millet']),

-- Jowar (Sorghum) varieties
('Jowar', 'CSH-16', 'ICAR', 'High', 'Medium', 'Medium', 'Low', 'High', 90, 'Low', ARRAY['Maharashtra','Karnataka','Telangana','Rajasthan'], ARRAY['Kharif','Rabi'], 22, 40, 6.0, 8.5, ARRAY['Drought-tolerant','Dual purpose','Grain+Fodder'])

ON CONFLICT DO NOTHING;


-- ============================================================
-- DONE
-- ============================================================
-- To verify: SELECT COUNT(*) FROM crop_varieties;
-- Expected: 20 rows of seed data
-- ============================================================
