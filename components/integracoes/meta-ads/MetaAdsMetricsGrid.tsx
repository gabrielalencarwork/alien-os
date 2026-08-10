import React from "react";
import { Card } from "@/components/Card";
import { MetaAdsDashboardMetrics } from "@/lib/repositories/metaAdsRepository";

export interface MetaAdsMetricsGridProps {
  metrics: MetaAdsDashboardMetrics;
}

export function MetaAdsMetricsGrid({ metrics }: MetaAdsMetricsGridProps) {
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
        <span className="text-[10px] text-zinc-300 font-mono block">Meta Spend</span>
      </Card>

      {/* Impressões */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Impressões
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalImpressions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A]">Exibições Feed & Stories</span>
      </Card>

      {/* Cliques */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Cliques no Link
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalClicks.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A]">Outbound Clicks</span>
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

      {/* CPC Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CPC Médio
        </span>
        <div className="text-base font-bold font-mono text-[#111111]">
          R$ {metrics.averageCpc.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A]">Custo por clique</span>
      </Card>

      {/* Frequência Média */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
          Frequência
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageFrequency}x
        </div>
        <span className="text-[10px] text-zinc-300 font-mono">Repetição público</span>
      </Card>

      {/* Conversões */}
      <Card padding="sm" className="space-y-1 bg-[rgba(74,130,55,0.08)] border-[#4A8237]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-bold block">
          Conversões
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalConversions}
        </div>
        <span className="text-[10px] text-[#4A8237] font-mono font-semibold">Compras Pixel / CAPI</span>
      </Card>

      {/* ROAS */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          ROAS Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageRoas}x
        </div>
        <span className="text-[10px] text-[#71717A]">Retorno Meta Ads</span>
      </Card>
    </div>
  );
}
