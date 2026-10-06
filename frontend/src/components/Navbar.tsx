"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  transparent?: boolean;
  onOpenPass?: () => void;
  onOpenScanner?: () => void;
  onOpenFeedback?: () => void;
}

export default function Navbar({
  transparent = true,
  onOpenPass,
  onOpenScanner,
  onOpenFeedback,
}: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navBackground = scrolled || !transparent
    ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-[var(--ice-blue)]"
    : "bg-transparent";

  const textColor = scrolled || !transparent
    ? "text-[var(--navy)]"
    : "text-white";

  const logoColor = scrolled || !transparent
    ? "text-[var(--navy)]"
    : "text-white";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBackground}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-[var(--sapphire)] flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 6v6" />
                <path d="M15 6v6" />
                <path d="M2 12h19.6" />
                <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
                <circle cx="7" cy="18" r="2" />
                <path d="M9 18h5" />
                <circle cx="16" cy="18" r="2" />
              </svg>
            </div>
            <span className={`text-xl font-bold tracking-tight ${logoColor} transition-colors font-[Outfit]`}>
              UniRide
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {[
              { label: "Home", href: "#home" },
              { label: "Features", href: "#features" },
              { label: "Schedules", href: "/schedules" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Contact", href: "#contact" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-[var(--sapphire)]/10 ${textColor}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${textColor} hover:bg-[var(--sapphire)]/10`}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="btn btn-primary btn-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className={`lg:hidden p-2 rounded-lg ${textColor}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-[var(--ice-blue)] shadow-xl animate-[modalSlideUp_0.3s_ease-out]">
          <div className="px-4 py-4 space-y-1">
            {[
              { label: "Home", href: "#home" },
              { label: "Features", href: "#features" },
              { label: "Schedules", href: "/schedules" },
              { label: "How It Works", href: "#how-it-works" },
              { label: "Contact", href: "#contact" },
              { label: "FAQ", href: "#faq" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 text-sm font-medium text-[var(--navy)] rounded-lg hover:bg-[var(--ice-blue-light)] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 mt-3 border-t border-[var(--ice-blue)] space-y-2">
              <Link
                href="/login"
                className="block text-center px-4 py-2.5 text-sm font-semibold text-[var(--sapphire)] border border-[var(--sapphire)] rounded-lg hover:bg-[var(--ice-blue-light)] transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="block text-center btn btn-primary w-full"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
