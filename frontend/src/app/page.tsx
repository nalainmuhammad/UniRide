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
import ScrollReveal from "@/components/animations/ScrollReveal";
import AnimatedCounter from "@/components/animations/AnimatedCounter";
import HeroBusMotion from "@/components/animations/HeroBusMotion";
import FeaturesShowcase from "@/components/animations/FeaturesShowcase";
import TestimonialsCarousel from "@/components/animations/TestimonialsCarousel";

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
            <ScrollReveal animation="fade-up" duration={800}>
              <div className="text-center max-w-3xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--powder-blue)] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[var(--sapphire)] shadow-sm backdrop-blur-md mb-6 hover:scale-105 transition-transform duration-200">
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
                    className="btn btn-primary btn-lg w-full sm:w-auto shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#tracker"
                    className="btn btn-secondary btn-lg w-full sm:w-auto hover:bg-[var(--ice-blue-light)] hover:-translate-y-0.5 active:scale-95 transition-all"
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
            </ScrollReveal>

            {/* Hero Interactive Highway & Bus Motion Graphic */}
            <ScrollReveal animation="zoom-in" delay={200} duration={900} className="mt-12 max-w-4xl mx-auto">
              <HeroBusMotion />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            QUICK ACCESS CARDS (Glassmorphic cards with hover lift)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-12 bg-white -mt-6 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Track Bus */}
              <ScrollReveal animation="fade-up" delay={100}>
                <a
                  href="#tracker"
                  className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] hover:-translate-y-2 hover:shadow-xl group cursor-pointer h-full transition-all duration-300"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                      <Navigation className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                      Track Your Bus
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Live interactive GPS map showing all active shuttles, speed, and exact stop ETAs.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>View Live Map</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </a>
              </ScrollReveal>

              {/* Card 2: View Schedules */}
              <ScrollReveal animation="fade-up" delay={200}>
                <Link
                  href="/schedules"
                  className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] hover:-translate-y-2 hover:shadow-xl group cursor-pointer h-full transition-all duration-300"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                      View Schedules
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Browse timetable across Morning, Afternoon, and Evening campus transit shifts.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>Browse Timetable</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </Link>
              </ScrollReveal>

              {/* Card 3: Dynamic QR Pass */}
              <ScrollReveal animation="fade-up" delay={300}>
                <button
                  onClick={() => setPassOpen(true)}
                  className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] hover:-translate-y-2 hover:shadow-xl group text-left cursor-pointer w-full h-full transition-all duration-300"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                      My QR Pass
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      View your rotating cryptographic digital pass for fast contactless bus check-in.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>Launch Pass</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </button>
              </ScrollReveal>

              {/* Card 4: Give Feedback */}
              <ScrollReveal animation="fade-up" delay={400}>
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="card p-6 flex flex-col justify-between hover:border-[var(--sapphire)] hover:-translate-y-2 hover:shadow-xl group text-left cursor-pointer w-full h-full transition-all duration-300"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center text-[var(--sapphire)] mb-4 group-hover:bg-[var(--sapphire)] group-hover:text-white group-hover:rotate-6 transition-all duration-300">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--navy)] font-display group-hover:text-[var(--sapphire)] transition-colors">
                      Give Feedback
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Rate your commute comfort and help optimize campus transport with NLP sentiment.
                    </p>
                  </div>
                  <div className="mt-5 flex items-center text-xs font-semibold text-[var(--sapphire)] group-hover:translate-x-1.5 transition-transform duration-200">
                    <span>Rate Trip</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </button>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FEATURES SHOWCASE (Apple-style Horizontal Carousel / Tabs)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="features" className="py-20 bg-[var(--off-white)] border-y border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
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
            </ScrollReveal>

            {/* Apple-style Interactive Feature Showcase */}
            <ScrollReveal animation="zoom-in" delay={150}>
              <FeaturesShowcase />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            HOW IT WORKS (3-Step Visual Flow)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
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
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <ScrollReveal animation="fade-up" delay={100}>
                <div className="relative rounded-3xl border border-[var(--ice-blue-dark)] bg-[var(--off-white)] p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center font-display font-extrabold text-xl shadow-md shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display">
                    Sign Up & Select Route
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                    Register with your university roll number and choose your daily morning and evening route stops.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 2 */}
              <ScrollReveal animation="fade-up" delay={200}>
                <div className="relative rounded-3xl border border-[var(--ice-blue-dark)] bg-[var(--off-white)] p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center font-display font-extrabold text-xl shadow-md shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display">
                    Get Cryptographic Pass
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                    Access your rotating TOTP Smart Pass on your phone. Automatically refreshes every 30 seconds.
                  </p>
                </div>
              </ScrollReveal>

              {/* Step 3 */}
              <ScrollReveal animation="fade-up" delay={300}>
                <div className="relative rounded-3xl border border-[var(--ice-blue-dark)] bg-[var(--off-white)] p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center font-display font-extrabold text-xl shadow-md shadow-blue-500/25 mb-6 group-hover:scale-110 transition-transform">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-[var(--navy)] font-display">
                    Track & Board Seamlessly
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                    Track your incoming shuttle on the live map, tap your QR pass at boarding, and enjoy a safe ride.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            LIVE TRANSIT TRACKER (Interactive Map + Route Roster)
            ═══════════════════════════════════════════════════════════════ */}
        <section id="tracker" className="py-20 bg-[var(--ice-blue-light)]/40 border-t border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
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
                      className="w-full rounded-xl border border-[var(--powder-blue)] bg-white py-2.5 pl-10 pr-4 text-xs text-[var(--navy)] placeholder-[var(--text-muted)] focus:border-[var(--sapphire)] focus:outline-none focus:ring-2 focus:ring-[var(--sapphire)]/20 font-mono shadow-sm transition-all"
                    />
                  </div>

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-11 z-30 mt-1 rounded-xl border border-[var(--powder-blue)] bg-white p-2 shadow-xl font-mono text-xs animate-[modalSlideUp_0.2s_ease-out]">
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
            </ScrollReveal>

            {/* Main Interactive Grid: Map + Shuttles */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Column (8 Cols) */}
              <ScrollReveal animation="fade-right" delay={150} className="lg:col-span-8 flex flex-col gap-4">
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
                          ? "bg-[var(--sapphire)] text-white shadow-sm font-semibold scale-105"
                          : "bg-white text-[var(--navy)] hover:bg-[var(--ice-blue-light)] border border-[var(--powder-blue)]"
                      }`}
                    >
                      {route.code} • {route.name.split("(")[0]}
                    </button>
                  ))}
                </div>
              </ScrollReveal>

              {/* Shuttles Column (4 Cols) */}
              <ScrollReveal animation="fade-left" delay={200} className="lg:col-span-4 space-y-3">
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
                        className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3 hover:border-[var(--sapphire)] hover:bg-white hover:-translate-y-0.5 transition-all shadow-xs"
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
                            className="btn btn-primary btn-sm py-1 px-2.5 text-[10px] active:scale-95 transition-transform"
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
                    className="card p-3 flex flex-col items-center justify-center text-center hover:border-[var(--sapphire)] hover:-translate-y-1 transition-all cursor-pointer"
                  >
                    <QrCode className="h-5 w-5 text-[var(--sapphire)] mb-1" />
                    <span className="text-xs font-bold text-[var(--navy)]">Digital Pass</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Dynamic TOTP</span>
                  </button>

                  <button
                    onClick={() => setScannerOpen(true)}
                    className="card p-3 flex flex-col items-center justify-center text-center hover:border-[var(--sapphire)] hover:-translate-y-1 transition-all cursor-pointer"
                  >
                    <Smartphone className="h-5 w-5 text-[var(--sapphire)] mb-1" />
                    <span className="text-xs font-bold text-[var(--navy)]">Driver Scanner</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">Boarding HUD</span>
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            STATISTICS COUNTER (Apple-style Animated Count-Up Numbers)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-[var(--navy)] text-white relative overflow-hidden">
          {/* Subtle animated background radial blurs */}
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[var(--sapphire)]/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[var(--ice-blue)]/10 blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <ScrollReveal animation="fade-up">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center font-display">
                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                    <AnimatedCounter target={8} duration={1800} />
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                    Active Transit Routes
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                    <AnimatedCounter target={50} suffix="+" duration={2200} />
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                    Equipped Fleet Shuttles
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                    <AnimatedCounter target={2148} suffix="+" duration={2400} />
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                    Daily Student Commuters
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--ice-blue)]">
                    <AnimatedCounter target={99.9} decimals={1} suffix="%" duration={2000} />
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--powder-blue)] uppercase tracking-wider">
                    Telemetry Service Uptime
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            TESTIMONIALS (Apple-Style Auto-Sliding Carousel)
            ═══════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="text-center max-w-2xl mx-auto mb-14">
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
            </ScrollReveal>

            {/* Interactive Carousel */}
            <ScrollReveal animation="zoom-in" delay={150}>
              <TestimonialsCarousel />
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            FAQ ACCORDION SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <section id="faq" className="py-20 bg-[var(--off-white)] border-t border-[var(--ice-blue)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade-up">
              <div className="text-center mb-12">
                <span className="text-xs font-bold text-[var(--sapphire)] tracking-widest uppercase font-mono">
                  QUESTIONS & ANSWERS
                </span>
                <h2 className="text-3xl font-extrabold text-[var(--navy)] font-display tracking-tight mt-2">
                  Frequently Asked Questions
                </h2>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="fade-up" delay={150}>
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
                    className="rounded-2xl border border-[var(--powder-blue)] bg-white overflow-hidden shadow-xs hover:border-[var(--sapphire)] transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm text-[var(--navy)] hover:text-[var(--sapphire)] transition-colors"
                    >
                      <span>{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[var(--sapphire)] transition-transform duration-300 ${
                          openFaq === idx ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {openFaq === idx && (
                      <div className="px-5 pb-5 text-xs text-[var(--text-secondary)] leading-relaxed border-t border-[var(--ice-blue)] pt-3 animate-[modalSlideUp_0.25s_ease-out]">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════
            CONTACT SECTION
            ═══════════════════════════════════════════════════════════════ */}
        <section id="contact" className="py-20 bg-white border-t border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal animation="fade-right">
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
              </ScrollReveal>

              {/* Fast Contact Inquiry Form */}
              <ScrollReveal animation="fade-left" delay={150}>
                <div className="rounded-3xl border border-[var(--powder-blue)] bg-[var(--off-white)] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow">
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
                      className="w-full btn btn-primary py-2.5 text-xs font-semibold hover:-translate-y-0.5 active:scale-95 transition-all"
                    >
                      Submit Inquiry
                    </button>
                  </form>
                </div>
              </ScrollReveal>
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
