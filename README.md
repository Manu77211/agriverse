# Krishi Sakhi 🌾

**AI-powered farming assistant for Indian farmers**

Krishi Sakhi is a full-stack agricultural advisory system that combines IoT sensor data, machine learning, and market intelligence to provide personalized crop recommendations, disease risk alerts, and profitability forecasts.

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+** (Backend)
- **Node.js 18+** (Frontend)
- **Supabase Account** (Database & Auth)
- **API Keys** (Optional but recommended):
  - Google Gemini AI
  - OpenAI
  - OpenWeather

## 📋 Setup Instructions

### 1. Database Setup (Supabase)

1. **Create Supabase Project**
   - Sign up at [supabase.com](https://supabase.com)
   - Create new project
   - Note these credentials from Project Settings → API:
     - `SUPABASE_URL` (Project URL)
     - `SUPABASE_ANON_KEY` (anon/public key)
     - `SUPABASE_SERVICE_ROLE_KEY` (service_role key)
     - `DATABASE_URL` (Connection string)

2. **Run Database Schema**
   - Go to **SQL Editor** in Supabase dashboard
   - Copy entire content from `database/schema.sql`
   - Execute to create tables, RLS policies, and seed data

   ```sql
   -- Verify setup
   SELECT COUNT(*) as total_varieties FROM crop_varieties; -- Should show 20+
   ```

### 2. Backend Setup (FastAPI)

```bash
# Navigate to backend
cd backend

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your Supabase credentials
```

**Environment Variables (`backend/.env`):**
```env
# REQUIRED: Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# OPTIONAL: AI & Weather APIs
GEMINI_API_KEY=your-gemini-api-key
OPENWEATHER_API_KEY=your-openweather-api-key

# Server Configuration
APP_ENV=development
APP_PORT=8000
CORS_ORIGINS=http://localhost:3000
```

**Run Backend:**
```bash
uvicorn app.main:app --reload --port 8000
```
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

### 3. Frontend Setup (Next.js)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Configure environment
copy .env.example .env.local
# Edit .env.local with your API keys
```

**Environment Variables (`frontend/.env.local`):**
```env
# REQUIRED: Supabase (same as backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# OPTIONAL: AI Services
OPENAI_API_KEY=your_openai_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
AGRISTACK_API_KEY=your_agristack_api_key_here
ENAM_API_KEY=your_enam_api_key_here

NODE_ENV=development
```

**Run Frontend:**
```bash
npm run dev
```
- **Application:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard

## 🏗️ Project Architecture

### System Components
```
┌─────────────────────────────────────────────────────────┐
│                    KRISHI SAKHI ARCHITECTURE            │
├─────────────────────────────────────────────────────────┤
│  🌐 Frontend (Next.js)                                  │
│     • Dashboard & Visualization                         │
│     • Multi-language UI (EN, HI, regional)              │
│     • Real-time sensor data display                     │
│                                                         │
│  🚀 Backend (FastAPI)                                   │
│     • RESTful APIs (Crop, Sensor, Forecast, Farm)       │
│     • ML Models (XGBoost, ARIMA/LSTM)                   │
│     • Sensor data processing & validation               │
│                                                         │
│  🗄️ Database (Supabase PostgreSQL)                      │
│     • 7 Tables with Row Level Security                  │
│     • Real-time subscriptions                           │
│     • Built-in Authentication                           │
│                                                         │
│  🤖 AI Engine                                           │
│     • Crop Recommendation (XGBoost)                     │
│     • Price Forecasting (ARIMA/LSTM)                    │
│     • Disease Risk Assessment                           │
│     • Variety Matching (ICAR catalog)                   │
└─────────────────────────────────────────────────────────┘
```

### Database Schema
- **profiles** – User profiles linked to Supabase Auth
- **farms** – Farm details with device configuration
- **sensor_data** – Raw IoT sensor readings (5-min intervals)
- **derived_metrics** – Computed stress indices & risk scores
- **crop_varieties** – ICAR biotech varieties (20+ seed entries)
- **market_prices** – Historical mandi price data
- **recommendation_log** – All recommendations with outcomes

## 🔧 API Endpoints

### Backend APIs (Port 8000)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Service health check |
| `/recommendation` | POST | Get crop recommendations |
| `/sensor/upload` | POST | Upload sensor data (IoT devices) |
| `/sensor/latest/{farm_id}` | GET | Latest sensor readings |
| `/forecast/price/{crop}` | GET | Price forecasts (7-30-90 days) |
| `/farm` | POST | Create/update farm profile |
| `/simulate/conditions` | POST | Simulate farming conditions |

### Frontend Pages (Port 3000)
- `/` – Landing page
- `/dashboard` – Farm dashboard with sensor data
- `/recommendations` – Crop recommendation interface
- `/forecast` – Market price predictions
- `/farms` – Farm management
- `/sensors` – IoT device configuration

## 🤖 Machine Learning Models

### 1. Crop Recommendation Model
- **Algorithm:** XGBoost Classifier
- **Features:** Soil moisture, temperature, pH, EC, location, season
- **Output:** Top 3 suitable crops with confidence scores
- **Training Data:** `data/Crop_recommendation.csv`

### 2. Price Forecasting Model  
- **Algorithm:** ARIMA/LSTM per crop
- **Features:** Historical mandi prices, seasonality, trends
- **Output:** 7, 30, 90-day price predictions
- **Training Data:** `data/mandi_prices.csv`

### 3. Disease Risk Assessment
- **Model:** Tom-Cast algorithm
- **Inputs:** Leaf wetness, temperature, humidity
- **Output:** Fungal disease probability (0-100%)

## 📁 Project Structure

```
agriverse/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── routes/            # API endpoints
│   │   ├── services/          # Business logic
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── middleware/        # Logging, error handling
│   │   └── utils/             # Helper functions
│   ├── data/                  # ML models & training data
│   ├── requirements.txt       # Python dependencies
│   └── train_model_improved.py # ML model training
│
├── frontend/                  # Next.js React frontend
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── lib/                   # Utility libraries
│   ├── supabase/              # Supabase client config
│   └── package.json           # Node.js dependencies
│
├── database/                  # Database schema
│   └── schema.sql            # PostgreSQL schema + RLS
│
├── .kiro/                    # Kiro IDE configuration
│   └── specs/               # Feature specifications
│
└── PROJECT_PLAN.md          # Project documentation
```

## 🚀 Deployment

### Railway (Backend)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### Vercel (Frontend)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Supabase (Database)
- Use Supabase dashboard for production database
- Enable backups and monitoring
- Set up production environment variables

## 📊 Testing

### Backend Tests
```bash
cd backend
pytest tests/
```

### Frontend Tests
```bash
cd frontend
npm run test
```

### API Testing
```bash
# Using curl examples
curl http://localhost:8000/health
curl -X POST http://localhost:8000/recommendation \
  -H "Content-Type: application/json" \
  -d '{"soil_moisture": 45, "soil_temp": 28, "state": "Maharashtra", "season": "Kharif"}'
```

## 🔐 Security

- **Row Level Security (RLS)** – Users only access their own data
- **JWT Authentication** – Via Supabase Auth
- **CORS Configuration** – Restricted to frontend origins
- **Input Validation** – All API inputs validated with Pydantic
- **Sensor Data Validation** – Range checks for physical plausibility

## 🌐 Supported Languages

- English (en)
- Hindi (hi)
- Tamil (ta)
- Telugu (te)
- Kannada (kn)
- Marathi (mr)
- Punjabi (pa)
- Bengali (bn)

## 📈 Features

### Core Features
- ✅ Real-time sensor data monitoring
- ✅ AI-powered crop recommendations
- ✅ Market price forecasting
- ✅ Disease risk assessment
- ✅ Multi-language support
- ✅ Farm management dashboard

### IoT Integration
- Raspberry Pi sensor nodes
- 5-minute data collection intervals
- Battery level monitoring
- Offline data buffering

### Business Intelligence
- Profitability ranking engine
- Investment opportunity scoring
- Historical recommendation tracking
- Farmer feedback collection

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check Supabase credentials
   echo $SUPABASE_URL
   # Test connection
   psql $DATABASE_URL -c "SELECT 1"
   ```

2. **Backend Won't Start**
   ```bash
   # Check Python version
   python --version
   # Reinstall dependencies
   pip install -r requirements.txt --force-reinstall
   ```

3. **Frontend Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next node_modules/.cache
   # Reinstall dependencies
   npm install --force
   ```

4. **CORS Errors**
   - Ensure `CORS_ORIGINS` includes frontend URL
   - Check backend is running on port 8000
   - Verify frontend is on port 3000

### Logs & Monitoring
```bash
# Backend logs
uvicorn app.main:app --reload --port 8000 --log-level debug

# Frontend logs
npm run dev 2>&1 | tee frontend.log
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Indian Council of Agricultural Research (ICAR)** – Crop variety data
- **Agmarknet** – Market price data
- **Supabase** – Database & Authentication
- **FastAPI** & **Next.js** – Web frameworks

---

**Krishi Sakhi** – Empowering Indian farmers with AI-driven insights since 2024.

*For support, contact: [Your Contact Information]*
