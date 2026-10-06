"use client";

import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    let variantStyles = "btn-primary";
    if (variant === "secondary") variantStyles = "btn-secondary";
    else if (variant === "ghost") variantStyles = "btn-ghost";
    else if (variant === "danger") variantStyles = "btn-danger";
    else if (variant === "outline") {
      variantStyles =
        "bg-transparent text-[var(--navy)] border border-[var(--powder-blue)] hover:border-[var(--sapphire)] hover:text-[var(--sapphire)]";
    }

    let sizeStyles = "";
    if (size === "sm") sizeStyles = "btn-sm text-xs py-1.5 px-3";
    else if (size === "lg") sizeStyles = "btn-lg text-base py-3 px-6";

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`btn ${variantStyles} ${sizeStyles} ${className} ${
          isLoading || disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
        )}
        {!isLoading && leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
