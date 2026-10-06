"use client";

import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[var(--navy)] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full rounded-xl border bg-white py-2.5 text-sm text-[var(--navy)] placeholder-[var(--text-muted)] transition-all duration-200 outline-none ${
              leftIcon ? "pl-10" : "pl-4"
            } ${rightIcon ? "pr-10" : "pr-4"} ${
              error
                ? "border-[var(--danger)] focus:ring-2 focus:ring-[var(--danger)]/20"
                : "border-[var(--powder-blue)] focus:border-[var(--sapphire)] focus:ring-2 focus:ring-[var(--sapphire)]/15"
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3.5 text-[var(--text-muted)] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--danger)] mt-1">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-[var(--text-secondary)] mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
