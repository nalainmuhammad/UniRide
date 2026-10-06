"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bus,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  MapPin,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "driver">("student");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [route, setRoute] = useState("R-101");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (role === "driver") {
        router.push("/dashboard/driver");
      } else {
        router.push("/dashboard/student");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-[var(--navy)]">
      {/* Left Column: Branded Visual Experience (Apple-Style) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-[var(--navy)] via-[var(--navy-light)] to-[var(--sapphire-dark)] text-white overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[var(--sapphire)]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[var(--ice-blue)]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--sapphire)] flex items-center justify-center shadow-lg">
              <Bus className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold font-display tracking-tight text-white">
              UniRide
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-mono text-[var(--ice-blue)] backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Instant Campus Registration</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">
            Join Thousands of <br />
            Daily Commuters.
          </h2>

          <p className="text-sm text-[var(--ice-blue)] leading-relaxed max-w-md">
            Create your account to unlock real-time GPS tracking, reserve seats with AVL tree balancing, and receive your dynamic TOTP pass.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Automated verification with university registrar",
              "Personalized stop alerts and departure countdowns",
              "Offline-ready digital pass on your smartphone",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[var(--ice-blue)]">
                <CheckCircle className="h-4 w-4 text-[var(--sapphire-light)] shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-[var(--powder-blue)] flex items-center justify-between">
          <span>Campus Transport Portal v2.0</span>
          <span>Fast-Track Onboarding</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div className="lg:hidden flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-[var(--sapphire)] flex items-center justify-center text-white">
              <Bus className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold font-display text-[var(--navy)]">UniRide</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)] font-display tracking-tight">
              Create an account
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
              Select your role and enter your details to register.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider mb-2 font-mono">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--ice-blue-light)] border border-[var(--ice-blue)]">
              {(["student", "driver"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 text-xs font-semibold rounded-lg capitalize transition-all duration-200 ${
                    role === r
                      ? "bg-white text-[var(--sapphire)] shadow-sm font-bold"
                      : "text-[var(--text-secondary)] hover:text-[var(--navy)]"
                  }`}
                >
                  {r === "student" ? "Student Commuter" : "Campus Driver"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ayesha Malik"
                  className="input pl-10 text-xs"
                />
              </div>
            </div>

            {/* Roll Number or Driver ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                  {role === "student" ? "Roll / Reg No" : "Driver License"}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={role === "student" ? "FA23-BCS-042" : "ISB-DL-98211"}
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="input pl-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* University Email */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                University Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu.pk"
                  className="input pl-10 text-xs"
                />
              </div>
            </div>

            {/* Route Selection */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                Primary Assigned Route
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <select
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  className="input pl-10 text-xs"
                >
                  <option value="R-101">R-101 • Islamabad Highway Corridor</option>
                  <option value="R-102">R-102 • Peshawar Road Express</option>
                  <option value="R-103">R-103 • Rawal Road & Murree Link</option>
                  <option value="R-104">R-104 • DHA & Bahria Shuttle</option>
                </select>
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 chars"
                    className="input pl-8 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="input pl-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2 mt-4"
            >
              <span>{isLoading ? "Creating Account..." : "Complete Registration"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="text-center text-xs text-[var(--text-secondary)]">
            Already have an active commuter account?{" "}
            <Link href="/login" className="text-[var(--sapphire)] font-bold hover:underline">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
