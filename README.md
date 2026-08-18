# SentinelAI: Smarter CCTV. Faster Security Response.

> **Residential CCTV AI Alerting & Guard Decision Platform**  
> Analyzes live video streams to detect people, track identities, score contextual risk, and dispatch real-time alerts to security guards with clear triage protocols and optional Google Gemini AI intelligence analysis.

---

## Key Philosophy: Human-in-the-Loop Alerting

SentinelAI is an **alerting platform**, NOT an autonomous judge. It flags elevated risks for human review and **never automatically labels someone a criminal**. Guards receive actionable alerts designed around the **5-Second UX Rule** to make fast, informed decisions (Mark Legitimate or Escalate).

---

## Google Gemini AI Integration (Optional & Zero-Crash)

SentinelAI integrates a free-tier **Google Gemini API** intelligence layer as a non-blocking decision-support assistant.

* **Event-Driven Analysis**: Gemini is **never** called on continuous CCTV video frames. YOLOv8, Centroid Tracking, and the 0-100 Risk Engine continue to run locally in real-time.
* **Strict Human-in-the-Loop Safeguards**: Prompts explicitly forbid declaring someone a criminal, inferring intent from appearance, or making law-enforcement decisions.
* **Database Caching**: AI explanations are saved in SQLite so duplicate requests for the same alert do not re-call Gemini.
* **Optional & Standalone**: If `GEMINI_API_KEY` is omitted, SentinelAI operates normally in `AI: DISABLED` mode without crashing.

### Gemini AI Setup Steps

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create or open the file `backend/.env`.
3. Set your API key in Windows Command Prompt:
   ```cmd
   echo GEMINI_API_KEY=your_actual_api_key_here > backend\.env
   ```
4. Start SentinelAI normally via `start.bat`.
5. Open the SOC dashboard (`http://localhost:3000`), click any alert, and click **`Generate AI Analysis`** or ask questions in the **AI Security Assistant** chat drawer.

---

## High-Level Architecture

```
sentinel-ai/
├── frontend/             # Next.js 14, React, Tailwind CSS, Lucide Icons, Recharts
│   ├── app/              # App router pages (SOC Grid, Alerts, Visitors, Analytics)
│   ├── components/       # SOCHeader, CameraFeedCard, AlertTriageModal, AIChatAssistant, VisitorTrackerTable, Analytics
│   ├── hooks/            # useAlertWebSocket (Live push updates)
│   └── lib/              # API clients, TypeScript types, utilities
├── backend/              # Python FastAPI, SQLAlchemy, WebSockets, OpenCV, Ultralytics YOLO
│   ├── app/ai/           # Hardware Device Manager (CPU/GPU), YOLO Detector, Centroid Tracker, Risk Engine, Gemini Service
│   ├── app/api/          # REST endpoints (Cameras, Alerts, Visitors, Analytics, Telemetry, AI Layer, WebSockets)
│   ├── app/database/     # SQLite database session & base configuration
│   ├── app/models/       # SQLAlchemy models (Camera, AuthorizedPerson, DetectionEvent, Alert)
│   ├── seed_demo.py      # SQLite database seeding script
│   └── generate_demo_video.py # Synthetic CCTV security video generator
├── sample_data/          # Local demo MP4 video storage
├── start.bat             # Windows one-click startup batch script
└── README.md
```

---

## Features & Highlights

1. **Strict Zero Containerization**: Runs natively on Windows 10/11 using standard local terminal commands (`python`, `npm`).
2. **Hardware Fallback Acceleration**: Automatically detects NVIDIA CUDA GPUs; gracefully falls back to CPU execution with status indicator (`AI Device: CPU` or `GPU`).
3. **Contextual Risk Scoring Engine (0–100)**:
   - Unrecognized Person: `+25`
   - Restricted Zone Access: `+30`
   - Extended Dwell Time (>15s): `+15`
   - No Visitor Pre-Registration Pass: `+20`
   - Risk levels: `LOW` (0–29), `MODERATE` (30–49), `ELEVATED` (50–74), `HIGH` (75–100).
4. **5-Second UX Rule Triage Modal + Gemini AI Analysis**:
   - **WHO**: Target entity identification & identity type.
   - **WHERE**: Camera & zone location.
   - **WHEN**: Timestamp & dwell duration.
   - **WHAT**: Detailed detection narrative.
   - **WHY**: Contextual risk scoring breakdown rules.
   - **WHAT TO DO**: Actionable protocol recommendation.
   - **AI ANALYSIS**: Structured summary, risk explanation, verification checklist, recommended action, and uncertainty notes.
5. **Real-Time WebSockets**: Live event and alert broadcast from Python backend directly to Next.js SOC interface.

---

## Local Windows Startup Guide

### Prerequisites
* **Windows 10 / 11**
* **Python 3.11+** installed and added to PATH
* **Node.js 20+** & **npm** installed

---

### Option A: Automatic One-Click Launch (`start.bat`)

Double-click or run from Command Prompt:

```cmd
start.bat
```

This script will automatically:
1. Create the Python virtual environment (`backend/venv`).
2. Install Python backend dependencies (`pip install -r backend/requirements.txt`).
3. Generate the synthetic demo security MP4 video (`sample_data/demo_security.mp4`).
4. Initialize and seed the SQLite database (`sentinel_ai.db`).
5. Install Node.js frontend packages (`npm install`).
6. Launch the FastAPI backend on `http://localhost:8000` and the Next.js SOC frontend on `http://localhost:3000`.

---

### Option B: Manual Terminal Commands

#### 1. Setup Backend
```cmd
cd backend
python -m venv venv
call venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python generate_demo_video.py
python seed_demo.py
uvicorn app.main:app --reload --port 8000
```

#### 2. Setup Frontend (New Terminal Window)
```cmd
cd frontend
npm install
npm run dev
```

---

## Access Points

* **SOC Guard UI Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Alert Center**: [http://localhost:3000/alerts](http://localhost:3000/alerts)
* **Visitor Directory**: [http://localhost:3000/visitors](http://localhost:3000/visitors)
* **Analytics**: [http://localhost:3000/analytics](http://localhost:3000/analytics)
* **FastAPI Backend & Interactive OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
