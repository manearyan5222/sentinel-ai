# SentinelAI — System Architecture & Technical Specifications

SentinelAI is an AI-powered CCTV security awareness and incident intelligence platform designed to convert continuous camera video feeds into explainable, prioritized security alerts for human security operations personnel.

---

## 1. System Pipeline Architecture

```
+-----------------------------------------------------------------------------+
|                          1. INGESTION & PERCEPTION                          |
|  RTSP Streams / USB Webcams / Synthetic Demo Video Loops (OpenCV cv2.VideoCapture)  |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                          2. OBJECT DETECTION LAYER                          |
|  PyTorch / Ultralytics YOLOv8 Nano (Class 0: Person) with CUDA/CPU Fallback |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                       3. PERSISTENT CENTROID TRACKING                       |
|  Euclidean Centroid Distance Matrix Matching + Wall-Clock Dwell Timer       |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                       4. SPATIAL POLYGON ZONE ENGINE                        |
|  Ray-Casting Point-in-Polygon Algorithm on Ground-Contact Foot Coordinates  |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     5. CONTEXTUAL RISK SCORING ENGINE                       |
|  Weighted Formula: Zone (35) + Auth (30) + Dwell (25) + Time (15) + Behavior (15)  |
|  Severity: LOW (0-29) • MEDIUM (30-59) • HIGH (60-79) • CRITICAL (80-100)   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     6. DECISION SUPPORT & PERSISTENCE                       |
|  FastAPI REST API + SQLite DB + Incident Timeline Events + System Audit Logs|
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                     7. GOOGLE GEMINI AI INTELLIGENCE                        |
|  Incident Briefs, Human Verification Checklists & Conversational Assistant   |
+-----------------------------------------------------------------------------+
                                       |
                                       v
+-----------------------------------------------------------------------------+
|                         8. GUARD SOC DASHBOARD                              |
|  Next.js 14 + React + Tailwind + Recharts + WebSockets Event Push           |
|  5-Second UX Alert Triage Protocol -> Human Acknowledges / Resolves         |
+-----------------------------------------------------------------------------+
```

---

## 2. Core Modules & Responsibilities

### Perception & Computer Vision (`backend/app/ai/detector.py` & `tracker.py`)
* **Detector**: Uses YOLOv8 Nano for real-time person detection. Automatically detects NVIDIA CUDA acceleration via PyTorch, falling back gracefully to optimized CPU execution.
* **Tracker**: Implements a persistent centroid tracker that assigns stable `TRACK-#XXXX` identifiers, tracks trajectory across disappearing frames, and calculates precise dwell duration.

### Spatial Zone Engine (`backend/app/ai/zone_engine.py`)
* Evaluates normalized polygon coordinates defining security perimeters (e.g. Server Rooms, Fence Lines, Concierge Desks).
* Uses ray-casting point-in-polygon tests on the bottom-center foot coordinate of tracked bounding boxes.

### Contextual Risk Engine (`backend/app/ai/risk_engine.py`)
* Scores events from 0 to 100 based on explainable weighted factors:
  $$\text{Risk Score} = \min(100, \text{zone\_score} + \text{auth\_score} + \text{dwell\_score} + \text{temporal\_score} + \text{behavior\_score})$$
* Returns a full array of breakdown reasons explaining exactly why a risk score was generated.

### Google Gemini AI Layer (`backend/app/ai/gemini_service.py`)
* Generates structured incident briefs and recommended verification steps for security guards.
* Adheres strictly to **Human-in-the-Loop** and ethical guidelines (never makes criminal allegations or autonomously executes enforcement).

---

## 3. Database Schema (`SQLite`)

| Entity | Primary Key | Key Attributes |
| :--- | :--- | :--- |
| **`users`** | `id` | `username, email, hashed_password, role (GUARD, SUPERVISOR, ADMIN)` |
| **`cameras`** | `id` | `name, location_zone, stream_type, source_path, status, is_restricted_zone, fps` |
| **`zones`** | `id` | `camera_id, name, zone_type, severity, polygon_coordinates, max_dwell_seconds` |
| **`authorized_persons`** | `id` | `full_name, identity_type, unit_number, access_level, allowed_zones` |
| **`expected_visitors`** | `id` | `pass_id, visitor_name, resident_host_name, unit_number, purpose, status, qr_code_data` |
| **`alerts`** | `id` | `camera_id, risk_score, risk_level, severity, risk_reasons, status, action_protocol, ai_summary` |
| **`incidents`** | `id` | `title, camera_id, alert_id, severity, status, risk_score, summary, guard_notes` |
| **`incident_timeline_events`** | `id` | `incident_id, timestamp, event_type, description, data` |
| **`audit_logs`** | `id` | `timestamp, username, action, resource_type, resource_id, details, ip_address` |

---

## 4. API Endpoints

* **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
* **Cameras**: `GET /api/cameras`, `POST /api/cameras`, `PUT /api/cameras/{id}`, `DELETE /api/cameras/{id}`, `POST /api/cameras/{id}/test`, `GET /api/cameras/{id}/stream`
* **Spatial Zones**: `GET /api/zones`, `POST /api/zones`, `DELETE /api/zones/{id}`
* **Alerts**: `GET /api/alerts`, `GET /api/alerts/{id}`, `PATCH /api/alerts/{id}/status`, `POST /api/alerts/{id}/assign`
* **Incidents**: `GET /api/incidents`, `GET /api/incidents/{id}`, `GET /api/incidents/{id}/timeline`, `PATCH /api/incidents/{id}/status`
* **Visitors**: `GET /api/visitors/authorized`, `GET /api/visitors/expected`, `POST /api/visitors/expected`, `PATCH /api/visitors/expected/{id}/status`
* **Analytics**: `GET /api/analytics`
* **Audit Trail**: `GET /api/audit-logs`
* **System Telemetry**: `GET /api/system/status`
* **Gemini AI**: `GET /api/ai/status`, `POST /api/ai/explain-alert`, `POST /api/ai/chat`
