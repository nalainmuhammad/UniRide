"use client";

import React, { useState, useEffect } from "react";
import { Bus, MapPin, Gauge, Users, Clock, Sparkles } from "lucide-react";

export default function HeroBusMotion() {
  const [activeStop, setActiveStop] = useState(1);
  const [busProgress, setBusProgress] = useState(38); // percentage along the path

  const stops = [
    { name: "Saddar Metro", eta: "Departed", passed: true, pos: "12%" },
    { name: "Faizabad Interchange", eta: "Arriving 3 min", active: true, pos: "42%" },
    { name: "Zero Point", eta: "11 min", pos: "72%" },
    { name: "Campus Terminal", eta: "24 min", pos: "92%" },
  ];

  // Subtle cyclic motion along route for live realism
  useEffect(() => {
    const interval = setInterval(() => {
      setBusProgress((p) => {
        const next = p + 0.3;
        if (next > 88) return 18;
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-3xl border border-[var(--powder-blue)] bg-white p-6 sm:p-8 shadow-xl overflow-hidden group">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-[var(--sapphire)]/15 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-[var(--ice-blue)]/50 to-transparent blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--ice-blue)] gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--sapphire)] text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <Bus className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[var(--navy)] font-display">
                Shuttle BUS-01 • Corridor Express
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                LIVE GPS
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">Route R-101 • Islamabad Highway Corridor</p>
          </div>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="rounded-xl bg-[var(--off-white)] border border-[var(--ice-blue)] px-3 py-1.5 flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[var(--sapphire)]" />
            <span className="font-bold text-[var(--navy)]">44.8 km/h</span>
          </div>
          <div className="rounded-xl bg-[var(--off-white)] border border-[var(--ice-blue)] px-3 py-1.5 flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--sapphire)]" />
            <span className="font-bold text-[var(--navy)]">34 / 50 seats</span>
          </div>
        </div>
      </div>

      {/* Interactive Transit Highway SVG Visualization */}
      <div className="relative z-10 py-8 px-2 sm:px-6">
        {/* Highway Track Container */}
        <div className="relative h-28 flex items-center">
          {/* Base Road Bar */}
          <div className="absolute left-0 right-0 h-4 rounded-full bg-[var(--ice-blue-light)] border border-[var(--powder-blue)] overflow-hidden shadow-inner">
            {/* Center Dashed Highway Line */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: "linear-gradient(90deg, #0F52BA 50%, transparent 50%)",
                backgroundSize: "20px 4px",
                animation: "shimmer 2s linear infinite",
              }}
            />
            {/* Active Completed Route Fill */}
            <div
              className="h-full bg-gradient-to-r from-[var(--sapphire-dark)] to-[var(--sapphire)] transition-all duration-300 ease-out"
              style={{ width: `${busProgress}%` }}
            />
          </div>

          {/* Gliding Bus Icon with Ping Glow */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-linear pointer-events-none"
            style={{ left: `${busProgress}%` }}
          >
            {/* Outer Ripple */}
            <div className="absolute -inset-2 rounded-2xl bg-[var(--sapphire)] opacity-30 animate-ping" />
            {/* Bus Badge */}
            <div className="relative flex items-center gap-1.5 rounded-2xl bg-[var(--navy)] text-white px-3 py-1.5 shadow-xl border-2 border-white">
              <Bus className="h-4 w-4 text-[var(--ice-blue)]" />
              <span className="text-[11px] font-mono font-bold whitespace-nowrap">BUS-01</span>
            </div>
            {/* Downward Pointer Arrow */}
            <div className="w-2 h-2 bg-[var(--navy)] rotate-45 mx-auto -mt-1" />
          </div>

          {/* Route Stop Nodes */}
          {stops.map((stop, index) => {
            const isPassed = stop.passed;
            const isActive = stop.active;

            return (
              <div
                key={stop.name}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center group/stop cursor-pointer"
                style={{ left: stop.pos }}
                onClick={() => setActiveStop(index)}
              >
                {/* Node Circle */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 h-8 bg-[var(--sapphire)] text-white shadow-lg shadow-blue-500/40 ring-4 ring-[var(--ice-blue)] scale-110"
                      : isPassed
                      ? "w-6 h-6 bg-[var(--ice-blue-dark)] text-[var(--navy)]"
                      : "w-6 h-6 bg-white border-2 border-[var(--powder-blue)] hover:border-[var(--sapphire)]"
                  }`}
                >
                  {isActive ? (
                    <MapPin className="h-4 w-4 animate-bounce" />
                  ) : (
                    <span className="text-[9px] font-mono font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Stop Label Card */}
                <div className="absolute top-10 flex flex-col items-center text-center whitespace-nowrap transition-transform duration-200 group-hover/stop:-translate-y-1">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isActive ? "text-[var(--sapphire)]" : "text-[var(--navy)]"
                    }`}
                  >
                    {stop.name}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${
                      isActive
                        ? "text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 mt-0.5"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    {stop.eta}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Live Status Bar */}
      <div className="relative z-10 mt-10 pt-4 border-t border-[var(--ice-blue)] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[var(--text-secondary)] gap-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-[var(--sapphire)]" />
          <span>Next Stop: <strong>Faizabad Interchange</strong> (Arrival window: 07:25 AM – 07:27 AM)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-mono text-[var(--sapphire)] font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AVL Load-Balanced • Punctuality 94.6%</span>
        </div>
      </div>
    </div>
  );
}
