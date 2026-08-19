<div align="center">

# 🛡️ SentinelAI

### Intelligent CCTV Security Awareness & Guard Triage Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![YOLOv8](https://img.shields.io/badge/YOLOv8-Ultralytics-00599C?style=for-the-badge&logo=pytorch&logoColor=white)](https://ultralytics.com/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-API_v1.5-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)](https://aistudio.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

*SentinelAI turns everyday residential CCTV into real-time security awareness — detecting loitering, computing transparent 0–100 risk context, and empowering guards with 5-second decision triage.*

[Explore Platform](#-quick-start-guide) • [Architecture](#-system-architecture) • [Risk Engine](#-deterministic-risk-engine-0100) • [Gemini AI Setup](#-optional-google-gemini-ai-layer)

</div>

---

## 🌟 Overview & Core Philosophy

> [!IMPORTANT]
> **Human-in-the-Loop Guarantee**: SentinelAI is a decision-support assistance layer, NOT an autonomous judge. It flags elevated security risks for human verification and **never automatically labels anyone a criminal**.

Residential security systems record terabytes of unread video every day while motion sensors spam guards with false alarms from swaying trees and pets. 

**SentinelAI** solves this by converting raw RTSP camera streams into structured spatial intelligence:
- **5-Second UX Triage Rule**: Presents instant WHO, WHERE, WHEN, WHAT, WHY, and WHAT TO DO context.
- **Deterministic 0–100 Risk Engine**: Calculates transparent risk scores from spatial boundary breaches, dwell duration, and credential checks.
- **Optional Gemini AI Layer**: Generates human-readable incident summaries and verification checklists without blocking real-time local computer vision.

---

## ⚡ Key Capabilities

| Feature | Description |
| :--- | :--- |
| 📹 **Multi-Stream Vision** | Ingests simultaneous RTSP feeds, webcams, or local video files across perimeter fences, gates, and lobbies. |
| 🎯 **YOLOv8 + Centroid Tracking** | Detects human entities and assigns persistent track IDs (`Track #0104`) to compute exact loitering trajectories. |
| 📊 **0–100 Contextual Risk Engine** | Transparent rule-based risk scoring with zero black-box magic. |
| ⚡ **5-Second Protocol Triage** | Instant modal interface providing actionable guard protocols (`MARK LEGITIMATE` or `ESCALATE INCIDENT`). |
| 🤖 **Google Gemini AI Assistant** | Non-blocking LLM assistant for natural language incident summaries and security Q&A. |
| 🔄 **Real-Time WebSockets** | Zero-latency event broadcast from FastAPI backend directly to Next.js SOC interface. |
| 🚀 **Zero-Docker Windows Native** | Runs natively on Windows 10/11 using standard local terminal commands (`python`, `npm`). |

---

## 🏗️ System Architecture

```
                                  SENTINELAI PIPELINE
                                  
  ┌─────────────────┐      ┌──────────────────────────┐      ┌─────────────────────────┐
  │  RTSP / CCTV    │ ───► │  OpenCV + YOLOv8 Tracker │ ───► │ 0–100 Context Risk      │
  │  Camera Feeds   │      │  Centroid Person Tracking│      │ Spatial/Temporal Engine │
  └─────────────────┘      └──────────────────────────┘      └────────────┬────────────┘
                                                                          │
  ┌─────────────────┐      ┌──────────────────────────┐                   │
  │ Security Guard  │ ◄─── │ Next.js 14 SOC Dashboard │ ◄─────────────────┘
  │ 5s Triage Action│      │ Real-Time WebSocket Push │      Real-Time Event Stream
  └────────┬────────┘      └────────────┬─────────────┘
           │                            │
           ▼                            ▼
  ┌─────────────────┐      ┌──────────────────────────┐
  │ Decision Audit  │      │ Google Gemini AI Layer   │ (Optional Intelligence
  │ Saved to SQLite │      │ Non-Blocking Summary API │  Support Analysis)
  └─────────────────┘      └──────────────────────────┘
```

### Repository Structure

```
sentinel-ai/
├── frontend/                 # Next.js 14 App Router UI (TypeScript, Tailwind CSS, Lucide)
│   ├── app/                  # App routes (SOC Grid, Alerts, Visitors, Analytics)
│   ├── components/           # UI Components & Landing Page Sections
│   ├── hooks/                # WebSocket hooks for live alert updates
│   └── lib/                  # REST API client & TypeScript interfaces
├── backend/                  # Python FastAPI Backend & Vision Pipeline
│   ├── app/ai/               # YOLO Detector, Centroid Tracker, Risk Engine, Gemini Service
│   ├── app/api/              # REST Endpoints & WebSocket Server
│   ├── app/database/         # SQLite SQLAlchemy session configuration
│   ├── app/models/           # Camera, Alert, Event, and AuthorizedPerson ORM schemas
│   ├── seed_demo.py          # Database seeder script
│   └── generate_demo_video.py# Synthetic CCTV security video generator
├── sample_data/              # Local demo MP4 video storage
├── start.bat                 # One-click Windows startup script
└── README.md
```

---

## 📐 Deterministic Risk Engine (0–100)

SentinelAI evaluates risk transparently based on enforceable spatial and temporal rules:

### Risk Rule Factors

| Rule Factor | Risk Point Addition | Description |
| :--- | :---: | :--- |
| **Unrecognized Person** | `+25 PTS` | Subject has no matching resident face/card profile in database. |
| **Restricted Perimeter Zone Breach** | `+30 PTS` | Subject crossed spatial polygon boundary into a restricted area. |
| **Extended Dwell Duration (>15s)** | `+15 PTS` | Subject remained stationary or loitered beyond threshold time. |
| **No Visitor Pre-Registration Pass** | `+20 PTS` | Subject has no active pre-registered visitor clearance badge. |

### Priority Threshold Levels

- 🟢 **LOW RISK (`0–29`)**: Normal routine activity. Logged for audit.
- 🟡 **MODERATE RISK (`30–49`)**: Minor anomaly. Monitor camera feed.
- 🟠 **ELEVATED RISK (`50–74`)**: High loitering/unrecognized match. Alert dispatcher.
- 🔴 **HIGH RISK (`75–100`)**: Immediate action required. Flagged for 5-second guard triage.

---

## 🤖 Optional Google Gemini AI Layer

> [!NOTE]
> **Zero-Crash Standalone Operation**: Gemini AI is completely optional. If `GEMINI_API_KEY` is omitted, SentinelAI operates normally in `AI: DISABLED` mode without crashing.

Gemini AI acts as a non-blocking assistant for security guards:
- **Event-Driven Execution**: Gemini is **never** called on continuous video frames; it runs on-demand when a guard requests an incident summary.
- **Database Caching**: Summaries are cached in SQLite so duplicate requests consume zero extra API calls.
- **Strict Guardrails**: Prompts explicitly enforce non-accusatory, objective verification recommendations.

### 🔑 Setting up Gemini AI Key

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create or update `backend/.env`:
   ```cmd
   echo GEMINI_API_KEY=your_actual_api_key_here > backend\.env
   ```
3. Start SentinelAI normally. The AI status badge in the SOC Header will reflect `AI: ONLINE (GEMINI 1.5)`.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Windows 10 / 11**
- **Python 3.11+** (added to system PATH)
- **Node.js 20+ & npm**

---

### Option A: Automatic One-Click Launch (Recommended)

Simply run `start.bat` from Command Prompt or double-click it:

```cmd
start.bat
```

`start.bat` automatically handles environment setup, dependency installation, synthetic video generation, SQLite database seeding, and service initialization!

---

### Option B: Manual Terminal Launch

#### 1. Start Python Backend
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

#### 2. Start Next.js Frontend (Separate Terminal)
```cmd
cd frontend
npm install
npm run dev
```

---

## 🌐 Access Points

| Service | Access URL | Purpose |
| :--- | :--- | :--- |
| **Landing Page** | [http://localhost:3000](http://localhost:3000) | Commercial Product Showcase & Overview |
| **SOC Guard Dashboard** | [http://localhost:3000/dashboard](http://localhost:3000/dashboard) | 4-Camera Live Grid & Real-time Stream |
| **Alert Center** | [http://localhost:3000/alerts](http://localhost:3000/alerts) | Security Incident Log & 5s Triage Modal |
| **Visitor Directory** | [http://localhost:3000/visitors](http://localhost:3000/visitors) | Resident & Pre-Registered Visitor Database |
| **Analytics Workspace** | [http://localhost:3000/analytics](http://localhost:3000/analytics) | Operational Incident Charts & Metrics |
| **FastAPI OpenAPI Docs** | [http://localhost:8000/docs](http://localhost:8000/docs) | Interactive REST API Documentation |

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

<div align="center">

**SentinelAI** — *Human-in-the-Loop Residential CCTV Intelligence*

</div>
