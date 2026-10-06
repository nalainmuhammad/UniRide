"use client";

import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "danger" | "info" | "sapphire" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "sapphire",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  let variantClass = "badge-sapphire";
  if (variant === "success") variantClass = "badge-success";
  else if (variant === "warning") variantClass = "badge-warning";
  else if (variant === "danger") variantClass = "badge-danger";
  else if (variant === "info") variantClass = "badge-info";
  else if (variant === "neutral")
    variantClass = "bg-[var(--ice-blue-light)] text-[var(--navy)] border border-[var(--powder-blue)]";

  const sizeClass = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
