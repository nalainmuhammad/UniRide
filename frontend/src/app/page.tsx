"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Bus,
  Search,
  MapPin,
  Clock,
  Users,
  Compass,
  ArrowRight,
  Shield,
  MessageSquare,
  QrCode,
  Zap,
  CheckCircle,
  Calendar,
  Sparkles,
  ChevronRight,
  Cpu,
  BarChart3,
  Network,
  Activity,
  Star,
  ChevronDown,
  ShieldCheck,
  Send,
  HelpCircle,
  Smartphone,
  Navigation,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import StudentPassModal from "@/components/StudentPassModal";
import DriverScannerModal from "@/components/DriverScannerModal";
import SeatReservationModal from "@/components/SeatReservationModal";
import FeedbackModal from "@/components/FeedbackModal";
import {
  fetchBuses,
  fetchRoutes,
  fetchStops,
  autocompleteStops,
  BusTelemetry,
  TransitRoute,
  TransitStop,
} from "@/lib/api";

// Dynamically load LiveMap to prevent Leaflet window SSR error
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[420px] w-full items-center justify-center rounded-2xl border border-[var(--ice-blue-dark)] bg-[var(--ice-blue-light)] text-[var(--text-secondary)] font-mono text-xs">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full border-2 border-[var(--sapphire)] border-t-transparent animate-spin" />
        <span>Initializing Geospatial Map Engine...</span>
      </div>
    </div>
  ),
});

export default function LandingPage() {
  const [showPreloader, setShowPreloader] = useState(true);
  const [buses, setBuses] = useState<BusTelemetry[]>([]);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<number>(1);
  const [selectedBus, setSelectedBus] = useState<BusTelemetry | null>(null);

  // Active feature tab in Apple-style showcase
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Modals state
  const [passOpen, setPassOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    // Check if preloader has already been shown in this session
    const hasSeenPreloader = sessionStorage.getItem("uniride_splash_shown");
    if (hasSeenPreloader) {
      setShowPreloader(false);
    }

    async function loadData() {
      const [busData, routeData, stopData] = await Promise.all([
        fetchBuses(),
        fetchRoutes(),
        fetchStops(),
      ]);
      setBuses(busData);
      setRoutes(routeData);
      setStops(stopData);
    }
    loadData();

    // Periodic simulation of vehicle movement
    const interval = setInterval(() => {
      setBuses((prev) =>
        prev.map((bus) => {
          if (bus.status === "EN_ROUTE") {
            const latDelta = (Math.random() - 0.5) * 0.001;
            const lngDelta = (Math.random() - 0.5) * 0.001;
            return {
              ...bus,
              current_latitude: +(bus.current_latitude + latDelta).toFixed(6),
              current_longitude: +(bus.current_longitude + lngDelta).toFixed(6),
              current_speed: Math.max(20, Math.min(55, Math.round(bus.current_speed + (Math.random() - 0.5) * 4))),
            };
          }
          return bus;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
    sessionStorage.setItem("uniride_splash_shown", "true");
  };

  const handleSearchChange = async (val: string) => {
    setSearchQuery(val);
    if (val.trim().length >= 1) {
      const res = await autocompleteStops(val);
      setSuggestions(res.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  // Apple-style Feature Showcase Items
  const features = [
    {
      title: "Real-Time GPS Tracking",
      subtitle: "Sub-Second Telemetry",
      badge: "LIVE SENSORS",
      description:
        "Track every campus shuttle with sub-meter precision. High-frequency telemetry keeps students informed of exact arrival times and bus capacity in real time.",
      points: [
        "Live Leaflet mapping with dynamic route polylines",
        "Estimated arrival time (ETA) based on live traffic",
        "Vehicle speed and active seat occupancy metrics",
      ],
      icon: Navigation,
      gradient: "from-blue-500/10 to-indigo-500/10",
    },
    {
      title: "Dynamic QR Smart Attendance",
      subtitle: "Anti-Fraud Pass System",
      badge: "SECURITY",
      description:
        "Say goodbye to physical IDs and forged screenshots. UniRide's rotating TOTP cryptographic QR passes update every 30 seconds for fraud-proof boarding.",
      points: [
        "Time-based one-time tokens verified in < 200 nanoseconds",
        "Fast Bloom Filter membership checks for driver offline HUD",
        "Instant attendance sync with university registrar database",
      ],
      icon: QrCode,
      gradient: "from-sky-500/10 to-blue-500/10",
    },
    {
      title: "AI-Powered Route Optimization",
      subtitle: "DSA Algorithmic Core",
      badge: "C# .NET 10",
      description:
        "High-performance C# microservice executing Dijkstra and A* pathfinding over graph topologies to minimize commuter travel time and fuel consumption.",
      points: [
        "Multi-criterion routing incorporating congestion weights",
        "AVL Tree dynamic seat allocation ensuring balanced bus loads",
        "Trie dictionary tree for instantaneous O(L) bus stop lookups",
      ],
      icon: Cpu,
      gradient: "from-indigo-500/10 to-cyan-500/10",
    },
    {
      title: "Demand Forecasting & Intelligence",
      subtitle: "Machine Learning (IDS)",
      badge: "DATA SCIENCE",
      description:
        "Random Forest regressors predict passenger surges across exam weeks, rush hours, and semester starts, allowing administrators to proactively scale the fleet.",
      points: [
        "DBSCAN spatial clustering to identify persistent congestion bottlenecks",
        "SimPy discrete-event digital twin simulating fleet operations",
        "NLP sentiment analysis on commuter feedback for continuous quality",
      ],
      icon: BarChart3,
      gradient: "from-blue-500/10 to-teal-500/10",
    },
    {
      title: "Secure WebSocket Telemetry",
      subtitle: "Computer Networks (RFC 6455)",
      badge: "CHANNELS ASGI",
      description:
        "Full-duplex WebSocket architecture with custom RFC 6455 packet dissector for microsecond latency telemetry between shuttles and commuters.",
      points: [
        "Low-overhead heartbeat ping/pong keepalives",
        "Circuit breakers guarding against network disconnects",
        "Token bucket rate limiting to prevent telemetry flood attacks",
      ],
      icon: Network,
      gradient: "from-sky-500/10 to-indigo-500/10",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--navy)] selection:bg-[var(--sapphire)] selection:text-white">
      {/* Splash Preloader */}
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}

      {/* Modern Navigation */}
      <Navbar
        transparent={false}
        onOpenPass={() => setPassOpen(true)}
        onOpenScanner={() => setScannerOpen(true)}
        onOpenFeedback={() => setFeedbackOpen(true)}
      />

      <main className="flex-1 pt-16 lg:pt-20">
        {/* ═══════════════════════════════════════════════════════════════
            HERO SECTION (Apple-Style Full Viewport with Ice Blue Gradient)
            ═══════════════════════════════════════════════════════════════ */}
        <section
          id="home"
          className="relative overflow-hidden bg-gradient-to-b from-[var(--ice-blue-light)] via-[var(--ice-blue)]/30 to-white py-16 sm:py-24 lg:py-28"
        >
          {/* Subtle background glow circles */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-[var(--sapphire)]/10 to-[var(--powder-blue)]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--powder-blue)] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[var(--sapphire)] shadow-sm backdrop-blur-md mb-6 animate-[modalSlideUp_0.5s_ease-out]">
                <Sparkles className="h-4 w-4 text-[var(--sapphire)]" />
                <span>Next-Gen Campus Transit Intelligence</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[var(--navy)] font-display leading-[1.08] mb-6">
                Commute Smarter. <br />
                <span className="text-[var(--sapphire)]">Never Miss Your Bus.</span>
              </h1>

              {/* Subtext */}
              <p className="text-base sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-8 max-w-2xl mx-auto">
                Real-time GPS tracking, dynamic anti-fraud QR passes, and AI-driven route optimization engineered for seamless university transport.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="btn btn-primary btn-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#tracker"
                  className="btn btn-secondary btn-lg w-full sm:w-auto hover:bg-[var(--ice-blue-light)]"
                >
                  <span>Track Live Shuttle</span>
                </a>
              </div>

              {/* Key Trust Signals */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-secondary)] font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[var(--success)]" /> 99.9% Telemetry Uptime
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[var(--success)]" /> Sub-Second Location Latency
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-[var(--success)]" /> Cryptographic TOTP Security
                </span>
              </div>
            </div>

            {/* Hero Bus Visual Showcase Card */}
            <div className="mt-14 max-w-4xl mx-auto rounded-3xl border border-[var(--powder-blue)] bg-white p-4 sm:p-6 shadow-xl relative overflow-hidden group">
              <div className="rounded-2xl bg-gradient-to-r from-[var(--navy)] via-[var(--navy-light)] to-[var(--sapphire-dark)] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1 text-xs font-mono text-[var(--ice-blue)]">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE FLEET TELEMETRY
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
                    50+ Active Shuttles On Campus
                  </h3>
                  <p className="text-sm text-[var(--ice-blue)] max-w-md">
                    Smart schedule distribution across 8 regional university routes connecting all major city junctions.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-4 border border-white/15 backdrop-blur-md">
                  <Bus className="h-16 w-16 text-[var(--ice-blue)] animate-float" />
                  <span className="font-mono text-xs text-white font-semibold">BUS-01 • Islamabad Exp</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            QUICK ACCESS CARDS (Glassmorphic cards with hover lift)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-12 bg-white -mt-6 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Track Bus */}
              <a
                href="#tracker"
                className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] group cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white transition-colors duration-200">
                    <Navigation className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                    Track Your Bus
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Live interactive GPS map showing all active shuttles, speed, and exact stop ETAs.
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1 transition-transform">
                  <span>View Live Map</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </a>

              {/* Card 2: View Schedules */}
              <Link
                href="/schedules"
                className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] group cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white transition-colors duration-200">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                    View Schedules
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Browse timetable across Morning, Afternoon, and Evening campus transit shifts.
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1 transition-transform">
                  <span>Browse Timetable</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Link>

              {/* Card 3: Dynamic QR Pass */}
              <button
                onClick={() => setPassOpen(true)}
                className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] group text-left cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white transition-colors duration-200">
                    <QrCode className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                    My QR Pass
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    View your rotating cryptographic digital pass for fast contactless bus check-in.
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1 transition-transform">
                  <span>Launch Pass</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </button>

              {/* Card 4: Give Feedback */}
              <button
                onClick={() => setFeedbackOpen(true)}
                className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] group text-left cursor-pointer"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white transition-colors duration-200">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                    Give Feedback
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                    Rate your commute comfort and help optimize campus transport with NLP sentiment.
                  </p>
                </div>
                <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1 transition-transform">
                  <span>Rate Trip</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FEATURES SHOWCASE (Apple-style Horizontal Carousel / Tabs)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-20 bg-[var(--off-white)] border-y border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                ENGINEERED EXCELLENCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-2">
                Cutting-Edge Transport Technology
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-3">
                Experience enterprise-grade computer science algorithms powering university fleet operations.
              </p>
            </div>

            {/* Apple-style Tab Navigation Bar */}
            <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar">
              {features.map((feat, idx) => {
                const IconComponent = feat.icon;
                const isSelected = activeFeatureTab === idx;
                return (
                  <button
                    key={feat.title}
                    onClick={() => setActiveFeatureTab(idx)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap shrink-0 ${
                      isSelected
                        ? "bg-[var(--navy)] text-white shadow-md"
                        : "bg-white text-[var(--text-secondary)] hover:bg-[var(--ice-blue-light)] border border-[var(--powder-blue)]"
                    }`}
                  >
                    <IconComponent className={`h-4 w-4 ${isSelected ? "text-[var(--ice-blue)]" : "text-[var(--sapphire)]"}`} />
                    <span>{feat.title.split(" ")[0]} {feat.title.split(" ")[1]}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Feature Showcase Box */}
            <div className="mt-8 rounded-3xl border border-[var(--powder-blue)] bg-white p-8 sm:p-12 shadow-md transition-all duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Text Detail */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[var(--ice-blue)] px-3 py-1 text-[11px] font-mono font-bold text-[var(--sapphire)]">
                    {features[activeFeatureTab].badge}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)] font-display">
                    {features[activeFeatureTab].title}
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    {features[activeFeatureTab].description}
                  </p>

                  <ul className="space-y-3 pt-2">
                    {features[activeFeatureTab].points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--navy)]">
                        <CheckCircle className="h-5 w-5 text-[var(--sapphire)] shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-4 flex gap-4">
                    <Link
                      href="/signup"
                      className="btn btn-primary btn-sm"
                    >
                      Try Feature
                    </Link>
                    <Link
                      href="/schedules"
                      className="btn btn-secondary btn-sm"
                    >
                      View Live Data
                    </Link>
                  </div>
                </div>

                {/* Right Interactive Graphic Box */}
                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[var(--ice-blue-dark)] bg-gradient-to-br from-[var(--ice-blue-light)] via-white to-[var(--off-white)] p-6 shadow-inner text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center shadow-lg mb-4">
                      {React.createElement(features[activeFeatureTab].icon, { className: "h-8 w-8" })}
                    </div>
                    <span className="font-mono text-xs font-bold text-[var(--sapphire)]">
                      {features[activeFeatureTab].subtitle}
                    </span>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      Optimized for extreme concurrency and zero network buffering across all campus routes.
                    </p>
                    <div className="mt-4 pt-4 border-t border-[var(--ice-blue)] flex justify-around font-mono text-[11px]">
                      <div>
                        <div className="text-[var(--text-muted)]">Accuracy</div>
                        <div className="font-bold text-[var(--navy)]">99.8%</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)]">Latency</div>
                        <div className="font-bold text-emerald-600">&lt; 0.8 ms</div>
                      </div>
                      <div>
                        <div className="text-[var(--text-muted)]">Protocol</div>
                        <div className="font-bold text-[var(--sapphire)]">WSS / TCP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HOW IT WORKS (3-Step Visual Flow)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                SIMPLE THREE-STEP JOURNEY
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-2">
                How UniRide Works
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-3">
                Effortless transit from morning departure to campus arrival.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative rounded-3xl border border-[var(--ice-blue-dark)] bg-[var(--off-white)] p-8 text-center hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center font-display font-extrabold text-xl shadow-md mb-6">
                  1
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] font-display">
                  Sign Up & Select Route
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                  Register with your university roll number and choose your daily morning and evening route stops.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative rounded-3xl border border-[var(--ice-blue-dark)] bg-[var(--off-white)] p-8 text-center hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center font-display font-extrabold text-xl shadow-md mb-6">
                  2
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] font-display">
                  Get Cryptographic Pass
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                  Access your rotating TOTP Smart Pass on your phone. Automatically refreshes every 30 seconds.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative rounded-3xl border border-[var(--ice-blue-dark)] bg-[var(--off-white)] p-8 text-center hover:shadow-lg transition-all">
                <div className="w-14 h-14 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center font-display font-extrabold text-xl shadow-md mb-6">
                  3
                </div>
                <h3 className="text-lg font-bold text-[var(--navy)] font-display">
                  Track & Board Seamlessly
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                  Track your incoming shuttle on the live map, tap your QR pass at boarding, and enjoy a safe ride.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            LIVE TRANSIT TRACKER (Interactive Map + Route Roster)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="tracker" className="py-20 bg-[var(--ice-blue-light)]/40 border-t border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                  LIVE TELEMETRY FEED
                </span>
                <h2 className="text-3xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-1">
                  Active Fleet Map
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Select a route or click any vehicle to view telemetry and seat capacity.
                </p>
              </div>

              {/* In-Memory Trie Autocomplete Search Bar */}
              <div className="relative w-full md:w-80">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-[var(--sapphire)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search bus stops (Trie lookup)..."
                    className="w-full rounded-xl border border-[var(--powder-blue)] bg-white py-2.5 pl-10 pr-4 text-xs text-[var(--navy)] placeholder-[var(--text-muted)] focus:border-[var(--sapphire)] focus:outline-none focus:ring-2 focus:ring-[var(--sapphire)]/20 font-mono shadow-sm"
                  />
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-11 z-30 mt-1 rounded-xl border border-[var(--powder-blue)] bg-white p-2 shadow-xl font-mono text-xs">
                    <div className="px-2 py-1 text-[10px] text-[var(--sapphire)] font-bold border-b border-[var(--ice-blue)]">
                      TRIE O(L) AUTOCOMPLETE MATCHES:
                    </div>
                    {suggestions.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchQuery(item);
                          setSuggestions([]);
                        }}
                        className="flex w-full items-center gap-2 rounded-lg p-2 text-[var(--navy)] hover:bg-[var(--ice-blue-light)] text-left transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-[var(--sapphire)]" />
                        <span>{item}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Main Interactive Grid: Map + Shuttles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Column (8 Cols) */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-[var(--powder-blue)] shadow-md bg-white">
                  <LiveMap
                    buses={buses}
                    routes={routes}
                    stops={stops}
                    onSelectBus={(bus) => {
                      setSelectedBus(bus);
                      setBookingOpen(true);
                    }}
                  />
                </div>

                {/* Route Selector Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-[var(--text-secondary)]">Routes:</span>
                  {routes.map((route) => (
                    <button
                      key={route.id}
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedRouteId === route.id
                          ? "bg-[var(--sapphire)] text-white shadow-sm font-semibold"
                          : "bg-white text-[var(--navy)] hover:bg-[var(--ice-blue-light)] border border-[var(--powder-blue)]"
                      }`}
                    >
                      {route.code} • {route.name.split("(")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shuttles Column (4 Cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="rounded-2xl border border-[var(--powder-blue)] bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                    <span className="text-xs font-bold text-[var(--navy)] flex items-center gap-1.5 font-display">
                      <Bus className="h-4 w-4 text-[var(--sapphire)]" /> Active Fleet Telemetry
                    </span>
                    <span className="text-[10px] font-mono text-[var(--sapphire)] font-bold bg-[var(--ice-blue)] px-2 py-0.5 rounded-full">
                      ASGI WSS
                    </span>
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {buses.map((bus) => (
                      <div
                        key={bus.id}
                        className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3 hover:border-[var(--sapphire)] hover:bg-white transition-all shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[var(--navy)]">
                              {bus.bus_number}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                bus.status === "EN_ROUTE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : bus.status === "DELAYED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {bus.status}
                            </span>
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-[var(--sapphire)]">
                            {bus.available_seats} seats free
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--text-secondary)]">
                          <span>{bus.model_name} • {bus.current_speed} km/h</span>
                          <button
                            onClick={() => {
                              setSelectedBus(bus);
                              setBookingOpen(true);
                            }}
                            className="btn btn-primary btn-sm py-1 px-2.5 text-[10px]"
                          >
                            Reserve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action Tiles */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPassOpen(true)}
                    className="card p-3 flex flex-col items-center justify-center text-center hover:border-[var(--sapphire)] cursor-pointer"
                  >
                    <QrCode className="h-5 w-5 text-[var(--sapphire)] mb-1" />
                    <span className="text-xs font-bold text-[var(--navy)]">Digital Pass</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Dynamic TOTP</span>
                  </button>

                  <button
                    onClick={() => setScannerOpen(true)}
                    className="card p-3 flex flex-col items-center justify-center text-center hover:border-[var(--sapphire)] cursor-pointer"
                  >
                    <Smartphone className="h-5 w-5 text-[var(--sapphire)] mb-1" />
                    <span className="text-xs font-bold text-[var(--navy)]">Driver Scanner</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Boarding HUD</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            STATISTICS COUNTER (Apple-style High Impact Numbers)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-[var(--navy)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center font-display">
              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                  8
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                  Active Transit Routes
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                  50+
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                  Equipped Fleet Shuttles
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                  2,000+
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                  Daily Student Commuters
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                  99.9%
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                  Telemetry Service Uptime
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TESTIMONIALS (Student & Driver Commuter Reviews)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                TESTIMONIALS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-2">
                Loved by Students & Transport Staff
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-3">
                Read how UniRide transformed daily commuting across campus.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="card p-8 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic leading-relaxed">
                    &ldquo;The live GPS tracking has completely eliminated standing in the cold at 7 AM. I see exactly when my bus passes Faizabad and walk out right on time.&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--ice-blue)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--ice-blue)] flex items-center justify-center font-bold text-[var(--sapphire)]">
                    HK
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--navy)]">Hamza Khan</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">BS Computer Science • Batch 2023</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="card p-8 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic leading-relaxed">
                    &ldquo;The QR code check-in is so rapid. In past semesters we had huge manual queues while drivers checked cards. Now everyone boards in seconds!&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--ice-blue)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--ice-blue)] flex items-center justify-center font-bold text-[var(--sapphire)]">
                    SA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--navy)]">Sara Ahmed</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">BBA Commuter • Route 102</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="card p-8 flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] italic leading-relaxed">
                    &ldquo;As a fleet driver, the HUD tablet app tells me upcoming student counts at each stop and verifies passes even in weak cell service spots. Excellent system.&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--ice-blue)] flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--ice-blue)] flex items-center justify-center font-bold text-[var(--sapphire)]">
                    TM
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--navy)]">Tariq Mehmood</h4>
                    <p className="text-[10px] text-[var(--text-muted)]">Senior Shuttle Driver • BUS-01</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FAQ ACCORDION SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-20 bg-[var(--off-white)] border-t border-[var(--ice-blue)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                QUESTIONS & ANSWERS
              </span>
              <h2 className="text-3xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-2">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "How does the rotating QR code prevent attendance fraud?",
                  a: "Each QR code contains a dynamic TOTP (Time-based One-Time Password) cryptographic token that regenerates every 30 seconds. Screenshots taken by friends will immediately expire and be rejected by the driver's scanner.",
                },
                {
                  q: "Can I track the shuttle without an active internet connection?",
                  a: "Live tracking requires data to fetch real-time bus telemetry, but cached schedules and stop timetables are permanently available offline on your phone.",
                },
                {
                  q: "How are seat reservations balanced?",
                  a: "UniRide utilizes an AVL (Adelson-Velsky and Landis) self-balancing tree algorithm on the backend to distribute passenger allocations evenly across all available buses along a given corridor.",
                },
                {
                  q: "What should I do if my bus is delayed due to traffic?",
                  a: "The system automatically adjusts arrival ETAs using live vehicle speed telemetry and flags delayed statuses on the commuter dashboard in real time.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-[var(--powder-blue)] bg-white overflow-hidden shadow-xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-[var(--navy)] hover:text-[var(--sapphire)] transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[var(--sapphire)] transition-transform duration-200 ${
                        openFaq === idx ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--ice-blue)] pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CONTACT SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <section id="contact" className="py-20 bg-white border-t border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                  GET IN TOUCH
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-2">
                  Need Help or Have Suggestions?
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
                  Our transport management team is available daily to address route adjustments, student pass inquiries, and driver dispatch queries.
                </p>

                <div className="mt-8 space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--ice-blue)] text-[var(--sapphire)] flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--navy)]">Transport Office:</span>
                      <p className="text-[var(--text-secondary)]">Administration Block, UET Lahore Campus</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--ice-blue)] text-[var(--sapphire)] flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="font-bold text-[var(--navy)]">Operating Hours:</span>
                      <p className="text-[var(--text-secondary)]">Monday – Friday: 06:30 AM – 08:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Contact Inquiry Form */}
              <div className="rounded-3xl border border-[var(--powder-blue)] bg-[var(--off-white)] p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-[var(--navy)] font-display mb-4">
                  Send Campus Transport Inquiry
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("Thank you! Your inquiry has been dispatched to the transport office.");
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ayesha Malik"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                      University Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@university.edu.pk"
                      className="input text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                      Inquiry Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Describe your inquiry or route question..."
                      className="input text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full btn btn-primary py-2.5 text-xs font-semibold"
                  >
                    Submit Inquiry
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Global Modals */}
      <StudentPassModal isOpen={passOpen} onClose={() => setPassOpen(false)} />
      <DriverScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
      <SeatReservationModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        busNumber={selectedBus?.bus_number || "BUS-01"}
        busId={selectedBus?.id || 1}
        routeId={selectedRouteId}
      />
      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />

      {/* Global Brand Footer */}
      <Footer />
    </div>
  );
}
