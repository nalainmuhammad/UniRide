# UniRide (CTMS v2.0) - Design System & UI/UX Specification

---

## 1. Core Design Philosophy

The UniRide CTMS v2.0 interface is engineered around an **Apple-grade Clean Light Aesthetic**:
- **Light-Dominant & Professional**: Crisp, high-contrast white card surfaces with Ice Blue and Deep Navy backgrounds. NO dark mode / cyberpunk themes.
- **Hierarchical Color System**: Deep Navy for authoritative typography and sidebars; Sapphire for primary CTAs and active states; Powder Blue for delicate borders and accents.
- **Apple-Style Micro-Interactions**: Smooth scale transforms, lift shadows on hover (`translate-y-[-2px]`), fluid modal backdrops, and seamless animated carousel transitions.
- **Glanceable Telemetry**: Information architecture designed for students checking arrival ETAs on mobile screens in broad daylight and drivers glancing at mounted HUD consoles.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code | CSS Variable | Semantic Usage |
|---|---|---|---|
| **Deep Navy** | `#000926` | `--navy` | Sidebars, main headings, primary text, brand accents |
| **Sapphire** | `#0F52BA` | `--sapphire` | Primary CTA buttons, active links, route highlights |
| **Ice Blue** | `#D6E6F3` | `--ice-blue` | Welcome hero banners, map overlays, secondary backgrounds |
| **Powder Blue** | `#A6C5D7` | `--powder-blue` | Card borders, subtle dividers, secondary iconography |
| **White** | `#FFFFFF` | `--white` | Clean card surfaces, table backgrounds, form modals |
| **Sapphire Light** | `#1A6DD4` | `--sapphire-light` | Button hover states, pulse indicators |
| **Sapphire Dark** | `#0A3D8A` | `--sapphire-dark` | Active pressed button states |
| **Navy Light** | `#001240` | `--navy-light` | Elevated sidebar cards, driver HUD frames |
| **Ice Blue Light** | `#E8F1F8` | `--ice-blue-light` | Alternating table rows, input backgrounds |
| **Success** | `#10B981` | `--success` | Active shuttles, verified passes, on-time indicators |
| **Warning** | `#F59E0B` | `--warning` | Traffic bottlenecks, delayed shuttles, monsoon alerts |
| **Danger** | `#EF4444` | `--danger` | Emergency SOS triggers, invalid/revoked pass cards |

---

## 3. Typography Scale & Fonts

### Font Families
- **Display & Headings**: `Outfit`, `system-ui`, `-apple-system`, `sans-serif` (Sleek geometric headline character)
- **Body & Controls**: `Inter`, `sans-serif` (Optimal reading legibility and balanced x-height)
- **Code, Telemetry & Coordinates**: `JetBrains Mono`, `monospace` (Tabular alignment for GPS coordinates, timestamps, and pass hashes)

### Typographic Scale
| Level | Font Size | Line Height | Weight | Tailwind / CSS Class | Use Case |
|---|---|---|---|---|---|
| **Hero Display** | 3.5rem (56px) - 4.5rem (72px) | 1.1 | Extrabold (800) | `text-5xl sm:text-7xl font-extrabold font-display` | Landing hero headlines |
| **Heading 1** | 2.0rem (32px) - 2.25rem (36px) | 1.2 | Extrabold (800) | `text-2xl sm:text-3xl font-extrabold font-display` | Page headers, welcome banners |
| **Heading 2** | 1.25rem (20px) - 1.5rem (24px) | 1.3 | Bold (700) | `text-lg sm:text-xl font-bold font-display` | Section headers, modal titles |
| **Heading 3** | 1.0rem (16px) - 1.125rem (18px) | 1.4 | Bold (700) | `text-base font-bold` | Card titles, telemetry labels |
| **Body Large** | 0.9375rem (15px) - 1.0rem (16px) | 1.5 | Regular (400) | `text-sm sm:text-base text-[var(--text-secondary)]` | Feature descriptions, commuter guides |
| **Body Small** | 0.8125rem (13px) - 0.875rem (14px) | 1.4 | Medium (500) | `text-xs sm:text-sm` | Table cells, inputs, list items |
| **Caption / Mono**| 0.6875rem (11px) - 0.75rem (12px) | 1.3 | SemiBold (600) | `text-xs font-mono font-bold` | Lat/Lng coordinates, TOTP tokens, bus IDs |

---

## 4. Reusable UI Components Architecture

The frontend components are centralized in `src/components/ui/` with modular exports:

### 4.1 Button (`Button.tsx`)
```tsx
<Button variant="primary" size="md">
  <span>Get Started</span>
  <ArrowRight className="h-4 w-4" />
</Button>
```
- **Variants**: `primary` (Sapphire fill with subtle drop shadow), `secondary` (White with Sapphire border), `ghost`, `danger`, `outline`.
- **States**: Hover elevation, active scale down (0.97), loading spinner slot.

### 4.2 Card (`Card.tsx`)
```tsx
<Card elevated hoverable>
  <CardHeader>
    <CardTitle>Next Bus ETA</CardTitle>
    <CardDescription>Faizabad Terminal Stop</CardDescription>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```
- Clean white surface with `1px solid var(--powder-blue)` and rounded `16px` or `24px` corners.

### 4.3 Input (`Input.tsx`)
- Standardized text, email, password, and search inputs with left/right icon slots, validation error text, and Sapphire focus ring.

### 4.4 Modal (`Modal.tsx`)
- Backdrop blur overlay (`backdrop-blur-sm`), escape key listener, click-outside dismissal, and slide-up entry animations.

### 4.5 Data Table (`Table.tsx`)
- Sticky Ice Blue headers (`bg-[var(--ice-blue)]`), alternating rows, and border accents.

---

## 5. Portal Layout Specifications

### 5.1 Public Experience
- **Preloader**: Fullscreen Sapphire-to-Navy gradient with animated floating bus icon and 1.5s progress bar fadeout.
- **Landing Page (`/`)**: Full-viewport Apple-style vertical scroll with Features Carousel, Live Transit Map, 3-Step Journey, Statistics Counters, Testimonials, FAQ Accordion, and University Footer.
- **Schedules (`/schedules`)**: Interactive timetable with route corridor filter, shift selector (Morning, Afternoon, Evening), search bar, and expandable stop timelines.
- **Auth (`/login`, `/signup`)**: Split-screen design with university branding, Google SSO ready button, and role-based redirects.

### 5.2 Student Dashboard (`/dashboard/student`)
- Fixed Deep Navy sidebar with quick notifications badge.
- Welcome banner with assigned route info, ETA countdown widget, rotating TOTP pass preview, live Leaflet vehicle tracking, attendance logs, and feedback submitter with NLP sentiment preview.

### 5.3 Admin Dashboard (`/dashboard/admin` & `/admin`)
- Operations Command Center with KPI stats, full CRUD data tables for Students, Drivers, Buses, Routes, and Schedules with CSV export.
- Smart Allocation (AVL Tree balance factor), Boarding Attendance HUD, Live Fleet Map, Broadcast Notification Dispatcher, and the IDS Data Science Suite (Random Forest, DBSCAN, Digital Twin, Protocol Dissector, Bayesian Causal).

### 5.4 Driver Dashboard (`/dashboard/driver` & `/driver`)
- HUD Console with live OBD-II speedometer gauge, turn-by-turn stop schedule, QR boarding scanner camera HUD with Bloom Filter verification, passenger roster, and one-tap Emergency SOS broadcast.

---

## 6. Responsive Breakpoint Guidelines

- **Mobile First (`< 768px`)**:
  - Sidebars collapse to off-canvas slide-out drawers triggered by the top-left menu icon.
  - Tables enable horizontal scroll wrappers without breaking viewport boundaries.
  - Floating action buttons and touch-friendly target sizes ($\ge 44\times 44\text{ px}$).
- **Tablet & Desktop (`>= 768px` and `>= 1024px`)**:
  - Fixed 260px Deep Navy sidebar with sticky top header.
  - Multi-column grids for KPI statistics, split map/roster views, and dashboard analytics.
