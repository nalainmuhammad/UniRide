"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Calendar,
  Camera,
  Navigation,
  ClipboardCheck,
  Users,
  ShieldAlert,
  Bell,
  LogOut,
  Gauge,
  MapPin,
  Clock,
  Bus,
  CheckCircle2,
  XCircle,
  Menu,
  X,
  Phone,
  RefreshCw,
  AlertTriangle,
  Radio,
} from "lucide-react";

import {
  fetchBuses,
  fetchRoutes,
  fetchStops,
  checkInAttendance,
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
        <span>Loading Driver Route Navigation...</span>
      </div>
    </div>
  ),
});

type DriverTab =
  | "overview"
  | "scanner"
  | "route"
  | "passengers"
  | "attendance"
  | "sos"
  | "profile"
  | "notifications";

export default function DriverDashboardPage() {
  const [activeTab, setActiveTab] = useState<DriverTab>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Driver Telemetry State
  const [speed, setSpeed] = useState(42);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [scannerScanning, setScannerScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    name: string;
    roll: string;
    message: string;
  } | null>(null);

  // Boarded Passengers State
  const [boardedList, setBoardedList] = useState([
    { id: 1, name: "Bilal Khan", roll: "FA23-BCS-001", stop: "Faizabad", time: "07:26 AM", status: "Verified" },
    { id: 2, name: "Ayesha Malik", roll: "FA23-BCS-042", stop: "Faizabad", time: "07:25 AM", status: "Verified" },
    { id: 3, name: "Hamza Tariq", roll: "SP22-BSE-019", stop: "Saddar", time: "07:05 AM", status: "Verified" },
    { id: 4, name: "Usman Ghani", roll: "FA24-BAI-012", stop: "Saddar", time: "07:04 AM", status: "Verified" },
  ]);

  // Telemetry APIs
  const [buses, setBuses] = useState<BusTelemetry[]>([]);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);

  // Turn by turn stop progress
  const routeStops = [
    { name: "Saddar Metro Station", distance: "0.0 km", eta: "Passed", completed: true },
    { name: "Faizabad Interchange Terminal", distance: "2.4 km ahead", eta: "4 min", completed: false },
    { name: "Zero Point Interchange", distance: "6.8 km", eta: "12 min", completed: false },
    { name: "FAST-NUCES Campus Terminal", distance: "16.5 km", eta: "28 min", completed: false },
  ];

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

    // Speedometer realistic jitter
    const interval = setInterval(() => {
      setSpeed((s) => Math.max(25, Math.min(56, s + Math.floor((Math.random() - 0.5) * 5))));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const handleSimulateScan = async (valid: boolean, roll: string, name: string) => {
    setScannerScanning(true);
    setScanResult(null);

    const token = valid ? `UNIRIDE-${roll}-TOKEN` : "REVOKED-EXPIRED";
    await checkInAttendance(token, 1);

    setTimeout(() => {
      setScannerScanning(false);
      if (valid) {
        setBoardedList((prev) => [
          {
            id: Date.now(),
            name,
            roll,
            stop: "Faizabad Interchange",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            status: "Verified",
          },
          ...prev,
        ]);
        setScanResult({
          success: true,
          name,
          roll,
          message: "Boarding Authorized • Pass verified in 120 μs",
        });
      } else {
        setScanResult({
          success: false,
          name: "Revoked Pass Card",
          roll: "EXPIRED-TOKEN",
          message: "Rejected: Pass token has expired or is invalid.",
        });
      }
    }, 350);
  };

  return (
    <div className="min-h-screen flex bg-[var(--off-white)] text-[var(--navy)]">
      {/* ═══════════════════════════════════════════════════════════════
          DRIVER SIDEBAR (Deep Navy)
          ═══════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--navy)] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--sapphire)] flex items-center justify-center text-white shadow-md">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold font-display text-white">UniRide</span>
                <span className="block text-[10px] font-mono text-amber-400">DRIVER HUD CONSOLE</span>
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
              Shuttle Controls
            </div>

            {[
              { id: "overview" as DriverTab, label: "Driver Dashboard", icon: LayoutDashboard },
              { id: "scanner" as DriverTab, label: "QR Boarding Scanner", icon: Camera },
              { id: "route" as DriverTab, label: "Live Route Map", icon: Navigation },
              { id: "passengers" as DriverTab, label: "Passenger List", icon: Users, badge: boardedList.length },
              { id: "attendance" as DriverTab, label: "My Attendance", icon: ClipboardCheck },
              { id: "sos" as DriverTab, label: "Emergency SOS", icon: ShieldAlert },
              { id: "profile" as DriverTab, label: "Driver Profile", icon: User },
              { id: "notifications" as DriverTab, label: "Dispatch Alerts", icon: Bell },
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
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[var(--sapphire-dark)] text-white font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Driver Vehicle Pill & Sign Out */}
        <div className="p-4 border-t border-white/10">
          <div className="rounded-xl bg-white/5 p-3 mb-3 space-y-1">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-white">BUS-01 • R-101</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-[var(--powder-blue)]">Driver: Tariq Mehmood</p>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={14} />
            <span>End Shift & Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Screen Container */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-[var(--ice-blue)] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[var(--navy)] hover:bg-[var(--ice-blue-light)]"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-xl font-bold font-display text-[var(--navy)] capitalize">
              {activeTab === "overview" ? "Driver HUD Console" : activeTab.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick SOS Trigger Button */}
            <button
              onClick={() => setSosTriggered(!sosTriggered)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold font-mono transition-all ${
                sosTriggered
                  ? "bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/30"
                  : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
              }`}
            >
              <ShieldAlert size={16} />
              <span>{sosTriggered ? "DISPATCH SIGNAL SENT" : "ONE-TAP SOS"}</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {/* ═══════════════════════════════════════════════════════════════
              TAB: OVERVIEW
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="rounded-3xl border border-[var(--powder-blue)] bg-gradient-to-r from-[var(--ice-blue-light)] via-[var(--ice-blue)] to-[var(--powder-blue-light)] p-6 sm:p-8 relative overflow-hidden shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-mono font-bold text-[var(--sapphire)] mb-3 border border-[var(--ice-blue)]">
                      <Bus className="h-3.5 w-3.5" />
                      Assigned Vehicle: BUS-01 (Toyota Coaster)
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)] font-display">
                      Shift in Progress: Morning Route R-101
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                      Corridor: Saddar Metro → Faizabad → Zero Point → Campus Terminal.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setActiveTab("scanner")}
                      className="btn btn-primary btn-sm flex items-center gap-2"
                    >
                      <Camera size={16} />
                      <span>Open Scanner</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("route")}
                      className="btn btn-secondary btn-sm bg-white"
                    >
                      Live Route Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid: Speedometer Gauge + Today's Schedule Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* OBD-II Speedometer Card */}
                <div className="lg:col-span-5 card p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
                    <Gauge className="h-4 w-4 text-[var(--sapphire)]" /> OBD-II Telemetry Speedometer
                  </span>

                  <div className="my-6 flex items-baseline justify-center">
                    <span className="text-6xl font-extrabold font-mono tracking-tighter text-[var(--navy)]">
                      {speed}
                    </span>
                    <span className="ml-2 text-xs font-mono text-[var(--text-muted)] font-bold">KM/H</span>
                  </div>

                  {/* Speed Bar */}
                  <div className="w-full bg-[var(--ice-blue)] rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        speed > 50 ? "bg-amber-500" : "bg-[var(--sapphire)]"
                      }`}
                      style={{ width: `${(speed / 80) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between w-full mt-2 text-[10px] font-mono text-[var(--text-muted)]">
                    <span>0 km/h</span>
                    <span>Campus Limit: 50 km/h</span>
                    <span>80 km/h</span>
                  </div>

                  <div className="mt-6 w-full pt-4 border-t border-[var(--ice-blue)] grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="rounded-xl bg-[var(--off-white)] p-2.5">
                      <span className="text-[10px] text-[var(--text-muted)]">Passenger Count</span>
                      <p className="font-bold text-[var(--navy)] text-sm">{boardedList.length} / 50</p>
                    </div>
                    <div className="rounded-xl bg-[var(--off-white)] p-2.5">
                      <span className="text-[10px] text-[var(--text-muted)]">Seats Remaining</span>
                      <p className="font-bold text-emerald-600 text-sm">{50 - boardedList.length} free</p>
                    </div>
                  </div>
                </div>

                {/* Upcoming Stops Timeline */}
                <div className="lg:col-span-7 card p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--navy)] font-display mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[var(--sapphire)]" /> Upcoming Stop Timetable
                    </h3>

                    <div className="space-y-4">
                      {routeStops.map((st, i) => (
                        <div
                          key={i}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                            st.completed
                              ? "border-[var(--ice-blue)] bg-[var(--off-white)] text-slate-400"
                              : i === 1
                              ? "border-[var(--sapphire)] bg-blue-50/30"
                              : "border-[var(--ice-blue)] bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                st.completed
                                  ? "bg-slate-200 text-slate-500"
                                  : i === 1
                                  ? "bg-[var(--sapphire)] text-white"
                                  : "bg-[var(--ice-blue)] text-[var(--navy)]"
                              }`}
                            >
                              {i + 1}
                            </div>
                            <div>
                              <span className={`font-semibold ${i === 1 ? "text-[var(--navy)] font-bold text-sm" : ""}`}>
                                {st.name}
                              </span>
                              <p className="text-[11px] text-[var(--text-secondary)]">{st.distance}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-[var(--sapphire)]">{st.eta}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      onClick={() => setActiveTab("scanner")}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Start Boarding Scanner
                    </button>
                    <button
                      onClick={() => setActiveTab("passengers")}
                      className="btn btn-secondary btn-sm flex-1"
                    >
                      View Passenger Roster
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: QR SCANNER (HUD Viewport)
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "scanner" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Driver Boarding HUD Scanner
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Bloom filter sub-millisecond cryptographic pass verification.
                </p>
              </div>

              <div className="card p-6">
                {/* Camera HUD Box */}
                <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--powder-blue)] bg-[var(--navy)] text-white">
                  {scannerScanning && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[var(--sapphire-light)] shadow-[0_0_20px_#1A6DD4] animate-bounce" />
                  )}

                  <div className="absolute top-4 left-4 h-6 w-6 border-t-2 border-l-2 border-[var(--ice-blue)]" />
                  <div className="absolute top-4 right-4 h-6 w-6 border-t-2 border-r-2 border-[var(--ice-blue)]" />
                  <div className="absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[var(--ice-blue)]" />
                  <div className="absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[var(--ice-blue)]" />

                  {scannerScanning ? (
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="h-10 w-10 text-[var(--ice-blue)] animate-spin" />
                      <span className="font-mono text-xs text-[var(--ice-blue)]">
                        Querying Bloom Filter Bit-Vector...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Camera className="h-10 w-10 text-[var(--powder-blue)]" />
                      <span className="text-xs font-mono">Camera viewport active • Align student pass</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 rounded-full bg-[var(--navy-light)] border border-white/20 px-3 py-1 font-mono text-[11px] text-[var(--ice-blue)]">
                    Boarded Students: {boardedList.length}
                  </div>
                </div>

                {/* Scan Result */}
                {scanResult && (
                  <div
                    className={`mt-4 rounded-xl border p-4 text-xs font-mono animate-fadeIn ${
                      scanResult.success
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-red-300 bg-red-50 text-red-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {scanResult.success ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      <span>{scanResult.name}</span>
                    </div>
                    <p className="mt-1">{scanResult.message}</p>
                    <span className="text-[10px] text-slate-500 block mt-1">Roll: {scanResult.roll}</span>
                  </div>
                )}

                {/* Simulation Buttons */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSimulateScan(true, "FA23-BCS-088", "Zainab Bibi")}
                    disabled={scannerScanning}
                    className="btn btn-primary btn-sm"
                  >
                    Simulate Valid Student Pass
                  </button>
                  <button
                    onClick={() => handleSimulateScan(false, "REVOKED-TOKEN", "Invalid Expired Pass")}
                    disabled={scannerScanning}
                    className="btn btn-danger btn-sm"
                  >
                    Simulate Expired Token
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: LIVE ROUTE MAP
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "route" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Turn-By-Turn Navigation & Route Map
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Live positioning along Route R-101 (Islamabad Highway Corridor).
                  </p>
                </div>
              </div>

              <div className="h-[520px] w-full rounded-2xl overflow-hidden border border-[var(--powder-blue)] shadow-md">
                <LiveMap buses={buses} routes={routes} stops={stops} />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: PASSENGER LIST
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "passengers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Today&apos;s Boarded Passengers Roster
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Verified through contactless Bloom Filter check-ins.
                  </p>
                </div>
                <span className="badge badge-success font-mono font-bold">
                  {boardedList.length} Commuters Onboard
                </span>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>Boarding Stop</th>
                      <th>Boarding Time</th>
                      <th>Pass Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boardedList.map((p) => (
                      <tr key={p.id}>
                        <td className="font-bold text-[var(--navy)]">{p.name}</td>
                        <td className="font-mono text-xs text-[var(--sapphire)] font-bold">{p.roll}</td>
                        <td>{p.stop}</td>
                        <td className="font-mono text-xs">{p.time}</td>
                        <td>
                          <span className="badge badge-success flex items-center gap-1 w-fit">
                            <CheckCircle2 size={12} />
                            <span>{p.status}</span>
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
              TAB: MY ATTENDANCE
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "attendance" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Driver Shift Attendance Log
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Personal shift duty records and route punctuality compliance.
                </p>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Shift</th>
                      <th>Route</th>
                      <th>Bus Number</th>
                      <th>Trip Punctuality</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { date: "Oct 06, 2026", shift: "Morning", route: "R-101", bus: "BUS-01", punctuality: "On Time (07:00 AM)", status: "Completed" },
                      { date: "Oct 05, 2026", shift: "Morning & Evening", route: "R-101", bus: "BUS-01", punctuality: "On Time", status: "Completed" },
                      { date: "Oct 02, 2026", shift: "Morning & Evening", route: "R-101", bus: "BUS-01", punctuality: "+3 min Traffic", status: "Completed" },
                      { date: "Oct 01, 2026", shift: "Morning", route: "R-101", bus: "BUS-01", punctuality: "On Time", status: "Completed" },
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-mono text-xs font-semibold">{row.date}</td>
                        <td>{row.shift}</td>
                        <td className="font-mono text-xs">{row.route}</td>
                        <td className="font-mono text-xs font-bold text-[var(--sapphire)]">{row.bus}</td>
                        <td className="text-xs text-emerald-700 font-semibold">{row.punctuality}</td>
                        <td>
                          <span className="badge badge-success">{row.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: EMERGENCY SOS
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "sos" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Emergency SOS Broadcast System
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Direct satellite link to Campus Emergency Response & Transport Control.
                </p>
              </div>

              <div className="card p-8 text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
                  <ShieldAlert className="h-12 w-12" />
                </div>

                <div>
                  <h3 className="text-xl font-bold text-[var(--navy)] font-display">
                    {sosTriggered ? "EMERGENCY BROADCAST ACTIVE" : "One-Tap Panic Trigger"}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md mx-auto">
                    Pressing this immediately broadcasts vehicle coordinates and halts non-essential telemetry to reserve bandwidth for dispatch.
                  </p>
                </div>

                <button
                  onClick={() => setSosTriggered(!sosTriggered)}
                  className={`w-full py-4 rounded-2xl font-mono text-sm font-bold tracking-wider transition-all ${
                    sosTriggered
                      ? "bg-red-600 text-white animate-pulse shadow-xl shadow-red-500/50"
                      : "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30"
                  }`}
                >
                  {sosTriggered ? "CANCEL SOS EMERGENCY BROADCAST" : "BROADCAST EMERGENCY SOS NOW"}
                </button>

                <div className="pt-4 border-t border-[var(--ice-blue)] grid grid-cols-2 gap-3 text-xs font-mono text-left">
                  <div className="rounded-xl bg-[var(--off-white)] p-3">
                    <span className="text-[var(--text-muted)]">Current Position:</span>
                    <p className="font-bold text-[var(--navy)]">33.6631° N, 73.0848° E</p>
                  </div>
                  <div className="rounded-xl bg-[var(--off-white)] p-3">
                    <span className="text-[var(--text-muted)]">Campus Security:</span>
                    <p className="font-bold text-[var(--sapphire)]">+92 51 111-222-333</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: DRIVER PROFILE
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "profile" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Driver Credentials & Profile
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Official university driver registration and authorized vehicle.
                </p>
              </div>

              <div className="card p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Driver Name
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Tariq Mehmood"
                      className="input text-xs bg-[var(--off-white)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      License Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value="ISB-DL-98211 (Heavy Commercial)"
                      className="input text-xs font-mono bg-[var(--off-white)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Assigned Vehicle
                    </label>
                    <input
                      type="text"
                      disabled
                      value="BUS-01 (Plate: ICT-101)"
                      className="input text-xs font-mono bg-[var(--off-white)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Assigned Route
                    </label>
                    <input
                      type="text"
                      disabled
                      value="R-101 (Islamabad Highway Corridor)"
                      className="input text-xs bg-[var(--off-white)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                    Emergency Contact Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value="+92 300 5544332"
                    className="input text-xs font-mono bg-[var(--off-white)]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              TAB: NOTIFICATIONS
              ═══════════════════════════════════════════════════════════════ */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Fleet Dispatch Alerts
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Live notices from the transport command room.
                </p>
              </div>

              <div className="space-y-3">
                <div className="card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <AlertTriangle size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--navy)]">Flyover Construction Alert</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Expect minor slow-down near Faizabad bridge. Maintain safe distance.
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">15 mins ago</span>
                  </div>
                </div>

                <div className="card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--ice-blue)] text-[var(--sapphire)] flex items-center justify-center shrink-0">
                    <Bell size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--navy)]">Shift Sign-Off Reminder</h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                      Remember to complete passenger log synchronization before parking at Campus Depot.
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
