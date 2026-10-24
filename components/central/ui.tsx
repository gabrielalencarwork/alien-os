"use client";

import React, { useEffect } from "react";
import { AlertTriangleIcon, XIcon } from "@/components/icons";

export function Panel({
  title,
  meta,
  action,
  children,
  className = "",
  hud = false,
}: {
  title: string;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  hud?: boolean;
}) {
  return (
    <section className={`bg-surface border border-line rounded-2xl ${hud ? "hud" : ""} ${className}`}>
      <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
        <div className="min-w-0">
          <h2 className="font-display text-[17px] font-bold text-ink leading-tight">{title}</h2>
          {meta && <div className="text-xs text-muted mt-0.5">{meta}</div>}
        </div>
        {action && <div className="flex items-center gap-1.5 shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  );
}

export function SmallButton({
  children,
  onClick,
  variant = "ghost",
  disabled,
  type = "button",
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "primary" | "outline";
  disabled?: boolean;
  type?: "button" | "submit";
  title?: string;
}) {
  const styles = {
    ghost: "text-muted hover:text-ink hover:bg-raised",
    outline: "border border-line text-body hover:text-ink hover:border-line-strong bg-surface",
    primary: "bg-accent text-on-accent hover:bg-accent-hover font-semibold",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles}`}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="px-5 pb-6 pt-2">
      <div className="rounded-xl border border-dashed border-line-strong px-4 py-6 text-center">
        <p className="text-sm font-medium text-ink">{title}</p>
        {text && <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">{text}</p>}
        {action && <div className="mt-3 flex justify-center gap-2">{action}</div>}
      </div>
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <div className="mx-5 mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
      <AlertTriangleIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span className="leading-relaxed [overflow-wrap:anywhere]">{message}</span>
    </div>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="px-5 pb-5 space-y-2" aria-busy="true" aria-label="Carregando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded-lg bg-raised animate-pulse" />
      ))}
    </div>
  );
}

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="bg-surface border border-line rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line-soft">
          <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Fechar" className="p-1 rounded-md text-muted hover:text-ink hover:bg-raised">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export const fieldClass =
  "w-full h-9 px-3 bg-canvas border border-line rounded-lg text-[13px] text-ink placeholder:text-subtle outline-none focus:border-accent";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-body">{label}</span>
      {children}
    </label>
  );
}

export function Delta({ value, inverse = false, neutral = false }: { value: number | null; inverse?: boolean; neutral?: boolean }) {
  if (value === null) return <span className="text-subtle">—</span>;
  if (value === 0) return <span className="text-muted">0%</span>;
  const good = inverse ? value < 0 : value > 0;
  return (
    <span className={neutral ? "text-muted" : good ? "text-accent" : "text-danger"}>
      {value > 0 ? "▲" : "▼"} {Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}%
    </span>
  );
}
