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
      <Card padding="sm" className="space-y-1 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
          Conectadas
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {stats.connectedProvidersCount} / {stats.availableApisCount}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">APIs operacionais</span>
      </Card>

      {/* Plataformas Pendentes */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Pendentes
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.pendingProvidersCount}
        </div>
        <span className="text-[10px] text-muted">Aguardando OAuth</span>
      </Card>

      {/* Última Sincronização */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Última Sync
        </span>
        <div className="text-sm font-bold font-mono text-accent truncate">
          {stats.lastGlobalSyncTime}
        </div>
        <span className="text-[10px] text-muted">Sincronização global</span>
      </Card>

      {/* Contas Vinculadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Contas Vinculadas
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.totalLinkedAccountsCount}
        </div>
        <span className="text-[10px] text-muted">BMs, CIDs e Pixels</span>
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
        <span className="text-[10px] font-mono uppercase text-subtle block">
          APIs Disponíveis
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.availableApisCount}
        </div>
        <span className="text-[10px] text-muted">Conectores oficiais</span>
      </Card>

      {/* Status Geral */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Status Geral
        </span>
        <div className="text-xl font-bold font-mono text-accent">
          {stats.generalOperationalPercentage}%
        </div>
        <span className="text-[10px] text-muted">Saúde da infra</span>
      </Card>
    </div>
  );
}
