"use client";

import React, { useState } from "react";
import { X, Check, AlertCircle, Sparkles, UserCheck } from "lucide-react";
import { reserveSeat } from "@/lib/api";

interface SeatReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  busNumber?: string;
  busId?: number;
  routeId?: number;
}

export default function SeatReservationModal({
  isOpen,
  onClose,
  busNumber = "BUS-01",
  busId = 1,
  routeId = 1,
}: SeatReservationModalProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  // Mock occupied seat numbers (e.g. seats 1-34 occupied)
  const occupiedSeats = new Set([
    1, 2, 3, 4, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 21, 22, 23, 24, 25, 28, 29, 30, 31, 32, 33, 34,
  ]);

  const handleConfirmReservation = async () => {
    if (!selectedSeat) return;
    setIsBooking(true);
    const res = await reserveSeat(busId, routeId, selectedSeat);
    setIsBooking(false);
    setBookingSuccess(res.message);
    setTimeout(() => {
      setBookingSuccess(null);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--powder-blue)] bg-white p-6 shadow-2xl animate-[modalSlideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ice-blue-light)] text-[var(--navy)] hover:bg-[var(--ice-blue)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sapphire)] text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--navy)] font-display">
              Reserve Seat • {busNumber}
            </h3>
            <p className="text-xs font-mono text-[var(--sapphire)] font-semibold">
              AVL Balanced Load Distribution Engine
            </p>
          </div>
        </div>

        {bookingSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center gap-2 text-center text-emerald-600">
            <UserCheck className="h-12 w-12 animate-bounce text-emerald-500" />
            <p className="text-base font-bold">{bookingSuccess}</p>
            <p className="text-xs text-[var(--text-secondary)]">Boarding QR token updated with assigned seat #{selectedSeat}.</p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            {/* Bus layout legend */}
            <div className="flex items-center justify-between rounded-xl bg-[var(--ice-blue-light)] p-3 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[var(--ice-blue)] border border-[var(--powder-blue)]" />
                <span className="text-[var(--text-secondary)]">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[var(--navy)]" />
                <span className="text-[var(--text-secondary)]">Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-[var(--sapphire)]" />
                <span className="text-[var(--text-secondary)]">Selected</span>
              </div>
            </div>

            {/* 40-Seat Bus Grid Layout */}
            <div className="rounded-2xl border border-[var(--powder-blue)] bg-[var(--off-white)] p-4">
              <div className="mb-2 text-center text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                ── FRONT / DRIVER CABIN ──
              </div>

              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 40 }, (_, i) => i + 1).map((seat) => {
                  const isOccupied = occupiedSeats.has(seat);
                  const isSelected = selectedSeat === seat;

                  return (
                    <button
                      key={seat}
                      disabled={isOccupied}
                      onClick={() => setSelectedSeat(seat)}
                      className={`flex h-10 items-center justify-center rounded-xl font-mono text-xs font-semibold transition-all ${
                        isOccupied
                          ? "bg-[var(--ice-blue-dark)] text-slate-500 cursor-not-allowed opacity-60"
                          : isSelected
                          ? "bg-[var(--sapphire)] text-white shadow-md shadow-blue-500/30 ring-2 ring-[var(--sapphire-light)] scale-105"
                          : "bg-white text-[var(--navy)] border border-[var(--powder-blue)] hover:border-[var(--sapphire)] hover:bg-[var(--ice-blue-light)]"
                      }`}
                    >
                      {seat}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-center text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                ── REAR EXIT ──
              </div>
            </div>

            {/* Selection info and confirm button */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-[var(--text-muted)]">Selected Seat:</span>
                <p className="font-mono text-sm font-bold text-[var(--navy)]">
                  {selectedSeat ? `Seat #${selectedSeat}` : "None selected"}
                </p>
              </div>

              <button
                disabled={!selectedSeat || isBooking}
                onClick={handleConfirmReservation}
                className="btn btn-primary btn-sm flex items-center gap-1.5 font-semibold"
              >
                <Check className="h-4 w-4" />
                <span>{isBooking ? "Allocating..." : "Confirm Seat"}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
