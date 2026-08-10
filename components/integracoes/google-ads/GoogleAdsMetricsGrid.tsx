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
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Investimento
        </span>
        <div className="text-[#4A8237] text-base font-bold font-mono tracking-tight">
          R$ {metrics.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">Custo acumulado</span>
      </Card>

      {/* Impressões */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Impressões
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalImpressions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A]">Exibições</span>
      </Card>

      {/* Cliques */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Cliques
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalClicks.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A]">Visitas</span>
      </Card>

      {/* CTR */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CTR Média
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageCtr}%
        </div>
        <span className="text-[10px] text-[#71717A]">Taxa de clique</span>
      </Card>

      {/* Optimization Score */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
          Opt. Score
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageOptimizationScore}%
        </div>
        <span className="text-[10px] text-zinc-300 font-mono">Qualidade Conta</span>
      </Card>

      {/* Search Impression Share */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Search Imp. Share
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.averageSearchImpressionShare}%
        </div>
        <span className="text-[10px] text-[#71717A]">Participação Busca</span>
      </Card>

      {/* Conversões Totais (All Conversions) */}
      <Card padding="sm" className="space-y-1 bg-[rgba(74,130,55,0.08)] border-[#4A8237]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-bold block">
          Todas Conversões
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalAllConversions}
        </div>
        <span className="text-[10px] text-[#4A8237] font-mono font-semibold">Diretas + Assistidas</span>
      </Card>

      {/* ROAS */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          ROAS Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageRoas}x
        </div>
        <span className="text-[10px] text-[#71717A]">Retorno Mídia</span>
      </Card>
    </div>
  );
}
