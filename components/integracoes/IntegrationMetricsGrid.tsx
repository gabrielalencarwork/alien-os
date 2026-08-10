import React from "react";
import { Card } from "@/components/Card";
import { IntegrationStats } from "@/lib/repositories/integrationRepository";

export interface IntegrationMetricsGridProps {
  stats: IntegrationStats;
}

export function IntegrationMetricsGrid({ stats }: IntegrationMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* Plataformas Conectadas */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Conectadas
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {stats.connectedProvidersCount} / {stats.availableApisCount}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">APIs operacionais</span>
      </Card>

      {/* Plataformas Pendentes */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Pendentes
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.pendingProvidersCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Aguardando OAuth</span>
      </Card>

      {/* Última Sincronização */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Última Sync
        </span>
        <div className="text-sm font-bold font-mono text-[#4A8237] truncate">
          {stats.lastGlobalSyncTime}
        </div>
        <span className="text-[10px] text-[#71717A]">Sincronização global</span>
      </Card>

      {/* Contas Vinculadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Contas Vinculadas
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.totalLinkedAccountsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">BMs, CIDs e Pixels</span>
      </Card>

      {/* Erros de Sincronização */}
      <Card padding="sm" className="space-y-1 bg-red-50/40 border-red-200">
        <span className="text-[10px] font-mono uppercase text-red-800 font-semibold block">
          Erros Sync
        </span>
        <div className="text-xl font-bold font-mono text-red-950">
          {stats.syncErrorsCount}
        </div>
        <span className="text-[10px] text-red-800 font-mono font-semibold">Exige ação</span>
      </Card>

      {/* Tokens Expirando */}
      <Card padding="sm" className="space-y-1 bg-amber-50/40 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Tokens Expirando
        </span>
        <div className="text-xl font-bold font-mono text-amber-950">
          {stats.expiringTokensCount}
        </div>
        <span className="text-[10px] text-amber-800 font-mono">Renovação OAuth</span>
      </Card>

      {/* APIs Disponíveis */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          APIs Disponíveis
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.availableApisCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Conectores oficiais</span>
      </Card>

      {/* Status Geral */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Status Geral
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.generalOperationalPercentage}%
        </div>
        <span className="text-[10px] text-[#71717A]">Saúde da infra</span>
      </Card>
    </div>
  );
}
