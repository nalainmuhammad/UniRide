"use client";

import React, { useState } from "react";
import { X, Star, Send, Sparkles, CheckCircle2 } from "lucide-react";
import { submitFeedback } from "@/lib/api";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState("PUNCTUALITY");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Real-time instant sentiment calculation preview
  const getSentimentPreview = (text: string, stars: number) => {
    const posWords = ["good", "great", "excellent", "safe", "clean", "on time", "fast", "friendly", "comfortable"];
    const negWords = ["bad", "terrible", "late", "delayed", "broken", "dirty", "crowded", "rash", "reckless"];
    const lower = text.toLowerCase();
    const p = posWords.filter((w) => lower.includes(w)).length;
    const n = negWords.filter((w) => lower.includes(w)).length;
    const score = stars >= 4 ? 0.6 + p * 0.1 : stars <= 2 ? -0.5 - n * 0.1 : (p - n) * 0.2;
    if (score > 0.15) return { label: "POSITIVE", score: Math.min(1.0, score), color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (score < -0.15) return { label: "NEGATIVE", score: Math.max(-1.0, score), color: "text-red-600 bg-red-50 border-red-200" };
    return { label: "NEUTRAL", score: 0.05, color: "text-amber-600 bg-amber-50 border-amber-200" };
  };

  const sentiment = getSentimentPreview(comment, rating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await submitFeedback(comment, rating, category);
    setIsSubmitting(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--powder-blue)] bg-white p-6 shadow-2xl animate-[modalSlideUp_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--ice-blue-light)] text-[var(--navy)] hover:bg-[var(--ice-blue)] transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sapphire)] text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--navy)] font-display">Student Commute Feedback</h3>
            <p className="text-xs font-mono text-[var(--sapphire)] font-semibold">NLP Sentiment Analysis Active</p>
          </div>
        </div>

        {success ? (
          <div className="my-8 flex flex-col items-center justify-center gap-2 text-center text-emerald-600">
            <CheckCircle2 className="h-12 w-12 animate-bounce text-emerald-500" />
            <p className="text-base font-bold">Feedback Recorded!</p>
            <p className="text-xs text-[var(--text-secondary)]">Your response will train route optimization models.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* Star Rating Bar */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5 uppercase tracking-wider">
                Trip Rating
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-[var(--powder-blue)]"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-mono text-xs font-bold text-[var(--navy)]">{rating} / 5</span>
              </div>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input text-xs"
              >
                <option value="PUNCTUALITY">Punctuality & Schedule adherence</option>
                <option value="DRIVING_SAFETY">Driving safety & comfort</option>
                <option value="BUS_CLEANLINESS">Bus cleanliness & maintenance</option>
                <option value="OVERCROWDING">Seat availability & crowding</option>
                <option value="OTHER">General suggestions / Other</option>
              </select>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-semibold text-[var(--navy)] mb-1.5 uppercase tracking-wider">
                Comments & Observations
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (e.g. Bus arrived on time, clean interior, safe driver)..."
                className="input text-xs"
                required
              />
            </div>

            {/* Live Sentiment Classification HUD */}
            {comment.length > 3 && (
              <div className={`flex items-center justify-between rounded-xl border p-2.5 text-xs font-mono ${sentiment.color}`}>
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="h-3.5 w-3.5" />
                  NLP Sentiment: {sentiment.label}
                </span>
                <span className="font-bold">Score: {sentiment.score.toFixed(2)}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn btn-primary flex items-center justify-center gap-2 py-2.5 text-xs font-semibold"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isSubmitting ? "Processing NLP Vector..." : "Submit Feedback"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
