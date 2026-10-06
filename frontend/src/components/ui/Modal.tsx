"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let widthClass = "max-w-md";
  if (maxWidth === "sm") widthClass = "max-w-sm";
  else if (maxWidth === "lg") widthClass = "max-w-lg";
  else if (maxWidth === "xl") widthClass = "max-w-xl";
  else if (maxWidth === "2xl") widthClass = "max-w-2xl";
  else if (maxWidth === "full") widthClass = "max-w-4xl";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${widthClass} w-[92%] p-6 relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-[var(--text-muted)] hover:text-[var(--navy)] p-1.5 rounded-lg hover:bg-[var(--ice-blue-light)] transition-colors"
        >
          <X size={18} />
        </button>

        {(title || description) && (
          <div className="mb-5 pr-8">
            {title && (
              <h2 className="text-xl font-bold text-[var(--navy)] font-display tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {description}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );
}
