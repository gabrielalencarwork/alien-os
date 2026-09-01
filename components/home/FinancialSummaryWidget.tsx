"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { WalletIcon, ChevronRightIcon } from "@/components/icons";
import { financialRepository, FinancialKpis } from "@/lib/repositories/financialRepository";

export function FinancialSummaryWidget() {
  const [kpis, setKpis] = useState<FinancialKpis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKpis() {
      try {
        const data = await financialRepository.getKpis();
        setKpis(data);
      } catch (err) {
        console.error("Erro ao carregar KPIs financeiros:", err);
      } finally {
        setLoading(false);
      }
    }

    loadKpis();
  }, []);

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <WalletIcon className="w-4 h-4 text-[#111111]" />
          <h3 className="text-base font-bold text-[#111111]">
            Resumo Financeiro Consolidado
          </h3>
        </div>
        <Link
          href="/financeiro"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:text-[#4A8237] transition-colors"
        >
          <span>Abrir Módulo Financeiro</span>
          <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* MRR Consolidado */}
        <div className="p-4 rounded-xl bg-[#111111] text-white space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
            MRR Consolidado
          </span>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {loading ? "..." : formatCurrency(kpis?.mrr || 0)}
          </div>
          <span className="text-[11px] text-zinc-400 font-mono block">
            {kpis?.activeClientsCount ? `${kpis.activeClientsCount} contratos ativos` : "Sem contratos ativos"}
          </span>
        </div>

        {/* ARR / Projeção Anual */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-medium block">
            ARR (Receita Anual Projetada)
          </span>
          <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight">
            {loading ? "..." : formatCurrency(kpis?.arr || 0)}
          </div>
          <span className="text-[11px] text-[#4A8237] font-mono font-semibold block">
            Ticket Médio: {formatCurrency(kpis?.averageTicket || 0)}
          </span>
        </div>

        {/* Pagamentos Pendentes */}
        <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-medium block">
            Faturas em Aberto / Pendentes
          </span>
          <div className="text-2xl font-bold font-mono text-[#111111] tracking-tight">
            {loading ? "..." : formatCurrency(kpis?.pendingPaymentsTotal || 0)}
          </div>
          <span className="text-[11px] text-[#71717A] font-mono block">
            {kpis?.pendingPaymentsCount ? `${kpis.pendingPaymentsCount} faturas pendentes` : "Nenhuma fatura em aberto"}
          </span>
        </div>
      </div>
    </Card>
  );
}
