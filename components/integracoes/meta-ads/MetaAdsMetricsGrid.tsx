import React from "react";
import { Card } from "@/components/Card";
import { MetaAdsDashboardMetrics } from "@/lib/repositories/metaAdsRepository";
import { MessageSquareIcon } from "@/components/icons";

export interface MetaAdsMetricsGridProps {
  metrics: MetaAdsDashboardMetrics;
}

export function MetaAdsMetricsGrid({ metrics }: MetaAdsMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {/* 1. Investimento Total */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Investimento
        </span>
        <div className="text-[#4A8237] text-base font-bold font-mono tracking-tight">
          R$ {metrics.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">Meta Spend</span>
      </Card>

      {/* 2. Conversas Iniciadas (WhatsApp / Direct / Messenger) */}
      <Card padding="sm" className="space-y-1 bg-[rgba(74,130,55,0.06)] border-[#4A8237] shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase text-[#4A8237] font-bold block">
            Conversas Iniciadas
          </span>
          <MessageSquareIcon className="w-3.5 h-3.5 text-[#4A8237]" />
        </div>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalMessagingConversations.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#4A8237] font-medium block">
          WhatsApp / Direct / Msg
        </span>
      </Card>

      {/* 3. Custo por Conversa (CPA Mensagem) */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Custo p/ Conversa
        </span>
        <div className="text-base font-bold font-mono text-[#111111]">
          R$ {metrics.costPerConversation.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A] block">CPA por conversa</span>
      </Card>

      {/* 4. Cliques no Link */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Cliques no Link
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalClicks.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A] block">Outbound Clicks</span>
      </Card>

      {/* 5. CTR Média */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CTR Média
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageCtr}%
        </div>
        <span className="text-[10px] text-[#71717A] block">Taxa de clique</span>
      </Card>

      {/* 6. CPC Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CPC Médio
        </span>
        <div className="text-base font-bold font-mono text-[#111111]">
          R$ {metrics.averageCpc.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A] block">Custo por clique</span>
      </Card>

      {/* 7. Impressões */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Impressões
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalImpressions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A] block">Exibições Feed & Stories</span>
      </Card>

      {/* 8. Frequência Média */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
          Frequência
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageFrequency}x
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">Repetição público</span>
      </Card>

      {/* 9. Conversões Pixel */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Conversões Pixel
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {metrics.totalConversions}
        </div>
        <span className="text-[10px] text-[#71717A] block">Compras / Forms / CAPI</span>
      </Card>

      {/* 10. ROAS Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          ROAS Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {metrics.averageRoas}x
        </div>
        <span className="text-[10px] text-[#71717A] block">Retorno Meta Ads</span>
      </Card>
    </div>
  );
}
