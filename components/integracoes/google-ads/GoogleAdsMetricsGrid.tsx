import React from "react";
import { Card } from "@/components/Card";
import { GoogleAdsDashboardMetrics } from "@/lib/repositories/googleAdsRepository";

export interface GoogleAdsMetricsGridProps {
  metrics: GoogleAdsDashboardMetrics;
}

export function GoogleAdsMetricsGrid({ metrics }: GoogleAdsMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* Investimento Total */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block text-center w-full">
          Investimento
        </span>
        <div className="text-accent text-base font-bold font-mono tracking-tight text-center w-full">
          R$ {metrics.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block text-center w-full">Custo acumulado</span>
      </Card>

      {/* Impressões */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-surface border-line">
        <span className="text-[10px] font-mono uppercase text-subtle block text-center w-full">
          Impressões
        </span>
        <div className="text-xl font-bold font-mono text-ink text-center w-full">
          {metrics.totalImpressions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-muted text-center w-full block">Exibições</span>
      </Card>

      {/* Cliques */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-surface border-line">
        <span className="text-[10px] font-mono uppercase text-subtle block text-center w-full">
          Cliques
        </span>
        <div className="text-xl font-bold font-mono text-ink text-center w-full">
          {metrics.totalClicks.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-muted text-center w-full block">Visitas</span>
      </Card>

      {/* CTR */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-surface border-line">
        <span className="text-[10px] font-mono uppercase text-subtle block text-center w-full">
          CTR Média
        </span>
        <div className="text-xl font-bold font-mono text-accent text-center w-full">
          {metrics.averageCtr}%
        </div>
        <span className="text-[10px] text-muted text-center w-full block">Taxa de clique</span>
      </Card>

      {/* Optimization Score */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase text-accent font-semibold block text-center w-full">
          Opt. Score
        </span>
        <div className="text-xl font-bold font-mono text-accent text-center w-full">
          {metrics.averageOptimizationScore}%
        </div>
        <span className="text-[10px] text-zinc-300 font-mono text-center w-full block">Qualidade Conta</span>
      </Card>

      {/* Search Impression Share */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-surface border-line">
        <span className="text-[10px] font-mono uppercase text-subtle block text-center w-full">
          Search Imp. Share
        </span>
        <div className="text-xl font-bold font-mono text-ink text-center w-full">
          {metrics.averageSearchImpressionShare}%
        </div>
        <span className="text-[10px] text-muted text-center w-full block">Participação Busca</span>
      </Card>

      {/* Conversões Totais (All Conversions) */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-accent/8 border-accent">
        <span className="text-[10px] font-mono uppercase text-accent font-bold block text-center w-full">
          Todas Conversões
        </span>
        <div className="text-xl font-bold font-mono text-ink text-center w-full">
          {metrics.totalAllConversions}
        </div>
        <span className="text-[10px] text-accent font-mono font-semibold text-center w-full block">Diretas + Assistidas</span>
      </Card>

      {/* ROAS */}
      <Card padding="sm" className="flex flex-col items-center justify-center text-center space-y-1.5 bg-surface border-line">
        <span className="text-[10px] font-mono uppercase text-subtle block text-center w-full">
          ROAS Médio
        </span>
        <div className="text-xl font-bold font-mono text-accent text-center w-full">
          {metrics.averageRoas}x
        </div>
        <span className="text-[10px] text-muted text-center w-full block">Retorno Mídia</span>
      </Card>
    </div>
  );
}
