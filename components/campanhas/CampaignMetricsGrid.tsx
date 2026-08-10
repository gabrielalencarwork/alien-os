import React from "react";
import { Card } from "@/components/Card";
import { CampaignStats } from "@/lib/repositories/campaignRepository";

export interface CampaignMetricsGridProps {
  stats: CampaignStats;
}

export function CampaignMetricsGrid({ stats }: CampaignMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {/* Investimento Total */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Investimento Total
        </span>
        <div className="text-lg font-bold font-mono text-white tracking-tight">
          R$ {stats.totalSpent.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Mídia Paga Acumulada
        </span>
      </Card>

      {/* Receita Gerada */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Receita Gerada
        </span>
        <div className="text-lg font-bold font-mono text-white tracking-tight">
          R$ {stats.totalRevenue.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Atribuição de Vendas
        </span>
      </Card>

      {/* ROAS Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          ROAS Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          {stats.averageRoas}x
        </div>
        <span className="text-[10px] text-[#71717A]">Retorno s/ anúncio</span>
      </Card>

      {/* ROI Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          ROI Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          +{stats.averageRoiPercentage}%
        </div>
        <span className="text-[10px] text-[#71717A]">Lucratividade</span>
      </Card>

      {/* CAC Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CAC Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          R$ {stats.averageCac.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A]">Custo por Aquisição</span>
      </Card>

      {/* CPL Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CPL Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          R$ {stats.averageCpl.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A]">Custo por Lead</span>
      </Card>

      {/* CTR Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CTR Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          {stats.averageCtr}%
        </div>
        <span className="text-[10px] text-[#71717A]">Taxa de Clique</span>
      </Card>

      {/* CPM Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CPM Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          R$ {stats.averageCpm.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A]">Por 1.000 impr.</span>
      </Card>

      {/* CPA Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          CPA Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          R$ {stats.averageCpa.toFixed(2)}
        </div>
        <span className="text-[10px] text-[#71717A]">Custo por Ação</span>
      </Card>

      {/* Total Conversões */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Conversões
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          {stats.totalConversions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A]">Vendas/Ações</span>
      </Card>

      {/* Total Leads */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Leads Totais
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          {stats.totalLeads.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-[#71717A]">Contatos capturados</span>
      </Card>

      {/* Campanhas Ativas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Campanhas Ativas
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          {stats.activeCampaignsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Rodando agora</span>
      </Card>

      {/* Pausadas */}
      <Card padding="sm" className="space-y-1 bg-amber-50/40 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Pausadas
        </span>
        <div className="text-lg font-bold font-mono text-amber-950">
          {stats.pausedCampaignsCount}
        </div>
        <span className="text-[10px] text-amber-800 font-mono">Standby</span>
      </Card>

      {/* Finalizadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Finalizadas
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          {stats.completedCampaignsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Histórico</span>
      </Card>
    </div>
  );
}
