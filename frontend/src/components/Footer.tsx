"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--navy)] text-[var(--powder-blue)]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--sapphire)] flex items-center justify-center">
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
              <span className="text-xl font-bold text-white font-[Outfit]">
                UniRide
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[var(--powder-blue-dark)] mb-6">
              Intelligent campus transport management system. Making university commuting smarter, safer, and more efficient.
            </p>
            <div className="flex gap-3">
              {/* Social icons as simple circles */}
              {["GitHub", "LinkedIn", "Twitter"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-full border border-[var(--powder-blue-dark)] flex items-center justify-center text-xs font-semibold text-[var(--powder-blue)] hover:bg-[var(--sapphire)] hover:border-[var(--sapphire)] hover:text-white transition-all duration-200"
                  aria-label={social}
                >
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-[Outfit]">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Schedules", href: "/schedules" },
                { label: "Features", href: "/#features" },
                { label: "How It Works", href: "/#how-it-works" },
                { label: "FAQ", href: "/#faq" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--powder-blue-dark)] hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-[Outfit]">
              For Users
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Student Portal", href: "/login" },
                { label: "Driver Portal", href: "/login" },
                { label: "Admin Dashboard", href: "/login" },
                { label: "Track My Bus", href: "/login" },
                { label: "Give Feedback", href: "/login" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--powder-blue-dark)] hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 font-[Outfit]">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 text-[var(--sapphire-light)] flex-shrink-0" />
                <span className="text-sm text-[var(--powder-blue-dark)]">
                  University of Engineering & Technology, G.T. Road, Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[var(--sapphire-light)] flex-shrink-0" />
                <span className="text-sm text-[var(--powder-blue-dark)]">
                  +92 42 9902 9000
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[var(--sapphire-light)] flex-shrink-0" />
                <span className="text-sm text-[var(--powder-blue-dark)]">
                  transport@uet.edu.pk
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--powder-blue-dark)]">
            © {new Date().getFullYear()} UniRide — UET Lahore. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-[var(--powder-blue-dark)] hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-[var(--powder-blue-dark)] hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
