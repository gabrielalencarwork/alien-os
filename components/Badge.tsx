import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "alien" | "dark" | "gray" | "outline" | "upcoming" | "danger" | "warning";
  size?: "sm" | "md";
  showDot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = "gray",
  size = "md",
  showDot = false,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium tracking-tight rounded-md select-none";

  const variants = {
    alien: "bg-accent/10 text-accent border border-accent/25",
    dark: "bg-inverse text-white border border-transparent",
    gray: "bg-raised text-body border border-line",
    outline: "bg-surface text-body border border-line",
    upcoming: "bg-canvas text-muted border border-line stroke-dasharray-1",
    danger: "bg-red-50 text-red-700 border border-red-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const dotColors = {
    alien: "bg-accent",
    dark: "bg-surface",
    gray: "bg-subtle",
    outline: "bg-muted",
    upcoming: "bg-line-strong",
    danger: "bg-red-500",
    warning: "bg-amber-500",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}
