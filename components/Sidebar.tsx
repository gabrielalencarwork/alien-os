"use client";

import React from "react";
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
  ClockIcon,
  SettingsIcon,
  LogOutIcon,
} from "./icons";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: <LayoutDashboardIcon className="w-4 h-4" />,
    },
    {
      label: "Clientes",
      href: "/clientes",
      icon: <UsersIcon className="w-4 h-4" />,
    },
    {
      label: "Projetos",
      href: "/projetos",
      icon: <BriefcaseIcon className="w-4 h-4" />,
      badge: "Hub",
    },
    {
      label: "Campanhas",
      href: "/campanhas",
      icon: <RocketIcon className="w-4 h-4" />,
      badge: "ROAS",
    },
    {
      label: "Growth Lab",
      href: "/growth",
      icon: <RocketIcon className="w-4 h-4" />,
      badge: "CRO",
    },
    {
      label: "Integrações",
      href: "/integracoes",
      icon: <SettingsIcon className="w-4 h-4" />,
      badge: "APIs",
    },
    {
      label: "Agenda",
      href: "/agenda",
      icon: <ClockIcon className="w-4 h-4" />,
      badge: "Meet",
    },
    {
      label: "Inteligência",
      href: "/inteligencia",
      icon: <BotIcon className="w-4 h-4" />,
      badge: "IA",
    },
    {
      label: "Tarefas",
      href: "/tarefas",
      icon: <CheckCircle2Icon className="w-4 h-4" />,
      badge: "Ops",
    },
    {
      label: "Financeiro",
      href: "/financeiro",
      icon: <WalletIcon className="w-4 h-4" />,
      badge: "MRR",
    },
    {
      label: "Documentos",
      href: "/documentos",
      icon: <FileTextIcon className="w-4 h-4" />,
      badge: "Docs",
    },
    {
      label: "Configurações",
      href: "#",
      icon: <SettingsIcon className="w-4 h-4" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Ignora erro se for logout local
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-[#E4E4E7] flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none">
      <div>
        {/* Top Header / Branding */}
        <div className="p-4 border-b border-[#F4F4F5] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <AlienLogoIcon className="w-7 h-7 shrink-0 group-hover:scale-105 transition-transform" />
            <div className="flex flex-col">
              <span className="font-bold text-sm text-[#111111] tracking-tight leading-none">
                Alien OS
              </span>
              <span className="text-[10px] font-mono text-[#71717A] mt-1 tracking-wider uppercase">
                Growth OS
              </span>
            </div>
          </Link>

          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-[rgba(74,130,55,0.1)] text-[#4A8237] border border-[rgba(74,130,55,0.2)]">
            v2.0
          </span>
        </div>

        {/* Navigation */}
        <div className="p-3 space-y-4">
          <div>
            <div className="px-3 text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] mb-2 font-medium">
              Centro de Decisão
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : item.href !== "#" && pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-[#111111] text-white"
                        : "text-[#52525B] hover:text-[#111111] hover:bg-[#F4F4F5]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? "text-[#4A8237]" : "text-[#71717A]"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                          isActive
                            ? "bg-white/10 text-white"
                            : item.badge === "IA" || item.badge === "MRR" || item.badge === "Docs" || item.badge === "Ops" || item.badge === "Meet" || item.badge === "Hub" || item.badge === "ROAS" || item.badge === "CRO" || item.badge === "APIs"
                            ? "bg-[rgba(74,130,55,0.1)] text-[#4A8237]"
                            : "bg-[#F4F4F5] text-[#71717A]"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Profile / Workspace & Logout */}
      <div className="p-3 border-t border-[#F4F4F5] bg-[#FAFAFA] space-y-2">
        <div className="p-2.5 rounded-lg border border-[#E4E4E7] bg-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#111111] text-white text-xs font-bold flex items-center justify-center border border-[#4A8237] shrink-0">
              G
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-[#111111] truncate">
                Gabriel Alencar
              </span>
              <span className="text-[10px] text-[#71717A] truncate">
                Head de Growth
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sair do sistema"
            className="p-1.5 rounded-md hover:bg-red-50 text-[#71717A] hover:text-red-600 transition-colors"
          >
            <LogOutIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
