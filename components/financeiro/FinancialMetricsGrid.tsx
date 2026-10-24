import React from "react";
import { Card } from "@/components/Card";
import { FinancialKpis } from "@/lib/repositories/financialRepository";
import { DollarIcon, TrendingUpIcon, UsersIcon, WalletIcon } from "@/components/icons";

export interface FinancialMetricsGridProps {
  kpis: FinancialKpis;
}

export function FinancialMetricsGrid({ kpis }: FinancialMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
      {/* MRR */}
      <Card padding="sm" className="space-y-1 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
          MRR Mensal
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          R$ {(kpis.mrr / 1000).toFixed(0)}k
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Receita Recorrente
        </span>
      </Card>

      {/* ARR */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          ARR Anual
        </span>
        <div className="text-xl font-bold font-mono text-ink tracking-tight">
          R$ {(kpis.arr / 1000000).toFixed(2)}M
        </div>
        <span className="text-[10px] text-muted font-mono block">
          Taxa Anualizada
        </span>
      </Card>

      {/* Receita Prevista */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Receita Prevista
        </span>
        <div className="text-lg font-bold font-mono text-accent truncate">
          R$ {(kpis.projectedRevenue / 1000000).toFixed(2)}M
        </div>
        <span className="text-[10px] text-muted">Projeção 12m</span>
      </Card>

      {/* Clientes Ativos */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Clientes Ativos
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {kpis.activeClientsCount}
        </div>
        <span className="text-[10px] text-muted">Carteira Fee Fixo</span>
      </Card>

      {/* Ticket Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Ticket Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          R$ {(kpis.averageTicket / 1000).toFixed(1)}k
        </div>
        <span className="text-[10px] text-muted">Por Contrato</span>
      </Card>

      {/* LTV Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          LTV Médio
        </span>
        <div className="text-lg font-bold font-mono text-ink">
          R$ {(kpis.averageLtv / 1000).toFixed(0)}k
        </div>
        <span className="text-[10px] text-muted">Lifetime Value</span>
      </Card>

      {/* Pagamentos Pendentes */}
      <Card padding="sm" className="space-y-1 bg-amber-50/50 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Pendentes
        </span>
        <div className="text-lg font-bold font-mono text-amber-950">
          R$ {(kpis.pendingPaymentsTotal / 1000).toFixed(0)}k
        </div>
        <span className="text-[10px] text-amber-800">
          {kpis.pendingPaymentsCount} Faturas
        </span>
      </Card>

      {/* Churn Financeiro */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Churn Financeiro
        </span>
        <div className="text-xl font-bold font-mono text-accent">
          {kpis.financialChurnRate}%
        </div>
        <span className="text-[10px] text-muted">Retenção 98.8%</span>
      </Card>
    </div>
  );
}
