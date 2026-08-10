import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-lg";

  const variants = {
    primary:
      "bg-[#4A8237] text-white hover:bg-[#3f6f2f] active:bg-[#355e28] focus:ring-[#4A8237]/40 shadow-xs border border-transparent",
    secondary:
      "bg-[#111111] text-white hover:bg-[#222222] active:bg-[#000000] focus:ring-[#111111]/30 shadow-xs border border-transparent",
    outline:
      "bg-white text-[#111111] border border-[#E4E4E7] hover:bg-[#F4F4F5] hover:border-[#D4D4D8] active:bg-[#E4E4E7] focus:ring-[#111111]/20",
    ghost:
      "bg-transparent text-[#52525B] hover:text-[#111111] hover:bg-[#F4F4F5] active:bg-[#E4E4E7] focus:ring-[#111111]/10",
  };

  const sizes = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5 rounded-md",
    md: "text-sm px-3.5 py-2 gap-2 rounded-lg",
    lg: "text-base px-4.5 py-2.5 gap-2.5 rounded-xl",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "right" && <span className="shrink-0">{icon}</span>}
    </button>
  );
}
