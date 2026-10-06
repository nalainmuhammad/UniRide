# UniRide (CTMS v2.0) - Product Requirements Document (PRD)

---

## 1. Product Overview

**UniRide (Campus Transport Management System v2.0)** is an enterprise-grade, polyglot smart campus transportation and fleet management platform. It transforms chaotic, legacy university bus transit operations into an optimized, real-time, data-driven ecosystem. 

By unifying **High-Performance Data Structures & Algorithms (DSA)** in C#, **Data Science & Machine Learning (IDS)** in Python/Django, **Modern Computer Networks (CN)** with WebSocket telemetry and mTLS, and rigorous **Software Engineering (SE)** standards, UniRide delivers an automated, secure, and intuitive transit experience for students, drivers, and campus fleet administrators.

---

## 2. Problem Statement

University campus transit systems face chronic operational inefficiencies:
- **Unpredictable Schedules & Ghost Buses**: Students wait at stops with zero visibility into real-time bus locations, arrival estimates, or route diversions.
- **Suboptimal Bus Capacity & Overcrowding**: Peak morning and evening slots suffer severe overcrowding, while off-peak buses run empty due to fixed, static scheduling.
- **Inefficient Routing & High Fuel Costs**: Fixed routes ignore dynamic traffic congestion, construction bottlenecks, and varying stop-level boarding demand.
- **Safety, Driver Fatigue & Complaint Neglect**: University dispatchers lack real-time driving telemetry (harsh braking, over-speeding) and cannot systematically categorize passenger grievances.
- **Legacy Monolithic Stacks**: Aging ASP.NET MVC monolithic applications lack modularity, real-time streaming capabilities, automated intelligence, and modern cross-platform support.

---

## 3. Goals & Success Metrics

### Strategic Goals
1. **Real-Time Visibility**: Provide sub-second live GPS bus tracking and dynamic ETAs to commuters.
2. **Automated Intelligent Allocation**: Dynamically optimize bus capacity and route dispatch using graph theory and predictive attendance algorithms.
3. **Enterprise Security & Reliability**: Protect transit telemetry and user data with zero-trust networking, mTLS, JWT authentication, and resilient failover.
4. **Actionable Fleet Insights**: Provide campus authorities with predictive analytics on fleet health, driver behavior, fuel consumption, and student sentiment.

### Key Performance Indicators (KPIs)
- **Commuter Wait Time Reduction**: Decrease average student stop wait times by $\ge 35\%$.
- **Fleet Utilization Efficiency**: Increase seat occupancy factor to $\ge 82\%$ across all operating windows.
- **Telemetry Latency**: Maintain end-to-end WebSocket GPS ping-to-render latency under $250\text{ ms}$.
- **Route Computation Time**: Execute multi-stop dynamic congestion route optimization in $< 20\text{ ms}$ via C# DSA engine.
- **System Uptime**: Achieve $99.9\%$ operational availability during university transit hours.

---

## 4. Target Users & Personas

| Persona | Role | Core Needs & Frustrations | Primary Touchpoints |
|---|---|---|---|
| **Ayesha (Student Commuter)** | Daily University Commuter | Needs exact bus arrival time, seat availability alerts, and instant route delay notifications. Tired of missed buses and overcrowded aisles. | Mobile/Responsive Web App, Live Map, QR Ticket Scanner, Push Alerts |
| **Tariq (Fleet Driver)** | Campus Shuttle Driver | Needs turn-by-turn optimized routing that bypasses congestion, rapid digital student boarding verification, and emergency breakdown reporting. | Driver Console, Turn-by-Turn View, QR Boarding Validator, SOS Dispatch |
| **Col. Farooq (Transport Director)** | Fleet Administrator & Dispatcher | Needs complete fleet bird's-eye view, dynamic bus reassignment, automated schedule generation, and fuel/maintenance anomaly detection. | Web Admin Dashboard, Fleet Heatmaps, Driver Telemetry, Allocation Matrix |
| **Dr. Nadia (Academic Evaluator)** | University Auditor & Evaluator | Inspects algorithmic efficiency, network resilience, predictive ML validity, and architectural compliance with IEEE standards. | Technical Specs, System Health Monitor, Benchmark Logs, SRS Docs |

---

## 5. Legacy Feature Preservation & Modernization Matrix

> [!IMPORTANT]
> **Strict Zero-Regression Mandate**: All existing features from the legacy ASP.NET application (`UniRide_3rd_Sem_project`) are 100% retained. They are not discarded; rather, they are systematically modernized and supercharged by the new subjects (DSA, IDS, CN, SE).

| Legacy ASP.NET Feature | Legacy State (ASP.NET MVC) | Modernized & Enhanced State (UniRide v2.0) | Enhancing Subject |
|---|---|---|---|
| **QR Code Attendance** (`AttendanceController`) | Basic static QR code scanning and SQL database insertion. | **Cryptographic Anti-Fraud QR + Sub-Millisecond Bloom Filter Validation**: Dynamic time-rotating QR codes (TOTP) preventing screenshot sharing; instant $O(1)$ validity check via C# Bloom Filter; offline camera queue sync for dead zones; real-time occupancy broadcast over WebSockets. | **CN** (Security/mTLS) + **DSA** (Bloom Filter) + **IDS** (Anomaly Detection) |
| **Driver Attendance** (`DriverAttendance.cs`) | Manual check-in log table. | **Geofenced Automated Driver Shift Validation**: Auto-verification of driver check-in when driver coordinates intersect the bus depot geofence via KD-Tree spatial indexing. | **DSA** (KD-Tree) + **CN** (Telemetry) |
| **Live Bus Tracking** (`TrackingController`) | Static HTML map with slow AJAX polling (5-10s interval). | **Sub-Second Real-Time Telemetry Streaming**: Low-latency (<250ms) bidirectional WebSockets (Django Channels + Redis) with client-side marker vector interpolation and directional bearing indicator. | **CN** (ASGI/WebSockets) |
| **Route & Stop Management** (`RouteController`) | Static stop sequence table in SQL Server. | **Dynamic Congestion-Aware Routing**: Dynamic A* and Dijkstra pathfinding in C# recalculating routes based on peak-hour congestion; sub-millisecond stop autocomplete via Trie + Levenshtein. | **DSA** (A* + Trie) |
| **Bus Scheduling** (`ScheduleController`) | Hardcoded fixed morning/evening timetable. | **AI Predictive Demand-Responsive Scheduling**: Machine learning (Random Forest) predicting passenger loads per shift and dynamically suggesting bus fleet dispatch schedules. | **IDS** (Scikit-Learn ML) |
| **Student Bus Pass** (`StudentController`) | Basic web page display of student roll number and bus route. | **Digital Glassmorphic Pass & Real-Time Seat Allocation**: Verified digital pass with live seat reservation status managed by self-balancing AVL Trees and Max-Heap priority waitlists. | **DSA** (AVL/Heap) + **SE** (Design System) |
| **Student Feedback & Reviews** (`FeedbackController`) | Simple star rating and text comments saved in database. | **Intelligent NLP Sentiment & Grievance Triage**: Automated NLP sentiment scoring (VADER/Transformers) categorizing complaints into urgency tiers and auto-flagging driver safety incidents. | **IDS** (NLP & Sentiment Analysis) |
| **System Notifications** (`NotificationController`) | Basic SQL table polling for unread user notifications. | **Push Telemetry & SOS Emergency Broadcast**: Instant push alerts via WebSockets for route diversions, delay notices, and driver-initiated one-tap SOS emergency broadcasts. | **CN** (WebSockets) |
| **Role-Based Auth & Profiles** (`AuthController`) | Cookie-based ASP.NET Forms / Identity authentication. | **Zero-Trust Asymmetric JWT Auth**: RS256 signed tokens, refresh token rotation, Redis-backed blacklist revocation, and strict RBAC across Students, Drivers, and Fleet Admins. | **CN** (Network Security) |
| **Admin & Fleet Dashboards** (`DashboardController`) | Traditional server-rendered Razor HTML tables. | **Modern Glassmorphic Command Center**: Real-time fleet overview, live vehicle heatmaps, driver driving risk scores (DBSCAN), and digital twin simulation controls. | **SE** (Modern UI) + **IDS** (Digital Twin) |

---

## 6. MVP Feature List

### 6.1 Preserved & Supercharged Core Commuter Features
- **Smart QR Code Bus Pass & Boarding**: Instant camera-based student boarding pass scanning with TOTP time-rotation, offline verification sync, and duplicate-scan prevention.
- **Interactive Live Transit Map**: Real-time bus tracking with continuous marker movement interpolation, route polylines, and live vehicle speed display.
- **Sub-Second Stop Search & Autocomplete**: Instant search for campus stops, gates, and blocks powered by in-memory Trie prefix search with typo-tolerant fuzzy matching.
- **Dynamic ETAs & Congestion-Aware Routing**: Real-time arrival predictions continuously recalibrated against live traffic and stop boarding delays.
- **Seat Reservation & Waitlisting**: Priority seat booking and waitlist queueing powered by self-balancing AVL Trees and Max-Heaps.
- **Personalized Commuter Dashboard**: View assigned route, bus pass status, historical attendance logs, and active transit announcements.

### 6.2 Preserved & Supercharged Driver Features
- **Driver Turn-by-Turn Navigator**: Active route view with dynamic diversion alerts and live waypoint sequencing.
- **Rapid Passenger Scanner (Driver Console)**: High-speed QR code camera scanner providing immediate visual and audio boarding feedback.
- **Geofenced Shift Check-In**: Automatic driver shift attendance logging when the vehicle enters depot geofenced coordinates.
- **One-Tap SOS Emergency Broadcast**: Immediate emergency alert transmission broadcasting incident location to dispatchers over WebSockets.

### 6.3 Preserved & Supercharged Administrative Features
- **Full Fleet Command Center**: Live interactive bird's-eye map showing all campus buses, current capacities, speeds, and on-time status.
- **Predictive Fleet Dispatcher**: Automated bus scheduling suggestions generated by ML models trained on historical boarding trends.
- **Driver Telemetry & Safety Profiling**: Anomaly detection tracking harsh acceleration, sudden braking, and over-speeding via DBSCAN and Z-scores.
- **Automated Feedback & Grievance NLP Portal**: Automated sentiment scoring and classification of student reviews to prioritize maintenance and service complaints.
- **Comprehensive Attendance & Operational Reporting**: Exportable attendance records, fleet utilization analytics, and route performance audits.

---

## 7. Out-of-Scope Items (Future Phases)

- **Automated License Plate Recognition (ALPR)**: Camera-based automated gate entry for university vehicles (deferred to v3.0).
- **Physical RFID Smart Card Integration**: Hardware turnstile integrations (MVP focuses on mobile/web QR boarding).
- **Inter-Campus Long-Haul Ticketing & Payment Gateway**: Commercial payment processor integrations (MVP uses internal student enrollment IDs and university semester passes).
- **Electric Vehicle Autonomous Battery Swapping**: Automated depot battery robotics (deferred to future fleet electrification).

---

## 8. Compliance & Technical Constraints

- **Language & Runtime Isolation**: Core business logic, APIs, and Data Science in Python 3.12 (Django 5.x); heavy computation and graph algorithms isolated in C# (.NET 10 microservice).
- **Standards**: IEEE 830-compliant SRS specifications and IEEE 1016 Software Design Documentation.
- **Security & Privacy**: Zero unencrypted transit communications (TLS 1.3 + mTLS inter-service), zero storage of plain-text passwords (Argon2id/PBKDF2), and strict OWASP Top 10 mitigation.

