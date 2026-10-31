"use client";

import React, { useState } from "react";
import { ClientEditModal } from "./ClientEditModal";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import {
  ChevronRightIcon,
  BotIcon,
  LayoutDashboardIcon,
  RocketIcon,
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
  const [editing, setEditing] = useState(false);
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
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </span>
          <span>Voltar para Lista de Clientes</span>
        </Link>
      </div>

      {/* Main Workspace Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-line">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="alien" showDot>
              {client.journeyStage}
            </Badge>
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
              Growth Workspace: {client.name}
            </h1>
            <p className="text-sm text-body">
              {client.company} · <strong className="text-ink">{client.segment}</strong>
              {client.contactPerson && (
                <>
                  {" "}· Contato: <span className="font-semibold text-ink">{client.contactPerson}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/agenda">
            <Button
              variant="outline"
              size="sm"
              icon={<ClockIcon className="w-3.5 h-3.5 text-accent" />}
            >
              Agendar Reunião
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => setEditing(true)}>
            Editar dados
          </Button>
          {editing && <ClientEditModal companyId={client.id} open onClose={() => setEditing(false)} />}
        </div>
      </div>

      {/* Workspace 8-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-surface p-2 rounded-xl border border-line">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-inverse text-white shadow-xs"
                  : "bg-canvas text-body hover:text-ink hover:bg-raised"
              }`}
            >
              <span className={isActive ? "text-accent" : "text-muted"}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-accent/10 text-accent"
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
