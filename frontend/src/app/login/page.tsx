"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bus,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Eye,
  EyeOff,
  UserCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "driver" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate authentication delay
    setTimeout(() => {
      setIsLoading(false);
      // Route dynamically depending on selected role
      if (role === "admin") {
        router.push("/dashboard/admin");
      } else if (role === "driver") {
        router.push("/dashboard/driver");
      } else {
        router.push("/dashboard/student");
      }
    }, 700);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white text-[var(--navy)]">
      {/* Left Column: Branded Visual Experience (Apple-Style) */}
      <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-12 bg-gradient-to-br from-[var(--navy)] via-[var(--navy-light)] to-[var(--sapphire-dark)] text-white overflow-hidden">
        {/* Abstract background circles */}
        <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[var(--sapphire)]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-[var(--ice-blue)]/10 blur-3xl pointer-events-none" />

        {/* Brand Top Header */}
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

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-mono text-[var(--ice-blue)] backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Encrypted Single Sign-On (SSO)</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight text-white">
            Smart Transit for <br />
            Next-Gen Universities.
          </h2>

          <p className="text-sm text-[var(--ice-blue)] leading-relaxed max-w-md">
            Log in to manage your daily shuttle schedule, view real-time vehicle telemetry, and access your dynamic boarding pass.
          </p>

          <div className="space-y-3 pt-4">
            {[
              "Dynamic TOTP Pass Generation (Anti-Fraud)",
              "Live Sub-Second GPS Tracking Across Campus",
              "Balanced Load Seat Reservations (AVL Engine)",
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-[var(--ice-blue)]">
                <CheckCircle className="h-4 w-4 text-[var(--sapphire-light)] shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="relative z-10 pt-6 border-t border-white/10 text-xs text-[var(--powder-blue)] flex items-center justify-between">
          <span>Campus Transport Portal v2.0</span>
          <span>99.9% Telemetry Uptime</span>
        </div>
      </div>

      {/* Right Column: Authentication Form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Brand Top */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[var(--sapphire)] flex items-center justify-center text-white">
              <Bus className="h-4 w-4" />
            </div>
            <span className="text-xl font-bold font-display text-[var(--navy)]">UniRide</span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--navy)] font-display tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5">
              Enter your credentials to access your transit dashboard.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--navy)] uppercase tracking-wider mb-2 font-mono">
              Select Portal Role
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-[var(--ice-blue-light)] border border-[var(--ice-blue)]">
              {(["student", "driver", "admin"] as const).map((r) => (
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
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Social Google Auth Ready Button */}
          <div>
            <button
              type="button"
              onClick={() => {
                // Simulate quick Google Auth
                setIsLoading(true);
                setTimeout(() => {
                  setIsLoading(false);
                  if (role === "admin") router.push("/dashboard/admin");
                  else if (role === "driver") router.push("/dashboard/driver");
                  else router.push("/dashboard/student");
                }, 600);
              }}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-[var(--powder-blue)] bg-white text-xs font-semibold text-[var(--navy)] hover:bg-[var(--ice-blue-light)] transition-colors shadow-xs"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with University Google Account</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[var(--ice-blue)] w-full" />
            <span className="bg-white px-3 text-[11px] font-mono text-[var(--text-muted)] uppercase absolute">
              or enter credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                {role === "student"
                  ? "Student Email / Roll Number"
                  : role === "driver"
                  ? "Driver ID / Email"
                  : "Admin Email"}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "student"
                      ? "fa23-bcs-001@university.edu.pk"
                      : role === "driver"
                      ? "driver@transport.edu.pk"
                      : "admin@uniride.edu.pk"
                  }
                  className="input pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--navy)] uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-[var(--sapphire)] hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="input pl-10 pr-10 text-xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[var(--text-muted)] hover:text-[var(--navy)]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>{isLoading ? "Authenticating..." : `Sign In as ${role.toUpperCase()}`}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Pre-fill Pills */}
          <div className="rounded-xl border border-[var(--ice-blue)] bg-[var(--off-white)] p-3 text-[11px]">
            <span className="font-mono text-[var(--text-muted)] font-semibold block mb-1">
              DEMO QUICK-LOGIN SHORTCUTS:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setRole("student");
                  setEmail("fa23-bcs-001@university.edu.pk");
                  setPassword("StudentPass2026!");
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-[var(--powder-blue)] text-[var(--sapphire)] font-mono hover:bg-[var(--ice-blue-light)]"
              >
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("driver");
                  setEmail("driver.tariq@transport.edu.pk");
                  setPassword("DriverPass2026!");
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-[var(--powder-blue)] text-[var(--sapphire)] font-mono hover:bg-[var(--ice-blue-light)]"
              >
                Driver Demo
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole("admin");
                  setEmail("admin@uniride.edu.pk");
                  setPassword("AdminMaster2026!");
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-white border border-[var(--powder-blue)] text-[var(--sapphire)] font-mono hover:bg-[var(--ice-blue-light)]"
              >
                Admin Demo
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-[var(--text-secondary)]">
            Don&apos;t have an active commuter account?{" "}
            <Link href="/signup" className="text-[var(--sapphire)] font-bold hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="modal-overlay" onClick={() => setForgotModalOpen(false)}>
          <div
            className="modal-content max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-[var(--navy)] font-display">
              Reset Your Password
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 mb-4">
              Enter your registered university email to receive a secure recovery code.
            </p>

            {forgotSuccess ? (
              <div className="py-4 text-center text-emerald-600">
                <UserCheck className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                <p className="text-xs font-bold">Recovery Link Sent!</p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1">
                  Check your university inbox for password reset instructions.
                </p>
                <button
                  onClick={() => {
                    setForgotSuccess(false);
                    setForgotModalOpen(false);
                  }}
                  className="mt-4 btn btn-primary btn-sm w-full"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setForgotSuccess(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-[var(--navy)] mb-1 uppercase tracking-wider">
                    University Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@university.edu.pk"
                    className="input text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="btn btn-secondary btn-sm flex-1"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm flex-1">
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
