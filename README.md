# Zoom Clone — Video Conferencing Web Platform

> A modern, high-fidelity Zoom Web & Desktop Client clone built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, **LiveKit SFU (WebRTC)**, **FastAPI (Python)**, **SQLAlchemy 2.0**, and **SQLite**.

---

## 🌟 Project Highlights

- **Zoom-Identical UI & UX:** Pixel-accurate design matching Zoom Workplace (Dark & Light theme components, `#0E71EB` Zoom Blue branding, responsive video stage, live duration timer, bottom meeting control bar, participants slide-over drawer).
- **LiveKit Cloud SFU WebRTC Media Architecture:**
  - **Zero HTTP Polling:** In-room media streaming, peer discovery, muting, and participant updates are 100% real-time SFU-driven via WebRTC events.
  - **Dynamic Low-Latency Media:** Real-time multi-peer camera feeds, microphone tracks, active speaker detection, and automatic track subscription management.
  - **Real-Time Data Channel Signaling:** Hand raise broadcasts, emoji reactions, in-meeting chat, and host remote commands (Mute All, End Meeting for All).
  - **Backend Scoped Token Generation:** FastAPI issues cryptographically signed LiveKit JWT access tokens with granular room permissions.
- **Pre-Join Meeting Lobby:** Zoom desktop-style light-themed lobby preview with live camera stream (`getUserMedia`), mic mute toggle, video mirror option, audio level visualizer, and display name customization before entering the room.
- **Connecting Experience:** Authentic Zoom Workplace connection screen with radial spoke loading animation and encrypted media connection feedback.
- **Meeting Management & Dashboard:**
  - 🟧 **Instant Meetings:** One-click instant meeting creation with auto-generated 10-digit meeting ID, passcode protection, and shareable invite links.
  - 🟦 **Schedule Meetings:** Full scheduling workflow with start time, duration, timezone, passcode, waiting room, and recurring options.
  - 🟦 **Join by ID / Link:** Direct meeting join with URL query parameter support (`?autojoin=1`, `?name=...`, `?passcode=...`).
  - 📋 **Meeting Tabs & Agenda:** Upcoming meetings, Past / Recorded history, and Personal Meeting ID (PMI) management.
- **Host Security & Controls:** Host badge identification, Mute All participants, End Meeting for Everyone, and slide-over Host Tools drawer.
- **Clean Layered Architecture:** Strict separation of concerns (`Routers` → `Services` → `Repositories` → `SQLAlchemy ORM` → `SQLite WAL mode`).
- **Automated Schema Contract:** FastAPI Pydantic v2 schemas drive OpenAPI 3.1 specifications (`/openapi.json`), ensuring strict alignment with TypeScript client types.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Details & Packages |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 16 (App Router)** | React 19, TypeScript, Turbopack, Server/Client components |
| **Styling** | **Tailwind CSS** | Zoom Workplace tokens, glassmorphism, responsive video grids, Lucide Icons |
| **WebRTC / SFU** | **LiveKit Client SDK (`livekit-client`)** | Real-time SFU media tracks, data packets, adaptive stream, speaker detection |
| **Backend** | **Python 3.11+ / FastAPI** | High-performance ASGI framework, Dependency Injection (`Depends`), CORS regex |
| **SFU Auth & Tokens** | **LiveKit Server SDK (`livekit-api`)** | Scoped JWT access tokens, VideoGrants permissions |
| **Data Validation** | **Pydantic v2** | `BaseModel`, `pydantic-settings`, automated OpenAPI 3.1 generation |
| **Persistence / ORM** | **SQLAlchemy 2.0** | Declarative Base, typed models (`Mapped`), Repository Pattern |
| **Database** | **SQLite** | WAL mode (`PRAGMA journal_mode=WAL;`), Foreign Keys enabled |
| **Testing** | **Pytest & HTTPX** | Automated unit and integration test suite (`tests/test_api_endpoints.py`) |

---

## 🏛️ System Architecture Overview

```text
                               ┌──────────────────────────────────────────────┐
                               │       Next.js App Router (TypeScript)        │
                               │  - Dashboard & Schedule Manager              │
                               │  - Pre-Join Camera/Mic Lobby Modal           │
                               │  - SFU Video Stage & Meeting Control Bar     │
                               └──────────────┬───────────────────────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │ (REST API / JSON)                             │ (LiveKit WebRTC SFU)
                      ▼                                               ▼
       ┌───────────────────────────────┐               ┌───────────────────────────────┐
       │     FastAPI Backend (Python)  │               │      LiveKit Cloud SFU        │
       │  - Meeting & User Routers     │               │  - Audio/Video Track Routing  │
       │  - LiveKit JWT Token Service  │               │  - Active Speaker Detection   │
       │  - Repository Pattern / ORM   │               │  - Real-Time Data Channels    │
       └──────────────┬────────────────┘               └───────────────────────────────┘
                      │
                      ▼
       ┌───────────────────────────────┐
       │     SQLite Database (WAL)     │
       │  - Users & Credentials        │
       │  - Meetings & Schedules       │
       │  - Participants & History     │
       └───────────────────────────────┘
```

---

## 📋 Pre-Seeded Demo Accounts & Meetings

To evaluate the application across multiple devices and simulate real-time meetings without complex authentication overhead, the database includes rich pre-seeded personas and meetings.

### 👤 Demo User Personas
Switch personas on the dashboard or sign in using these emails on the **Sign-In** screen (`/signin`):

| Persona Name | Email | Role / State |
| :--- | :--- | :--- |
| **Swastik Nagpal** | `swastik@zoom.test` | **Default Active User** (Host persona) |
| **Alex Chen** | `alex@zoom.test` | Team Member persona |
| **Sarah Jenkins** | `sarah@zoom.test` | Product Manager persona |
| **David Miller** | `david@zoom.test` | Participant persona |

### 📅 Pre-Configured Test Meetings

| Meeting Type | Meeting Number | Title | Status / Details |
| :--- | :--- | :--- | :--- |
| **🔴 Active Live Room** | `849 2018 3921` | *Sprint 24 Architecture Review* | Live room ready to join across devices |
| **Upcoming Meeting 1** | `392 4810 5928` | *Scaler AI — Weekly Fullstack Sync* | Scheduled for tomorrow |
| **Upcoming Meeting 2** | `718 2940 1823` | *Product Design & UX Teardown* | Scheduled for tomorrow |
| **Past Meeting 1** | `102 9384 5721` | *Backend Scaffolding & SQLite* | Ended (history view) |
| **Past Meeting 2** | `592 1048 3729` | *Project Kickoff Review* | Ended (history view) |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Python:** `3.11+`
- **Node.js:** `18.x` or `20.x+` (with `pnpm` or `npm`)
- **Git**

---

### 2. Backend Setup (FastAPI)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
# Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template and configure variables
cp .env.example .env

# 5. Populate SQLite database with seed data
python -m app.db.seed

# 6. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **Backend API Base URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **OpenAPI Specification JSON:** `http://localhost:8000/openapi.json`

#### Running Backend Tests:
```bash
python -m pytest
```

---

### 3. Frontend Setup (Next.js)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
pnpm install
# or: npm install

# 3. Configure environment variables
cp .env.local.example .env.local

# 4. Start the Next.js development server
pnpm dev
# or: npm run dev
```

- **Frontend Application URL:** `http://localhost:3000`

---

## 🔑 Environment Variables Configuration

### Backend (`backend/.env`):
```env
# Application Settings
PROJECT_NAME="Zoom Clone API"
API_V1_STR="/api/v1"
CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000"]
CORS_ORIGIN_REGEX="https?://.*(vercel\.app|render\.com|localhost:[0-9]+)"

# Database (SQLite with WAL mode)
DATABASE_URL="sqlite:///./zoom_clone.db"

# LiveKit SFU Cloud Credentials
LIVEKIT_URL="wss://zoom-clone-439p850o.livekit.cloud"
LIVEKIT_API_KEY="your-livekit-api-key"
LIVEKIT_API_SECRET="your-livekit-api-secret"
```

### Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api/v1"
```

---

## 🎥 Key Meeting Features Walkthrough

1. **Creating / Starting a Meeting:**
   - Click **"New Meeting"** on the dashboard for an instant session, or **"Schedule"** to set a date and time.
   - The pre-join lobby launches with a real-time camera/microphone preview.
   - Click **"Join Meeting"** to connect to the LiveKit SFU room.

2. **Joining from Another Device / Tab:**
   - Copy the invite link (`http://localhost:3000/meeting/<id>`) and open it in another browser tab, window, or device on the same network.
   - Enter your display name in the light-themed lobby and join.
   - Video tiles and audio streams will immediately negotiate over LiveKit SFU with zero latency.

3. **In-Meeting Collaboration:**
   - **Mute / Video Toggles:** Pure SFU track controls without page resets or disconnections.
   - **Hand Raise:** Broadcasts hand-raise status with animated badges to all participants.
   - **Reactions:** Floating emoji reactions (👏, 👍, ❤️, 😂, 😮, 🎉) broadcast in real time.
   - **In-Room Chat:** Slide-over chat drawer with real-time SFU data messages.
   - **View Modes:** Seamless switching between **Dynamic Grid**, **Speaker Spotlight**, and **Gallery** layouts.
   - **Host Tools:** Host can mute all participants or end the meeting for everyone.

---

## 📄 License
This project is developed as an engineering assignment. All rights reserved.
