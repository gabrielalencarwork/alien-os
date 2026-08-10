"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import {
  ChevronRightIcon,
  BotIcon,
  PlusIcon,
  LayoutDashboardIcon,
  RocketIcon,
  UsersIcon,
  BriefcaseIcon,
  WalletIcon,
  FileTextIcon,
  ClockIcon,
  SparklesIcon,
} from "@/components/icons";

export type WorkspaceTab =
  | "dashboard"
  | "jornada"
  | "campanhas"
  | "growth"
  | "financeiro"
  | "timeline"
  | "documentos"
  | "alien-max";

export interface ClientWorkspaceHeaderProps {
  client: Cliente;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
}

export function ClientWorkspaceHeader({
  client,
  activeTab,
  onTabChange,
}: ClientWorkspaceHeaderProps) {
  const tabs: { id: WorkspaceTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "jornada", label: "Jornada", icon: <RocketIcon className="w-3.5 h-3.5" />, badge: "360°" },
    { id: "campanhas", label: "Campanhas", icon: <BriefcaseIcon className="w-3.5 h-3.5" /> },
    { id: "growth", label: "Growth", icon: <SparklesIcon className="w-3.5 h-3.5" />, badge: "A/B" },
    { id: "financeiro", label: "Financeiro", icon: <WalletIcon className="w-3.5 h-3.5" /> },
    { id: "timeline", label: "Timeline", icon: <ClockIcon className="w-3.5 h-3.5" /> },
    { id: "documentos", label: "Documentos", icon: <FileTextIcon className="w-3.5 h-3.5" /> },
    { id: "alien-max", label: "Alien Max", icon: <BotIcon className="w-3.5 h-3.5" />, badge: "IA" },
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Back Link */}
      <div>
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </span>
          <span>Voltar para Lista de Clientes</span>
        </Link>
      </div>

      {/* Main Workspace Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="alien" showDot>
              {client.journeyStage}
            </Badge>
            <Badge variant="dark" size="sm">
              Alien Score {client.alienScore}/100
            </Badge>
            <Badge
              variant={client.healthStatus === "Excelente" ? "alien" : "gray"}
              size="sm"
              className={
                client.healthStatus === "Atenção"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : ""
              }
            >
              Saúde: {client.healthStatus}
            </Badge>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Growth Workspace: {client.name}
            </h1>
            <p className="text-sm text-[#52525B]">
              {client.company} · <strong className="text-[#111111]">{client.segment}</strong> · Responsável:{" "}
              <span className="font-semibold text-[#111111]">{client.contactPerson}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/agenda">
            <Button
              variant="outline"
              size="sm"
              icon={<ClockIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
            >
              Agendar Reunião
            </Button>
          </Link>
          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
            Nova Ação
          </Button>
        </div>
      </div>

      {/* Workspace 8-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-white p-2 rounded-xl border border-[#E4E4E7]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-[#111111] text-white shadow-xs"
                  : "bg-[#FAFAFA] text-[#52525B] hover:text-[#111111] hover:bg-[#F4F4F5]"
              }`}
            >
              <span className={isActive ? "text-[#4A8237]" : "text-[#71717A]"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[rgba(74,130,55,0.1)] text-[#4A8237]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
