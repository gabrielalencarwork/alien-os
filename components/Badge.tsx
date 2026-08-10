import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "alien" | "dark" | "gray" | "outline" | "upcoming";
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
    alien: "bg-[rgba(74,130,55,0.1)] text-[#4A8237] border border-[rgba(74,130,55,0.25)]",
    dark: "bg-[#111111] text-white border border-transparent",
    gray: "bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]",
    outline: "bg-white text-[#52525B] border border-[#E4E4E7]",
    upcoming: "bg-[#FAFAFA] text-[#71717A] border border-[#E4E4E7] stroke-dasharray-1",
  };

  const sizes = {
    sm: "text-[11px] px-2 py-0.5 gap-1.5",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  const dotColors = {
    alien: "bg-[#4A8237]",
    dark: "bg-white",
    gray: "bg-[#A1A1AA]",
    outline: "bg-[#71717A]",
    upcoming: "bg-[#D4D4D8]",
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
