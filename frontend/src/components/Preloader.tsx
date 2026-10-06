"use client";

import React, { useEffect, useRef } from "react";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.classList.add("fade-out");
      }
      setTimeout(onComplete, 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div ref={containerRef} className="preloader">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(15,82,186,0.4) 0%, transparent 70%)",
            top: "10%",
            left: "-5%",
            animation: "float 4s ease-in-out infinite",
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-15"
          style={{
            background: "radial-gradient(circle, rgba(214,230,243,0.5) 0%, transparent 70%)",
            bottom: "15%",
            right: "5%",
            animation: "float 5s ease-in-out infinite 1s",
          }}
        />
      </div>

      {/* Logo & Bus Icon */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated bus icon */}
        <div className="mb-6 relative">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-float"
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

        {/* Brand name */}
        <h1 className="preloader-logo">
          Uni<span style={{ color: "#D6E6F3" }}>Ride</span>
        </h1>

        <p
          className="text-sm font-medium tracking-widest uppercase mb-8"
          style={{ color: "rgba(214, 230, 243, 0.6)" }}
        >
          Smart Campus Transport
        </p>

        {/* Progress bar */}
        <div className="preloader-bar">
          <div className="preloader-bar-fill" />
        </div>
      </div>
    </div>
  );
}
