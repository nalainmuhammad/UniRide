"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  highlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Hamza Khan",
    role: "BS Computer Science • Batch 2023",
    avatar: "HK",
    rating: 5,
    highlight: "Sub-Second GPS Precision",
    quote:
      "The live GPS tracking has completely eliminated standing in the cold at 7 AM. I see exactly when my bus passes Faizabad and walk out right on time. The ETA accuracy is unmatched.",
  },
  {
    id: 2,
    name: "Sara Ahmed",
    role: "BBA Commuter • Route R-102",
    avatar: "SA",
    rating: 5,
    highlight: "Instant Contactless Boarding",
    quote:
      "The dynamic QR code check-in is so rapid. In past semesters we had huge manual queues while drivers checked physical cards. Now everyone boards in seconds with zero delay!",
  },
  {
    id: 3,
    name: "Tariq Mehmood",
    role: "Senior Shuttle Driver • BUS-01",
    avatar: "TM",
    rating: 5,
    highlight: "Offline Bloom Filter HUD",
    quote:
      "As a fleet driver, the HUD tablet app tells me upcoming student counts at each stop and verifies passes even in weak cell service spots. It makes driving peaceful and safe.",
  },
  {
    id: 4,
    name: "Dr. Ayesha Siddiqui",
    role: "Faculty Member • Department of Mathematics",
    avatar: "AS",
    rating: 5,
    highlight: "Guaranteed Seat Allocation",
    quote:
      "Reserving priority seating through the AVL Tree algorithm has made the daily faculty commute so dependable. I never have to worry about arriving to lectures late.",
  },
];

export default function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-slide every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Testimonial Card with Apple-Style Depth */}
      <div className="relative rounded-3xl border border-[var(--powder-blue)] bg-white p-8 sm:p-12 shadow-xl overflow-hidden transition-all duration-500 ease-out">
        {/* Subtle background decoration */}
        <div className="absolute top-6 right-8 text-[var(--ice-blue)] pointer-events-none opacity-60">
          <Quote className="h-28 w-28 stroke-[1]" />
        </div>

        <div className="relative z-10 flex flex-col justify-between min-h-[220px]">
          <div>
            {/* Rating Stars & Highlight Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--ice-blue-light)] text-[var(--sapphire)] border border-[var(--ice-blue)]">
                {current.highlight}
              </span>
            </div>

            {/* Quote Body with animated crossfade */}
            <p className="text-base sm:text-xl text-[var(--navy)] font-medium leading-relaxed italic transition-all duration-300">
              &ldquo;{current.quote}&rdquo;
            </p>
          </div>

          {/* Author Details & Carousel Controls */}
          <div className="mt-8 pt-6 border-t border-[var(--ice-blue)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--sapphire)] text-white font-bold flex items-center justify-center font-display shadow-md">
                {current.avatar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--navy)] font-display">
                  {current.name}
                </h4>
                <p className="text-xs text-[var(--text-secondary)]">{current.role}</p>
              </div>
            </div>

            {/* Navigation buttons and slide indicator dots */}
            <div className="flex items-center gap-3 self-end sm:self-center">
              {/* Dots */}
              <div className="flex gap-1.5 mr-2">
                {TESTIMONIALS.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === idx
                        ? "w-6 bg-[var(--sapphire)]"
                        : "w-2 bg-[var(--powder-blue)] hover:bg-[var(--text-muted)]"
                    }`}
                  />
                ))}
              </div>

              {/* Prev / Next Buttons */}
              <button
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="w-9 h-9 rounded-xl border border-[var(--powder-blue)] flex items-center justify-center text-[var(--navy)] hover:bg-[var(--ice-blue-light)] hover:border-[var(--sapphire)] transition-all active:scale-95"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next testimonial"
                className="w-9 h-9 rounded-xl border border-[var(--powder-blue)] flex items-center justify-center text-[var(--navy)] hover:bg-[var(--ice-blue-light)] hover:border-[var(--sapphire)] transition-all active:scale-95"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
