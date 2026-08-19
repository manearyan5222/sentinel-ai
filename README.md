# 🛡️ SentinelAI — CCTV Security Awareness & Incident Intelligence Platform

> **Transform raw CCTV video into explainable, contextual security intelligence that empowers human security teams to investigate incidents 10x faster.**

<div align="center">

[![Live Web App](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://sentinel-ai-app-olive.vercel.app)
[![Live Backend API](https://img.shields.io/badge/Backend%20API-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://sentinel-ai-vnm8.onrender.com)
[![Swagger API Docs](https://img.shields.io/badge/API%20Docs-Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://sentinel-ai-vnm8.onrender.com/docs)
[![CI Pipeline](https://img.shields.io/badge/CI%20Pipeline-Passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/manearyan5222/sentinel-ai/actions)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black.svg?logo=next.js&logoColor=white)](https://nextjs.org)
[![YOLOv8](https://img.shields.io/badge/Ultralytics-YOLOv8-blue.svg)](https://docs.ultralytics.com)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C.svg?logo=pytorch&logoColor=white)](https://pytorch.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB.svg?logo=python&logoColor=white)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## 🌐 Live Production Links

Experience SentinelAI live on the public cloud:

| Service | Public URL | Description |
| :--- | :--- | :--- |
| 🚀 **Live Web Application** | **[https://sentinel-ai-app-olive.vercel.app](https://sentinel-ai-app-olive.vercel.app)** | Production Next.js 14 SOC dashboard & landing page |
| 📊 **SOC Overview Command Center** | **[https://sentinel-ai-app-olive.vercel.app/dashboard](https://sentinel-ai-app-olive.vercel.app/dashboard)** | Real-time SOC overview, live KPI cards, and critical alerts |
| 📹 **Multi-Camera Monitoring Grid** | **[https://sentinel-ai-app-olive.vercel.app/monitoring](https://sentinel-ai-app-olive.vercel.app/monitoring)** | Live multi-stream CCTV grid with FPS counters & fullscreen views |
| 🚨 **5-Second Alert Triage Center** | **[https://sentinel-ai-app-olive.vercel.app/alerts](https://sentinel-ai-app-olive.vercel.app/alerts)** | Explainable 5-second alert triage cards & incident actions |
| ⚡ **Live Backend API (Render)** | **[https://sentinel-ai-vnm8.onrender.com](https://sentinel-ai-vnm8.onrender.com)** | High-performance Python FastAPI intelligence server |
| 📖 **Interactive OpenAPI Documentation** | **[https://sentinel-ai-vnm8.onrender.com/docs](https://sentinel-ai-vnm8.onrender.com/docs)** | Interactive Swagger UI API testing & schemas |

---

## 📌 Executive Overview

**SentinelAI** is a production-grade Security Operations Center (SOC) intelligence platform engineered for residential communities, educational campuses, and commercial perimeters. 

Traditional video surveillance systems inundate security operators with thousands of false-positive motion alerts from trees, animals, and authorized foot traffic. SentinelAI solves security fatigue by evaluating computer-vision detections through a **deterministic 0–100 contextual risk engine**, a **spatial polygon boundary model**, and a **5-Second UX Alert Protocol** that presents human security officers with clear, actionable decision support.

```
                  ┌─────────────────────────────────────────┐
                  │       CCTV Feeds (RTSP / USB / DEMO)    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    YOLOv8 Real-Time Person Detection    │
                  │       (PyTorch / OpenCV Pipeline)       │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │   Centroid Multi-Object Tracking (Re-ID)│
                  │   Persistent Track IDs & Dwell Timers   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │     Ray-Casting Polygon Zone Engine     │
                  │    Perimeter & Restricted Boundary Hits │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │   Deterministic 0–100 Context Risk Model│
                  │  Zone + Identity + Dwell + Time + Rules │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      FastAPI Backend & SQLite Store     │
                  │   Alerts, Incidents & Timelines Created │
                  └────────────────────┬────────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     ▼                                   ▼
        ┌─────────────────────────┐         ┌─────────────────────────┐
        │  Google Gemini AI Layer │         │  WebSocket Alert Stream │
        │  Incident Brief & Guard │         │   Real-Time Push to SOC │
        │  Verification Checklist │         │   Operator Dashboard    │
        └────────────┬────────────┘         └────────────┬────────────┘
                     │                                   │
                     └─────────────────┬─────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │       Next.js 14 SOC Web Dashboard      │
                  │     5-Second Human-in-the-Loop Triage   │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Human Security Guard Action & Audit  │
                  │  (Acknowledge / Escalate / Log Record)  │
                  └─────────────────────────────────────────┘
```

---

## 🎯 5-Second UX Alert Protocol

When elevated risk is detected, security guards cannot afford to scrub through 10-minute video files. SentinelAI presents standardized, scannable alert triage cards answering 6 fundamental questions:

| Pillar | Description | Example Output |
| :--- | :--- | :--- |
| **WHO** | Track ID & Authorization Status | `Track #50DD (Unrecognized Subject)` |
| **WHERE** | Camera Location & Polygon Zone | `Cam 02 — Perimeter Fence South (Restricted Boundary)` |
| **WHEN** | Timestamp & Wall-Clock Dwell Time | `10:42:15 PM — Dwell Duration: 24s` |
| **WHAT** | Incident Classification & Summary | `Unauthorized loitering along restricted boundary line` |
| **WHY** | Transparent Context Factor Additions | `Restricted Zone (+35), No Pass (+25), Dwell >15s (+15)` |
| **WHAT TO DO** | Recommended Action Protocol | `Dispatch patrol guard to verify identity & secure boundary` |

---

## ⚡ Local Performance Benchmark

### Test Environment
- **Operating System**: Windows 10 x86_64
- **Model**: Ultralytics YOLOv8n (Nano)
- **Input Resolution**: 1280×720 (720p)
- **Test Set**: 100 consecutive frames
- **Execution Target**: CPU
- **CUDA Acceleration**: False

### Measured Performance
| Metric | Measured Value |
| :--- | :--- |
| **Total Processing Time** | `23.966 sec` |
| **Average Pipeline FPS** | **`4.17 FPS`** |
| **Per-Frame Latency** | **`239.66 ms/frame`** |

> **Hardware Disclaimer**: The benchmark above represents local CPU execution without discrete GPU acceleration. Actual throughput scales with hardware: standard NVIDIA RTX GPUs typically achieve 30–60+ FPS on 720p streams.

---

## 🏗️ Core Features & Capabilities

- **Multi-Stream Vision Pipeline**: Live ingestion of RTSP streams, USB cameras, and synthetic video loops with automatic hardware detection.
- **Centroid Object Tracking**: Stable `TRACK-#XXXX` tracking across frame occlusions with precise wall-clock dwell timers.
- **Spatial Polygon Zones**: Ray-casting point-in-polygon boundary checks against ground-contact foot coordinates.
- **Weighted 0–100 Risk Engine**: Multi-dimensional scoring evaluating Zone (0–35), Authorization (0–30), Dwell (0–25), Time-of-Day (0–15), and Behavior (0–15).
- **Incident Lifecycle Management**: End-to-end incident investigations with millisecond-accurate chronological audit timelines.
- **Pre-Registered Visitor Directory**: Resident whitelist with pass IDs (`VP-XXXX`), allowed zones, and digital QR verification.
- **SOC Web Dashboard (12 Pages)**: Real-time UI for Live Monitoring, Alerts, Incidents, Visitors, Cameras, Analytics, Audit Logs, Settings, and Operator Login.
- **Google Gemini AI Assistant**: Non-blocking AI incident briefs, guard verification checklists, and conversational log queries.
- **Role-Based Access Control (RBAC)**: `GUARD`, `SUPERVISOR`, and `ADMIN` with PBKDF2-HMAC password hashing and JWT authentication.
- **Immutable Audit Trail**: Compliance logging for all logins, camera adjustments, visitor passes, and guard triage actions.

---

## 🚀 Quick Start Guide

### Prerequisites
* **Python 3.11+**
* **Node.js 20+**
* **Git**

### Option A: One-Click Windows Launcher (Recommended)
Double-click `start.bat` in the repository root or run:
```cmd
start.bat
```

### Option B: Manual Startup

#### Terminal 1 — Backend (FastAPI):
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
python seed_demo.py
uvicorn app.main:app --reload --port 8000
```

#### Terminal 2 — Frontend (Next.js):
```bash
cd frontend
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🎬 Reproducible Demo Mode

Run the single-command reproducible demonstration scenario to simulate an end-to-end perimeter breach with real-time risk scoring, AI briefing, and audit logging:

```cmd
backend\venv\Scripts\python.exe backend/demo.py
```

---

## 🛡️ Privacy, Safety & Production Security Framework

> **IMPORTANT DISCLAIMER**  
> SentinelAI is a security-awareness and decision-support platform designed to assist authorized human security personnel. The system **does not determine criminal intent or guilt**, and **never autonomously classifies individuals as dangerous or criminal**. Alerts represent contextual indicators of elevated operational risk and must be reviewed by human operators before any action is taken.

* **Human-in-the-Loop**: AI flags contextual anomalies; human officers make all final assessment decisions.
* **Local Processing**: Video feeds are processed locally on-premise and never transmitted to external clouds.
* **No Facial Profiling**: Operates on spatial bounding boxes, centroid dwell times, and opt-in badge/pass registries.

### 🔒 Production Deployment Security Guidelines

When transitioning from the demonstration environment to a production SOC deployment:

1. **Disable Demo Mode**: Set `DEMO_MODE=false` in `backend/.env`.
2. **Configure JWT Secret**: Generate and provide a cryptographically secure 32+ character string for `SECRET_KEY`. When `DEMO_MODE=false`, the server strictly refuses to start if `SECRET_KEY` is omitted.
3. **Lock Down CORS**: Specify trusted frontend domain origins in `CORS_ORIGINS` (e.g. `https://sentinel-ai-app-olive.vercel.app`).
4. **WebSocket & SSRF Protection**: All WebSocket channels require valid JWT authentication query tokens (`/ws/alerts?token=...`), and camera source URLs are filtered against intranet loopback/link-local SSRF vectors.

---

## 🧪 Automated Testing Suite

Run the complete automated Pytest test suite (39 unit, security, and integration tests):

```cmd
backend\venv\Scripts\python.exe -m pytest backend/tests/ -v
```

```
============================= test session starts =============================
platform win32 -- Python 3.11.9, pytest-9.1.1
collected 39 items

backend/tests/test_api.py::test_root_endpoint PASSED                     [  2%]
backend/tests/test_api.py::test_get_cameras PASSED                       [  5%]
backend/tests/test_api.py::test_get_alerts PASSED                        [  7%]
backend/tests/test_api.py::test_get_system_status PASSED                 [ 10%]
backend/tests/test_api.py::test_get_analytics PASSED                     [ 12%]
backend/tests/test_api.py::test_get_visitors PASSED                      [ 15%]
backend/tests/test_api.py::test_create_expected_visitor PASSED           [ 17%]
backend/tests/test_auth.py::test_password_hashing_and_verification PASSED [ 20%]
backend/tests/test_auth.py::test_jwt_token_creation_and_decoding PASSED  [ 23%]
backend/tests/test_gemini.py::test_risk_engine_integrity PASSED          [ 25%]
backend/tests/test_gemini.py::test_gemini_disabled_mode PASSED           [ 28%]
backend/tests/test_gemini.py::test_gemini_success_mock PASSED            [ 30%]
backend/tests/test_gemini.py::test_gemini_malformed_json_fallback PASSED [ 33%]
backend/tests/test_gemini.py::test_ai_status_endpoint PASSED             [ 35%]
backend/tests/test_gemini.py::test_explain_alert_endpoint PASSED         [ 38%]
backend/tests/test_gemini.py::test_ai_chat_endpoint PASSED               [ 41%]
backend/tests/test_risk_engine.py::test_low_risk_authorized_resident PASSED [ 43%]
backend/tests/test_risk_engine.py::test_critical_risk_server_room_intrusion PASSED [ 46%]
backend/tests/test_risk_engine.py::test_explainable_reasons_presence PASSED [ 48%]
backend/tests/test_security_remediation.py::test_allowed_rtsp_url PASSED [ 51%]
backend/tests/test_security_remediation.py::test_allowed_https_url PASSED [ 53%]
backend/tests/test_security_remediation.py::test_blocked_localhost PASSED [ 56%]
backend/tests/test_security_remediation.py::test_blocked_127_0_0_1 PASSED [ 58%]
backend/tests/test_security_remediation.py::test_blocked_169_254_metadata PASSED [ 61%]
backend/tests/test_security_remediation.py::test_blocked_file_scheme PASSED [ 64%]
backend/tests/test_security_remediation.py::test_allowed_demo_sample_data_in_demo_mode PASSED [ 66%]
backend/tests/test_security_remediation.py::test_blocked_demo_sample_data_outside_demo_mode PASSED [ 69%]
backend/tests/test_security_remediation.py::test_blocked_directory_traversal_demo_path PASSED [ 71%]
backend/tests/test_security_remediation.py::test_websocket_valid_token PASSED [ 74%]
backend/tests/test_security_remediation.py::test_websocket_invalid_token PASSED [ 76%]
backend/tests/test_security_remediation.py::test_websocket_expired_token PASSED [ 79%]
backend/tests/test_security_remediation.py::test_websocket_missing_token_production_mode PASSED [ 82%]
backend/tests/test_security_remediation.py::test_secret_key_missing_production_mode_fails_safely PASSED [ 84%]
backend/tests/test_security_remediation.py::test_secret_key_missing_demo_mode_uses_safe_demo_key PASSED [ 87%]
backend/tests/test_security_remediation.py::test_auth_fallback_rejected_when_demo_mode_false PASSED [ 89%]
backend/tests/test_tracking.py::test_centroid_tracker_registration PASSED [ 92%]
backend/tests/test_tracking.py::test_centroid_tracker_persistence PASSED [ 94%]
backend/tests/test_tracking.py::test_polygon_intersection PASSED         [ 97%]
backend/tests/test_tracking.py::test_zone_membership_evaluation PASSED   [100%]

============================= 39 passed in 5.37s ==============================
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
