# UniRide (CTMS v2.0) - System Architecture Document

---

## 1. High-Level Architecture Overview

UniRide CTMS v2.0 follows a **Polyglot Hybrid Architecture** separating heavy algorithmic computation, event-driven real-time streaming, and transactional data science across specialized cloud platforms:
- **Frontend Hosting**: **Vercel** (Global Edge CDN for Next.js 15 App Router)
- **Backend & Microservices**: **Railway** (Persistent ASGI WebSockets + C# .NET 10 Microservice in Private Network)
- **Real-Time Channel Layer & Cache**: **Upstash Redis** (Serverless low-latency message broker)
- **Relational & Spatial Database**: **Supabase** (PostgreSQL 16 with PostGIS spatial extension)

```
                     ┌─────────────────────────────────────────┐
                     │         Commuter & Fleet Admin          │
                     │      Next.js 15 / Tailwind CSS UI       │
                     │          (Hosted on VERCEL)             │
                     └────────────────────┬────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  │ HTTPS (REST API)                              │ WSS (Live Telemetry)
                  ▼                                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        RAILWAY CLOUD PLATFORM                          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │               Core Web & API Tier (Python 3.12 / Django 5)     │   │
│   │  • Django REST Framework (Auth, Passes, Schedules, CRUD)       │   │
│   │  • Django Channels / Daphne ASGI (Live Telemetry Broadcast)    │   │
│   │  • IDS Machine Learning & SimPy Digital Twin Engine            │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
│                                   │ Internal Private Network           │
│                                   │ (http://dsa-service.railway.internal)
│                                   ▼                                    │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              C# .NET 10 Standalone DSA Microservice            │   │
│   │  • Dijkstra & A* Dynamic Congestion Pathfinding                │   │
│   │  • AVL Tree & Max-Heap Priority Seat Allocator                 │   │
│   │  • KD-Tree 2D Spatial Nearest-Stop Indexing                    │   │
│   │  • In-Memory Bloom Filter for Anti-Fraud QR Verification       │   │
│   └────────────────────────────────────────────────────────────────┘   │
└──────────────────┬──────────────────────────────────────┬──────────────┘
                   │ TLS (rediss://)                      │ TLS (SSL Mode)
                   ▼                                      ▼
    ┌─────────────────────────────┐        ┌─────────────────────────────┐
    │       UPSTASH REDIS         │        │          SUPABASE           │
    │  (Serverless Channel Layer  │        │   (Managed PostgreSQL 16    │
    │   & Distributed Cache)      │        │    + PostGIS Spatial Ext)   │
    └─────────────────────────────┘        └─────────────────────────────┘
```

---

## 2. Technology Stack & Rationale

| Tier / Component | Technology | Version | Exact Architectural Rationale |
|---|---|---|---|
| **Frontend Framework** | **Next.js (App Router)** | `15.x` | Server-Side Rendering (SSR) for blazing initial loads, React Server Components for SEO, modern routing. |
| **Frontend Cloud Host**| **Vercel** | Latest | Native host for Next.js, zero-config CI/CD, global Edge network, instant SSL provisioning, and free student tier. |
| **Language (UI)** | **TypeScript** | `5.x` | Strict static typing across API contracts, payload safety, and reduction of runtime UI exceptions. |
| **Styling Engine** | **Tailwind CSS** | `3.4.x` | High-performance atomic utility CSS, native dark mode support, seamless glassmorphism tokens. |
| **Backend Web Framework**| **Django + DRF** | `5.1.x` | Batteries-included web framework, battle-tested ORM, native authentication, clean REST framework. |
| **Real-time Server (ASGI)**| **Django Channels + Daphne**| `4.1.x` | Native asynchronous WebSocket support for live driver GPS broadcasting and instant UI push notifications. |
| **Backend Cloud Host** | **Railway.app** | Latest | Dedicated persistent container runtime for Django ASGI with sub-second WebSockets, zero sleep timeouts, and private internal networking. |
| **High-Performance DSA** | **C# / .NET** | `10.0` | Sub-millisecond CPU-bound algorithm execution (A*, AVL, KD-Tree), zero-allocation `Span<T>`, JIT optimizations. |
| **Primary Database** | **Supabase (PostgreSQL 16)** | `16.x` | Managed cloud PostgreSQL with native **PostGIS** spatial extension for GPS geofencing, built-in connection pooler (PgBouncer), and auto-backups. |
| **Cache & Channel Layer** | **Upstash Redis** | `7.2.x` | Serverless low-latency cloud Redis with native TLS (`rediss://`), 10,000 free daily commands, backing Django Channels pub/sub and rate limiting. |
| **Machine Learning / IDS**| **Scikit-Learn, SimPy, Pandas**| Latest | Native Python data science ecosystem for predictive passenger modeling and campus transit digital twins. |


---

## 3. Directory Tree Structure

```
uniride-v2/
├── frontend/                               # Next.js 15 TypeScript Frontend
│   ├── src/
│   │   ├── app/                            # App Router Pages
│   │   │   ├── page.tsx                    # Landing Page with Apple-style sections
│   │   │   ├── layout.tsx                  # Root Layout & typography
│   │   │   ├── globals.css                 # Design tokens (Navy, Sapphire, Ice Blue)
│   │   │   ├── schedules/page.tsx          # Public Transit Schedules & Timetable
│   │   │   ├── login/page.tsx              # Split-screen Auth with Role Selection
│   │   │   ├── signup/page.tsx             # Commuter Registration
│   │   │   ├── dashboard/student/page.tsx  # Student Commuter Portal
│   │   │   ├── dashboard/admin/page.tsx    # Admin Fleet Operations Console
│   │   │   ├── dashboard/driver/page.tsx   # Driver HUD & Telemetry Console
│   │   │   ├── admin/page.tsx              # Admin Route Forwarder
│   │   │   └── driver/page.tsx             # Driver Route Forwarder
│   │   ├── components/                     # High-level feature components & modals
│   │   │   ├── Navbar.tsx                  # Global responsive navigation header
│   │   │   ├── Footer.tsx                  # University footer & contact
│   │   │   ├── Preloader.tsx               # Fullscreen animated bus splash
│   │   │   ├── LiveMap.tsx                 # Leaflet mapping engine with light tiles
│   │   │   ├── StudentPassModal.tsx        # Rotating TOTP cryptographic pass modal
│   │   │   ├── DriverScannerModal.tsx      # Boarding check-in camera HUD modal
│   │   │   ├── SeatReservationModal.tsx    # AVL-balanced 40-seat grid modal
│   │   │   ├── FeedbackModal.tsx           # NLP Sentiment analysis feedback modal
│   │   │   ├── DigitalTwinPanel.tsx        # SimPy discrete-event simulation panel
│   │   │   ├── ProtocolDissectorPanel.tsx  # RFC 6455 WebSocket frame dissector
│   │   │   └── ui/                         # Atomic Design System components
│   │   │       ├── Button.tsx              # Button with variants and sizes
│   │   │       ├── Card.tsx                # Card, Header, Title, Content, Footer
│   │   │       ├── Input.tsx               # Form input with icon slots
│   │   │       ├── Modal.tsx               # Reusable backdrop modal dialog
│   │   │       ├── Badge.tsx               # Semantic status badge pill
│   │   │       ├── Table.tsx               # Responsive data table collection
│   │   │       └── index.ts                # UI barrel export
│   │   └── lib/
│   │       └── api.ts                      # Django/WS client with resilient mock fallbacks
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend_django/                         # Python Django 5.x Web Application
│   ├── manage.py
│   ├── uniride/                            # Project configuration root
│   │   ├── settings.py
│   │   ├── asgi.py                         # ASGI entry point for Channels
│   │   ├── wsgi.py
│   │   └── urls.py
│   ├── core/                               # Core models (Users, Students, Drivers)
│   ├── transit/                            # Transit operations (Buses, Routes, Stops)
│   ├── telemetry/                          # WebSockets, consumers, GPS live feeds
│   ├── ids_analytics/                      # ML pipelines, predictive analytics, SimPy
│   ├── dsa_client/                         # HTTP/mTLS client talking to C# DSA engine
│   └── requirements.txt
│
├── dsa_service_csharp/                     # High-Performance C# .NET 10 Microservice
│   ├── Program.cs                          # Minimal API entry point
│   ├── Algorithms/
│   │   ├── RouteGraph.cs                   # Dijkstra + A* pathfinding
│   │   ├── AVLTree.cs                      # Self-balancing BST for seat allocation
│   │   ├── MaxHeap.cs                      # Priority queue for waitlist
│   │   ├── KDTree.cs                       # 2D spatial tree for nearest stops
│   │   ├── Trie.cs                         # Prefix autocomplete with Levenshtein
│   │   └── BloomFilter.cs                  # Token revocation verification
│   ├── DTOs/                               # Request/Response contracts
│   ├── UniRide.DSA.csproj
│   └── Dockerfile
│
├── docs/                                   # Project Documentation & Context Hub
│   ├── PRD.md                              # Product Requirements Document
│   ├── ARCHITECTURE.md                     # System Architecture & Schemas
│   ├── RULES.md                            # Global AI & Engineering Rules
│   ├── DESIGN.md                           # UI/UX Design System Specification
│   ├── TASKS.md                            # Phase-by-phase actionable task tracker
│   └── MEMORY.md                           # Project state and decisions memory
│
├── .github/workflows/                      # CI/CD Workflows
│   └── ci-cd.yml
├── docker-compose.yml                      # Local development orchestrator
└── README.md
```

---

## 4. End-to-End Data Flow

### 4.1 Commuter Live Telemetry Loop (WebSockets)
```
[Driver Mobile Client] 
       │ 1. GPS coordinates emitted every 1000ms
       ▼
[Django Channels ASGI Consumer] (telemetry/consumers.py)
       │ 2. Validate JWT & parse {bus_id, lat, lng, speed, bearing}
       ├──────────────────────────────────────────┐
       ▼                                          ▼
[Redis Pub/Sub Channel]                 [PostgreSQL Async Worker]
(`bus_telemetry_live`)                  (Batch insert to telemetry_gpslog)
       │
       ▼ Broadcast to subscribed clients
[Next.js Commuter Map Client]
       │ 3. Interpolate bus marker on Leaflet/Mapbox canvas (<250ms latency)
```

### 4.2 Dynamic Route Pathfinding Flow (Polyglot Inter-Service)
```
[Admin / Commuter Request]
       │ GET /api/v1/routes/optimize/?origin=Gate1&destination=BlockC
       ▼
[Django View / Service] (transit/services.py)
       │ 1. Extract current road traffic congestion weights from Redis
       │ 2. Forward payload to C# DSA Microservice over internal mTLS
       ▼
[C# .NET 10 Minimal API] (http://dsa-service:5050/api/dsa/route/optimize)
       │ 3. Execute A* search with Euclidean heuristic on RouteGraph
       │ 4. Response generated in <15ms: {path: [...], distance_km, eta_minutes}
       ▼
[Django View] ──▶ Transform to GeoJSON ──▶ [Next.js Map Client]
```

### 4.3 Smart QR Code Attendance & Verification Lifecycle (Enhanced Legacy Flow)
```
[Student Mobile App / Pass] 
       │ 1. Generates TOTP-signed dynamic QR Token (rotates every 30s)
       ▼
[Driver Console Camera / Scanner]
       │ 2. Scans QR code payload: {student_id, token, timestamp}
       ├──────────────────────────────────────────┐
       ▼ (Sub-millisecond verification)           ▼ (In case of network dead zone)
[C# DSA Bloom Filter Engine]               [Local IndexedDB Offline Queue]
(Checks if token already used in O(1))     (Buffers scans; auto-syncs on reconnect)
       │
       ▼ (Token is fresh & valid)
[Django Attendance Service] (/api/v1/attendance/verify/)
       │ 3. Log verified attendance record in PostgreSQL
       │ 4. Decrement available bus seats; update real-time passenger count
       ├──────────────────────────────────────────┐
       ▼                                          ▼
[Redis Pub/Sub Channel]                 [IDS Anomaly Pipeline]
(`bus_occupancy_update`)                (Compare scan count vs predicted demand)
       │
       ▼ Broadcast live occupancy to map
[All Student Commuters' Live Map UI]
```

---

## 5. Database Schema & Data Models

### Complete Relational Entity-Relationship Mapping (Preserving & Modernizing All Legacy Models)

| Modern Model Name | Legacy ASP.NET Equivalent | Preserved Fields & Modern Enhancements |
|---|---|---|
| **`User`** | `User.cs` | `id`, `email`, `role (STUDENT, DRIVER, ADMIN)`, `first_name`, `last_name`, `phone`, `is_active`, `password_hash (Argon2id)`. |
| **`StudentProfile`** | `Student.cs` | `user_id (1:1)`, `roll_number`, `rfid_card_uid`, `emergency_contact`, `default_stop_id (FK)`, `bus_pass_active (BOOL)`. |
| **`DriverProfile`** | `Driver.cs` | `user_id (1:1)`, `license_number`, `experience_years`, `rating_score`, `assigned_bus_id (FK)`. |
| **`Bus`** | `Bus.cs` | `id`, `registration_number`, `capacity (seats)`, `standing_capacity`, `status (ACTIVE, MAINTENANCE, OFF_DUTY)`, `current_route_id (FK)`. |
| **`Route`** | `BusRoute.cs` | `id`, `route_code`, `route_name`, `origin_name`, `destination_name`, `total_distance_km`, `estimated_duration_min`. |
| **`Stop` & `RouteStop`** | `RouteWaypoint.cs` | `id`, `stop_name`, `latitude`, `longitude`, `geofence_radius_meters`, `stop_sequence (INT)`, `scheduled_offset_min`. |
| **`Schedule`** | `Schedule.cs` | `id`, `route_id (FK)`, `bus_id (FK)`, `driver_id (FK)`, `shift_type (MORNING, EVENING)`, `departure_time`, `expected_arrival_time`, `is_active`. |
| **`Attendance`** | `Attendance.cs` | `id`, `student_id (FK)`, `bus_id (FK)`, `route_id (FK)`, `scan_timestamp`, `verification_method (QR_DYNAMIC, RFID, MANUAL)`, `validation_status (VALID, DUPLICATE_BLOCKED, EXPIRED)`, `latitude`, `longitude`, `synced_from_offline (BOOL)`. |
| **`DriverAttendance`** | `DriverAttendance.cs` | `id`, `driver_id (FK)`, `bus_id (FK)`, `shift_date`, `check_in_time`, `check_out_time`, `geofence_verified (BOOL)`. |
| **`GpsTelemetryLog`** | `BusLocation.cs` | `id`, `bus_id (FK)`, `latitude`, `longitude`, `speed_kmh`, `heading_degrees`, `recorded_at`. |
| **`Notification` & `ReadLog`**| `Notification.cs`, `NotificationRead.cs` | `id`, `title`, `message`, `target_role`, `is_emergency_broadcast`, `created_at`, `read_by_users (M2M)`. |
| **`FeedbackLog`** | `Feedback.cs` | `id`, `student_id (FK)`, `bus_id (FK)`, `rating (1-5)`, `comments`, `sentiment_polarity`, `sentiment_label`, `triage_priority (LOW, MEDIUM, URGENT)`. |
| **`Booking` / `Waitlist`** | *New (DSA Feature)* | `id`, `student_id (FK)`, `bus_id (FK)`, `route_id (FK)`, `seat_number`, `booking_status`, `qr_code_token`, `priority_score`. |
| **`IncidentAlert`** | `Report.cs` | `id`, `driver_id (FK)`, `bus_id (FK)`, `severity (LOW, MEDIUM, CRITICAL)`, `alert_type`, `description`, `created_at`. |

