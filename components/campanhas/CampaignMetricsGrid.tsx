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
      <Card padding="sm" className="space-y-1 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
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
      <Card padding="sm" className="space-y-1 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
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
        <span className="text-[10px] font-mono uppercase text-subtle block">
          ROAS Médio
        </span>
        <div className="text-lg font-bold font-mono text-accent">
          {stats.averageRoas}x
        </div>
        <span className="text-[10px] text-muted">Retorno s/ anúncio</span>
      </Card>

      {/* ROI Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          ROI Médio
        </span>
        <div className="text-lg font-bold font-mono text-accent">
          +{stats.averageRoiPercentage}%
        </div>
        <span className="text-[10px] text-muted">Lucratividade</span>
      </Card>

      {/* CAC Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          CAC Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          R$ {stats.averageCac.toFixed(2)}
        </div>
        <span className="text-[10px] text-muted">Custo por Aquisição</span>
      </Card>

      {/* CPL Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          CPL Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          R$ {stats.averageCpl.toFixed(2)}
        </div>
        <span className="text-[10px] text-muted">Custo por Lead</span>
      </Card>

      {/* CTR Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          CTR Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          {stats.averageCtr}%
        </div>
        <span className="text-[10px] text-muted">Taxa de Clique</span>
      </Card>

      {/* CPM Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          CPM Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          R$ {stats.averageCpm.toFixed(2)}
        </div>
        <span className="text-[10px] text-muted">Por 1.000 impr.</span>
      </Card>

      {/* CPA Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          CPA Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          R$ {stats.averageCpa.toFixed(2)}
        </div>
        <span className="text-[10px] text-muted">Custo por Ação</span>
      </Card>

      {/* Total Conversões */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Conversões
        </span>
        <div className="text-lg font-bold font-mono text-accent">
          {stats.totalConversions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-muted">Vendas/Ações</span>
      </Card>

      {/* Total Leads */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Leads Totais
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          {stats.totalLeads.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-muted">Contatos capturados</span>
      </Card>

      {/* Campanhas Ativas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Campanhas Ativas
        </span>
        <div className="text-lg font-bold font-mono text-accent">
          {stats.activeCampaignsCount}
        </div>
        <span className="text-[10px] text-muted">Rodando agora</span>
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
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Finalizadas
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          {stats.completedCampaignsCount}
        </div>
        <span className="text-[10px] text-muted">Histórico</span>
      </Card>
    </div>
  );
}
