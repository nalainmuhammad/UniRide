"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  LayoutDashboard,
  QrCode,
  User,
  Navigation,
  Calendar,
  ClipboardCheck,
  MessageSquare,
  Bell,
  LogOut,
  Clock,
  MapPin,
  Bus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  ShieldCheck,
  Send,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Phone,
  Save,
} from "lucide-react";

import {
  fetchBuses,
  fetchRoutes,
  fetchStops,
  submitFeedback,
  BusTelemetry,
  TransitRoute,
  TransitStop,
} from "@/lib/api";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-[var(--ice-blue-dark)] bg-[var(--ice-blue-light)] text-[var(--text-secondary)] font-mono text-xs">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded-full border-2 border-[var(--sapphire)] border-t-transparent animate-spin" />
        <span>Loading Satellite Transit Map...</span>
      </div>
    </div>
  ),
});

type TabType =
  | "overview"
  | "pass"
  | "tracking"
  | "schedule"
  | "attendance"
  | "feedback"
  | "profile"
  | "notifications";

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Student Profile State
  const [profile, setProfile] = useState({
    name: "Bilal Khan",
    rollNumber: "FA23-BCS-001",
    email: "fa23-bcs-001@university.edu.pk",
    phone: "+92 301 8472910",
    emergencyContact: "+92 321 9988776 (Father)",
    bloodGroup: "B+",
    assignedRoute: "R-101 • Islamabad Highway Corridor",
    pickupStop: "Faizabad Interchange Terminal",
    address: "House 42, Street 8, Sector I-8/2, Islamabad",
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Dynamic QR Pass State
  const [totpSeconds, setTotpSeconds] = useState(30);
  const [tokenHash, setTokenHash] = useState("UNIRIDE-FA23BCS001-2026");

  // Telemetry data
  const [buses, setBuses] = useState<BusTelemetry[]>([]);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);

  // Feedback State
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState("PUNCTUALITY");
  const [fbComment, setFbComment] = useState("");
  const [fbSuccess, setFbSuccess] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Bus En Route",
      message: "Your assigned shuttle BUS-01 is 6 minutes away from Faizabad.",
      time: "10 mins ago",
      read: false,
      type: "info",
    },
    {
      id: 2,
      title: "Pass Verified",
      message: "Morning attendance checked in successfully at 07:26 AM.",
      time: "2 hours ago",
      read: true,
      type: "success",
    },
    {
      id: 3,
      title: "Schedule Notice",
      message: "Midterm exam week will have supplementary 11:30 AM return shuttles.",
      time: "Yesterday",
      read: true,
      type: "notice",
    },
  ]);

  useEffect(() => {
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

    // Dynamic TOTP countdown timer
    const interval = setInterval(() => {
      setTotpSeconds((prev) => {
        if (prev <= 1) {
          setTokenHash(`UNIRIDE-${Math.random().toString(36).substring(2, 8).toUpperCase()}-2026`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFeedback(fbComment, fbRating, fbCategory);
    setFbSuccess(true);
    setFbComment("");
    setTimeout(() => setFbSuccess(false), 2500);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex bg-[var(--off-white)] text-[var(--navy)]">
      {/* ═══════════════════════════════════════════════════════════════
          SIDEBAR NAVIGATION (Deep Navy with Sapphire Accents)
          ═══════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--navy)] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--sapphire)] flex items-center justify-center text-white shadow-md">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold font-display text-white">UniRide</span>
                <span className="block text-[10px] font-mono text-[var(--powder-blue)]">STUDENT PORTAL</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--powder-blue-dark)]">
              Commuter Console
            </div>

            {[
              { id: "overview" as TabType, label: "Dashboard", icon: LayoutDashboard },
              { id: "pass" as TabType, label: "My QR Pass", icon: QrCode },
              { id: "tracking" as TabType, label: "Live Tracking", icon: Navigation },
              { id: "schedule" as TabType, label: "My Schedule", icon: Calendar },
              { id: "attendance" as TabType, label: "My Attendance", icon: ClipboardCheck },
              { id: "feedback" as TabType, label: "Trip Feedback", icon: MessageSquare },
              { id: "profile" as TabType, label: "My Profile", icon: User },
              {
                id: "notifications" as TabType,
                label: "Notifications",
                icon: Bell,
                badge: unreadCount > 0 ? unreadCount : undefined,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--sapphire)] text-white shadow-md"
                      : "text-[var(--powder-blue)] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-white/5">
            <div className="w-9 h-9 rounded-full bg-[var(--sapphire)] text-white font-bold flex items-center justify-center text-xs">
              BK
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{profile.name}</p>
              <p className="text-[10px] text-[var(--powder-blue-dark)] font-mono truncate">
                {profile.rollNumber}
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header Bar */}
        <header className="h-16 lg:h-20 bg-white border-b border-[var(--ice-blue)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--navy)] hover:bg-[var(--ice-blue-light)]"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold font-display text-[var(--navy)] capitalize">
              {activeTab === "overview" ? "Student Dashboard" : activeTab.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--ice-blue-light)] transition-colors"
              aria-label="View notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("pass")}
              className="btn btn-primary btn-sm flex items-center gap-1.5 py-1.5 px-3 text-xs"
            >
              <QrCode size={14} />
              <span className="hidden sm:inline">Quick Pass</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {/* ═══════════════════════════════════════════════════════════════
              TAB: OVERVIEW (Dashboard Home)
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Banner (Ice Blue Background) */}
              <div className="rounded-3xl border border-[var(--powder-blue)] bg-gradient-to-r from-[var(--ice-blue-light)] via-[var(--ice-blue)] to-[var(--powder-blue-light)] p-6 sm:p-8 relative overflow-hidden shadow-xs">
                <div className="relative z-10 max-w-2xl">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-mono font-bold text-[var(--sapphire)] mb-3">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Fall 2026 Academic Term</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)] font-display">
                    Welcome back, {profile.name}!
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                    Assigned to <strong>{profile.assignedRoute}</strong>. Your next bus (BUS-01) is currently en route with normal traffic flow.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab("pass")}
                    className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
                  >
                    <QrCode className="h-4 w-4" />
                    <span>Open Smart QR Pass</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("tracking")}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5 bg-white"
                  >
                    <Navigation className="h-4 w-4" />
                    <span>Track Assigned Shuttle</span>
                  </button>
                </div>
              </div>

              {/* KPI Quick Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <ClipboardCheck className="h-4 w-4 text-[var(--sapphire)]" /> Term Attendance
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-[var(--navy)]">92.4%</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">38 of 41 Days Present</span>
                </div>

                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-[var(--sapphire)]" /> Next Bus ETA
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-[var(--sapphire)]">6 min</p>
                  <span className="text-[11px] text-[var(--text-secondary)]">Faizabad Terminal Stop</span>
                </div>

                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Bus className="h-4 w-4 text-[var(--sapphire)]" /> Assigned Vehicle
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-[var(--navy)]">BUS-01</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">16 Seats Available</span>
                </div>

                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[var(--sapphire)]" /> Pass Validity
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-emerald-600">Active</p>
                  <span className="text-[11px] text-[var(--text-secondary)]">Valid till Jan 2027</span>
                </div>
              </div>

              {/* Grid: QR Mini-Card Preview + Live Shuttle Status */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Mini QR Pass Card */}
                <div className="lg:col-span-5 card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-5 w-5 text-[var(--sapphire)]" />
                        <h3 className="text-sm font-bold text-[var(--navy)] font-display">
                          Digital Commuter Card
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--sapphire)] font-bold bg-[var(--ice-blue)] px-2 py-0.5 rounded-full">
                        {totpSeconds}s TOTP
                      </span>
                    </div>

                    <div className="my-6 flex flex-col items-center">
                      <div className="h-40 w-40 rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--sapphire-dark)] p-3 flex flex-col items-center justify-center text-white shadow-md">
                        <QrCode className="h-24 w-24 text-white stroke-[1.2]" />
                        <span className="text-[9px] font-mono text-[var(--ice-blue)] mt-1 tracking-widest">
                          {tokenHash.slice(0, 16)}...
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-3">
                        Present to scanner upon boarding. Rotates automatically.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab("pass")}
                    className="w-full btn btn-secondary btn-sm"
                  >
                    View Fullscreen Pass
                  </button>
                </div>

                {/* Right: Next Bus Progress & Today's Schedule */}
                <div className="lg:col-span-7 card p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                      <h3 className="text-sm font-bold text-[var(--navy)] font-display flex items-center gap-2">
                        <Bus className="h-4 w-4 text-[var(--sapphire)]" /> Today&apos;s Return Shuttle
                      </h3>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        On Schedule
                      </span>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">Evening Departure:</span>
                        <span className="font-bold text-[var(--navy)] font-mono">05:15 PM (Campus Terminal)</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">Your Dropoff Stop:</span>
                        <span className="font-bold text-[var(--sapphire)]">Faizabad Interchange</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-secondary)]">Estimated Arrival:</span>
                        <span className="font-bold text-[var(--navy)] font-mono">06:05 PM</span>
                      </div>

                      <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3 text-xs">
                        <div className="flex items-center justify-between font-mono text-[11px] text-[var(--text-secondary)] mb-1.5">
                          <span>Route Progress:</span>
                          <span>3 of 4 Stops Completed</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[var(--ice-blue)] overflow-hidden">
                          <div className="h-full bg-[var(--sapphire)] rounded-full w-3/4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => setActiveTab("tracking")}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Track Vehicle
                    </button>
                    <button
                      onClick={() => setActiveTab("schedule")}
                      className="btn btn-secondary btn-sm flex-1"
                    >
                      Full Timetable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: MY QR PASS (Fullscreen Anti-Fraud Pass)
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "pass" && (
            <div className="max-w-md mx-auto">
              <div className="card p-8 text-center shadow-lg border-[var(--powder-blue)]">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ice-blue-light)] border border-[var(--ice-blue)] px-3 py-1 text-xs font-mono font-bold text-[var(--sapphire)] mb-4">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Dynamic Cryptographic Pass</span>
                </div>

                <h2 className="text-xl font-bold text-[var(--navy)] font-display">
                  {profile.name}
                </h2>
                <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
                  Roll: {profile.rollNumber}
                </p>

                {/* QR Box */}
                <div className="my-6 mx-auto w-56 h-56 rounded-3xl bg-[var(--navy)] p-4 flex flex-col items-center justify-center shadow-xl border-4 border-[var(--ice-blue)]">
                  <QrCode className="h-36 w-36 text-white stroke-[1.2]" />
                  <div className="mt-2 text-[10px] font-mono text-[var(--ice-blue)] tracking-widest truncate max-w-[200px]">
                    {tokenHash}
                  </div>
                </div>

                {/* Live Countdown */}
                <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] px-4">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[var(--sapphire)] animate-spin-slow" />
                    Auto-regenerates in:
                  </span>
                  <span className="font-bold text-[var(--sapphire)] text-sm">{totpSeconds}s</span>
                </div>

                <div className="mt-2 h-1.5 w-full bg-[var(--ice-blue)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--sapphire)] transition-all duration-1000 ease-linear rounded-full"
                    style={{ width: `${(totpSeconds / 30) * 100}%` }}
                  />
                </div>

                {/* Security Warning */}
                <div className="mt-6 rounded-2xl bg-[var(--ice-blue-light)] p-3 text-[11px] text-[var(--navy)] flex items-start gap-2 text-left">
                  <ShieldCheck className="h-4 w-4 text-[var(--sapphire)] shrink-0 mt-0.5" />
                  <p>
                    Screenshot protection enabled. Driver scanners reject expired TOTP tokens in under 200 nanoseconds.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: LIVE TRACKING
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "tracking" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Live Shuttle Telemetry
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Tracking assigned shuttle BUS-01 along {profile.assignedRoute}.
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    WebSocket Feed Connected
                  </span>
                </div>
              </div>

              <div className="h-[460px] w-full rounded-2xl overflow-hidden border border-[var(--powder-blue)] shadow-md">
                <LiveMap buses={buses} routes={routes} stops={stops} />
              </div>

              {/* Shuttle Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
                <div className="card p-4">
                  <span className="text-xs text-[var(--text-muted)]">Current Velocity</span>
                  <p className="text-xl font-bold text-[var(--navy)] mt-1">42.5 km/h</p>
                  <span className="text-[10px] text-emerald-600">Within campus safe limit</span>
                </div>
                <div className="card p-4">
                  <span className="text-xs text-[var(--text-muted)]">Seat Availability</span>
                  <p className="text-xl font-bold text-[var(--sapphire)] mt-1">16 seats free</p>
                  <span className="text-[10px] text-[var(--text-secondary)]">34 of 50 occupied</span>
                </div>
                <div className="card p-4">
                  <span className="text-xs text-[var(--text-muted)]">Next Stop</span>
                  <p className="text-xl font-bold text-[var(--navy)] mt-1">Faizabad (6 min)</p>
                  <span className="text-[10px] text-[var(--text-secondary)]">Normal traffic condition</span>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: MY SCHEDULE
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  My Assigned Bus Schedule
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Full timetable sequence for {profile.assignedRoute}.
                </p>
              </div>

              <div className="card overflow-hidden">
                <div className="p-4 bg-[var(--ice-blue)] border-b border-[var(--powder-blue)] flex items-center justify-between font-mono text-xs font-bold text-[var(--navy)]">
                  <span>Shift: Morning Inbound & Evening Return</span>
                  <span>Vehicle: BUS-01</span>
                </div>

                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--sapphire)] font-mono mb-3">
                      Morning Arrival Corridor (Inbound)
                    </h3>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--powder-blue)]">
                      {[
                        { stop: "Saddar Metro Station", time: "07:00 AM", status: "Passed" },
                        { stop: "Faizabad Interchange (Your Pickup)", time: "07:25 AM", status: "Approaching" },
                        { stop: "Zero Point Interchange", time: "07:45 AM", status: "Scheduled" },
                        { stop: "Campus Terminal", time: "08:15 AM", status: "Scheduled" },
                      ].map((s, idx) => (
                        <div key={idx} className="relative flex items-center justify-between text-xs">
                          <div className={`absolute -left-[23px] h-3.5 w-3.5 rounded-full border-2 ${
                            s.status === "Approaching" ? "bg-[var(--sapphire)] border-white ring-2 ring-[var(--sapphire)]" : "bg-white border-[var(--powder-blue)]"
                          }`} />
                          <span className={`font-semibold ${s.status === "Approaching" ? "text-[var(--sapphire)] font-bold" : "text-[var(--navy)]"}`}>
                            {s.stop}
                          </span>
                          <span className="font-mono text-[var(--navy)] font-bold bg-[var(--ice-blue-light)] px-2 py-0.5 rounded border border-[var(--ice-blue)]">
                            {s.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[var(--ice-blue)] pt-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--sapphire)] font-mono mb-3">
                      Evening Return Corridor (Outbound)
                    </h3>
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--powder-blue)]">
                      {[
                        { stop: "Campus Terminal Departure", time: "05:15 PM" },
                        { stop: "Zero Point Interchange", time: "05:40 PM" },
                        { stop: "Faizabad Interchange (Your Dropoff)", time: "06:05 PM" },
                        { stop: "Saddar Metro Station", time: "06:30 PM" },
                      ].map((s, idx) => (
                        <div key={idx} className="relative flex items-center justify-between text-xs">
                          <div className="absolute -left-[23px] h-3.5 w-3.5 rounded-full bg-white border-2 border-[var(--powder-blue)]" />
                          <span className="font-semibold text-[var(--navy)]">{s.stop}</span>
                          <span className="font-mono text-[var(--navy)] font-bold bg-[var(--ice-blue-light)] px-2 py-0.5 rounded border border-[var(--ice-blue)]">
                            {s.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: MY ATTENDANCE
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Attendance History & Records
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Verified via Bloom Filter fast-scanning boarding logs.
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--powder-blue)] bg-white px-4 py-2 text-xs font-mono font-bold text-[var(--navy)]">
                  Total Rate: <span className="text-emerald-600">92.4%</span>
                </div>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shift</th>
                      <th>Boarding Stop</th>
                      <th>Check-in Time</th>
                      <th>Assigned Bus</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "Oct 06, 2026", shift: "Morning", stop: "Faizabad", time: "07:26 AM", bus: "BUS-01", status: "Present" },
                      { date: "Oct 05, 2026", shift: "Morning", stop: "Faizabad", time: "07:24 AM", bus: "BUS-01", status: "Present" },
                      { date: "Oct 05, 2026", shift: "Evening", stop: "Campus", time: "05:14 PM", bus: "BUS-01", status: "Present" },
                      { date: "Oct 02, 2026", shift: "Morning", stop: "Faizabad", time: "—", bus: "BUS-01", status: "Absent" },
                      { date: "Oct 01, 2026", shift: "Morning", stop: "Faizabad", time: "07:28 AM", bus: "BUS-01", status: "Present" },
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-mono text-xs font-semibold text-[var(--navy)]">{row.date}</td>
                        <td>{row.shift}</td>
                        <td>{row.stop}</td>
                        <td className="font-mono text-xs">{row.time}</td>
                        <td className="font-mono text-xs font-bold text-[var(--sapphire)]">{row.bus}</td>
                        <td>
                          <span
                            className={`badge ${
                              row.status === "Present" ? "badge-success" : "badge-danger"
                            }`}
                          >
                            {row.status === "Present" ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            <span>{row.status}</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: TRIP FEEDBACK
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "feedback" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Trip Feedback & AI Sentiment
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your ratings directly shape driver performance and fleet scheduling.
                </p>
              </div>

              {fbSuccess && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Feedback recorded successfully! NLP vector generated for fleet analysis.</span>
                </div>
              )}

              <div className="card p-6">
                <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1.5 font-mono">
                      Commute Rating
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setFbRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`h-7 w-7 ${
                              fbRating >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-[var(--powder-blue)]"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-mono text-xs font-bold text-[var(--navy)]">
                        {fbRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Category
                    </label>
                    <select
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value)}
                      className="input text-xs"
                    >
                      <option value="PUNCTUALITY">Punctuality & Timing</option>
                      <option value="DRIVING_SAFETY">Driver Safety & Conduct</option>
                      <option value="BUS_CLEANLINESS">Vehicle Cleanliness</option>
                      <option value="OVERCROWDING">Seat Crowding & Capacity</option>
                      <option value="OTHER">Other Suggestions</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Your Comments
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={fbComment}
                      onChange={(e) => setFbComment(e.target.value)}
                      placeholder="Describe your commute experience today..."
                      className="input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Commute Feedback</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: MY PROFILE
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Student Commuter Profile
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Update your contact info and designated pickup stop.
                </p>
              </div>

              {profileSaved && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="card p-6">
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                        Registration ID
                      </label>
                      <input
                        type="text"
                        disabled
                        value={profile.rollNumber}
                        className="input text-xs font-mono bg-[var(--off-white)] cursor-not-allowed opacity-75"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="input text-xs font-mono"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={profile.emergencyContact}
                        onChange={(e) =>
                          setProfile({ ...profile, emergencyContact: e.target.value })
                        }
                        className="input text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Pickup & Dropoff Terminal Stop
                    </label>
                    <input
                      type="text"
                      value={profile.pickupStop}
                      onChange={(e) => setProfile({ ...profile, pickupStop: e.target.value })}
                      className="input text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Home Address
                    </label>
                    <textarea
                      rows={2}
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className="input text-xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm py-2 px-4 flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: NOTIFICATIONS
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Transit Notifications
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Alerts from your assigned shuttle and university transport dispatcher.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setNotifications(notifications.map((n) => ({ ...n, read: true })))
                  }
                  className="text-xs font-semibold text-[var(--sapphire)] hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`card p-4 flex items-start gap-3 transition-all ${
                      !item.read ? "border-[var(--sapphire)] bg-blue-50/20" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        item.type === "info"
                          ? "bg-[var(--ice-blue)] text-[var(--sapphire)]"
                          : item.type === "success"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Bell size={16} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[var(--navy)]">{item.title}</h4>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">{item.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
