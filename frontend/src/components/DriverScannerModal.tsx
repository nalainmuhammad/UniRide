"use client";

import React, { useState } from "react";
import { X, Camera, CheckCircle2, XCircle, Zap, Shield, RefreshCw } from "lucide-react";
import { checkInAttendance } from "@/lib/api";

interface DriverScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  busId?: number;
}

export default function DriverScannerModal({
  isOpen,
  onClose,
  busId = 1,
}: DriverScannerModalProps) {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    name: string;
    roll: string;
    message: string;
    latencyMicroseconds: number;
  } | null>(null);
  const [boardedCount, setBoardedCount] = useState(34);

  if (!isOpen) return null;

  const handleSimulateScan = async (valid: boolean, roll: string, name: string) => {
    setScanning(true);
    setScanResult(null);

    // Sub-millisecond latency simulation
    const token = valid ? `UNIRIDE-${roll}-TOKEN` : "FAKE-EXPIRED-TOKEN-999";
    await checkInAttendance(token, busId);

    setTimeout(() => {
      setScanning(false);
      if (valid) {
        setBoardedCount((c) => c + 1);
        setScanResult({
          success: true,
          name: name,
          roll: roll,
          message: "Boarding Authorized • Bloom Filter Verified",
          latencyMicroseconds: 140,
        });
      } else {
        setScanResult({
          success: false,
          name: "Unknown / Invalid Card",
          roll: "REVOKED-TOKEN",
          message: "Rejected: Pass Not In Active Bloom Filter (< 200ns)",
          latencyMicroseconds: 85,
        });
      }
    }, 350);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--powder-blue)] bg-white p-6 shadow-2xl animate-[modalSlideUp_0.3s_ease-out]"
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
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--navy)] font-display">
              Driver Boarding HUD Scanner
            </h3>
            <p className="text-xs font-mono text-[var(--sapphire)] font-semibold">
              Bloom Filter O(1) Fast Membership Check
            </p>
          </div>
        </div>

        {/* Camera HUD Viewport Box */}
        <div className="relative mt-5 flex h-52 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--powder-blue)] bg-[var(--navy)] text-white">
          {/* Scanning line animation */}
          {scanning && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--sapphire-light)] shadow-[0_0_15px_#1A6DD4] animate-bounce" />
          )}

          {/* Corner target reticles */}
          <div className="absolute top-3 left-3 h-5 w-5 border-t-2 border-l-2 border-[var(--ice-blue)]" />
          <div className="absolute top-3 right-3 h-5 w-5 border-t-2 border-r-2 border-[var(--ice-blue)]" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[var(--ice-blue)]" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[var(--ice-blue)]" />

          {scanning ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="h-8 w-8 text-[var(--ice-blue)] animate-spin" />
              <span className="font-mono text-xs text-[var(--ice-blue)]">Interpreting QR Payload...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-300">
              <Camera className="h-8 w-8 text-[var(--powder-blue)]" />
              <span className="text-xs font-mono">Point camera at student phone pass</span>
            </div>
          )}

          {/* Boarded passengers counter badge */}
          <div className="absolute bottom-3 right-3 rounded-full bg-[var(--navy-light)] border border-white/20 px-3 py-1 font-mono text-[11px] text-[var(--ice-blue)]">
            Total Boarded: {boardedCount}
          </div>
        </div>

        {/* Scan Result Feedback Card */}
        {scanResult && (
          <div
            className={`mt-4 rounded-2xl border p-4 text-xs font-mono animate-fadeIn ${
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
            <p className="mt-1 text-[11px]">{scanResult.message}</p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-600 border-t border-black/10 pt-1.5">
              <span>Token: {scanResult.roll}</span>
              <span>Latency: {scanResult.latencyMicroseconds} μs</span>
            </div>
          </div>
        )}

        {/* Scanner Simulation Controls */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => handleSimulateScan(true, "FA23-BCS-042", "Ayesha Malik")}
            disabled={scanning}
            className="btn btn-secondary btn-sm text-[11px]"
          >
            Simulate Valid Scan
          </button>
          <button
            onClick={() => handleSimulateScan(false, "REVOKED", "Fraudulent Card")}
            disabled={scanning}
            className="btn btn-danger btn-sm text-[11px]"
          >
            Simulate Invalid Pass
          </button>
        </div>
      </div>
    </div>
  );
}
