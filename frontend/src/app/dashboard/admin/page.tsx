"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Bus,
  MapPin,
  Calendar,
  Sparkles,
  ClipboardCheck,
  Navigation,
  MessageSquare,
  Bell,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Cpu,
  Network,
  GitBranch,
  ShieldCheck,
  Plus,
  Search,
  Download,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Menu,
  X,
  LogOut,
  Send,
  Camera,
  RefreshCw,
} from "lucide-react";

import DigitalTwinPanel from "@/components/DigitalTwinPanel";
import ProtocolDissectorPanel from "@/components/ProtocolDissectorPanel";
import {
  fetchBuses,
  fetchRoutes,
  fetchStops,
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
        <span>Loading Fleet Geospatial Map...</span>
      </div>
    </div>
  ),
});

type AdminSection =
  | "overview"
  | "students"
  | "drivers"
  | "buses"
  | "routes"
  | "schedules"
  | "allocation"
  | "attendance"
  | "tracking"
  | "feedback"
  | "notifications"
  | "reports"
  | "analytics";

export default function AdminDashboardPage() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsSubTab, setAnalyticsSubTab] = useState<
    "forecast" | "bottlenecks" | "digitalTwin" | "dissector" | "causal"
  >("forecast");

  // Telemetry data
  const [buses, setBuses] = useState<BusTelemetry[]>([]);
  const [routes, setRoutes] = useState<TransitRoute[]>([]);
  const [stops, setStops] = useState<TransitStop[]>([]);

  // CRUD Tables Data State
  const [students, setStudents] = useState([
    { id: 1, name: "Bilal Khan", roll: "FA23-BCS-001", route: "R-101", stop: "Faizabad", status: "Active" },
    { id: 2, name: "Ayesha Malik", roll: "FA23-BCS-042", route: "R-102", stop: "G-11 Signal", status: "Active" },
    { id: 3, name: "Hamza Tariq", roll: "SP22-BSE-019", route: "R-101", stop: "Saddar", status: "Active" },
    { id: 4, name: "Zainab Bibi", roll: "FA24-BAI-088", route: "R-103", stop: "Chandni Chowk", status: "Active" },
    { id: 5, name: "Usman Ali", roll: "FA21-BCS-105", route: "R-104", stop: "Koral Chowk", status: "Suspended" },
  ]);

  const [driversList, setDriversList] = useState([
    { id: 1, name: "Tariq Mehmood", license: "ISB-DL-98211", bus: "BUS-01", route: "R-101", phone: "+92 300 5544332", status: "On Duty" },
    { id: 2, name: "Muhammad Aslam", license: "RWP-DL-77412", bus: "BUS-02", route: "R-102", phone: "+92 312 9988112", status: "On Duty" },
    { id: 3, name: "Rashid Minhas", license: "ISB-DL-33419", bus: "BUS-03", route: "R-103", phone: "+92 333 4455667", status: "Off Duty" },
  ]);

  // CRUD Modal State
  const [crudModalOpen, setCrudModalOpen] = useState(false);
  const [crudType, setCrudType] = useState<"student" | "driver" | "bus" | "route">("student");
  const [crudForm, setCrudForm] = useState({ name: "", code: "", field3: "", field4: "" });

  // Notifications Compose State
  const [notifTarget, setNotifTarget] = useState("ALL");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSent, setNotifSent] = useState(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

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
  }, []);

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (crudType === "student") {
      setStudents([
        ...students,
        {
          id: Date.now(),
          name: crudForm.name,
          roll: crudForm.code,
          route: crudForm.field3 || "R-101",
          stop: crudForm.field4 || "Faizabad",
          status: "Active",
        },
      ]);
    } else if (crudType === "driver") {
      setDriversList([
        ...driversList,
        {
          id: Date.now(),
          name: crudForm.name,
          license: crudForm.code,
          bus: crudForm.field3 || "BUS-01",
          route: "R-101",
          phone: crudForm.field4 || "+92 300 0000000",
          status: "On Duty",
        },
      ]);
    }
    setCrudModalOpen(false);
    setCrudForm({ name: "", code: "", field3: "", field4: "" });
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setNotifSent(true);
    setTimeout(() => {
      setNotifSent(false);
      setNotifTitle("");
      setNotifMessage("");
    }, 2000);
  };

  const exportCsv = (filename: string, rows: object[]) => {
    if (!rows.length) return;
    const separator = ",";
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      "\n" +
      rows
        .map((row: any) =>
          keys
            .map((k) => {
              let cell = row[k] === null || row[k] === undefined ? "" : row[k];
              cell = cell instanceof Date ? cell.toLocaleString() : cell.toString();
              return `"${cell.replace(/"/g, '""')}"`;
            })
            .join(separator)
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex bg-[var(--off-white)] text-[var(--navy)]">
      {/* ═══════════════════════════════════════════════════════════════
          ADMIN SIDEBAR (Deep Navy with Sapphire Accents)
          ═══════════════════════════════════════════════════════════════ */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--navy)] text-white flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
          {/* Logo Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10 sticky top-0 bg-[var(--navy)] z-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--sapphire)] flex items-center justify-center text-white shadow-md">
                <Bus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-lg font-bold font-display text-white">UniRide</span>
                <span className="block text-[10px] font-mono text-emerald-400">ADMIN FLEET OPS</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--powder-blue-dark)]">
              Operations & Management
            </div>

            {[
              { id: "overview" as AdminSection, label: "Overview", icon: LayoutDashboard },
              { id: "students" as AdminSection, label: "Student Registry", icon: Users },
              { id: "drivers" as AdminSection, label: "Driver Management", icon: UserCheck },
              { id: "buses" as AdminSection, label: "Fleet Shuttles", icon: Bus },
              { id: "routes" as AdminSection, label: "Route Management", icon: MapPin },
              { id: "schedules" as AdminSection, label: "Transit Schedules", icon: Calendar },
              { id: "allocation" as AdminSection, label: "Smart Allocation (AVL)", icon: Sparkles },
              { id: "attendance" as AdminSection, label: "Attendance & QR", icon: ClipboardCheck },
              { id: "tracking" as AdminSection, label: "Live Fleet Map", icon: Navigation },
              { id: "feedback" as AdminSection, label: "Feedback Sentiment", icon: MessageSquare },
              { id: "notifications" as AdminSection, label: "Broadcast Dispatch", icon: Bell },
              { id: "reports" as AdminSection, label: "Reports Generator", icon: FileText },
              { id: "analytics" as AdminSection, label: "IDS Data Science Suite", icon: BarChart3 },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[var(--sapphire)] text-white shadow-md font-bold"
                      : "text-[var(--powder-blue)] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer Bar */}
        <div className="p-4 border-t border-white/10 bg-[var(--navy)]">
          <div className="flex items-center justify-between text-xs text-[var(--powder-blue)] mb-2">
            <span>Admin: Dr. Haris</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
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

      {/* Main Container */}
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
              {activeSection.replace("-", " ")}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              50 SHUTTLES ONLINE
            </span>
          </div>
        </header>

        {/* Section View */}
        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {/* ═══════════════════════════════════════════════════════════════
              SECTION: OVERVIEW
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              {/* Executive KPI Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-[var(--sapphire)]" /> Total Registered Commuters
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-[var(--navy)]">2,148</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">+8.4% vs last semester</span>
                </div>

                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Bus className="h-4 w-4 text-[var(--sapphire)]" /> Active Fleet Deployment
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-[var(--sapphire)]">42 / 50</p>
                  <span className="text-[11px] text-[var(--text-secondary)]">8 on standby / maintenance</span>
                </div>

                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <ClipboardCheck className="h-4 w-4 text-[var(--sapphire)]" /> Today&apos;s Boarding Rate
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-emerald-600">94.6%</p>
                  <span className="text-[11px] text-emerald-600 font-semibold">1,842 verified check-ins</span>
                </div>

                <div className="card p-5">
                  <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[var(--sapphire)]" /> Satisfaction Score
                  </span>
                  <p className="mt-2 text-2xl font-extrabold font-mono text-[var(--navy)]">4.6 / 5.0</p>
                  <span className="text-[11px] text-[var(--sapphire)] font-semibold">NLP compound: +0.72</span>
                </div>
              </div>

              {/* Live Fleet Mini-Map Preview */}
              <div className="card p-6">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--ice-blue)]">
                  <div>
                    <h3 className="text-base font-bold font-display text-[var(--navy)]">
                      Live Regional Fleet Movement
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Real-time positions across Islamabad Highway, Peshawar Road, and Rawal corridors.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSection("tracking")}
                    className="btn btn-primary btn-sm"
                  >
                    Fullscreen Map
                  </button>
                </div>

                <div className="mt-4 h-[380px] w-full rounded-2xl overflow-hidden border border-[var(--powder-blue)]">
                  <LiveMap buses={buses} routes={routes} stops={stops} />
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: STUDENT REGISTRY (CRUD)
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "students" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Student Commuter Registry
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Manage student pass assignments, assigned corridors, and account authorizations.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportCsv("students_registry", students)}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setCrudType("student");
                      setCrudModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Student</span>
                  </button>
                </div>
              </div>

              {/* Table Card */}
              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Roll Number</th>
                      <th>Assigned Route</th>
                      <th>Pickup Stop</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((st) => (
                      <tr key={st.id}>
                        <td className="font-bold text-[var(--navy)]">{st.name}</td>
                        <td className="font-mono text-xs text-[var(--sapphire)] font-bold">{st.roll}</td>
                        <td>{st.route}</td>
                        <td>{st.stop}</td>
                        <td>
                          <span
                            className={`badge ${
                              st.status === "Active" ? "badge-success" : "badge-danger"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => setStudents(students.filter((s) => s.id !== st.id))}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete student"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: DRIVER MANAGEMENT (CRUD)
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "drivers" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Driver Fleet Roster
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Driver license numbers, assigned vehicles, and contact information.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => exportCsv("drivers_roster", driversList)}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                  >
                    <Download size={14} />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      setCrudType("driver");
                      setCrudModalOpen(true);
                    }}
                    className="btn btn-primary btn-sm flex items-center gap-1.5"
                  >
                    <Plus size={14} />
                    <span>Add Driver</span>
                  </button>
                </div>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Driver Name</th>
                      <th>License Number</th>
                      <th>Assigned Bus</th>
                      <th>Assigned Route</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversList.map((dr) => (
                      <tr key={dr.id}>
                        <td className="font-bold text-[var(--navy)]">{dr.name}</td>
                        <td className="font-mono text-xs">{dr.license}</td>
                        <td className="font-mono text-xs font-bold text-[var(--sapphire)]">{dr.bus}</td>
                        <td>{dr.route}</td>
                        <td className="font-mono text-xs">{dr.phone}</td>
                        <td>
                          <span
                            className={`badge ${
                              dr.status === "On Duty" ? "badge-success" : "badge-neutral"
                            }`}
                          >
                            {dr.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              setDriversList(driversList.filter((d) => d.id !== dr.id))
                            }
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            aria-label="Delete driver"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: FLEET SHUTTLES (CRUD / STATUS)
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "buses" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Fleet Shuttle Vehicles
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Vehicle capacity, real-time occupancy, telemetry state, and registration plates.
                  </p>
                </div>
                <button
                  onClick={() => exportCsv("bus_fleet", buses)}
                  className="btn btn-secondary btn-sm flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Bus ID</th>
                      <th>Plate</th>
                      <th>Model</th>
                      <th>Occupancy</th>
                      <th>Live Speed</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.map((b) => (
                      <tr key={b.id}>
                        <td className="font-mono text-xs font-bold text-[var(--navy)]">
                          {b.bus_number}
                        </td>
                        <td className="font-mono text-xs">{b.registration_plate}</td>
                        <td>{b.model_name}</td>
                        <td className="font-mono text-xs">
                          {b.current_occupancy} / {b.capacity} seats ({b.available_seats} free)
                        </td>
                        <td className="font-mono text-xs font-bold text-[var(--sapphire)]">
                          {b.current_speed} km/h
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              b.status === "EN_ROUTE"
                                ? "badge-success"
                                : b.status === "DELAYED"
                                ? "badge-warning"
                                : "badge-neutral"
                            }`}
                          >
                            {b.status}
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
              SECTION: ROUTE MANAGEMENT
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "routes" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Transit Route Corridors
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Topological graph edges, distance meters, and intermediate stops.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map((rt) => (
                  <div key={rt.id} className="card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold bg-[var(--ice-blue)] text-[var(--sapphire)] px-2.5 py-1 rounded-lg">
                        {rt.code}
                      </span>
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        {rt.total_distance_km} km • {rt.estimated_duration_min} min
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[var(--navy)] font-display">
                      {rt.name}
                    </h3>

                    <div className="text-xs text-[var(--text-secondary)] space-y-1">
                      <p>Origin: <strong>{rt.origin}</strong></p>
                      <p>Destination: <strong>{rt.destination}</strong></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: SCHEDULES
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "schedules" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Schedule Management
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Configure departure times and shift schedules.
                  </p>
                </div>
                <Link href="/schedules" className="btn btn-secondary btn-sm">
                  View Public Timetable Page
                </Link>
              </div>

              <div className="card p-6 text-center">
                <Calendar className="h-12 w-12 text-[var(--sapphire)] mx-auto mb-3" />
                <h3 className="text-base font-bold text-[var(--navy)] font-display">
                  Active Timetable Synchronized
                </h3>
                <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mt-1">
                  8 Corridors, 3 daily shifts (Morning, Afternoon, Evening) with live GPS adherence metrics.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: SMART ALLOCATION (AVL TREE)
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "allocation" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Smart Allocation Engine (AVL Tree)
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  C# .NET 10 microservice self-balancing load distribution across campus buses.
                </p>
              </div>

              <div className="card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                  <span className="font-mono text-xs font-bold text-[var(--navy)] flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[var(--sapphire)]" /> AVL Tree Balance Factor: 0 (Optimal)
                  </span>
                  <span className="badge badge-success">Load Balanced</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {buses.map((bus) => (
                    <div key={bus.id} className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-4">
                      <div className="flex items-center justify-between font-mono text-xs font-bold">
                        <span className="text-[var(--navy)]">{bus.bus_number}</span>
                        <span className="text-[var(--sapphire)]">{bus.current_occupancy}/50</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-[var(--ice-blue)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--sapphire)] rounded-full"
                          style={{ width: `${(bus.current_occupancy / 50) * 100}%` }}
                        />
                      </div>
                      <p className="mt-2 text-[10px] text-[var(--text-muted)] font-mono">
                        Load Factor: {((bus.current_occupancy / 50) * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: ATTENDANCE & QR
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "attendance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Boarding Attendance HUD
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Bloom filter sub-millisecond membership verification check-ins.
                  </p>
                </div>
                <span className="badge badge-success">Live Bloom Filter Synchronized</span>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Student</th>
                      <th>Roll Number</th>
                      <th>Bus ID</th>
                      <th>Scan Method</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { time: "07:26 AM", name: "Bilal Khan", roll: "FA23-BCS-001", bus: "BUS-01", method: "TOTP Dynamic QR", result: "Verified (140 μs)" },
                      { time: "07:24 AM", name: "Ayesha Malik", roll: "FA23-BCS-042", bus: "BUS-02", method: "TOTP Dynamic QR", result: "Verified (110 μs)" },
                      { time: "07:21 AM", name: "Hamza Tariq", roll: "SP22-BSE-019", bus: "BUS-01", method: "TOTP Dynamic QR", result: "Verified (95 μs)" },
                    ].map((row, idx) => (
                      <tr key={idx}>
                        <td className="font-mono text-xs">{row.time}</td>
                        <td className="font-bold text-[var(--navy)]">{row.name}</td>
                        <td className="font-mono text-xs">{row.roll}</td>
                        <td className="font-mono text-xs font-bold text-[var(--sapphire)]">{row.bus}</td>
                        <td className="text-xs">{row.method}</td>
                        <td className="text-xs font-mono font-bold text-emerald-600">{row.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: LIVE TRACKING
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "tracking" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                    Live Regional Fleet Map
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    WebSocket telemetry for all active campus buses.
                  </p>
                </div>
              </div>

              <div className="h-[520px] w-full rounded-2xl overflow-hidden border border-[var(--powder-blue)] shadow-md">
                <LiveMap buses={buses} routes={routes} stops={stops} />
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: FEEDBACK VIEWER
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "feedback" && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Commuter Feedback & NLP Sentiment Viewer
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  VADER NLP sentiment classification on student ratings.
                </p>
              </div>

              <div className="card overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rating</th>
                      <th>Category</th>
                      <th>Student Comment</th>
                      <th>NLP Sentiment</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { rating: "5/5", cat: "Punctuality", comment: "Bus arrived exactly at 7:25 AM at Faizabad. Very clean interior.", sentiment: "POSITIVE", score: "+0.84" },
                      { rating: "4/5", cat: "Driving Safety", comment: "Safe driving during peak morning rush hour on Islamabad Highway.", sentiment: "POSITIVE", score: "+0.62" },
                      { rating: "2/5", cat: "Overcrowding", comment: "Too many students standing in aisle after Zero Point stop.", sentiment: "NEGATIVE", score: "-0.54" },
                    ].map((f, i) => (
                      <tr key={i}>
                        <td className="font-mono font-bold text-amber-500">{f.rating}</td>
                        <td className="font-semibold text-xs">{f.cat}</td>
                        <td className="text-xs">{f.comment}</td>
                        <td>
                          <span className={`badge ${f.sentiment === "POSITIVE" ? "badge-success" : "badge-danger"}`}>
                            {f.sentiment}
                          </span>
                        </td>
                        <td className="font-mono text-xs font-bold">{f.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: NOTIFICATIONS DISPATCH
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "notifications" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Campus Broadcast Notification Dispatcher
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Send high-priority alerts to all students, specific route corridors, or drivers.
                </p>
              </div>

              {notifSent && (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>Broadcast dispatched to target commuter channel!</span>
                </div>
              )}

              <div className="card p-6">
                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Target Audience
                    </label>
                    <select
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                      className="input text-xs"
                    >
                      <option value="ALL">All Commuters & Drivers</option>
                      <option value="R-101">Route R-101 (Islamabad Highway)</option>
                      <option value="R-102">Route R-102 (Peshawar Road)</option>
                      <option value="DRIVERS">All Active Drivers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Notification Title
                    </label>
                    <input
                      type="text"
                      required
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="e.g. Weather Advisory / Departure Timing Update"
                      className="input text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                      Message Body
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="Enter broadcast message text..."
                      className="input text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-full py-2.5 flex items-center justify-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    <span>Send Broadcast Alert</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: REPORTS GENERATOR
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "reports" && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  Executive Reports Generator
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Export semester attendance audits, fleet fuel consumption, and route telemetry logs.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-6 space-y-3">
                  <FileText className="h-8 w-8 text-[var(--sapphire)]" />
                  <h3 className="text-base font-bold text-[var(--navy)] font-display">
                    Student Attendance Audit
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Complete monthly check-in history with Bloom Filter microsecond timestamps.
                  </p>
                  <button
                    onClick={() => exportCsv("attendance_audit_oct_2026", students)}
                    className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download CSV Audit</span>
                  </button>
                </div>

                <div className="card p-6 space-y-3">
                  <FileText className="h-8 w-8 text-[var(--sapphire)]" />
                  <h3 className="text-base font-bold text-[var(--navy)] font-display">
                    Fleet Telemetry & Mileage
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Daily distance kilometers, average speeds, and estimated fuel expenditures.
                  </p>
                  <button
                    onClick={() => exportCsv("fleet_telemetry_report", buses)}
                    className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    <span>Download CSV Report</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════
              SECTION: ANALYTICS (IDS DATA SCIENCE SUITE)
              ═══════════════════════════════════════════════════════════════ */}
          {activeSection === "analytics" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[var(--navy)]">
                  IDS Data Science & Telemetry Suite
                </h2>
                <p className="text-xs text-[var(--text-secondary)]">
                  Machine learning demand forecasting, DBSCAN bottleneck discovery, and SimPy Digital Twin.
                </p>
              </div>

              {/* Subtabs for Analytics */}
              <div className="flex flex-wrap gap-2 border-b border-[var(--ice-blue)] pb-3">
                {[
                  { id: "forecast" as const, label: "Random Forest Demand", icon: TrendingUp },
                  { id: "bottlenecks" as const, label: "DBSCAN Bottlenecks", icon: AlertTriangle },
                  { id: "digitalTwin" as const, label: "SimPy Digital Twin", icon: Cpu },
                  { id: "dissector" as const, label: "RFC 6455 Dissector", icon: Network },
                  { id: "causal" as const, label: "Bayesian Causal", icon: GitBranch },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = analyticsSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setAnalyticsSubTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? "bg-[var(--sapphire)] text-white shadow-sm font-bold"
                          : "bg-white text-[var(--navy)] border border-[var(--powder-blue)] hover:bg-[var(--ice-blue-light)]"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Digital Twin Panel */}
              {analyticsSubTab === "digitalTwin" && <DigitalTwinPanel />}

              {/* Protocol Dissector Panel */}
              {analyticsSubTab === "dissector" && <ProtocolDissectorPanel />}

              {/* Demand Forecasting Panel */}
              {analyticsSubTab === "forecast" && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                    <span className="font-bold text-sm text-[var(--navy)] font-display flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[var(--sapphire)]" /> Next-Day Demand Forecast (Random Forest Regressor)
                    </span>
                    <span className="badge badge-success">R² = 0.94</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-4">
                      <span className="text-[var(--text-muted)]">Predicted Boardings:</span>
                      <p className="text-2xl font-bold text-[var(--navy)] mt-1">2,240</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">+6.2% Exam Surge</span>
                    </div>

                    <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-4">
                      <span className="text-[var(--text-muted)]">Recommended Buses:</span>
                      <p className="text-2xl font-bold text-[var(--sapphire)] mt-1">45 Buses</p>
                      <span className="text-[10px] text-[var(--text-secondary)]">3 Reserve Shuttles</span>
                    </div>

                    <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-4">
                      <span className="text-[var(--text-muted)]">Overcrowding Risk:</span>
                      <p className="text-2xl font-bold text-emerald-600 mt-1">LOW (8%)</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">Corridor capacity sufficient</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottlenecks Panel */}
              {analyticsSubTab === "bottlenecks" && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                    <span className="font-bold text-sm text-[var(--navy)] font-display flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500" /> Persistent Congestion Bottlenecks (DBSCAN ε=0.005)
                    </span>
                    <span className="badge badge-warning">2 Active Hotspots</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-amber-900">Faizabad Interchange Flyover Junction</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">Average speed dropped to 14 km/h • Estimated delay: 8.5 min</p>
                      </div>
                      <span className="badge badge-warning">High Congestion</span>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-amber-900">Chungi No 26 Signal Bottleneck</p>
                        <p className="text-[11px] text-amber-800 mt-0.5">Average speed dropped to 19 km/h • Estimated delay: 4.2 min</p>
                      </div>
                      <span className="badge badge-warning">Moderate Delay</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bayesian Causal Inference Panel */}
              {analyticsSubTab === "causal" && (
                <div className="card p-6 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--ice-blue)]">
                    <span className="font-bold text-sm text-[var(--navy)] font-display flex items-center gap-2">
                      <GitBranch className="h-4 w-4 text-[var(--sapphire)]" /> Bayesian Causal Network & Do-Calculus
                    </span>
                    <span className="badge badge-info">Do(Rain=True)</span>
                  </div>

                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Counterfactual analysis on shuttle delays. Intervening on weather confirms monsoon rains cause an average 38.4% drop in terminal turnaround times.
                  </p>

                  <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-4 font-mono text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">ATE (Average Treatment Effect of Rain):</span>
                      <span className="font-bold text-red-600">+11.4 min Delay</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Causal Confidence Interval (95%):</span>
                      <span className="font-bold text-[var(--navy)]">[9.8 min, 13.1 min]</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* CRUD Create/Edit Modal */}
      {crudModalOpen && (
        <div className="modal-overlay" onClick={() => setCrudModalOpen(false)}>
          <div
            className="modal-content max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--navy)] font-display mb-1">
              Add New {crudType === "student" ? "Student" : "Driver"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Enter official credentials for university transport authorization.
            </p>

            <form onSubmit={handleCreateRecord} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={crudForm.name}
                  onChange={(e) => setCrudForm({ ...crudForm, name: e.target.value })}
                  placeholder="e.g. Usman Ali"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  {crudType === "student" ? "Roll Number" : "License Number"}
                </label>
                <input
                  type="text"
                  required
                  value={crudForm.code}
                  onChange={(e) => setCrudForm({ ...crudForm, code: e.target.value })}
                  placeholder={crudType === "student" ? "FA23-BCS-099" : "ISB-DL-11223"}
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  {crudType === "student" ? "Assigned Route" : "Assigned Bus"}
                </label>
                <input
                  type="text"
                  value={crudForm.field3}
                  onChange={(e) => setCrudForm({ ...crudForm, field3: e.target.value })}
                  placeholder={crudType === "student" ? "R-101" : "BUS-01"}
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  {crudType === "student" ? "Pickup Stop" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={crudForm.field4}
                  onChange={(e) => setCrudForm({ ...crudForm, field4: e.target.value })}
                  placeholder={crudType === "student" ? "Faizabad" : "+92 300 1234567"}
                  className="input text-xs"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setCrudModalOpen(false)}
                  className="btn btn-secondary btn-sm flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm flex-1">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
