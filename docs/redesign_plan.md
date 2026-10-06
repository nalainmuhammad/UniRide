# UniRide CTMS v2.0 — Complete Frontend Redesign Plan

> **Scope:** Full teardown and rebuild of the Next.js 15 frontend
> **Design Inspiration:** Apple.com (smooth carousels, seamless animations, premium feel)
> **Color Palette:** Deep Navy · Sapphire · Ice Blue · Powder Blue · White

---

## 🎨 New Color Palette & Design Tokens

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| **Deep Navy** | `#000926` | `--navy` | Sidebar, headings, main text, page backgrounds |
| **Sapphire** | `#0F52BA` | `--sapphire` | Primary buttons, active nav, links, CTAs |
| **Ice Blue** | `#D6E6F3` | `--ice-blue` | Welcome banners, background accents, hero sections |
| **Powder Blue** | `#A6C5D7` | `--powder-blue` | Borders, decorative details, secondary elements |
| **White** | `#FFFFFF` | `--white` | Cards, forms, tables, content surfaces |
| **Sapphire Light** | `#1A6DD4` | `--sapphire-light` | Hover states for buttons |
| **Sapphire Dark** | `#0A3D8A` | `--sapphire-dark` | Active/pressed states |
| **Navy Light** | `#001240` | `--navy-light` | Elevated surfaces, sidebar hover |
| **Ice Blue Light** | `#E8F1F8` | `--ice-blue-light` | Alternating table rows |
| **Success** | `#10B981` | `--success` | Active status, on-time indicators |
| **Warning** | `#F59E0B` | `--warning` | Delays, congestion warnings |
| **Danger** | `#EF4444` | `--danger` | SOS, breakdowns, errors |

---

## 📐 Complete Page Architecture & User Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VISITOR (NOT LOGGED IN)                       │
│                                                                       │
│  [Preloader Animation] ──► [Landing Page] ──► [Login / Sign Up]      │
│                               │                                       │
│                          [Schedules Page]                              │
│                          [Contact Us Page]                             │
│                          [FAQ Page]                                    │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ (After Login - Role-Based Redirect)
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  STUDENT  │    │  ADMIN   │    │  DRIVER  │
        │ Dashboard │    │ Dashboard│    │ Dashboard│
        └──────────┘    └──────────┘    └──────────┘
```

---

## 📄 Page-by-Page Breakdown

### 1. Preloader (Full-Screen Animated Splash)
- UniRide logo with animated bus icon driving across screen
- Sapphire-to-Navy gradient background
- Smooth fade-out transition to landing page (1.5s duration)
- Progress bar or dot indicators

### 2. Landing Page (`/`)
**Navbar:** Logo | Home | Schedules | Features | Contact | FAQ | **Login** | **Get Started**

**Sections (Apple-style vertical scroll with animations):**
1. **Hero Section** — Full-viewport with large headline, subtext, and animated bus illustration. "Get Started" CTA button in Sapphire. Ice Blue gradient background.
2. **Quick Access Cards** — 3-4 glassmorphic cards (Track Your Bus, View Schedules, Book Seat, Give Feedback) with hover lift animations
3. **Features Showcase** — Apple-style horizontal carousel/tabs showing:
   - Real-time GPS Tracking
   - QR Code Smart Attendance
   - AI-Powered Route Optimization (DSA)
   - Demand Forecasting (IDS)
   - Secure WebSocket Telemetry (CN)
   - Automated RTM & Chaos Testing (SE)
4. **How It Works** — 3-step visual flow (Sign Up → Get QR Pass → Track & Ride)
5. **Statistics Counter** — Animated counters (8 Routes, 50+ Buses, 2000+ Students, 99.9% Uptime)
6. **Testimonials** — Student reviews carousel
7. **Footer** — Links, contact info, social media, university branding

### 3. Schedules Page (`/schedules`)
- Full route table with stop details, timings, shift types
- Filter by route, shift (Morning/Afternoon/Evening)
- Search bar with Trie autocomplete
- Clean white cards with Powder Blue borders
- Mobile-responsive accordion view

### 4. Auth Pages (`/login`, `/signup`)
- Split-screen layout: Left = branded visual, Right = form
- Google Auth integration button
- Role selector (Student / Driver)
- Form validation with real-time feedback
- "Forgot Password" flow
- Sapphire primary buttons, white card surface

### 5. Student Dashboard (`/dashboard/student`)
**Sidebar Navigation (Deep Navy):**
- Dashboard (Home)
- My QR Pass
- My Profile
- Live Tracking
- My Schedule
- My Attendance
- Feedback
- Notifications (bell icon with badge)

**Dashboard Home:**
- Welcome banner (Ice Blue background) with student name & route info
- QR Pass card preview (click to expand)
- Next bus ETA widget
- Quick stats (Attendance %, This Week's Rides)
- Recent notifications preview

**My QR Pass:** Full-screen QR code with student info, route, validity timer

**My Profile:** Editable form (name, phone, emergency contact, address)

**Live Tracking:** Leaflet map showing only the student's assigned bus with ETA

**My Schedule:** Table of assigned bus schedule with route stops and timings

**My Attendance:** Calendar view + table with Present/Absent status, date filters, summary stats

**Feedback:** Star rating + category selector + comment box + sentiment preview

### 6. Admin Dashboard (`/dashboard/admin`)
**Sidebar Navigation (Deep Navy):**
- Dashboard (Home/Overview)
- Student Management
- Driver Management
- Bus Management
- Route Management
- Schedule Management
- Smart Allocation
- Student Attendance (Manual + QR)
- Driver Attendance
- Live Tracking (All Buses)
- Feedback Viewer
- Notifications Sender
- Reports Generator
- Analytics (IDS Features)
  - Demand Forecast
  - Bottleneck Discovery
  - Sentiment Analysis
  - Digital Twin Simulator
  - Causal Root Cause

**Dashboard Home:**
- KPI cards (Total Students, Active Buses, Today's Attendance %, Avg Rating)
- Live fleet mini-map
- Recent activity feed
- Quick action buttons

**CRUD Pages (Students, Drivers, Buses, Routes, Schedules):**
- Data table with search, sort, pagination
- Create/Edit modal with form validation
- Delete confirmation dialog
- Export to CSV button

**Smart Allocation:** 
- Visual interface for assigning buses to students
- AVL Tree load-balancing visualization

**Attendance Module:**
- Manual attendance: Table with checkboxes per student per date
- QR Scanner: Camera viewport with scan status HUD
- Driver attendance: Similar to student attendance

**Live Tracking:** Full-width map with ALL active buses, speed, occupancy pills

**Feedback Viewer:** Table of all student feedback with NLP sentiment labels, filters

**Notification System:** Compose notification form (target: All/Route/Specific Student), history log

**Report Generator:**
- Select report type (Student Attendance, Driver Attendance, Student Registry)
- Date range picker
- Format selector (PDF / Excel)
- Generate & download buttons

### 7. Driver Dashboard (`/dashboard/driver`)
**Sidebar Navigation (Deep Navy):**
- Dashboard (Home)
- My Profile
- My Schedule & Route
- QR Scanner (Boarding Check-in)
- Live Route Map
- My Attendance
- Passenger List
- SOS Emergency
- Notifications

**Dashboard Home:**
- Welcome banner with driver name & assigned bus info
- Today's shift schedule card
- Current bus status (occupancy, speed, location)
- Quick actions (Start QR Scanner, View Route, SOS)

**QR Scanner:** Full-screen camera with HUD overlay for boarding verification

**Live Route Map:** Turn-by-turn route view with current position, upcoming stops, ETA

**My Attendance:** Personal attendance record with shift details

**Passenger List:** Today's boarded students list with boarding time

**SOS Emergency:** One-tap emergency broadcast button with location sharing

---

## 🎭 Animation & Interaction Specifications

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Page transitions | Fade + slight slide up | 300ms | `ease-out` |
| Card hover | Lift shadow + slight scale (1.02) | 200ms | `ease-in-out` |
| Preloader → Landing | Fade out + scale up | 800ms | `cubic-bezier(0.4,0,0.2,1)` |
| Feature carousel | Horizontal slide with crossfade | 500ms | `ease-in-out` |
| Counter numbers | Count up from 0 | 2000ms | `ease-out` |
| Sidebar nav items | Background slide from left | 150ms | `ease` |
| Modal open | Backdrop fade + modal slide up | 300ms | `ease-out` |
| Scroll reveal | Fade up from 20px below | 600ms | `ease-out` |
| Button press | Scale down to 0.97 | 100ms | `ease` |
| Toast notifications | Slide in from top-right | 300ms | `ease-out` |

---

## 🏗️ Build Order & Implementation Status (All Phases Completed ✅)

### Phase A: Foundation & Design System ✅
- [x] 1. Rewrote `globals.css` with new color palette and design tokens (`frontend/src/app/globals.css`)
- [x] 2. Updated `tailwind.config.ts` and `layout.tsx` with new background, typography tokens
- [x] 3. Created reusable UI components: `Button`, `Card`, `Input`, `Modal`, `Badge`, `Table` (`frontend/src/components/ui/`)
- [x] **Debug Session A**: Verified tokens and UI library with `npx tsc --noEmit` — 0 errors.

### Phase B: Public Pages & Core Modals ✅
- [x] 4. Preloader component with animated bus and smooth fadeout (`frontend/src/components/Preloader.tsx`)
- [x] 5. Landing Page with all sections (`frontend/src/app/page.tsx`):
  - Hero section with Sapphire CTA & Ice Blue gradient
  - Quick Access Cards (Track Bus, Schedules, QR Pass, Feedback)
  - Apple-style Features Showcase carousel / tabs
  - 3-Step "How It Works" journey
  - Interactive Transit Map preview with Trie autocomplete search
  - Statistics Counter (8 Routes, 50+ Buses, 2,000+ Commuters, 99.9% Uptime)
  - Student Reviews & Testimonials Carousel
  - Interactive FAQ Accordion
  - Contact Us Inquiry Section & Transport Office details
  - Brand Footer (`frontend/src/components/Footer.tsx`)
- [x] 6. Schedules page with route corridor filters and shift selector (`frontend/src/app/schedules/page.tsx`)
- [x] 7. Auth pages:
  - Role-based split-screen Login page with Google SSO (`frontend/src/app/login/page.tsx`)
  - Student / Driver Registration Signup page (`frontend/src/app/signup/page.tsx`)
- [x] Upgraded Modals (`StudentPassModal`, `DriverScannerModal`, `SeatReservationModal`, `FeedbackModal`, `LiveMap`)
- [x] **Debug Session B**: Typecheck & build validation — 0 errors.

### Phase C: Student Dashboard ✅
- [x] 8. Deep Navy sidebar navigation wrapper (`frontend/src/app/dashboard/student/page.tsx`)
- [x] 9. All student dashboard views:
  - Welcome Banner with assigned route information
  - Next bus ETA widget (6 min) & quick stats
  - Fullscreen dynamic TOTP cryptographic Smart QR pass
  - Live Tracking Leaflet map showing assigned bus BUS-01
  - Assigned timetable stop sequence (Morning inbound & Evening return)
  - Attendance history table with Bloom filter verification status
  - Trip feedback form with live NLP sentiment preview
  - Editable student profile with emergency contacts
  - Notification center with unread badges
- [x] **Debug Session C**: Ran `npx tsc --noEmit` — 0 errors.

### Phase D: Admin Dashboard ✅
- [x] 10. Admin Deep Navy sidebar with 13 operations items (`frontend/src/app/dashboard/admin/page.tsx` & `frontend/src/app/admin/page.tsx`)
- [x] 11. Admin dashboard overview with KPI cards and live fleet mini-map
- [x] 12. Full CRUD pages (Students, Drivers, Buses, Routes, Schedules) with search, create modal, delete, and CSV export
- [x] 13. Smart Allocation visualizer with AVL Tree self-balancing factor
- [x] 14. Boarding attendance HUD with microsecond timestamp audits
- [x] 15. Broadcast dispatcher for campus alerts
- [x] 16. Reports generator with CSV download exports
- [x] 17. IDS Data Science Suite:
  - Scikit-Learn Random Forest Demand Forecasting
  - DBSCAN Congestion Bottleneck Hotspot Discovery
  - SimPy Discrete-Event Digital Twin Simulator (`frontend/src/components/DigitalTwinPanel.tsx`)
  - RFC 6455 WebSocket Frame Dissector (`frontend/src/components/ProtocolDissectorPanel.tsx`)
  - Bayesian Causal Network Counterfactual Analysis
- [x] **Debug Session D**: Verified Admin Console & Analytics — 0 errors.

### Phase E: Driver Dashboard ✅
- [x] 18. Driver sidebar layout (`frontend/src/app/dashboard/driver/page.tsx` & `frontend/src/app/driver/page.tsx`)
- [x] 19. All driver dashboard views:
  - Welcome banner with vehicle indicator (`BUS-01 • R-101`)
  - OBD-II Speedometer gauge with live velocity simulation
  - Turn-by-turn stop sequence with ETAs
  - QR Boarding Scanner HUD viewport with simulation triggers
  - Live route Leaflet navigation view
  - Passenger roster of checked-in students
  - Shift attendance records and on-time compliance
  - One-tap Emergency SOS broadcast button with GPS sharing
- [x] **Debug Session E**: Verified Driver Console — 0 errors.

### Phase F: Polish & Integration & Production Build ✅
- [x] 20. Resilient mock fallbacks in `src/lib/api.ts` guaranteeing zero UI breakage
- [x] 21. Apple-level micro-animations and responsive mobile drawers across all portals
- [x] 22. Production build verified: `npm run build` compiled 12 static routes with 0 errors.

---

## ⚠️ Key Design Rules (Verified)

1. **NO dark mode / cyberpunk theme** — Replaced with clean, professional, light-dominant design.
2. **White cards on Ice Blue / Navy backgrounds** — High legibility and contrast.
3. **Sapphire for all primary actions** — Buttons, active nav tabs, links, interactive pills.
4. **Deep Navy for sidebar and headings** — Authoritative, clear, and elegant.
5. **Powder Blue for borders and accents** — Soft borders and dividers throughout.
6. **Mobile-first responsive** — Off-canvas drawers and responsive tables for all screen widths.
7. **Apple-level animations** — Subtle fade-ins, float animations, and scale transforms.
8. **Generous spacing** — 24px-32px padding and clean whitespace hierarchy.

