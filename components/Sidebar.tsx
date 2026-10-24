"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOutUser } from "@/lib/supabase/auth";
import {
  AlienLogoIcon,
  LayoutDashboardIcon,
  UsersIcon,
  RocketIcon,
  BriefcaseIcon,
  BotIcon,
  CheckCircle2Icon,
  WalletIcon,
  FileTextIcon,
  CalendarIcon,
  SettingsIcon,
  LogOutIcon,
  LayersIcon,
  SparklesIcon,
  TrendingUpIcon,
  ChevronRightIcon,
} from "./icons";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const ic = "w-4 h-4";

/** Menu principal: só o que é usado todos os dias. */
export const PRIMARY_NAV: NavItem[] = [
  { label: "Central do Dia", href: "/", icon: <LayoutDashboardIcon className={ic} /> },
  { label: "Clientes", href: "/clientes", icon: <UsersIcon className={ic} /> },
  { label: "Tarefas", href: "/tarefas", icon: <CheckCircle2Icon className={ic} /> },
  { label: "Agenda", href: "/agenda", icon: <CalendarIcon className={ic} /> },
  { label: "Alien Max", href: "/alien-max", icon: <BotIcon className={ic} /> },
  { label: "Integrações", href: "/integracoes", icon: <LayersIcon className={ic} /> },
];

/** Módulos de uso eventual, agrupados em "Mais". */
export const SECONDARY_NAV: NavItem[] = [
  { label: "Financeiro", href: "/financeiro", icon: <WalletIcon className={ic} /> },
  { label: "Projetos", href: "/projetos", icon: <BriefcaseIcon className={ic} /> },
  { label: "Campanhas", href: "/campanhas", icon: <RocketIcon className={ic} /> },
  { label: "Growth Lab", href: "/growth", icon: <TrendingUpIcon className={ic} /> },
  { label: "Inteligência", href: "/inteligencia", icon: <SparklesIcon className={ic} /> },
  { label: "Documentos", href: "/documentos", icon: <FileTextIcon className={ic} /> },
];

export const SETTINGS_NAV: NavItem = {
  label: "Configurações",
  href: "/configuracoes",
  icon: <SettingsIcon className={ic} />,
};

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActivePath(pathname, item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] transition-colors ${
        active ? "bg-raised text-ink font-semibold" : "text-muted hover:text-ink hover:bg-raised/60"
      }`}
    >
      {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-neon" aria-hidden />}
      <span className={active ? "text-accent" : ""}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({ variant = "desktop", onNavigate }: { variant?: "desktop" | "drawer"; onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const secondaryActive = SECONDARY_NAV.some((i) => isActivePath(pathname, i.href));
  const [moreOpen, setMoreOpen] = useState(secondaryActive);

  useEffect(() => {
    if (secondaryActive) setMoreOpen(true);
  }, [secondaryActive]);

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Mesmo com erro na API, a sessão local é encerrada abaixo.
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <aside
      className={
        variant === "desktop"
          ? "hidden lg:flex w-60 shrink-0 h-screen sticky top-0 z-30 flex-col bg-surface border-r border-line select-none"
          : "flex w-72 max-w-[85vw] h-full flex-col bg-surface border-r border-line select-none"
      }
    >
      <Link href="/" onClick={onNavigate} className="h-16 px-5 flex items-center gap-2.5 border-b border-line-soft shrink-0">
        <AlienLogoIcon className="w-7 h-7 shrink-0" />
        <span className="font-display text-[19px] font-bold text-ink leading-none tracking-tight">Alien OS</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Menu principal">
        {PRIMARY_NAV.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
        ))}

        <div className="pt-3">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className="w-full flex items-center justify-between h-9 px-3 rounded-lg text-[13px] text-muted hover:text-ink hover:bg-raised/60 transition-colors"
          >
            <span>Mais</span>
            <ChevronRightIcon className={`w-3.5 h-3.5 transition-transform ${moreOpen ? "rotate-90" : ""}`} />
          </button>
          {moreOpen && (
            <div className="mt-1 space-y-1">
              {SECONDARY_NAV.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} onNavigate={onNavigate} />
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="px-3 py-3 border-t border-line-soft space-y-1 shrink-0">
        <NavLink item={SETTINGS_NAV} pathname={pathname} onNavigate={onNavigate} />
        <div className="flex items-center gap-2.5 px-3 h-11">
          <div className="w-7 h-7 rounded-full bg-inverse text-neon text-xs font-bold flex items-center justify-center border border-line-strong shrink-0">
            G
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-ink truncate">Gabriel Alencar</div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
            className="p-1.5 rounded-md text-muted hover:text-danger hover:bg-raised transition-colors"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
