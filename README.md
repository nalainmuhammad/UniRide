# UniRide — Campus Transport Management System (CTMS v2.0)

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![Django 5.1](https://img.shields.io/badge/Django-5.1-092E20.svg?logo=django&logoColor=white)](https://www.djangoproject.com/)
[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4.svg?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.x-black.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16-4169E1.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis 7.2](https://img.shields.io/badge/Redis-7.2-DC382D.svg?logo=redis&logoColor=white)](https://redis.io/)
[![Tailwind CSS 3.4](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

> **An enterprise-grade, polyglot smart campus transportation and fleet management platform.**  
> UniRide integrates high-performance graph pathfinding (C# .NET 10), predictive data science (Python/Django 5), real-time WebSocket telemetry, and an Apple/Samsung-grade glassmorphic interface.

---

## 🌟 Academic Multi-Subject Synergy (3rd Semester Capstone)

UniRide uniquely harmonizes four core computer science disciplines into a unified production architecture:

| Subject | Core Implementation | Key Highlight |
|---|---|---|
| **DSA (Data Structures & Algorithms)** | Isolated C# (.NET 10) Minimal API Microservice | **Dijkstra & A\*** dynamic congestion pathfinding; **AVL Trees & Max-Heaps** for seat reservations; **KD-Trees** for sub-millisecond nearest stop lookups; **Bloom Filters** for anti-fraud ticket validation; **Tries** with Levenshtein fuzzy autocomplete. |
| **IDS (Introduction to Data Science)** | Native Python ML Engine (Scikit-Learn, Pandas, SimPy) | **Predictive Attendance Forecasting** (Random Forest/XGBoost); **GPS Trajectory Anomaly Detection** (DBSCAN + Z-score driver profiling); **NLP Sentiment Triage** for student feedback; **Discrete-Event Digital Twin Simulation**. |
| **CN (Computer Networks)** | Django Channels ASGI + Redis Pub/Sub + mTLS | **Real-Time WebSocket GPS Streaming** (<250ms latency); **Mutual TLS (mTLS)** inter-service encryption; **Distributed Sliding-Window Rate Limiting**; **Resilient Circuit Breaker Pattern** (`pybreaker`). |
| **SE (Software Engineering)** | IEEE Standards & Automated CI/CD | **IEEE 830-compliant SRS** & **IEEE 1016 SDD**; comprehensive **Mermaid UML Suite** (14 diagrams) & **ADRs**; automated GitHub Actions testing and containerization. |

---

## 🚀 Key Innovations & Supercharged Features

1. **Virtual Real-Time Fleet Simulator & Map Navigation**:
   - Google Maps-style dynamic shortest-path rendering with glowing cyan trails and smooth marker interpolation (`requestAnimationFrame`), allowing 100% reliable live demonstrations without physical GPS hardware.
2. **Cryptographic Smart QR Code Attendance**:
   - Time-rotating TOTP QR bus passes (30-second expiry) preventing screenshot sharing, verified in sub-milliseconds via an in-memory C# Bloom Filter with offline IndexedDB queueing.
3. **Dynamic Demand-Responsive Scheduling**:
   - AI algorithms predict peak boarding demand at campus stops and auto-generate optimal bus fleet dispatch timetables.
4. **Driver Safety & Telemetry Profiling**:
   - Automated detection of harsh braking, over-speeding, and erratic turns using spatial DBSCAN clustering.
5. **Modern Glassmorphic Dark-Mode UI**:
   - Apple/Samsung-grade sleek obsidian surfaces, frosted acrylic blur cards, responsive mobile bottom navigation, and glanceable driver HUDs.

---

## 📁 Repository Structure

```
uniride-v2/
├── frontend/                               # Next.js 15 App Router + Tailwind CSS
│   ├── src/
│   │   ├── app/                            # Route pages (live map, booking, admin)
│   │   ├── components/                     # Glassmorphic UI component library
│   │   ├── hooks/                          # WebSocket & Geolocation telemetry hooks
│   │   └── lib/                            # Typed API clients and helpers
│   ├── package.json
│   └── tailwind.config.ts
│
├── backend_django/                         # Python Django 5.x Web Application
│   ├── manage.py
│   ├── uniride/                            # Settings, ASGI/WSGI, root URL routing
│   ├── core/                               # Custom User, Student, Driver models & JWT
│   ├── transit/                            # Bus, Route, Stop, Schedule management
│   ├── telemetry/                          # WebSockets, ASGI consumers, GPS live feeds
│   ├── ids_analytics/                      # Scikit-Learn ML models & SimPy simulator
│   ├── dsa_client/                         # HTTP/mTLS client for C# DSA microservice
│   └── requirements.txt
│
├── dsa_service_csharp/                     # High-Performance C# .NET 10 Microservice
│   ├── Program.cs                          # Minimal API endpoints on Kestrel
│   ├── Algorithms/                         # Custom RouteGraph, AVLTree, KDTree, Trie, BloomFilter
│   ├── DTOs/                               # Data transfer contracts
│   └── UniRide.DSA.csproj
│
├── docs/                                   # Complete Context & Architecture Hub
│   ├── PRD.md                              # Product Requirements Document
│   ├── ARCHITECTURE.md                     # System Architecture & Schemas
│   ├── RULES.md                            # Global AI & Engineering Rulebook
│   ├── DESIGN.md                           # Glassmorphic Design System Tokens
│   ├── TASKS.md                            # Phase-by-phase task tracking breakdown
│   └── MEMORY.md                           # Persistent project context & ADRs
│
├── .github/workflows/                      # GitHub Actions CI/CD pipelines
│   └── ci.yml
├── .env.example                            # Comprehensive environment variable template
├── .gitignore                              # Polyglot gitignore (Python, .NET, Node)
└── README.md
```

---

## 🛠️ Quick Start (Local Setup)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/UniRide-CTMS.git
cd UniRide-CTMS
```

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Adjust parameters if needed (default values work for local dev)
```

### 3. Run the Services
- **Backend (Django 5)**:
  ```bash
  cd backend_django
  python -m venv venv
  source venv/bin/activate  # On Windows: venv\Scripts\activate
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py runserver 8000
  ```
- **DSA Microservice (C# .NET 10)**:
  ```bash
  cd dsa_service_csharp
  dotnet restore
  dotnet run
  ```
- **Frontend (Next.js 15)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🌐 Production Multi-Cloud Deployment Architecture

UniRide CTMS v2.0 is built on a high-efficiency multi-cloud topology:

| Layer / Service | Cloud Platform | Role & Justification |
|---|---|---|
| **Frontend UI** | **Vercel** | Hosts the **Next.js 15 App Router** on a global Edge CDN with automatic SSL, zero-config CI/CD, and sub-100ms global latency. |
| **Backend API & WebSockets** | **Railway** | Hosts the **Django 5.1 ASGI / Daphne** server with persistent WebSocket connections for live bus tracking (<250ms latency). |
| **Algorithmic Engine** | **Railway** | Runs the **C# .NET 10 DSA Microservice** as a private container on Railway's internal network (`http://dsa-service.railway.internal:5050`) with sub-millisecond inter-service latency. |
| **Primary Relational DB** | **Supabase** | Managed **PostgreSQL 16** with the **PostGIS** spatial extension for real-time bus geofencing and nearest stop distance calculations. |
| **Channel Layer & Cache** | **Upstash** | Serverless **Redis 7.2** with native TLS (`rediss://`), backing Django Channels WebSocket broadcasting and distributed rate limiting. |

---

## 📚 Complete Project Documentation

Refer to the [`docs/`](docs/) directory for detailed specifications:
- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture & Schemas](docs/ARCHITECTURE.md)
- [Engineering Rulebook & Constraints](docs/RULES.md)
- [Design System & Tailwind Tokens](docs/DESIGN.md)
- [Phase-by-Phase Task Roadmap](docs/TASKS.md)
- [Architecture Decision Records & Memory](docs/MEMORY.md)
