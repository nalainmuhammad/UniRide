"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
}

export function Card({
  children,
  elevated = false,
  bordered = true,
  hoverable = true,
  className = "",
  ...props
}: CardProps) {
  const baseClasses = elevated ? "card-elevated" : "card";
  const hoverClass = hoverable ? "hover:shadow-lg hover:-translate-y-0.5" : "";
  const borderClass = bordered ? "border border-[var(--ice-blue-dark)]" : "border-none";

  return (
    <div
      className={`${baseClasses} ${hoverClass} ${borderClass} bg-white rounded-2xl p-6 transition-all duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-b border-[var(--ice-blue)] pb-4 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-bold text-[var(--navy)] font-display tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-xs text-[var(--text-secondary)] mt-1 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`border-t border-[var(--ice-blue)] pt-4 mt-4 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}
