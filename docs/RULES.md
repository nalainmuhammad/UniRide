# UniRide (CTMS v2.0) - Global AI & Engineering Rulebook

---

## 1. General Principles

1. **Polyglot Boundary Integrity**: Python/Django is the business logic, API, and Data Science authority. C# (.NET 10) is strictly a high-performance computation engine. Never bleed UI, database ORM, or auth sessions into the C# microservice.
2. **Explicit Contracts Over Implicit Behavior**: All inter-service and client-server communication must adhere strictly to typed DTOs and JSON Schemas.
3. **Defense in Depth**: Every network boundary (client-to-backend and backend-to-microservice) requires mutual verification (JWT, mTLS, and internal token headers).
4. **Single Source of Truth**: All transactional state resides in PostgreSQL. C# algorithms receive read-only snapshots and return computed results without holding persistent database locks.
5. **Fail-Safe & Circuit Breaking**: If the C# microservice is temporarily unreachable, Django MUST degrade gracefully to precomputed static routing instead of throwing a 500 error.
6. **Zero Feature Regression Principle**: Every legacy feature from the existing ASP.NET codebase (`UniRide_3rd_Sem_project`) — including QR code student attendance scanning, driver attendance, route/stop management, schedule shifts, bus pass generation, notifications, student feedback/ratings, and role-based dashboards — MUST be ported and preserved in full. Modernization must elevate and supercharge existing features, never drop them.

---

## 2. Language & Framework Guidelines

### 2.1 Python & Django 5.x
- **Type Annotations**: All functions, methods, and service boundaries MUST use Python 3.12 type hints (`def get_route(stop_id: int) -> RouteDTO:`).
- **Service Layer Pattern**: Keep Django models focused on schema/validation and Django views focused on HTTP request/response. Encapsulate business logic in a dedicated `services/` directory.
- **Asynchronous Safety**: Never execute synchronous, blocking ORM operations inside ASGI WebSocket consumers. Always wrap ORM queries in `database_sync_to_async`.
- **Query Optimization**: Always use `select_related()` and `prefetch_related()` to eliminate N+1 queries. Never iterate through querysets without checking query counts in tests.
- **Dependency Hygiene**: Pin all packages strictly in `requirements.txt` with exact hashes or major.minor versions.

### 2.2 C# / .NET 10 (DSA Microservice)
- **Zero-Allocation Mindset**: Use `Span<T>`, `ReadOnlySpan<T>`, and `ref struct` for inner loops in graph traversal, priority queue updates, and spatial distance calculations.
- **Minimal API Pattern**: Do not add unnecessary MVC controllers or heavyweight middleware. Use standard ASP.NET Minimal APIs with `TypedResults`.
- **Pure Algorithmic Independence**: Custom DSA classes (`RouteGraph`, `AVLTree`, `KDTree`, `Trie`, `BloomFilter`) must NOT depend on external NuGet libraries for their core data structures. They must be pure, educational, industry-grade implementations.
- **Thread Safety**: Algorithm instances shared across concurrent requests must be stateless or use lock-free / read-only concurrency constructs (`ReaderWriterLockSlim`).

### 2.3 Frontend (Next.js 15, TypeScript & Tailwind CSS)
- **TypeScript Strictness**: `tsconfig.json` MUST have `"strict": true` enabled. No usage of `any`. Define explicit interfaces for all API payloads.
- **Component Modularity**: Divide components into atomic units (`atoms`, `molecules`, `organisms`). All UI components must accept standard props and support responsive states.
- **Client vs. Server Components**: Default to React Server Components (RSC) for data fetching and layout rendering; restrict `'use client'` strictly to interactive components (maps, forms, WebSocket listeners).
- **Semantic HTML & a11y**: Ensure all inputs, buttons, and dialogs have appropriate ARIA attributes, semantic tags, and full keyboard navigation support.

---

## 3. Error Handling & Logging Standards

- **RFC 7807 Problem Details**: All REST API error responses must adhere strictly to standard problem details format:
  ```json
  {
    "type": "https://uniride.campus/errors/seat-unavailable",
    "title": "Seat Allocation Failed",
    "status": 409,
    "detail": "Seat 14B on Bus-04 has already been reserved.",
    "instance": "/api/v1/bookings/reserve/",
    "code": "SEAT_ALREADY_RESERVED"
  }
  ```
- **Structured JSON Logging**: All logs emitted by Django and .NET must be structured JSON containing: `timestamp`, `level`, `trace_id`, `service`, `message`, and `context`.
- **No Swallowed Exceptions**: Never use bare `except:` or empty `catch {}` blocks. Log every exception with full stack trace at the `ERROR` level before returning a sanitized client response.
- **Circuit Breaker Policy**: Wrap C# microservice calls in Python with a circuit breaker (e.g., `pybreaker`). Trip threshold: 5 consecutive failures; reset timeout: 30 seconds.

---

## 4. Strict Negative Constraints (What NOT To Do)

1. **NO Hardcoded Credentials**: Never commit secrets, database connection strings, JWT signing keys, or API tokens to source control. Use `.env` files validated with Pydantic or `django-environ`.
2. **NO Synchronous Blocking in Async Loops**: Never invoke `time.sleep()`, synchronous `requests.get()`, or blocking DB calls inside an `async def` function. Use `asyncio.sleep()` or `httpx.AsyncClient`.
3. **NO Unparameterized Raw SQL**: Never execute raw string-formatted SQL queries (`f"SELECT * FROM users WHERE id = {user_id}"`). Always use parameterized queries or the Django ORM.
4. **NO Unauthenticated Microservice Calls**: The C# DSA service must NEVER be directly exposed to the public internet without an internal authorization token or mutual TLS check.
5. **NO Bloated Third-Party Additions**: Do not introduce heavy dependencies (e.g., massive full-stack boilerplate libraries) without documented justification.
6. **NO Monolithic Coupling**: Never import Django models inside the C# codebase or attempt to share a single binary database connection pool across both runtimes.
7. **NO Breaking Changes Without Versioning**: All public endpoints must be versioned under `/api/v1/`. Breaking schema changes without version bumping are forbidden.
8. **NO Dropped Legacy Features / Regressions**: Never drop, delete, or ignore existing ASP.NET functionality (e.g., QR attendance check-in, driver logs, notification reads, bus schedules, or student passes) during migration. Every legacy capability must have an enhanced, backwards-compatible equivalent in Django 5.x.

