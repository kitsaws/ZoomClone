# Zoom Clone — Video Conferencing Web Platform

> A modern, high-fidelity Zoom Web Client clone built with **Next.js (TypeScript)**, **Tailwind CSS**, **FastAPI (Python)**, **SQLAlchemy 2.0**, and **SQLite**.

---

## 🌟 Project Highlights

- **Zoom-Identical UI & UX:** Pixel-accurate design matching Zoom Workplace (Dark mode palette `#1A1E24`, Zoom Blue `#0E71EB`, responsive video stage, live clock, bottom meeting control bar, participants drawer).
- **Core Meeting Workflows:**
  - 🟧 **Instant Meetings:** One-click instant meeting creation with auto-generated 10-digit meeting ID and shareable invite link.
  - 🟦 **Schedule Meetings:** Full scheduling workflow with date, time, duration pickers, and persistent database storage.
  - 🟦 **Join by ID / Link:** Direct meeting validation by meeting number or URL.
  - 👥 **Guest & Registered Users:** Join seamlessly with or without an account.
- **Waiting Room & Host Controls:** Real-time join requests, host admission modal, and participant state synchronization.
- **Layered Clean Architecture:** Strict separation of concerns (`Routers` → `Services` → `Repositories` → `SQLAlchemy ORM` → `SQLite`).
- **Shared API Contract Philosophy:** FastAPI Pydantic v2 schemas auto-generate OpenAPI 3.1 specifications (`/openapi.json`), driving strongly typed TypeScript client interfaces and eliminating silent schema drift.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Details & Packages |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** | TypeScript, SPA responsiveness, React Server/Client Components |
| **Styling** | **Tailwind CSS** | Zoom dark tokens, adaptive CSS video grids, Lucide Icons |
| **Backend** | **Python 3.11+ / FastAPI** | High-performance ASGI framework, Dependency Injection (`Depends`) |
| **Data Validation** | **Pydantic v2** | `BaseModel`, `pydantic-settings`, automated OpenAPI 3.1 generation |
| **Persistence / ORM** | **SQLAlchemy 2.0** | Declarative Base, typed models (`Mapped`), Repository Pattern |
| **Database** | **SQLite** | Embedded relational DB with WAL mode (`PRAGMA journal_mode=WAL;`) & Foreign Keys enabled |
| **Real-Time & Signaling**| **WebSockets & WebRTC** | FastAPI WebSocket Connection Manager, local media capture (`getUserMedia`), P2P signaling |

---

## 📋 Pre-Seeded Demo Accounts & Meetings

To evaluate the application across multiple devices and simulate real-time meetings without building a complex authentication system, the database is pre-seeded with rich data.

### 👤 Demo User Personas
You can switch personas on the dashboard or log in using these emails on the **Sign-In** screen (`/signin`):

| Persona Name | Email | Role / State |
| :--- | :--- | :--- |
| **Swastik Nagpal** | `swastik@zoom.test` | **Default Active User** (Host of active meeting) |
| **Alex Chen** | `alex@zoom.test` | Seeded participant (Muted, In-Meeting) |
| **Sarah Jenkins** | `sarah@zoom.test` | Seeded participant (Unmuted, In-Meeting) |
| **David Miller** | `david@zoom.test` | Waiting Room persona (Pending Join Request) |

### 📅 Pre-Configured Test Meetings

| Meeting Type | Meeting Number | Title | Status / Details |
| :--- | :--- | :--- | :--- |
| **🔴 Active Live Room** | `849 2018 3921` | *Sprint 24 Architecture Review* | 3 in-room participants + 1 in waiting room |
| **Upcoming Meeting 1** | `392 4810 5928` | *Scaler AI — Weekly Fullstack Sync* | Scheduled for tomorrow |
| **Upcoming Meeting 2** | `718 2940 1823` | *Product Design & UX Teardown* | Scheduled for tomorrow |
| **Past Meeting 1** | `102 9384 5721` | *Backend Scaffolding & SQLite* | Ended (3 participants history) |
| **Past Meeting 2** | `592 1048 3729` | *Project Kickoff Review* | Ended (3 participants history) |

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- **Python:** `3.11+`
- **Node.js:** `18.x` or `20.x+` (with `npm`)
- **Git**

---

### 2. Backend Setup (FastAPI)

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a Python virtual environment
# On Windows (PowerShell):
python -m venv venv
.\venv\Scripts\activate

# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy environment template
cp .env.example .env

# 5. Populate SQLite database with seed data
python -m app.db.seed

# 6. Start the FastAPI development server
uvicorn app.main:app --reload --port 8000
```

- **Backend API Base URL:** `http://localhost:8000`
- **Interactive Swagger Documentation:** `http://localhost:8000/docs`
- **OpenAPI Specification JSON:** `http://localhost:8000/openapi.json`

---

### 3. Frontend Setup (Next.js)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.local.example .env.local

# 4. Start the Next.js development server
npm run dev
```

- **Frontend Application URL:** `http://localhost:3000`

---

## 🏛️ System Architecture Overview

```text
[ Next.js SPA (App Router + Tailwind) ]
      │ (REST API / JSON)                 │ (WebSocket Events / Signaling)
      ▼                                   ▼
[ FastAPI Routers / HTTP Layer ]     [ FastAPI WebSocket Connection Manager ]
      │                                   │
      └──────────────┬────────────────────┘
                     ▼
       [ Domain Services Layer ] (Business Rules, State Transitions)
                     ▼
       [ Repository Layer ] (Data Access & Query Abstraction)
                     ▼
       [ SQLAlchemy 2.0 ORM ]
                     ▼
       [ SQLite Database ] (sqlite:///./zoom_clone.db)
```

### Key Architectural Decisions:
1. **Repository Pattern:** Database access is encapsulated inside `app/repositories/`. Business logic never executes raw database queries directly, making a future migration to PostgreSQL a zero-code-change configuration switch.
2. **SQLite Optimization:** Configured with `PRAGMA foreign_keys=ON;` to enforce relational cascades and `PRAGMA journal_mode=WAL;` (Write-Ahead Logging) to allow concurrent reads without write-blocking.
3. **Simulated Auth & Guest Architecture:**
   - **Multi-Device Testing:** Devices can log in as any seeded persona via `/signin` or the quick Demo Accounts switcher. Device identity is stored locally in `localStorage`.
   - **Guest Users:** Guests join via Meeting ID and Display Name. The `MeetingParticipant` record stores `user_id = NULL` and `is_guest = True`, avoiding polluting the `users` table with throwaway rows.

---

## 🧪 Assumptions Made

1. **Authentication:** In strict compliance with assignment instructions, full cryptographic auth (JWT, bcrypt, OAuth) is not implemented. A simulated email sign-in, demo persona switcher, and guest join modal are provided for multi-device testing.
2. **Database:** SQLite is used as mandated by the assignment specification with WAL mode enabled.
3. **WebRTC Priority:** WebRTC peer-to-peer audio/video streaming is implemented as a progressive enhancement on top of a rock-solid WebSocket signaling hub and Zoom UI layout.

---

## 📄 License
This project is developed as an engineering assignment. All rights reserved.
