import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: "none" | "sm" | "md" | "lg";
  hoverable?: boolean;
  borderAccent?: boolean;
}

export function Card({
  children,
  padding = "md",
  hoverable = false,
  borderAccent = false,
  className = "",
  ...props
}: CardProps) {
  const paddings = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const hoverStyles = hoverable
    ? "transition-all duration-200 hover:border-[#D4D4D8] hover:shadow-sm"
    : "";

  const accentStyles = borderAccent
    ? "border-l-4 border-l-[#4A8237]"
    : "";

  return (
    <div
      className={`bg-white border border-[#E4E4E7] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] ${paddings[padding]} ${hoverStyles} ${accentStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
