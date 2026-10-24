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
      "bg-accent text-on-accent hover:bg-accent-hover focus:ring-accent/40 shadow-xs border border-transparent",
    secondary:
      "bg-inverse text-white hover:bg-inverse-hover focus:ring-ink/30 shadow-xs border border-transparent",
    outline:
      "bg-surface text-ink border border-line hover:bg-raised hover:border-line-strong active:bg-line focus:ring-ink/20",
    ghost:
      "bg-transparent text-body hover:text-ink hover:bg-raised active:bg-line focus:ring-ink/10",
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
