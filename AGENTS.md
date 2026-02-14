# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## What this repo is
SafetyVision is a hybrid edge + cloud industrial safety vision platform:
- `frontend/`: React (Vite) dashboard.
- `backend/`: FastAPI “cloud API” backend (local dev server; also has Docker artifacts).
- `edge/`: FastAPI “edge server” intended to run on-prem near cameras/GPU.
- `cloud/`: AWS infrastructure + Lambda handlers + SQL schema (reference implementation for a serverless cloud API).
- `docs/AWS_ARCHITECTURE.md`: end-to-end architecture + AWS deployment notes.

## Common development commands
All commands below assume you are in the repo root.

### Backend (FastAPI) — local dev
Entry point: `backend/main.py` (app import is `main:app`).

PowerShell (Windows) setup:
- Create + activate venv
  - `python -m venv backend\venv`
  - `backend\venv\Scripts\Activate.ps1`
- Install deps
  - `pip install -r backend\requirements.txt`
- Create env file (settings read `.env` in `backend/`)
  - Copy `backend/.env.example` to `backend/.env` and edit as needed
- Run API (port 8000 by default)
  - `uvicorn backend.main:app --reload --port 8000`

Notes:
- API docs: `/api/docs` and `/api/redoc`.
- Routers are mounted at both `/api/v1/*` and `/api/*` (see `backend/main.py`).

#### Backend tests
`pytest` is included in `backend/requirements.txt`, but the repo currently does not include a `tests/` directory.
If/when tests exist, typical invocations are:
- Run all tests: `pytest`
- Run a single test file: `pytest path\to\test_file.py`
- Run a single test by keyword: `pytest -k "keyword"`

### Frontend (React + Vite)
Manifest: `frontend/package.json`.

- Install deps: `npm --prefix frontend install`
- Start dev server (port 3000): `npm --prefix frontend run dev`
- Build: `npm --prefix frontend run build`
- Lint: `npm --prefix frontend run lint`

Notes:
- `frontend/vite.config.ts` proxies `/api/*` to `http://localhost:8000` for local development.
- API base URL is also configurable via `VITE_API_URL` (see `frontend/src/services/api/apiClient.ts`).

### Edge server (on-prem FastAPI)
Entry point: `edge/main.py` (app import is `main:app`).

- Create + activate venv
  - `python -m venv edge\venv`
  - `edge\venv\Scripts\Activate.ps1`
- Install deps
  - `pip install -r edge\requirements.txt`
- Run edge API (port 8080 by default)
  - `uvicorn edge.main:app --reload --port 8080`

Configuration:
- Environment variables are defined in `edge/config.py` (e.g. `CLOUD_API_URL`, `CLOUD_API_KEY`, `EDGE_DEVICE_ID`, `INFERENCE_DEVICE`, `STORAGE_PATH`).

### Docker Compose flows
- “Edge deployment” full stack compose (backend + DB + redis + frontend + worker):
  - File: `backend/deployment/edge/docker-compose.yml`
  - Run (from repo root):
    - `docker compose -f backend/deployment/edge/docker-compose.yml up --build`
  - Requires `DB_PASSWORD` env var (used by Postgres and API container).

- Edge server compose (edge + optional redis + optional monitoring profile):
  - File: `edge/docker-compose.yml`
  - Run:
    - `docker compose -f edge/docker-compose.yml up --build`
  - Optional monitoring services:
    - `docker compose -f edge/docker-compose.yml --profile monitoring up --build`

### AWS / Cloud (reference)
- Architecture & deployment notes: `docs/AWS_ARCHITECTURE.md`.
- Lambda handlers: `cloud/lambda/handlers.py`.
- Database schema: `cloud/database/schema.sql`.
- CloudFormation template (alternate infra): `backend/deployment/cloud/cloudformation.yml`.

## Big-picture architecture (how pieces connect)
### Frontend → Backend API
- The React app routes are defined in `frontend/src/App.tsx`.
- HTTP calls are made through `frontend/src/services/api/apiClient.ts` (Axios) and per-domain service modules in `frontend/src/services/api/`.
- In dev, Vite proxies `/api/*` to the backend at `localhost:8000` (see `frontend/vite.config.ts`).

### Backend API (FastAPI)
- App wiring:
  - `backend/main.py` creates the FastAPI app, configures CORS, and mounts the API router under `/api` and `/api/v1`.
  - `backend/api/__init__.py` composes route modules under `backend/api/routes/`.
- Configuration:
  - `backend/core/config.py` uses `pydantic-settings` and reads `.env` from within `backend/`.
- Domain/data layer:
  - Pydantic request/response types live in `backend/models/schemas.py`.
  - Business logic currently starts in `backend/services/` (e.g. `analytics_service.py`).

### Edge server (on-prem)
- `edge/main.py` owns lifecycle startup and wires services:
  - Camera ingestion/management (`edge/services/camera_manager.py`)
  - AI inference (`edge/services/ai_inference.py`)
  - Privacy filtering (`edge/services/face_blur.py`)
  - Local evidence storage (`edge/services/local_storage.py`)
  - Cloud sync + alerts (`edge/services/cloud_sync.py`, `edge/services/alert_service.py`)
- The edge exposes local endpoints under `/api/*` (health, cameras, detections, evidence, sync) and can upload/sync to a cloud API (configured by `CLOUD_API_URL` / `CLOUD_API_KEY`).

### Cloud reference implementation
- `docs/AWS_ARCHITECTURE.md` describes the intended AWS-side components (API Gateway + Lambda + RDS/DynamoDB/S3/SNS).
- `cloud/lambda/handlers.py` implements API Gateway-style handlers for detections, alerts, analytics, evidence presigned URLs, and edge device registration/heartbeat.
- `cloud/database/schema.sql` defines the relational schema used by the cloud handlers.
