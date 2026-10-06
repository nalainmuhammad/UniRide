"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  Bus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SeatReservationModal from "@/components/SeatReservationModal";
import { fetchRoutes, fetchBuses, TransitRoute, BusTelemetry } from "@/lib/api";

interface ScheduleItem {
  id: number;
  routeCode: string;
  routeName: string;
  shift: "Morning" | "Afternoon" | "Evening";
  departureTime: string;
  arrivalTime: string;
  busNumber: string;
  busId: number;
  capacity: string;
  stops: { name: string; time: string }[];
}

const SCHEDULE_DATA: ScheduleItem[] = [
  {
    id: 1,
    routeCode: "R-101",
    routeName: "Islamabad Highway Corridor",
    shift: "Morning",
    departureTime: "07:00 AM",
    arrivalTime: "08:15 AM",
    busNumber: "BUS-01",
    busId: 1,
    capacity: "34 / 50 seats occupied",
    stops: [
      { name: "Saddar Metro Station", time: "07:00 AM" },
      { name: "Faizabad Interchange Terminal", time: "07:25 AM" },
      { name: "Zero Point Interchange", time: "07:45 AM" },
      { name: "FAST-NUCES Campus Terminal", time: "08:15 AM" },
    ],
  },
  {
    id: 2,
    routeCode: "R-101",
    routeName: "Islamabad Highway Corridor",
    shift: "Afternoon",
    departureTime: "01:30 PM",
    arrivalTime: "02:40 PM",
    busNumber: "BUS-01",
    busId: 1,
    capacity: "22 / 50 seats occupied",
    stops: [
      { name: "Saddar Metro Station", time: "01:30 PM" },
      { name: "Faizabad Interchange Terminal", time: "01:55 PM" },
      { name: "Zero Point Interchange", time: "02:15 PM" },
      { name: "FAST-NUCES Campus Terminal", time: "02:40 PM" },
    ],
  },
  {
    id: 3,
    routeCode: "R-101",
    routeName: "Islamabad Highway Corridor",
    shift: "Evening",
    departureTime: "05:15 PM",
    arrivalTime: "06:30 PM",
    busNumber: "BUS-01",
    busId: 1,
    capacity: "45 / 50 seats occupied",
    stops: [
      { name: "FAST-NUCES Campus Terminal", time: "05:15 PM" },
      { name: "Zero Point Interchange", time: "05:40 PM" },
      { name: "Faizabad Interchange Terminal", time: "06:05 PM" },
      { name: "Saddar Metro Station", time: "06:30 PM" },
    ],
  },
  {
    id: 4,
    routeCode: "R-102",
    routeName: "Peshawar Road Express",
    shift: "Morning",
    departureTime: "06:45 AM",
    arrivalTime: "08:00 AM",
    busNumber: "BUS-02",
    busId: 2,
    capacity: "48 / 50 seats occupied",
    stops: [
      { name: "Kohinoor Mills Terminal", time: "06:45 AM" },
      { name: "Chungi No 26 Interchange", time: "07:10 AM" },
      { name: "G-11 Signal Junction", time: "07:35 AM" },
      { name: "FAST-NUCES Campus Terminal", time: "08:00 AM" },
    ],
  },
  {
    id: 5,
    routeCode: "R-102",
    routeName: "Peshawar Road Express",
    shift: "Evening",
    departureTime: "05:15 PM",
    arrivalTime: "06:30 PM",
    busNumber: "BUS-02",
    busId: 2,
    capacity: "38 / 50 seats occupied",
    stops: [
      { name: "FAST-NUCES Campus Terminal", time: "05:15 PM" },
      { name: "G-11 Signal Junction", time: "05:40 PM" },
      { name: "Chungi No 26 Interchange", time: "06:05 PM" },
      { name: "Kohinoor Mills Terminal", time: "06:30 PM" },
    ],
  },
  {
    id: 6,
    routeCode: "R-103",
    routeName: "Rawal Road & Murree Link",
    shift: "Morning",
    departureTime: "07:15 AM",
    arrivalTime: "08:20 AM",
    busNumber: "BUS-03",
    busId: 3,
    capacity: "12 / 50 seats occupied",
    stops: [
      { name: "Chandni Chowk", time: "07:15 AM" },
      { name: "Rawal Dam Chowk", time: "07:40 AM" },
      { name: "Aabpara Market Terminal", time: "07:55 AM" },
      { name: "FAST-NUCES Campus Terminal", time: "08:20 AM" },
    ],
  },
  {
    id: 7,
    routeCode: "R-104",
    routeName: "DHA & Bahria University Shuttle",
    shift: "Morning",
    departureTime: "06:50 AM",
    arrivalTime: "08:10 AM",
    busNumber: "BUS-04",
    busId: 4,
    capacity: "40 / 50 seats occupied",
    stops: [
      { name: "Bahria Phase 7 Gateway", time: "06:50 AM" },
      { name: "DHA Phase 2 Gate 1", time: "07:15 AM" },
      { name: "Koral Chowk Overhead", time: "07:40 AM" },
      { name: "FAST-NUCES Campus Terminal", time: "08:10 AM" },
    ],
  },
];

export default function SchedulesPage() {
  const [selectedRoute, setSelectedRoute] = useState<string>("ALL");
  const [selectedShift, setSelectedShift] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedScheduleId, setExpandedScheduleId] = useState<number | null>(null);

  // Seat Reservation Modal State
  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [selectedBusForReservation, setSelectedBusForReservation] = useState<{
    number: string;
    id: number;
  }>({ number: "BUS-01", id: 1 });

  const filteredSchedules = SCHEDULE_DATA.filter((item) => {
    const matchesRoute =
      selectedRoute === "ALL" || item.routeCode === selectedRoute;
    const matchesShift =
      selectedShift === "ALL" || item.shift === selectedShift;
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.routeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.stops.some((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesRoute && matchesShift && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-white text-[var(--navy)]">
      <Navbar transparent={false} />

      <main className="flex-1 pt-20 pb-16">
        {/* Header Banner */}
        <section className="bg-gradient-to-b from-[var(--ice-blue-light)] via-[var(--ice-blue)]/30 to-white py-12 border-b border-[var(--ice-blue)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--powder-blue)] bg-white px-3 py-1 text-xs font-semibold text-[var(--sapphire)] mb-3">
                <Calendar className="h-3.5 w-3.5" />
                <span>Semester Fall 2026 Timetable</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--navy)] font-display tracking-tight">
                Campus Transit Schedules
              </h1>
              <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                Explore comprehensive shuttle departure times, intermediate stop sequences, and seat availability across all 8 university corridors.
              </p>
            </div>

            {/* Filter and Search Controls Bar */}
            <div className="mt-8 rounded-2xl border border-[var(--powder-blue)] bg-white p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Route Filter */}
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  Route Corridor
                </label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="input text-xs"
                >
                  <option value="ALL">All University Routes</option>
                  <option value="R-101">R-101 • Islamabad Highway</option>
                  <option value="R-102">R-102 • Peshawar Road</option>
                  <option value="R-103">R-103 • Rawal Road & Murree</option>
                  <option value="R-104">R-104 • DHA & Bahria</option>
                </select>
              </div>

              {/* Shift Filter */}
              <div className="md:col-span-3">
                <label className="block text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  Shift Timing
                </label>
                <select
                  value={selectedShift}
                  onChange={(e) => setSelectedShift(e.target.value)}
                  className="input text-xs"
                >
                  <option value="ALL">All Shifts</option>
                  <option value="Morning">Morning Shift (06:30 - 08:30)</option>
                  <option value="Afternoon">Afternoon Shift (01:00 - 03:00)</option>
                  <option value="Evening">Evening Return (05:00 - 07:00)</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="md:col-span-5">
                <label className="block text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider mb-1 font-mono">
                  Search Stop or Landmark
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[var(--sapphire)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. Faizabad, Saddar, Zero Point..."
                    className="input pl-10 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Schedules Content List */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono font-bold text-[var(--navy)]">
              Showing {filteredSchedules.length} Scheduled Departures
            </span>
            <span className="text-xs text-[var(--text-secondary)]">
              Punctuality Rate: <strong className="text-emerald-600 font-mono">94.6%</strong>
            </span>
          </div>

          <div className="space-y-4">
            {filteredSchedules.map((schedule) => {
              const isExpanded = expandedScheduleId === schedule.id;

              return (
                <div
                  key={schedule.id}
                  className="rounded-2xl border border-[var(--powder-blue)] bg-white shadow-xs overflow-hidden hover:border-[var(--sapphire)] transition-all"
                >
                  {/* Summary Bar */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--ice-blue)] flex items-center justify-center font-bold text-[var(--sapphire)] font-mono text-sm shrink-0">
                        {schedule.routeCode}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-[var(--navy)] font-display">
                            {schedule.routeName}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              schedule.shift === "Morning"
                                ? "bg-blue-100 text-blue-800"
                                : schedule.shift === "Afternoon"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {schedule.shift} Shift
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-2">
                          <span>Assigned Bus: <strong className="font-mono text-[var(--navy)]">{schedule.busNumber}</strong></span>
                          <span>•</span>
                          <span>{schedule.capacity}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-[var(--ice-blue)]">
                      <div className="text-left md:text-right">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--navy)] font-bold font-mono">
                          <Clock className="h-3.5 w-3.5 text-[var(--sapphire)]" />
                          <span>{schedule.departureTime} – {schedule.arrivalTime}</span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)]">Origin to Campus</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBusForReservation({
                              number: schedule.busNumber,
                              id: schedule.busId,
                            });
                            setReserveModalOpen(true);
                          }}
                          className="btn btn-primary btn-sm py-1.5 px-3 text-xs"
                        >
                          Book Seat
                        </button>

                        <button
                          onClick={() =>
                            setExpandedScheduleId(isExpanded ? null : schedule.id)
                          }
                          className="p-2 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--ice-blue-light)] transition-colors"
                          aria-label="Toggle stop details"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Stop Sequence Timeline */}
                  {isExpanded && (
                    <div className="border-t border-[var(--ice-blue)] bg-[var(--off-white)] p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--navy)] mb-4 font-mono">
                        Route Stops & Timetable Sequence
                      </h4>
                      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--powder-blue)]">
                        {schedule.stops.map((stop, idx) => (
                          <div key={idx} className="relative flex items-center justify-between text-xs">
                            <div className="absolute -left-[23px] h-3.5 w-3.5 rounded-full bg-white border-2 border-[var(--sapphire)]" />
                            <span className="font-semibold text-[var(--navy)]">{stop.name}</span>
                            <span className="font-mono text-[var(--sapphire)] font-bold bg-white px-2 py-0.5 rounded-md border border-[var(--ice-blue)]">
                              {stop.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Seat Reservation Modal */}
      <SeatReservationModal
        isOpen={reserveModalOpen}
        onClose={() => setReserveModalOpen(false)}
        busNumber={selectedBusForReservation.number}
        busId={selectedBusForReservation.id}
      />

      <Footer />
    </div>
  );
}
