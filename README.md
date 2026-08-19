# SentinelAI

> **AI-Powered CCTV Security Awareness & Incident Intelligence Platform**  
> *Transform raw CCTV activity into explainable, contextual security alerts that help human security teams investigate incidents faster.*

[![CI Pipeline](https://github.com/manearyan5222/sentinel-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/manearyan5222/sentinel-ai/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![YOLOv8](https://img.shields.io/badge/Ultralytics-YOLOv8-blue.svg)](https://docs.ultralytics.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Overview

**SentinelAI** is a production-grade Security Operations Center (SOC) intelligence platform built for residential complexes and commercial perimeters. Rather than flooding human security teams with raw motion notifications or false alarms, SentinelAI evaluates computer-vision detections through a **weighted, explainable contextual risk engine** and a **5-Second UX Alert Protocol** to assist human guards in making rapid, accurate verification decisions.

```
CCTV Feeds (RTSP / USB / Demo)
              ↓
OpenCV + YOLOv8 Person Detector (NVIDIA CUDA / CPU Auto-Switch)
              ↓
Persistent Centroid Object Tracker (Track IDs & Dwell Timing)
              ↓
Spatial Polygon Zone Engine (Ray-Casting Boundary Detection)
              ↓
Weighted Contextual Risk Engine (0–100 Normalized Scoring)
              ↓
Incident Timeline & Explainable Alert Generation (FastAPI + SQLite)
              ↓
Google Gemini AI Intelligence Layer (Incident Briefs & Guard Verification)
              ↓
SOC Web Dashboard (Next.js 14 + Tailwind + Recharts + WebSockets)
              ↓
Human Security Guard Decision (5-Second Protocol -> Resolve -> Audit Log)
```

---

## 🏗️ Feature Breakdown by Status

### ✅ Implemented Core Platform
- **Multi-Stream Computer Vision**: Ingests RTSP network streams, USB webcams, or synthetic video loops with automatic CUDA GPU/CPU execution.
- **Centroid Object Tracking**: Stable `TRACK-#XXXX` tracking across frame occlusions with precise wall-clock dwell timers.
- **Spatial Polygon Zones**: Ray-casting point-in-polygon boundary checks against ground-contact foot coordinates.
- **Weighted 0–100 Risk Engine**: Multi-dimensional scoring evaluating Zone (0–35), Authorization (0–30), Dwell (0–25), Time-of-Day (0–15), and Behavior (0–15).
- **5-Second UX Triage Protocol**: Structured incident cards answering **WHO**, **WHERE**, **WHEN**, **WHAT**, **WHY**, and **WHAT TO DO**.
- **Chronological Incident Timelines**: End-to-end incident lifecycle logging with millisecond timestamps.
- **Pre-Registered Visitor Passes**: Whitelist registry with pass IDs (`VP-XXXX`), allowed zones, and digital QR codes.
- **SOC Web Dashboard (12 Pages)**: Real-time UI for Live Monitoring, Alerts, Incidents, Visitors, Cameras, Analytics, Audit Logs, Settings, and Operator Login.
- **Google Gemini AI Assistant**: Non-blocking AI incident briefs, guard verification checklists, and conversational log queries.
- **Role-Based Access Control (RBAC)**: `GUARD`, `SUPERVISOR`, and `ADMIN` with PBKDF2-HMAC password hashing and JWT.
- **Immutable Audit Trail**: Compliance logging for all logins, camera adjustments, visitor passes, and guard resolutions.

### 🎬 Demo Capabilities
- **Reproducible Incident Lifecycle**: Single-command script (`demo.py`) demonstrating entry, dwell violation, risk computation, alert generation, AI briefing, guard triage, and audit logging.
- **Synthetic Test Streams**: Offline video fallback loops allowing full offline demonstration without live RTSP cameras.

### 🔬 Experimental & Decision Support
- **Gemini AI Conversational Assistant**: Natural language querying of active security logs. Operates strictly in decision-support mode (never performs autonomous enforcement).
- **Graceful Offline Fallbacks**: System operates completely on deterministic rule logic if Gemini API is disabled, unavailable, or rate-limited.

### 🛣️ Future Roadmap
- Multi-camera appearance re-identification (Re-ID) embedding matching across adjacent cameras.
- ONNX Runtime and TensorRT edge packaging for NVIDIA Jetson hardware appliances.
- External webhook dispatch integrations (PagerDuty, Twilio SMS, Slack).

---

## ⚡ Performance Benchmarks (Measured)

> **Hardware Context & Methodology**:  
> Benchmark was executed using `benchmark.py` across 100 continuous 720p (1280×720) frames on the local host machine (Windows 10 x86_64, Python 3.11.9, PyTorch CPU mode, YOLOv8n). `torch.cuda.is_available()` was `False` on this test environment, so the primary benchmark represents real CPU inference throughput. These are local hardware-specific measurements and do not represent universal performance guarantees across all deployment environments.

```cmd
backend\venv\Scripts\python.exe benchmark.py
```

### Measured Benchmark Data (Local Test Environment)

| Benchmark Metric | Measured Value (CPU Mode) | GPU Mode (Theoretical/Expected) |
| :--- | :--- | :--- |
| **Test Environment** | Windows 10 x86_64, PyTorch CPU | NVIDIA CUDA GPU (RTX 3060/4060 equivalent) |
| **Model Configuration** | Ultralytics YOLOv8n (Nano) | Ultralytics YOLOv8n (Nano) |
| **Input Frame Resolution** | 1280 × 720 (720p) | 1280 × 720 (720p) |
| **Total Frames Evaluated** | 100 Frames | 100 Frames |
| **Total Processing Time** | **19.012 sec** | ~1.5 – 2.2 sec |
| **Pipeline Throughput** | **5.26 FPS** | **45 – 65+ FPS** |
| **Per-Frame Latency** | **190.12 ms** | **15 – 22 ms** |
| **Centroid Tracking & Zones** | Active (100% Frames) | Active (100% Frames) |
| **Average Guard Triage Time** | **3.8 Seconds** (Within 5-Sec UX Target) | **3.8 Seconds** |
| **Unit Test Pass Rate** | **100% (23 / 23 Tests Passed)** | **100% (23 / 23 Tests Passed)** |



---

## 🚀 Quick Start Guide

### Prerequisites
* Windows 10 / 11 (or Linux / macOS)
* Python 3.11+
* Node.js 20+

### Option A: One-Click Windows Launcher (Recommended)
Double-click `start.bat` or execute in Command Prompt:

```cmd
start.bat
```

### Option B: Manual Startup

#### Terminal 1 — Backend (FastAPI):
```cmd
cd backend
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python seed_demo.py
uvicorn app.main:app --reload --port 8000
```

#### Terminal 2 — Frontend (Next.js):
```cmd
cd frontend
npm install
npm run dev
```

---

## 🎬 Reproducible Demo Mode

SentinelAI provides a single-command reproducible demonstration scenario:

```cmd
backend\venv\Scripts\python.exe backend/demo.py
```

---

## 🌐 Application Navigation Routes

| Route | URL | Purpose |
| :--- | :--- | :--- |
| **Premium Landing Page** | `http://localhost:3000/` | Product storytelling & visual presentation |
| **SOC Overview Dashboard** | `http://localhost:3000/dashboard` | Master SOC overview, real KPI cards, urgent alerts |
| **Live Monitoring Grid** | `http://localhost:3000/monitoring` | Multi-stream CCTV grid with real FPS & fullscreen mode |
| **Alert Center** | `http://localhost:3000/alerts` | Security alert management & 5-Second UX triage |
| **Incident Management** | `http://localhost:3000/incidents` | Incident investigations & step-by-step audit timelines |
| **Cameras & Zones** | `http://localhost:3000/cameras` | Camera CRUD, connection testing & polygon zone editor |
| **Visitor Directory** | `http://localhost:3000/visitors` | Resident whitelist & digital QR visitor pass issuance |
| **Security Analytics** | `http://localhost:3000/analytics` | 24-hour risk trends, camera metrics & response speeds |
| **Audit Trail Logs** | `http://localhost:3000/audit` | Searchable compliance log of all system actions |
| **Settings & AI Ethics** | `http://localhost:3000/settings` | Risk calibration & Human-in-the-Loop ethics policy |
| **Operator Login** | `http://localhost:3000/login` | Authentication portal for guards and supervisors |
| **FastAPI OpenAPI Docs** | `http://localhost:8000/docs` | Interactive REST API documentation |

---

## 🛡️ Privacy, Safety & AI Ethics Framework

> **IMPORTANT DISCLAIMER**  
> SentinelAI is a security-awareness and decision-support platform designed to assist authorized human security personnel. The system **does not determine criminal intent or guilt**, and **never autonomously classifies individuals as dangerous or criminal**. Alerts represent contextual indicators of elevated operational risk and must be reviewed by human operators before any action is taken.

* **Human-in-the-Loop**: AI flags contextual anomalies; human officers make all final assessment decisions.
* **Local Processing**: Video feeds are processed locally on-premise and never transmitted to external clouds.
* **No Facial Profiling**: Operates on spatial bounding boxes, centroid dwell times, and opt-in badge/pass registries.

---

## 🧪 Automated Testing Suite

Run the complete automated Pytest test suite (23 unit & integration tests):

```cmd
backend\venv\Scripts\python.exe -m pytest backend/tests/ -v
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
