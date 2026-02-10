# SafetyVision AI Platform

An AI-Powered Vision Platform for Industrial Safety - providing real-time safety monitoring, violation detection, predictive analytics, and comprehensive reporting.

Built on top of [securade/hub](https://github.com/securade/hub.git) open source project.

## Features

### Core Capabilities
- **Real-time Video Analysis** - AI-powered detection from multiple camera streams
- **PPE Detection** - Hardhat, vest, mask compliance monitoring
- **Proximity Detection** - Person-to-equipment distance monitoring
- **Exclusion Zone Monitoring** - Restricted area violation alerts
- **Predictive Analytics** - AI-driven risk forecasting

### Analytics & Reporting
- **Executive KPIs** - Safety Score, TRIR, LTIFR, Compliance Rate
- **Incident Trends** - Time-series analysis with severity breakdown
- **Location Risk Analysis** - Heatmaps and zone-based risk scoring
- **Root Cause Analysis** - NLP-powered incident categorization
- **Shift/Team Analysis** - Pattern detection across work schedules
- **Corrective Action Tracking** - Closure rates and effectiveness metrics
- **Compliance Reporting** - ISO 45001, OSHA-ready documentation

## Project Structure

```
ai-safety-vision-platform/
├── backend/                 # FastAPI Python backend
│   ├── api/                 # API routes
│   │   └── routes/          # Route modules
│   ├── core/                # Core configuration & security
│   ├── models/              # Pydantic schemas
│   ├── services/            # Business logic & analytics
│   ├── ai_engine/           # AI/ML detection models
│   ├── utils/               # Utility functions
│   ├── main.py              # Application entry point
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── styles/          # CSS/Tailwind styles
│   │   └── assets/          # Static assets
│   ├── package.json         # Node dependencies
│   └── vite.config.ts       # Vite configuration
│
└── temp-hub/                # Original securade/hub repo (reference)
```

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (optional, SQLite for development)
- Redis (optional, for caching)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Key Analytics Categories

### 1. Incident Trends Over Time
Tracks safety performance using normalized metrics, rolling averages, and YoY trends.

### 2. Location & Zone Risk Analytics
Identifies incident hotspots using heatmaps and risk rankings.

### 3. Incident Type & Severity Analysis
Breaks down incidents by category with downtime and cost impact.

### 4. Root Cause & Contributing Factors
Uses structured data and NLP to uncover incident causes.

### 5. Predictive Analytics & Forecasting
AI models predict future incident probability with early-warning alerts.

### 6. Compliance & Regulatory Reporting
Tracks corrective actions, policy adherence, and training effectiveness.

### 7. Team, Shift & Human Factors Analysis
Analyzes incidents by shift, crew, fatigue, and exposure patterns.

### 8. Near-Miss & Hazard Analytics
Monitors near-miss trends as leading indicators.

### 9. Action Effectiveness Tracking
Measures closure rates, recurrence, and intervention impact.

### 10. Benchmarking & Risk Scoring
Compares performance against industry norms and maturity models.

## KPI Layers

### Executive KPIs
- Overall Safety Risk Score (0-100)
- TRIR (Total Recordable Incident Rate)
- LTIFR (Lost Time Injury Frequency Rate)
- Severity-Weighted Incident Index
- Predictive Incident Probability
- Compliance Coverage
- Cost of Safety Risk

### Operations KPIs
- Incident & near-miss rates
- Repeat violation rate
- Unsafe act vs unsafe condition ratio
- Mean time to detect & correct
- Corrective action closure rate
- AI detection confidence & coverage

## Tech Stack

### Backend
- **FastAPI** - High-performance async API framework
- **SQLAlchemy** - ORM for database operations
- **Pydantic** - Data validation and settings
- **PyTorch** - AI/ML model inference
- **OpenCV** - Video processing

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **TanStack Query** - Data fetching & caching
- **Framer Motion** - Animations

### Infrastructure (AWS Ready)
- **S3** - Media storage
- **RDS** - PostgreSQL database
- **ElastiCache** - Redis caching
- **Lambda** - Serverless functions
- **CloudWatch** - Monitoring

## License

This project builds upon the [securade/hub](https://github.com/securade/hub.git) open source project.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
