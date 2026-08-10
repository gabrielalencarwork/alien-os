import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { WalletIcon, TrendingUpIcon, DollarIcon } from "@/components/icons";

export function FinancialSummaryWidget() {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-4 h-4 text-[#111111]" />
          <h3 className="text-base font-bold text-[#111111]">
            Resumo Financeiro Consolidado
          </h3>
        </div>
        <Badge variant="alien" size="sm" showDot>
          Previsão Q3-2026
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* MRR Consolidado */}
        <div className="p-4 rounded-xl bg-[#111111] text-white space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
            MRR Consolidado
          </span>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            R$ 185.000
          </div>
          <span className="text-[11px] text-zinc-400 font-mono block">
            +18.4% no último trimestre
          </span>
        </div>

        {/* Receita Gerada Clientes */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-medium block">
            Receita Mensal Gerada
          </span>
          <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight">
            R$ 3.840.000
          </div>
          <span className="text-[11px] text-[#4A8237] font-mono font-semibold block">
            Acumulado nos Clientes
          </span>
        </div>

        {/* Recebimentos Previstos */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-medium block">
            Previsão de Recebimentos
          </span>
          <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight">
            R$ 62.500
          </div>
          <span className="text-[11px] text-[#71717A] font-mono block">
            Vencimentos esta semana
          </span>
        </div>
      </div>
    </Card>
  );
}
