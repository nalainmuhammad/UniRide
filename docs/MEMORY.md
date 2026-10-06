# UniRide (CTMS v2.0) - Persistent Context & Project Memory

---

## 1. Project Overview & Current Status

- **Project Name**: UniRide (Campus Transport Management System v2.0)
- **Academic Context**: 3rd Semester Computer Science Capstone Project integrating 4 core subjects:
  - **DSA**: High-performance algorithmic engine in C# (.NET 10 Minimal API)
  - **IDS**: Predictive analytics, ML models, and digital twin simulation in Python
  - **CN**: Real-time telemetry via Django Channels (ASGI/WebSockets), mTLS, and Redis rate limiting
  - **SE**: IEEE 830/1016 documentation, UML diagram suite, CI/CD pipeline, and structured testing
- **Current Lifecycle State**: **Frontend v2.0 Redesign Completed & Verified • Next.js 15 Active on Port 3000**
- **Active Workspace Directory**: `e:/3rd Semester/UniRide_Project`

---

## 2. Completed Milestones

- **Legacy Audit & Decontamination**: Completed comprehensive review of legacy ASP.NET monolith in `UniRide_3rd_Sem_project/`. Identified all existing models, controllers, and database relationships.
- **Polyglot Strategy Alignment**: Successfully replaced legacy fragmented architecture with an enterprise polyglot model:
  - Django 5.x + DRF + Django Channels for web, auth, API, and Data Science.
  - C# .NET 10 for isolated, zero-allocation computational DSA workloads.
- **Frontend v2.0 Redesign (100% Completed)**: Executed complete redesign plan (`docs/redesign_plan.md`):
  - Rewrote design tokens to Apple-inspired Deep Navy (`#000926`), Sapphire (`#0F52BA`), Ice Blue (`#D6E6F3`), Powder Blue (`#A6C5D7`), and White (`#FFFFFF`).
  - Implemented reusable UI component system (`frontend/src/components/ui/` with `Button`, `Card`, `Input`, `Modal`, `Badge`, `Table`).
  - Built Apple-style Landing Page (`/`), Schedules Page (`/schedules`), Role-based Auth (`/login`, `/signup`).
  - Built Student Dashboard (`/dashboard/student`) with rotating TOTP pass, live Leaflet tracking, attendance logs, and NLP sentiment feedback.
  - Built Admin Operations Console (`/dashboard/admin`) with full CRUD, AVL smart allocation, and the IDS Data Science suite.
  - Built Driver HUD Console (`/dashboard/driver`) with OBD-II speedometer, camera scanner HUD, turn-by-turn navigation, and emergency SOS broadcast.
  - Completed all debug sessions with 0 TypeScript/build errors.
- **Documentation Updated**: Synchronized `redesign_plan.md`, `DESIGN.md`, `ARCHITECTURE.md`, `TASKS.md`, and `MEMORY.md` with the new design system and folder structure.

---

## 3. Key Architectural Decision Records (ADRs)

| ADR ID | Decision Title | Status | Rationale | Alternatives Considered |
|---|---|---|---|---|
| **ADR-001** | Polyglot Backend (Django 5 + C# Microservice) | **Approved** | Python provides the best ecosystem for ML/IDS and rapid web development; C# fulfills the academic requirement for pure C# DSA while providing ultra-fast graph and tree computation. | Single ASP.NET monolith, Single Django monolith. |
| **ADR-002** | PostgreSQL 16 with PostGIS Extension | **Approved** | Industry standard for geospatial transit coordinates, geofences, and spatial distance calculations without external GIS servers. | Microsoft SQL Server Express, SQLite, MongoDB. |
| **ADR-003** | WebSockets via Django Channels + Redis | **Approved** | Provides sub-250ms real-time GPS coordinates broadcasting to hundreds of student commuter clients with low server overhead. | Periodic HTTP polling, Server-Sent Events (SSE). |
| **ADR-004** | Next.js 15 Light-Dominant Apple Design System | **Approved & Built** | Modern, high-contrast, professional light-dominant aesthetic (Deep Navy, Sapphire, Ice Blue, Powder Blue, White). Replaced dark cyberpunk theme for optimal campus usability in daylight. | Dark cyberpunk theme, generic Tailwind presets. |
| **ADR-005** | Internal Mutual TLS (mTLS) for Inter-service RPC | **Approved** | Secures communications between Django web servers and C# DSA microservice over internal private network networks. | Plain HTTP over internal subnet, Shared API key header. |
| **ADR-006** | 100% Legacy Feature Retention & Modernization | **Approved** | Zero regression mandate: All ASP.NET features (QR attendance, driver check-in, bus scheduling, bus pass, feedback, notifications) retained and elevated by modern DSA/IDS/CN/SE capabilities. | Dropping legacy features, rewriting only a partial subset. |
| **ADR-007** | Multi-Cloud Deployment Topology (Vercel + Railway + Upstash + Supabase) | **Approved** | Next.js 15 on Vercel for global Edge CDN; Django & C# on Railway for persistent WebSockets and private networking; Upstash for serverless low-latency Redis; Supabase for managed PostGIS. | Single VPS monolithic deployment, pure serverless without persistent WebSockets. |

---

## 4. Known Technical Debt & Challenges

1. **Backend Integration**: Frontend is running with resilient mock fallbacks; next step is running Django 5 backend and C# microservice locally.
2. **C# Minimal API Algorithm Independence**: Algorithms in `dsa_service_csharp` must remain 100% custom-built for academic defense without relying on third-party NuGet collections for graphs or trees.

---

## 5. Immediate Next Actions

1. Maintain Next.js 15 dev server running on `http://localhost:3000`.
2. Review live portals in browser (Commuter Landing, Student Portal, Driver HUD, Admin Operations).
