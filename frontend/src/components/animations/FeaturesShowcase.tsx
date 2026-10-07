"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Navigation,
  QrCode,
  Cpu,
  BarChart3,
  Network,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface FeatureItem {
  id: string;
  title: string;
  shortLabel: string;
  subtitle: string;
  badge: string;
  description: string;
  points: string[];
  metrics: { label: string; value: string }[];
  icon: React.ElementType;
}

const FEATURES: FeatureItem[] = [
  {
    id: "gps",
    title: "Real-Time GPS Fleet Tracking",
    shortLabel: "Live GPS",
    subtitle: "Sub-Second WebSocket Telemetry",
    badge: "SENSORS & TELEMETRY",
    description:
      "Track every campus shuttle with sub-meter precision. High-frequency telemetry streams vehicle coordinates, live velocity, and seat availability directly to commuter dashboards.",
    points: [
      "Live Leaflet mapping engine with dynamic route polylines",
      "Dynamic ETA countdown based on active corridor congestion",
      "Real-time vehicle speed and seat occupancy gauges",
    ],
    metrics: [
      { label: "Update Rate", value: "1,000 ms" },
      { label: "Location Drift", value: "< 1.2 m" },
      { label: "Active Shuttles", value: "50 Buses" },
    ],
    icon: Navigation,
  },
  {
    id: "qr",
    title: "Dynamic Cryptographic QR Pass",
    shortLabel: "Smart QR",
    subtitle: "Rotating TOTP Anti-Fraud Defense",
    badge: "CYBERSECURITY",
    description:
      "Eliminate physical bus cards and forged screenshot fraud. UniRide generates a time-based one-time cryptographic token that automatically regenerates every 30 seconds.",
    points: [
      "TOTP tokens verified in < 200 nanoseconds on driver HUD",
      "Bloom Filter probabilistic bit-vector checks for offline terminals",
      "Automated attendance logs synced with university registrar database",
    ],
    metrics: [
      { label: "Token Validity", value: "30s Cycle" },
      { label: "Verification Latency", value: "< 200 ns" },
      { label: "Fraud Attempt Drop", value: "99.8%" },
    ],
    icon: QrCode,
  },
  {
    id: "dsa",
    title: "AI-Powered Route Optimization",
    shortLabel: "DSA Engine",
    subtitle: "C# .NET 10 Microservice Core",
    badge: "ALGORITHMS & GRAPHS",
    description:
      "Sub-millisecond computational engine executing Dijkstra and A* pathfinding over graph topologies to minimize commuter travel time and fleet fuel burn.",
    points: [
      "Multi-criterion routing incorporating congestion penalty weights",
      "AVL Tree dynamic seat allocation ensuring balanced bus loads",
      "Trie dictionary tree for instantaneous O(L) bus stop lookups",
    ],
    metrics: [
      { label: "Route Compute SLA", value: "0.82 ms" },
      { label: "Path Efficiency", value: "+18.4%" },
      { label: "Algorithm Core", value: ".NET 10" },
    ],
    icon: Cpu,
  },
  {
    id: "ids",
    title: "Demand Forecasting & Intelligence",
    shortLabel: "ML Forecast",
    subtitle: "Machine Learning (IDS Data Science)",
    badge: "MACHINE LEARNING",
    description:
      "Scikit-Learn Random Forest regressors predict passenger surges across exam weeks, rush hours, and semester starts, allowing administrators to proactively scale the fleet.",
    points: [
      "DBSCAN spatial clustering to identify persistent congestion bottlenecks",
      "SimPy discrete-event digital twin simulating 100x accelerated fleet operations",
      "NLP sentiment analysis on commuter feedback for continuous transit quality",
    ],
    metrics: [
      { label: "Forecast Accuracy", value: "94.2% R²" },
      { label: "Simulation Speed", value: "100x Realtime" },
      { label: "Models Active", value: "4 Pipelines" },
    ],
    icon: BarChart3,
  },
  {
    id: "cn",
    title: "Secure WebSocket Telemetry",
    shortLabel: "RFC 6455",
    subtitle: "Computer Networks (Full-Duplex)",
    badge: "NETWORKING",
    description:
      "Full-duplex WebSocket architecture with custom RFC 6455 packet dissector for microsecond latency telemetry between shuttles and commuters.",
    points: [
      "Low-overhead heartbeat ping/pong keepalives over persistent TCP",
      "Circuit breakers guarding against network disconnects",
      "Token bucket rate limiting to prevent telemetry flood attacks",
    ],
    metrics: [
      { label: "Round Trip Time", value: "14.2 ms" },
      { label: "Frame Overhead", value: "4.05%" },
      { label: "Protocol", value: "WSS / TCP" },
    ],
    icon: Network,
  },
];

export default function FeaturesShowcase() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6000; // 6 seconds per slide

  // Auto-slide with progress indicator
  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 50;
    const increment = (intervalTime / SLIDE_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((t) => (t + 1) % FEATURES.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPaused, activeTab]);

  const handleSelectTab = (idx: number) => {
    setActiveTab(idx);
    setProgress(0);
  };

  const current = FEATURES[activeTab];
  const IconComponent = current.icon;

  return (
    <div
      className="w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Apple-style Tab Bar with animated progress bars */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar">
        {FEATURES.map((feat, idx) => {
          const TabIcon = feat.icon;
          const isSelected = activeTab === idx;

          return (
            <button
              key={feat.id}
              onClick={() => handleSelectTab(idx)}
              className={`relative flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-300 whitespace-nowrap shrink-0 overflow-hidden ${
                isSelected
                  ? "bg-[var(--navy)] text-white shadow-lg"
                  : "bg-white text-[var(--text-secondary)] hover:bg-[var(--ice-blue-light)] border border-[var(--powder-blue)]"
              }`}
            >
              <TabIcon
                className={`h-4 w-4 transition-colors ${
                  isSelected ? "text-[var(--ice-blue)]" : "text-[var(--sapphire)]"
                }`}
              />
              <span>{feat.shortLabel}</span>

              {/* Animated Progress Bar under the active tab button */}
              {isSelected && (
                <span
                  className="absolute bottom-0 left-0 h-1 bg-[var(--sapphire-light)] transition-all duration-75 ease-linear rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Feature Showcase Presentation Card */}
      <div className="mt-8 rounded-3xl border border-[var(--powder-blue)] bg-white p-6 sm:p-12 shadow-xl relative overflow-hidden transition-all duration-500">
        {/* Subtle radial ambient background glow */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[var(--sapphire)]/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left Text Detail */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--ice-blue-light)] border border-[var(--ice-blue)] px-3.5 py-1 text-[11px] font-mono font-bold text-[var(--sapphire)]">
              <Zap className="h-3.5 w-3.5" />
              <span>{current.badge}</span>
            </div>

            <h3 className="text-2xl sm:text-4xl font-extrabold text-[var(--navy)] font-display tracking-tight">
              {current.title}
            </h3>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {current.description}
            </p>

            <ul className="space-y-3 pt-2">
              {current.points.map((pt, i) => (
                <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-[var(--navy)]">
                  <CheckCircle className="h-5 w-5 text-[var(--sapphire)] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="btn btn-primary btn-sm flex items-center gap-2"
              >
                <span>Experience {current.shortLabel}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/schedules"
                className="btn btn-secondary btn-sm"
              >
                View Live Corridor Schedules
              </Link>
            </div>
          </div>

          {/* Right Visual Dashboard Graphic */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-[var(--ice-blue-dark)] bg-gradient-to-br from-[var(--ice-blue-light)] via-white to-[var(--off-white)] p-6 sm:p-8 shadow-inner text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[var(--sapphire)] text-white mx-auto flex items-center justify-center shadow-xl shadow-blue-500/30 mb-4 animate-float">
                <IconComponent className="h-8 w-8" />
              </div>

              <span className="font-mono text-xs font-bold text-[var(--sapphire)] uppercase tracking-wider block">
                {current.subtitle}
              </span>

              <p className="text-xs text-[var(--text-secondary)] mt-2">
                Engineered for maximum academic efficiency and zero latency buffering across all campus routes.
              </p>

              {/* 3 Metric Counters */}
              <div className="mt-6 pt-6 border-t border-[var(--ice-blue)] grid grid-cols-3 gap-2 font-mono">
                {current.metrics.map((m) => (
                  <div key={m.label} className="p-2 rounded-xl bg-white/70 border border-[var(--ice-blue)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">{m.label}</span>
                    <span className="font-bold text-xs sm:text-sm text-[var(--navy)] block mt-0.5">
                      {m.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
