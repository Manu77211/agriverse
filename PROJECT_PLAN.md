# KRISHI SAKHI — Complete Project Plan & Architecture Reference

> **Created:** February 27, 2026  
> **Status:** Active Development  
> **Owner:** Manu.S  
> **Repository:** agriverse  

---

## TABLE OF CONTENTS

1. [Current State Audit](#1-current-state-audit)
2. [Target Architecture](#2-target-architecture)
3. [Tech Stack](#3-tech-stack)
4. [Folder Structure](#4-folder-structure)
5. [Database Schema](#5-database-schema)
6. [Phase-by-Phase Task List](#6-phase-by-phase-task-list)
7. [Key Technical Decisions](#7-key-technical-decisions)
8. [Data Sources & Datasets](#8-data-sources--datasets)
9. [Hardware Integration (Raspberry Pi)](#9-hardware-integration-raspberry-pi)
10. [Multi-Language Strategy](#10-multi-language-strategy)
11. [Revenue Model](#11-revenue-model)
12. [IP Protection](#12-ip-protection)
13. [Hosting & Deployment](#13-hosting--deployment)
14. [Anti-Patterns Found in Current Code](#14-anti-patterns-found-in-current-code)

---

## 1. CURRENT STATE AUDIT

### What EXISTS today:

| Layer | Status | Details |
|-------|--------|---------|
| **Frontend** | ✅ Solid | Next.js 15, TypeScript, Tailwind, Framer Motion, 8+ animated components |
| **API Routes** | ⚠️ Basic | Only 2 endpoints: `/api/analyze` (POST) and `/api/health` (GET) |
| **Agent 1** (Data Collector) | ✅ Working | OpenWeather API live, soil data is **mock** (AgriStack needs govt approval) |
| **Agent 2** (Crop Analyzer) | ✅ Working | Google Gemini 2.5-flash, biotech varieties DB hardcoded, returns top 5 crops |
| **Agent 3** (Market Optimizer) | ⚠️ Partial | **Mock market prices only**, profitability formula is basic (revenue - cost) |
| **Database** | ❌ Not Active | Supabase client exists but **no tables created**, auth helpers unused |
| **ML Models** | ❌ None | Zero trained models. All "intelligence" comes from Gemini prompts |
| **Sensor Integration** | ❌ None | No IoT data ingestion at all |
| **Feature Engineering** | ❌ None | No derived metrics computed |
| **Market Forecasting** | ❌ None | No time-series analysis, no ARIMA/LSTM/Prophet |
| **Decision Engine** | ❌ None | No multi-factor scoring system |

### Current Files That Matter:

```
lib/agents/agent1DataCollector.ts  → Weather API (OpenWeather) + Mock soil data
lib/agents/agent2CropAnalyzer.ts   → Gemini AI crop analysis + hardcoded biotech varieties
lib/agents/agent3MarketOptimizer.ts → Mock market prices + basic profit calculation
app/api/analyze/route.ts            → Orchestrates all 3 agents (business logic IN route - bad)
app/api/health/route.ts             → Simple health check
utils/types.ts                      → TypeScript interfaces
utils/constants.ts                  → District DB (700+), crop lists, mock data
supabase/client.ts                  → Supabase connection + auth helpers (unused)
.env.example                        → Outdated (references OPENAI_API_KEY, code uses GEMINI_API_KEY)
```

---

## 2. TARGET ARCHITECTURE

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│         Next.js 15 (Keep existing)                   │
│   Landing | Dashboard | Analysis | Risk Dashboard    │
│   Sensor Dashboard | Market Charts | Profile         │
│         ↕ REST API calls ↕                           │
├─────────────────────────────────────────────────────┤
│                   BACKEND (NEW)                      │
│              Python FastAPI Server                   │
│                                                     │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ Sensor   │ │   Feature    │ │   Decision   │   │
│  │ Ingestion│→│ Engineering  │→│   Engine     │   │
│  └──────────┘ └──────────────┘ └──────────────┘   │
│                                                     │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Crop    │ │   Market     │ │  Simulation  │   │
│  │  Model   │ │  Forecasting │ │   Engine     │   │
│  │(XGBoost) │ │  (Prophet)   │ │              │   │
│  └──────────┘ └──────────────┘ └──────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                  DATABASE                            │
│           PostgreSQL (Supabase)                      │
│  Users | Farms | SensorData | DerivedMetrics |      │
│  CropVarieties | MarketPrices | RecommendationLog   │
└─────────────────────────────────────────────────────┘
│                                                     │
│               HARDWARE LAYER                        │
│  Raspberry Pi → Sensors → HTTP POST to Backend      │
└─────────────────────────────────────────────────────┘
```

### Why Python Backend Separate from Next.js?

- XGBoost, Prophet, ARIMA, scikit-learn, pandas — all Python libraries
- Running ML models in Next.js serverless functions is unreliable and slow
- Python FastAPI gives proper ML pipeline support
- Frontend stays as pure UI layer (what it should be)
- Both deploy independently — frontend on Vercel, backend on Railway

---

## 3. TECH STACK

```
FRONTEND (KEEP EXISTING)
├── Next.js 15 (TypeScript)
├── Tailwind CSS
├── Framer Motion (animations)
├── Recharts (data visualization)
└── Deployed on Vercel

BACKEND (BUILD NEW)
├── Python 3.11+
├── FastAPI (REST API framework)
├── Pydantic (data validation)
├── Uvicorn (ASGI server)
└── Deployed on Railway/Render

AI / ML
├── scikit-learn (preprocessing)
├── XGBoost (crop recommendation model)
├── Facebook Prophet (market price forecasting)
├── pandas + numpy (data processing)
├── joblib (model serialization .pkl files)
└── Google Gemini AI (supplementary analysis — NOT primary)

DATABASE
├── PostgreSQL (via Supabase)
├── Row Level Security (multi-tenant)
└── Supabase Auth (JWT tokens)

IoT / HARDWARE
├── Raspberry Pi 4 (2GB sufficient)
├── Python script (sensor reader)
├── HTTP POST to cloud API
├── 4G dongle for internet
└── Sensors: soil moisture, EC, temp, DHT22, leaf wetness

DEVOPS
├── GitHub (version control)
├── Docker (containerization)
├── GitHub Actions (CI/CD) — optional
└── Vercel + Railway (hosting)

EXTERNAL APIs
├── OpenWeather API (real-time weather data)
├── Google Gemini AI (supplementary crop analysis)
└── Agmarknet (historical mandi prices — scraped)
```

---

## 4. FOLDER STRUCTURE

```
agriverse/
├── PROJECT_PLAN.md              ← THIS FILE (reference)
│
├── frontend/                    ← MOVE existing Next.js code here
│   ├── app/
│   │   ├── api/                 ← Keep existing, gradually replace with Python backend
│   │   ├── dashboard/
│   │   ├── history/
│   │   ├── profile/
│   │   ├── risk-dashboard/      ← NEW
│   │   ├── sensor-dashboard/    ← NEW
│   │   ├── market-forecast/     ← NEW
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── cards/
│   │   ├── charts/
│   │   ├── effects/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── ui/
│   ├── lib/
│   │   └── agents/             ← Keep for reference, frontend will call Python backend instead
│   ├── utils/
│   ├── locales/                ← NEW (multi-language JSON files)
│   │   ├── en.json
│   │   ├── hi.json
│   │   ├── ta.json
│   │   ├── te.json
│   │   ├── kn.json
│   │   ├── mr.json
│   │   ├── pa.json
│   │   └── bn.json
│   ├── supabase/
│   ├── public/
│   ├── package.json
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                     ← NEW Python FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              ← FastAPI entry point
│   │   ├── config.py            ← Environment config
│   │   ├── database.py          ← Supabase/PostgreSQL connection
│   │   │
│   │   ├── routes/              ← API endpoints (thin controllers)
│   │   │   ├── __init__.py
│   │   │   ├── sensor.py        ← /sensor/upload, /sensor/health
│   │   │   ├── recommendation.py ← /recommendation
│   │   │   ├── forecast.py      ← /forecast
│   │   │   ├── simulate.py      ← /simulate
│   │   │   ├── farm.py          ← /farm CRUD
│   │   │   └── auth.py          ← /auth endpoints
│   │   │
│   │   ├── services/            ← Business logic (CORE — no logic in routes)
│   │   │   ├── __init__.py
│   │   │   ├── sensor_service.py
│   │   │   ├── feature_engineering.py
│   │   │   ├── crop_model.py
│   │   │   ├── market_forecast.py
│   │   │   ├── decision_engine.py
│   │   │   ├── rotation_engine.py
│   │   │   └── simulation_engine.py
│   │   │
│   │   ├── models/              ← Trained ML model files
│   │   │   ├── crop_xgboost.pkl
│   │   │   ├── market_prophet/
│   │   │   │   ├── rice_model.pkl
│   │   │   │   ├── wheat_model.pkl
│   │   │   │   └── ...
│   │   │   └── training/
│   │   │       ├── train_crop_model.py
│   │   │       └── train_market_model.py
│   │   │
│   │   ├── schemas/             ← Pydantic validation models
│   │   │   ├── __init__.py
│   │   │   ├── sensor.py
│   │   │   ├── recommendation.py
│   │   │   ├── forecast.py
│   │   │   └── farm.py
│   │   │
│   │   ├── middleware/          ← Error handling, logging
│   │   │   ├── __init__.py
│   │   │   ├── error_handler.py
│   │   │   └── logger.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── constants.py     ← Crop data, biotech varieties, etc.
│   │       └── helpers.py
│   │
│   ├── data/                    ← Datasets for training
│   │   ├── crop_recommendation.csv
│   │   ├── mandi_prices/
│   │   └── biotech_varieties.json
│   │
│   ├── tests/
│   │   ├── test_sensor_service.py
│   │   ├── test_feature_engineering.py
│   │   ├── test_crop_model.py
│   │   ├── test_market_forecast.py
│   │   ├── test_decision_engine.py
│   │   └── test_api.py
│   │
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── hardware/                    ← Raspberry Pi code
│   ├── sensor_reader.py         ← Main script (runs on Pi)
│   ├── local_buffer.py          ← SQLite buffer for offline mode
│   ├── config.py                ← Pi configuration
│   └── requirements.txt
│
├── database/
│   └── schema.sql               ← Full relational schema (source of truth)
│
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 5. DATABASE SCHEMA

### Tables:

```sql
-- 1. Users (managed by Supabase Auth, extended with profiles)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'farmer',  -- farmer | admin | investor
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Farms
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(id),
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area_acres DOUBLE PRECISION,
    device_id TEXT UNIQUE,         -- Pi device identifier
    device_secret TEXT,            -- Pi authentication key
    last_crop TEXT,                -- For crop rotation logic
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SensorData (from Raspberry Pi)
CREATE TABLE sensor_data (
    id BIGSERIAL PRIMARY KEY,
    farm_id UUID REFERENCES farms(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    soil_moisture DOUBLE PRECISION,    -- % (0-100)
    soil_temp DOUBLE PRECISION,        -- °C
    soil_ec DOUBLE PRECISION,          -- dS/m (electrical conductivity)
    air_temp DOUBLE PRECISION,         -- °C
    humidity DOUBLE PRECISION,         -- % (0-100)
    leaf_wetness DOUBLE PRECISION,     -- 0-1 scale
    battery_level DOUBLE PRECISION,    -- % (Pi power status)
    is_valid BOOLEAN DEFAULT TRUE      -- Anomaly flag
);

-- 4. DerivedMetrics (computed by feature_engineering.py)
CREATE TABLE derived_metrics (
    id BIGSERIAL PRIMARY KEY,
    sensor_data_id BIGINT REFERENCES sensor_data(id),
    farm_id UUID REFERENCES farms(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    stress_index DOUBLE PRECISION,         -- 0-100
    water_deficit_score DOUBLE PRECISION,  -- 0-100
    salinity_risk DOUBLE PRECISION,        -- 0-100
    disease_probability DOUBLE PRECISION,  -- 0-100
    crop_suitability_score DOUBLE PRECISION -- 0-100
);

-- 5. CropVarieties (biotech lookup table)
CREATE TABLE crop_varieties (
    id SERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    variety_name TEXT NOT NULL,
    source TEXT,                        -- ICAR, SAU, etc.
    drought_tolerance TEXT,             -- Low | Medium | High
    salinity_tolerance TEXT,
    disease_resistance TEXT,
    flood_tolerance TEXT,
    yield_potential TEXT,               -- Low | Medium | High
    growth_duration_days INT,
    water_requirement TEXT,             -- Low | Medium | High
    suitable_states TEXT[],             -- Array of state names
    suitable_seasons TEXT[],            -- Kharif | Rabi | Zaid
    min_temp DOUBLE PRECISION,
    max_temp DOUBLE PRECISION,
    optimal_ph_min DOUBLE PRECISION,
    optimal_ph_max DOUBLE PRECISION
);

-- 6. MarketPrices (historical mandi data)
CREATE TABLE market_prices (
    id BIGSERIAL PRIMARY KEY,
    crop_name TEXT NOT NULL,
    variety TEXT,
    mandi_name TEXT,
    state TEXT,
    date DATE NOT NULL,
    min_price DOUBLE PRECISION,        -- ₹/quintal
    max_price DOUBLE PRECISION,
    modal_price DOUBLE PRECISION,      -- Most common price
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RecommendationLog (every recommendation saved)
CREATE TABLE recommendation_log (
    id BIGSERIAL PRIMARY KEY,
    farm_id UUID REFERENCES farms(id),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    recommended_crop TEXT,
    recommended_variety TEXT,
    confidence_score DOUBLE PRECISION,
    disease_risk DOUBLE PRECISION,
    expected_price DOUBLE PRECISION,
    profitability_score DOUBLE PRECISION,
    irrigation_advisory TEXT,
    full_response JSONB,               -- Complete decision engine output
    sensor_snapshot JSONB,             -- Sensor values at time of recommendation
    model_version TEXT                 -- Which model version was used
);

-- INDEXES for performance
CREATE INDEX idx_sensor_data_farm_time ON sensor_data(farm_id, timestamp DESC);
CREATE INDEX idx_derived_metrics_farm ON derived_metrics(farm_id, timestamp DESC);
CREATE INDEX idx_market_prices_crop_date ON market_prices(crop_name, date DESC);
CREATE INDEX idx_recommendation_farm ON recommendation_log(farm_id, timestamp DESC);
```

### Row Level Security (RLS):

```sql
-- Farmers can only see their own farms
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own farms" ON farms
    FOR ALL USING (owner_id = auth.uid());

-- Farmers can only see their own sensor data
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own sensor data" ON sensor_data
    FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

-- Same for derived metrics
ALTER TABLE derived_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own metrics" ON derived_metrics
    FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

-- Same for recommendation log
ALTER TABLE recommendation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own recommendations" ON recommendation_log
    FOR ALL USING (farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid()));

-- Market prices and crop varieties are PUBLIC (read-only for all)
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read market prices" ON market_prices FOR SELECT USING (true);

ALTER TABLE crop_varieties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read varieties" ON crop_varieties FOR SELECT USING (true);
```

---

## 6. PHASE-BY-PHASE TASK LIST

### PHASE 1 — Foundation
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 1 | Project Restructure | Move Next.js into `frontend/`, create `backend/` skeleton | ✅ |
| 2 | Database Schema Design | Write SQL for all 7 tables (see Section 5) | ✅ |
| 3 | Supabase Tables Setup | Execute SQL in Supabase, enable RLS policies | ✅ |
| 4 | Update LICENSE | Change to proprietary to protect IP | ✅ |

### PHASE 2 — Backend Skeleton
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 5 | Python Backend Setup | FastAPI project with routes/, services/, models/, schemas/, middleware/ | ✅ |
| 6 | Config + Logging + Error Middleware | .env handler, JSON logging, global error handler | ✅ |
| 7 | Pydantic Schemas | Validation classes for sensor data, recommendations, forecasts | ✅ |
| 8 | Database Connection Module | Python module to connect to Supabase PostgreSQL | ✅ |

### PHASE 3 — Sensor Pipeline
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 9 | Sensor Ingestion API | `POST /sensor/upload` receives JSON from Pi, validates, stores | ✅ |
| 10 | Sensor Service | Business logic — validates ranges, detects anomalies, stores data | ✅ |
| 11 | Sensor Health Check | `GET /sensor/health/{farm_id}` checks if Pi sent data in last 15 min | ✅ |

### PHASE 4 — Feature Engineering
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 12 | Feature Engineering Service | Raw sensor values → derived metrics (feature_engineering.py) | ⬜ |
| 13 | Stress Index Calculations | Soil Stress, Water Deficit, Salinity Risk, Crop Suitability (FAO formulas) | ⬜ |
| 14 | Disease Risk Model | Tom-Cast model: leaf_wetness + temp + humidity → disease probability | ⬜ |

### PHASE 5 — AI Crop Recommendation
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 15 | Download Crop Dataset | Kaggle Crop Recommendation (2200 rows: N,P,K,temp,humidity,pH,rain → crop) | ⬜ |
| 16 | Train XGBoost Model | Train and save as .pkl file. Replaces Gemini as PRIMARY predictor | ⬜ |
| 17 | Crop Model Service | crop_model.py — loads model, returns top crops with confidence | ⬜ |
| 18 | Biotech Variety Lookup | JSON table: crop + state + risk → recommended variety (from ICAR) | ⬜ |
| 19 | /recommendation Endpoint | `POST /recommendation` — full pipeline: sensor → features → ML → variety | ⬜ |

### PHASE 6 — Market Forecasting
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 20 | Collect Mandi Price Data | Download from data.gov.in + Agmarknet scraper (3-5 years daily) | ⬜ |
| 21 | Train Prophet Model | Per-crop Prophet model. Predicts price 6 months ahead | ⬜ |
| 22 | Market Forecast Service | market_forecast.py — loads models, predicts price + volatility | ⬜ |
| 23 | /forecast Endpoint | `GET /forecast/{crop}` — price at harvest, trend, best planting window | ⬜ |

### PHASE 7 — Intelligence Layer
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 24 | Decision Engine | Combines: crop suitability + risk + profitability → final recommendation | ⬜ |
| 25 | Crop Rotation Engine | Last crop → nutrient depletion logic → suggest next crop | ⬜ |
| 26 | Scenario Simulation | Compare multiple crops side-by-side for a farm | ⬜ |
| 27 | /simulate Endpoint | `POST /simulate` — ranked comparison table of crops | ⬜ |

### PHASE 8 — Frontend Upgrade
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 28 | Refactor Frontend API Calls | Change from `/api/analyze` to Python backend endpoints | ⬜ |
| 29 | Risk Dashboard Page | Weekly disease risk, soil stress trends, irrigation advisory | ⬜ |
| 30 | Sensor Live Dashboard | Real-time sensor values, last updated, 7/30-day charts | ⬜ |
| 31 | Market Forecast Charts | Interactive price prediction charts with planting window | ⬜ |
| 32 | Multi-Language Support | i18n: Hindi, Tamil, Telugu, Kannada, Marathi, Punjabi, Bengali | ⬜ |

### PHASE 9 — Multi-User & Security
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 33 | Multi-User Auth + RLS | Supabase Auth + JWT + Row Level Security | ⬜ |
| 34 | Farm Management | CRUD — register farms, link Pi device, manage multiple farms | ⬜ |
| 35 | Recommendation History | Save every recommendation, track accuracy over time | ⬜ |

### PHASE 10 — Hardware Integration
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 36 | Raspberry Pi Sensor Script | Reads 6 sensors, POSTs JSON every 5 min, runs on boot | ⬜ |
| 37 | Pi Auto-Recovery | SQLite buffer for offline, auto-restart, SMS alert if offline >1hr | ⬜ |

### PHASE 11 — Production Ready
| # | Task | What It Does | Status |
|---|------|-------------|--------|
| 38 | Unit Tests | pytest for each service module | ⬜ |
| 39 | API Integration Tests | Full flow: upload sensor → get recommendation | ⬜ |
| 40 | Docker + docker-compose | Containerize backend, one-command local run | ⬜ |
| 41 | Deploy Backend to Railway | Push Python backend to Railway.app, get live URL | ⬜ |
| 42 | Redeploy Frontend to Vercel | Frontend points to live Railway backend, final deploy | ⬜ |

---

## 7. KEY TECHNICAL DECISIONS

### Why XGBoost and not just Gemini AI?
- Gemini is an LLM — great for reasoning, bad for precise numerical prediction
- XGBoost is a trained ML model — deterministic, fast (<100ms), works offline
- Gemini becomes SUPPLEMENTARY (adds reasoning text), XGBoost is PRIMARY (makes the decision)
- Investors want to hear "trained ML model" not "we ask ChatGPT"

### Why stress indices are formulas, not ML?
- Soil Stress Index, Water Deficit, Salinity Risk — these are established agronomic science
- FAO (UN Food & Agriculture Org) publishes the formulas
- No dataset needed, no training needed — just code the formulas
- Disease Risk uses Tom-Cast model (published, peer-reviewed)

### Why separate frontend and backend?
- ML libraries (XGBoost, Prophet, pandas) only work in Python
- Next.js serverless functions have 10-second timeout on Vercel
- Independent deployment — update ML model without redeploying frontend
- Clean separation of concerns

### Why Supabase and not MongoDB?
- Relational data (sensor → farm → user) needs JOIN queries
- Row Level Security is built-in — critical for multi-tenant
- Auth is built-in — no extra service needed
- Free tier: 500MB, sufficient for MVP

### Why Facebook Prophet and not ARIMA/LSTM?
- Prophet handles Indian agricultural seasonality automatically (festivals, monsoon)
- Much simpler to implement than LSTM (which needs TensorFlow)
- Accurate enough for 6-month price forecasts
- Can upgrade to LSTM later if needed

### App works in 2 modes:
- **WITH Pi:** Automatic sensor data → real-time dashboard → recommendations
- **WITHOUT Pi:** Farmer manually enters data → still gets recommendations
- Pi failure does NOT break the product

---

## 8. DATA SOURCES & DATASETS

### For Crop Recommendation ML Model:
| Dataset | Source | Rows | Features |
|---------|--------|------|----------|
| Crop Recommendation | Kaggle (atharvaingle) | 2,200 | N, P, K, temp, humidity, pH, rainfall → crop |
| Crop Production India | Kaggle (abhinand05) | 246K | State, district, season, area, production |
| FAO Crop Water Req | fao.org | ~100 crops | Water needs per crop per growth stage |

### For Market Forecasting:
| Source | Coverage | Access |
|--------|----------|--------|
| data.gov.in | 2014-present, CSV download | Free, no API key |
| Agmarknet (agmarknet.gov.in) | 7,000+ mandis, 300+ commodities | Scrape with Python |
| Kaggle commodity prices | Historical prices | Free download |

### For Biotech Variety Mapping:
| Source | What We Get |
|--------|-------------|
| ICAR Crop Variety Catalogs | Variety traits: drought/salinity/disease tolerance |
| State Agricultural University publications | Region-specific variety recommendations |
| Krishi Vigyan Kendra (KVK) reports | Field-tested variety performance data |
| **Approach:** Manually compile ~50-100 varieties into JSON/DB table (2-3 hours research) |

---

## 9. HARDWARE INTEGRATION (RASPBERRY PI)

### Sensors:
| Sensor | Measures | Connection |
|--------|----------|-----------|
| Soil Moisture Sensor | Soil water content (%) | Analog → ADC → Pi GPIO |
| Soil EC Sensor | Electrical conductivity (dS/m) — indicates salinity | Analog → ADC |
| Soil Temperature (DS18B20) | Soil temp (°C) | Digital (1-Wire) |
| DHT22 | Air temp (°C) + Humidity (%) | Digital GPIO |
| Leaf Wetness Sensor | Surface wetness (0-1) | Analog → ADC |
| Power Module | Battery level monitoring | ADC |

### Data Flow:
```
Pi reads sensors every 5 min
    → Formats JSON: { device_id, soil_moisture, soil_ec, soil_temp, air_temp, humidity, leaf_wetness }
    → HTTP POST to https://backend-url/sensor/upload
    → If internet down: store in local SQLite, bulk upload when reconnected
    → Backend validates, stores in SensorData table, computes DerivedMetrics
```

### Connection: 4G USB dongle on Pi (~₹500/month data plan)

### Failure Handling:
| Failure | Recovery |
|---------|----------|
| Power loss | UPS/battery backup (₹500), Pi auto-restarts, sensor script in rc.local |
| Internet loss | Local SQLite buffer, bulk upload when reconnected |
| Sensor wire break | Health check detects NULL/out-of-range, SMS alert to farmer |
| Pi hardware dies | App still works in manual mode (farmer enters data by hand) |

---

## 10. MULTI-LANGUAGE STRATEGY

### Supported Languages (Phase 1):
| Code | Language | Coverage |
|------|----------|----------|
| en | English | Default |
| hi | Hindi | ~40% of farmers |
| ta | Tamil | Tamil Nadu |
| te | Telugu | Andhra Pradesh, Telangana |
| kn | Kannada | Karnataka |
| mr | Marathi | Maharashtra |
| pa | Punjabi | Punjab |
| bn | Bengali | West Bengal |

### Implementation:
- **UI Labels:** next-intl library, JSON files per language
- **AI Responses:** Gemini prompt includes language instruction
- **Voice (Future):** Google Speech-to-Text (post-investment)

---

## 11. REVENUE MODEL

| Phase | Stream | Revenue |
|-------|--------|---------|
| **1** | Freemium SaaS: Free basic, ₹99/mo Pro (IoT + forecast + alerts) | 10K farmers × ₹99 = ₹11.8L/mo |
| **2** | Hardware-as-a-Service: Sensor kit rental ₹299/mo | 5K kits × ₹299 = ₹14.9L/mo |
| **3** | Data Monetization: Anonymized crop/soil data to seed/fertilizer/insurance companies | ₹5-50L/year per client |
| **4** | Commission: Recommend specific seeds/fertilizers, earn 5-10% | Variable |
| **5** | Government Contracts: White-label platform for state agriculture departments | ₹50L-5Cr per state |

### Unit Economics:
- Hardware cost per farm: ~₹5,000
- Monthly revenue per farm: ₹99-299
- Payback period: 6-17 months
- At 50,000 farms, ARR: ₹6-18 crore

---

## 12. IP PROTECTION

| Type | Action | Cost | Status |
|------|--------|------|--------|
| Software Copyright | Automatic (change LICENSE to proprietary) | Free | ⬜ Task 4 |
| Provisional Patent | File for decision engine algorithm + IoT pipeline | ₹1,600 | ⬜ Manual |
| Trademark | Register "Krishi Sakhi" | ₹4,500 | ⬜ Manual |

---

## 13. HOSTING & DEPLOYMENT

### Pre-Investment (₹0/month):
| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel (free tier) | ₹0 |
| Backend | Railway (free tier) | ₹0 |
| Database | Supabase (free, 500MB) | ₹0 |

### Post-Investment:
| Service | Platform | Cost |
|---------|----------|------|
| Frontend | Vercel Pro | $20/mo |
| Backend | AWS EC2 / Azure App Service | $30-60/mo |
| Database | Supabase Pro / AWS RDS | $25/mo |
| **Total** | | **~₹8-10K/mo** for 1,000+ farmers |

---

## 14. ANTI-PATTERNS FOUND IN CURRENT CODE

| Problem | Where | Fix |
|---------|-------|-----|
| Business logic inside API route | app/api/analyze/route.ts orchestrates all 3 agents | Move to service layer in Python backend |
| No separation of frontend/backend | Everything in Next.js | Split into frontend/ + backend/ |
| Hardcoded mock data | constants.ts has mock prices, soil | Move to database tables |
| Fallback function never called | agent2CropAnalyzer.ts has fallbackCropSelection but it's never invoked | Implement proper fallback chain |
| .env.example outdated | References OPENAI_API_KEY | Code uses GEMINI_API_KEY — fix mismatch |
| No database tables | Supabase configured, zero tables | Create all 7 tables (Task 3) |
| No error recovery | Single agent failure crashes entire analysis | Each service handles its own errors |
| No logging | Just console.log everywhere | Structured JSON logging with levels |
| No tests | Zero test files | pytest for each service (Phase 11) |

---

## API ENDPOINTS (Final System)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/sensor/upload` | Receive sensor data from Pi | Device token |
| GET | `/sensor/health/{farm_id}` | Check if Pi is sending data | JWT |
| GET | `/sensor/latest/{farm_id}` | Get latest sensor readings | JWT |
| GET | `/sensor/history/{farm_id}` | Get historical sensor data | JWT |
| POST | `/recommendation` | Get AI crop recommendation | JWT |
| GET | `/forecast/{crop_name}` | Get market price forecast | JWT |
| POST | `/simulate` | Compare multiple crops | JWT |
| GET | `/rotation/{farm_id}` | Get crop rotation suggestion | JWT |
| GET | `/risk/{farm_id}` | Get risk dashboard data | JWT |
| POST | `/farm` | Create a new farm | JWT |
| GET | `/farm` | List user's farms | JWT |
| PUT | `/farm/{id}` | Update farm details | JWT |
| DELETE | `/farm/{id}` | Delete a farm | JWT |
| GET | `/health` | Backend health check | None |

---

## DECISION ENGINE OUTPUT FORMAT

The final `/recommendation` endpoint returns:

```json
{
    "success": true,
    "farm_id": "uuid",
    "timestamp": "2026-02-27T10:30:00Z",
    "sensor_snapshot": {
        "soil_moisture": 42.5,
        "soil_temp": 28.3,
        "soil_ec": 1.2,
        "air_temp": 32.1,
        "humidity": 65.0,
        "leaf_wetness": 0.3
    },
    "derived_metrics": {
        "stress_index": 35.2,
        "water_deficit_score": 22.1,
        "salinity_risk": 15.8,
        "disease_probability": 12.5,
        "crop_suitability_score": 78.3
    },
    "recommendation": {
        "crop": "Rice",
        "variety": "Swarna Sub-1 (Flood-tolerant)",
        "confidence": 0.87,
        "reasoning": "High soil moisture and alluvial soil favor rice cultivation. Swarna Sub-1 recommended due to flood risk in Bihar."
    },
    "market_forecast": {
        "expected_price_at_harvest": 38.5,
        "current_price": 35.0,
        "price_trend": "Rising",
        "volatility": "Low",
        "harvest_date": "2026-10-15"
    },
    "profitability": {
        "expected_profit_per_acre": 45000,
        "cultivation_cost": 25000,
        "revenue_estimate": 70000,
        "profitability_score": 82.3
    },
    "risk_assessment": {
        "disease_risk": "Low",
        "drought_risk": "Medium",
        "flood_risk": "Low",
        "overall_risk": "Low-Medium"
    },
    "irrigation_advisory": "Current soil moisture is adequate. Next irrigation recommended in 3 days.",
    "crop_rotation_note": "Previous crop was Wheat. Rice is an excellent rotation choice for nitrogen balance.",
    "alternatives": [
        { "crop": "Maize (NK-6240)", "profit": 38000, "confidence": 0.72 },
        { "crop": "Soybean (JS-335)", "profit": 32000, "confidence": 0.68 }
    ],
    "model_version": "xgb_v1.0_prophet_v1.0"
}
```

---

> **REMEMBER:** Read this file at the start of every session to get full context.  
> Update task status (⬜ → ✅) as tasks are completed.  
> This is the single source of truth for the project.
