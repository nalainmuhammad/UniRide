"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, Clock, ShieldCheck, QrCode } from "lucide-react";

interface StudentPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  rollNumber?: string;
  routeCode?: string;
}

export default function StudentPassModal({
  isOpen,
  onClose,
  studentName = "Bilal Khan",
  rollNumber = "FA23-BCS-001",
  routeCode = "R-101 (Islamabad Highway)",
}: StudentPassModalProps) {
  const [totpSeconds, setTotpSeconds] = useState(30);
  const [tokenHash, setTokenHash] = useState("UNIRIDE-98FA2-2026");

  // Rotating TOTP dynamic token for anti-screenshot fraud prevention
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--powder-blue)] bg-white p-6 shadow-2xl animate-[modalSlideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle accent gradient behind QR */}
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-[var(--ice-blue)] opacity-60 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-36 w-36 rounded-full bg-[var(--powder-blue-light)] opacity-40 blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ice-blue-light)] text-[var(--navy)] hover:bg-[var(--ice-blue)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Pass Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sapphire)] text-white shadow-md">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--navy)] font-display">
              Smart Transit Pass
            </h3>
            <p className="text-[11px] font-mono text-[var(--sapphire)] font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Dynamic TOTP Anti-Fraud
            </p>
          </div>
        </div>

        {/* Pass Card Container */}
        <div className="mt-5 rounded-2xl border border-[var(--powder-blue)] bg-[var(--off-white)] p-4 text-center">
          {/* Simulated QR Code matrix */}
          <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl bg-white p-3 shadow-inner border border-[var(--ice-blue)]">
            <div className="relative flex h-full w-full flex-col items-center justify-center rounded-xl bg-gradient-to-br from-[var(--navy)] to-[var(--sapphire-dark)] p-3 text-white">
              <QrCode className="h-28 w-28 text-white stroke-[1.2]" />
              <div className="mt-1 flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[var(--ice-blue)]">
                <span>{tokenHash}</span>
              </div>
            </div>
          </div>

          {/* Dynamic TOTP Expiry bar */}
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-[var(--text-secondary)]">
            <span className="flex items-center gap-1 text-[11px]">
              <Clock className="h-3.5 w-3.5 text-[var(--sapphire)] animate-spin-slow" />
              Auto-refreshes in
            </span>
            <span className="font-bold text-[var(--sapphire)] font-mono">{totpSeconds}s</span>
          </div>

          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ice-blue)]">
            <div
              className="h-full bg-[var(--sapphire)] transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${(totpSeconds / 30) * 100}%` }}
            />
          </div>
        </div>

        {/* Commuter Metadata */}
        <div className="mt-4 space-y-2 rounded-2xl bg-[var(--ice-blue-light)] p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Commuter:</span>
            <span className="font-bold text-[var(--navy)]">{studentName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Registration ID:</span>
            <span className="font-mono font-semibold text-[var(--navy)]">{rollNumber}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--text-muted)]">Assigned Route:</span>
            <span className="font-semibold text-[var(--sapphire)]">{routeCode}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--ice-blue-dark)] pt-2 text-[11px]">
            <span className="text-[var(--text-muted)]">Verification Status:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-[var(--success)]">
              <CheckCircle className="h-3.5 w-3.5" /> Active & Authorized
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full btn btn-primary py-2.5 text-xs font-semibold"
        >
          Done
        </button>
      </div>
    </div>
  );
}
