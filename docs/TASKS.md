# UniRide (CTMS v2.0) - Phase-by-Phase Task Breakdown & Roadmap

---

## Phase 1: Environment Setup & Monorepo Initialization
- [x] **[High]** Initialize monorepo directory layout (`frontend/`, `backend_django/`, `dsa_service_csharp/`, `docs/`) `[Status: Completed]`
- [x] **[High]** Consolidate project masterplan and technical requirements in `docs/` `[Status: Completed]`
- [ ] **[High]** Configure local container environment with `docker-compose.yml` (PostgreSQL 16, Redis 7.2, Django, .NET 10) `[Status: Ready to Start]`
- [ ] **[Med]** Initialize `.env.example` templates and secret management pipelines `[Status: Pending]`
- [ ] **[Low]** Setup pre-commit hooks (Black, Flake8, dotnet format, Prettier) `[Status: Pending]`

---

## Phase 2: Django 5 Core Backend & Database Migration
- [ ] **[High]** Initialize Django 5.1 project with custom `User`, `StudentProfile`, and `DriverProfile` models (porting legacy `User.cs`, `Student.cs`, `Driver.cs`) `[Status: Pending]`
- [ ] **[High]** Define transit relational models (`Bus`, `Route`, `Stop`, `RouteStop`, `Booking`, `Waitlist`) with PostGIS spatial fields `[Status: Pending]`
- [ ] **[High]** Port legacy **QR Code Attendance System** (`AttendanceController` + `DriverAttendance.cs`): Implement TOTP validation, attendance history, and real-time boarding event hooks `[Status: Pending]`
- [ ] **[High]** Port legacy **Schedule & Shift System** (`ScheduleController.cs`): Implement morning/evening departure schedules and driver-bus pairing `[Status: Pending]`
- [ ] **[Med]** Port legacy **Notification & Feedback Systems** (`NotificationController.cs` + `FeedbackController.cs`): Broadcast announcements and student grievance logging `[Status: Pending]`
- [ ] **[High]** Build seed data migration script porting initial stops, routes, and sample buses from legacy SQL Server `[Status: Pending]`
- [ ] **[High]** Implement JWT authentication with RS256 asymmetric signing and refresh token rotation `[Status: Pending]`
- [ ] **[Med]** Build REST endpoints for standard CRUD operations under `/api/v1/transit/` with DRF serializers `[Status: Pending]`
- [ ] **[Med]** Implement RFC 7807 problem details error handling middleware `[Status: Pending]`
- [ ] **[Low]** Configure Swagger/OpenAPI documentation via `drf-spectacular` `[Status: Pending]`

---

## Phase 3: High-Performance C# .NET 10 DSA Microservice
- [ ] **[High]** Setup C# .NET 10 Minimal API project (`UniRide.DSA.csproj`) running on Kestrel `[Status: Pending]`
- [ ] **[High]** Implement `RouteGraph.cs`: Dijkstra's algorithm and A* heuristic with dynamic congestion multipliers `[Status: Pending]`
- [ ] **[High]** Implement `AVLTree.cs`: Self-balancing binary search tree for $O(\log n)$ seat reservation and re-balancing `[Status: Pending]`
- [ ] **[High]** Implement `MaxHeap.cs`: Priority queue for dynamic student waitlist allocation `[Status: Pending]`
- [ ] **[Med]** Implement `KDTree.cs`: 2D spatial indexing tree for sub-millisecond nearest stop lookups `[Status: Pending]`
- [ ] **[Med]** Implement `Trie.cs`: Prefix tree with Levenshtein fuzzy distance matching for stop autocomplete `[Status: Pending]`
- [ ] **[Med]** Implement `BloomFilter.cs`: Fast $O(1)$ probabilistic token revocation check before reaching database `[Status: Pending]`
- [ ] **[High]** Implement internal REST endpoints (`/api/dsa/route/optimize`, `/api/dsa/seat/reserve`, `/api/dsa/stops/nearest`) `[Status: Pending]`
- [ ] **[Med]** Write comprehensive unit test suite in xUnit benchmarking execution times ($< 20\text{ ms}$) `[Status: Pending]`

---

## Phase 4: IDS Predictive Analytics & Machine Learning
- [ ] **[High]** Implement `attendance_predictor.py`: Scikit-Learn Random Forest / XGBoost model predicting stop boarding demand `[Status: Pending]`
- [ ] **[High]** Implement `trajectory_analyzer.py`: GPS telemetry anomaly detection using DBSCAN clustering and Z-score speed profiling `[Status: Pending]`
- [ ] **[Med]** Implement `sentiment_engine.py`: VADER/Transformer pipeline for automated commuter grievance sentiment scoring `[Status: Pending]`
- [ ] **[Med]** Implement `digital_twin_sim.py`: SimPy discrete-event simulation modeling campus bus delays under peak loads `[Status: Pending]`
- [ ] **[Low]** Implement causal delay inference DAG using `pgmpy` Bayesian networks `[Status: Pending]`
- [ ] **[Med]** Expose analytics endpoints in Django under `/api/v1/analytics/` with Redis caching `[Status: Pending]`

---

## Phase 5: Computer Networks (Telemetry, Security & Resilience)
- [ ] **[High]** Configure Django Channels ASGI application with Redis channel layer for real-time WebSockets `[Status: Pending]`
- [ ] **[High]** Implement `GpsTelemetryConsumer` receiving driver coordinate streams and broadcasting to commuter clients `[Status: Pending]`
- [ ] **[High]** Setup internal mTLS (Mutual TLS) certificates for secure Django-to-C# microservice communication `[Status: Pending]`
- [ ] **[Med]** Implement distributed token-bucket rate limiting middleware using Redis `[Status: Pending]`
- [ ] **[Med]** Implement Circuit Breaker pattern with fallback in Python (`pybreaker`) for C# service downtime `[Status: Pending]`
- [ ] **[Low]** Capture Wireshark pcap traces comparing WebSocket vs HTTP polling throughput for documentation `[Status: Pending]`

---

## Phase 6: Modern Next.js 15 Frontend (v2.0 Redesign Completed)
- [x] **[High]** Initialize Next.js 15 App Router project with TypeScript and Tailwind CSS `[Status: Completed]`
- [x] **[High]** Build reusable Apple-inspired UI component library (`Button`, `Card`, `Input`, `Modal`, `Badge`, `Table`) in `frontend/src/components/ui/` `[Status: Completed]`
- [x] **[High]** Implement Commuter Live Map view with CartoDB Voyager light tiles, vehicle markers, and route polyline rendering `[Status: Completed]`
- [x] **[High]** Port & Upgrade **Student QR Bus Pass Component**: Dynamic TOTP QR display, live route status, and boarding history log `[Status: Completed]`
- [x] **[High]** Port & Upgrade **Driver QR Boarding Scanner**: High-speed camera scanner with instant audio/visual confirmation and Bloom Filter O(1) check `[Status: Completed]`
- [x] **[High]** Implement Stop Search & Autocomplete input connected to Trie API `[Status: Completed]`
- [x] **[Med]** Implement Seat Reservation UI with 40-seat interactive bus grid and AVL Tree load balancing `[Status: Completed]`
- [x] **[Med]** Port & Upgrade **Student Feedback & Grievance Modal**: Interactive star rating, category selector, and AI sentiment analysis preview `[Status: Completed]`
- [x] **[Med]** Port & Upgrade **Notification Center**: Real-time push toast alerts, unread badge counter, and emergency SOS banner `[Status: Completed]`
- [x] **[Med]** Implement Driver HUD Console: Live speed display, turn-by-turn alerts, and one-tap SOS button (`/dashboard/driver`) `[Status: Completed]`
- [x] **[Med]** Implement Admin Fleet Operations Dashboard with CRUD management and IDS Data Science Suite (`/dashboard/admin`) `[Status: Completed]`
- [x] **[Low]** Optimize responsive layouts across mobile, tablet, and widescreen monitors with off-canvas drawers `[Status: Completed]`

---

## Phase 7: Software Engineering QA, IEEE Docs & Cloud Deployment
- [ ] **[High]** Generate IEEE 830-compliant Software Requirements Specification (`docs/SRS.md`) `[Status: Pending]`
- [ ] **[High]** Generate IEEE 1016 Software Design Document (`docs/SDD.md`) and complete Mermaid UML diagram suite `[Status: Pending]`
- [ ] **[High]** Create GitHub Actions CI/CD workflow testing Django, C# xUnit, and Next.js builds on push `[Status: Completed]`
- [ ] **[High]** Provision **Supabase PostgreSQL 16** database with `CREATE EXTENSION postgis;` enabled `[Status: Pending]`
- [ ] **[High]** Provision **Upstash Serverless Redis** and configure `REDIS_URL` for Django Channels `[Status: Pending]`
- [ ] **[High]** Deploy `backend_django/` and `dsa_service_csharp/` to **Railway** with internal private networking and public HTTPS API URL `[Status: Pending]`
- [ ] **[High]** Deploy `frontend/` (Next.js 15) to **Vercel** with automatic GitHub continuous deployment `[Status: Pending]`
- [ ] **[Med]** Build Dockerfiles for Django and .NET service with multi-stage production builds `[Status: Pending]`
- [ ] **[Low]** Conduct chaos testing (simulated network lag and microservice kill) validating circuit breaker resilience `[Status: Pending]`

