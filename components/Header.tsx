"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, BellIcon, CommandIcon, PlusIcon, LogOutIcon } from "./icons";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { signOutUser } from "@/lib/supabase/auth";

export function Header() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch {
      // Ignora se for logout local
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-sm border-b border-[#E4E4E7] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left section: Breadcrumbs & Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-[#71717A]">Alien OS</span>
          <span className="text-[#D4D4D8]">/</span>
          <span className="font-semibold text-[#111111]">Dashboard</span>
        </div>

        <div className="h-4 w-px bg-[#E4E4E7] hidden sm:block" />

        <Badge variant="alien" size="sm" showDot className="hidden sm:inline-flex">
          Sistema Operacional Ativo
        </Badge>
      </div>

      {/* Right section: Search, Actions, Notifications, Logout */}
      <div className="flex items-center gap-3">
        {/* Search bar placeholder */}
        <div className="relative hidden md:flex items-center">
          <SearchIcon className="w-3.5 h-3.5 absolute left-3 text-[#A1A1AA]" />
          <input
            type="text"
            readOnly
            placeholder="Buscar clientes, métricas, atalhos..."
            className="w-64 pl-8 pr-12 py-1.5 bg-[#F4F4F5] border border-transparent hover:border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-lg text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all cursor-pointer select-none"
          />
          <div className="absolute right-2.5 flex items-center gap-0.5 text-[10px] font-mono text-[#A1A1AA] bg-white px-1.5 py-0.5 rounded border border-[#E4E4E7]">
            <CommandIcon className="w-2.5 h-2.5" />
            <span>K</span>
          </div>
        </div>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notificações"
          className="w-8 h-8 rounded-lg border border-[#E4E4E7] bg-white hover:bg-[#F4F4F5] flex items-center justify-center text-[#52525B] transition-colors relative"
        >
          <BellIcon className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#4A8237]" />
        </button>

        {/* Logout Quick Button */}
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair da conta"
          title="Sair da conta"
          className="w-8 h-8 rounded-lg border border-[#E4E4E7] bg-white hover:bg-red-50 hover:border-red-200 flex items-center justify-center text-[#71717A] hover:text-red-600 transition-colors"
        >
          <LogOutIcon className="w-3.5 h-3.5" />
        </button>

        {/* Action Button */}
        <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
          Nova Operação
        </Button>
      </div>
    </header>
  );
}
