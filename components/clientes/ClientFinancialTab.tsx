"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import {
  WalletIcon,
  TrendingUpIcon,
  FileTextIcon,
  CheckCircle2Icon,
  ClockIcon,
  ArrowUpRightIcon,
  PlusIcon,
} from "@/components/icons";

export interface ClientFinancialTabProps {
  client: Cliente;
}

export function ClientFinancialTab({ client }: ClientFinancialTabProps) {
  const [manualRevenue, setManualRevenue] = useState<string>(client.generatedRevenue || "R$ 485.000");

  const contractInfo = {
    contractNumber: "CT-2025-089",
    monthlyValue: "R$ 25.000 / mês",
    startDate: "15/01/2025",
    duration: "12 meses",
    renewalDate: "15/01/2026",
    status: "Ativo",
    paymentMethod: "PIX / Boleto bancário",
  };

  const invoiceHistory = [
    {
      id: "inv-01",
      date: "05/08/2026",
      amount: "R$ 25.000,00",
      status: "A Vencer",
      method: "PIX",
      services: "Mídia + Branding + CRM",
    },
    {
      id: "inv-02",
      date: "05/07/2026",
      amount: "R$ 25.000,00",
      status: "Pago",
      method: "PIX",
      services: "Mídia + Branding + CRM",
    },
    {
      id: "inv-03",
      date: "05/06/2026",
      amount: "R$ 25.000,00",
      status: "Pago",
      method: "Boleto",
      services: "Mídia + Branding + CRM",
    },
    {
      id: "inv-04",
      date: "05/05/2026",
      amount: "R$ 25.000,00",
      status: "Pago",
      method: "PIX",
      services: "Mídia + Branding + CRM",
    },
  ];

  const servicesBreakdown = [
    { name: "Gestão de Tráfego Pago (Meta & Google)", value: "R$ 12.000", status: "Ativo", manager: "Lucas Mendes", generated: "R$ 310.000" },
    { name: "CRM & Automação de Vendas (Klaviyo)", value: "R$ 7.500", status: "Ativo", manager: "Matheus Silva", generated: "R$ 115.000" },
    { name: "Branding & Produção de Criativos UGC", value: "R$ 5.500", status: "Ativo", manager: "Fernanda Lima", generated: "R$ 60.000" },
  ];

  const mediaInvestments = [
    { platform: "Meta Ads (Instagram & Facebook)", currentBudget: "R$ 20.000 / mês", roas: "5.2x", cpa: "R$ 24,50" },
    { platform: "Google Ads (Search & Performance Max)", currentBudget: "R$ 10.000 / mês", roas: "4.1x", cpa: "R$ 31,00" },
    { platform: "TikTok Ads (Estrutura Inicial)", currentBudget: "R$ 3.000 / mês", roas: "3.2x", cpa: "R$ 42,00" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Financeiro do Cliente & Contrato */}
      <Card className="border-[#E4E4E7] bg-white space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4F4F5]">
          <div>
            <div className="flex items-center gap-2">
              <WalletIcon className="w-4 h-4 text-[#4A8237]" />
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Consolidado Financeiro & Contrato: {client.name}
              </h3>
              <Badge variant="alien" size="sm" showDot>
                Contrato Ativo
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Gestão de mensalidade, histórico de cobranças, gastos de mídia e faturamento acumulado
            </p>
          </div>

          <Badge variant="dark" size="sm">
            Status da Conta: Em dia
          </Badge>
        </div>

        {/* Contract Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#111111] text-white space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
              Mensalidade MRR
            </span>
            <div className="text-lg font-bold font-mono text-white">
              {contractInfo.monthlyValue}
            </div>
            <span className="text-[10px] text-zinc-300">Fee Fixo</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Número do Contrato
            </span>
            <div className="text-sm font-bold font-mono text-[#111111]">
              {contractInfo.contractNumber}
            </div>
            <span className="text-[10px] text-[#71717A]">Documento assinado</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Data de Início
            </span>
            <div className="text-sm font-semibold text-[#111111]">
              {contractInfo.startDate}
            </div>
            <span className="text-[10px] text-[#71717A]">Vigência: {contractInfo.duration}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Próxima Renovação
            </span>
            <div className="text-sm font-semibold text-[#111111]">
              {contractInfo.renewalDate}
            </div>
            <span className="text-[10px] text-[#4A8237] font-semibold">Em 5 meses</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Método de Pagamento
            </span>
            <div className="text-xs font-semibold text-[#111111]">
              {contractInfo.paymentMethod}
            </div>
            <span className="text-[10px] text-[#71717A]">Vencimento dia 05</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Receita Total Gerada
            </span>
            <div className="text-lg font-bold font-mono text-[#4A8237]">
              {manualRevenue}
            </div>
            <span className="text-[10px] text-[#71717A]">Acumulado na conta</span>
          </div>
        </div>
      </Card>

      {/* 2. Histórico Cronológico de Faturas & Pagamentos */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-[#111111]" />
            <h4 className="text-sm font-bold text-[#111111]">
              Histórico Cronológico de Cobranças & Faturas
            </h4>
          </div>
          <Badge variant="outline" size="sm">
            {invoiceHistory.length} Faturas Registradas
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-2.5 px-3 font-semibold">Data de Vencimento</th>
                <th className="py-2.5 px-3 font-semibold">Valor da Fatura</th>
                <th className="py-2.5 px-3 font-semibold">Situação</th>
                <th className="py-2.5 px-3 font-semibold">Método de Pagamento</th>
                <th className="py-2.5 px-3 font-semibold">Serviços Incluídos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5] text-xs">
              {invoiceHistory.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#FAFAFA]">
                  <td className="py-3 px-3 font-mono font-medium text-[#111111]">
                    {inv.date}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#111111]">
                    {inv.amount}
                  </td>
                  <td className="py-3 px-3">
                    <Badge
                      variant={inv.status === "Pago" ? "alien" : "dark"}
                      size="sm"
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-[#52525B]">
                    {inv.method}
                  </td>
                  <td className="py-3 px-3 text-[#71717A]">
                    {inv.services}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. Tabela de Serviços Contratados vs Receita Gerada */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#E4E4E7] bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
            <h4 className="text-sm font-bold text-[#111111]">
              Serviços Contratados & Receita Gerada (Campo Manual)
            </h4>
            <Badge variant="alien" size="sm">
              3 Serviços
            </Badge>
          </div>

          <div className="space-y-3">
            {servicesBreakdown.map((srv, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">
                    {srv.name}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#4A8237]">
                    {srv.value}/mês
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#71717A]">
                  <span>Responsável: {srv.manager}</span>
                  <span>Receita Gerada: <strong className="text-[#111111]">{srv.generated}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 4. Estrutura de Investimento em Mídia (Meta, Google, TikTok Ads) */}
        <Card className="border-[#E4E4E7] bg-white space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
            <h4 className="text-sm font-bold text-[#111111]">
              Investimento em Mídia Ativo (Meta, Google & TikTok)
            </h4>
            <Badge variant="dark" size="sm">
              R$ 33.000 / mês
            </Badge>
          </div>

          <div className="space-y-3">
            {mediaInvestments.map((med, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <h5 className="text-xs font-bold text-[#111111]">
                    {med.platform}
                  </h5>
                  <span className="text-[10px] font-mono text-[#71717A]">
                    Orçamento: {med.currentBudget}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-[#4A8237] block">
                    ROAS {med.roas}
                  </span>
                  <span className="text-[10px] text-[#71717A]">
                    CPA: {med.cpa}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 5. KPIs Financeiros da Conta (ROI, ROAS, CAC, CPL) */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <h4 className="text-sm font-bold text-[#111111]">
            KPIs Financeiros de Performance (Estrutura Pronta para APIs)
          </h4>
          <span className="text-xs font-mono text-[#4A8237] font-semibold">
            Integrado com Meta Ads / GA4
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
              ROI Consolidado
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              {client.currentRoi}
            </div>
            <span className="text-[10px] text-[#71717A]">Retorno de Operação</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
              ROAS Médio
            </span>
            <div className="text-xl font-bold font-mono text-[#4A8237]">
              {client.currentRoas}
            </div>
            <span className="text-[10px] text-[#71717A]">Retorno sobre Anúncios</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
              CAC Mídia (Custo por Cliente)
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              R$ 28,60
            </div>
            <span className="text-[10px] text-[#71717A]">Meta Ads + Google</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
              CPL Médio (Custo por Lead)
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              R$ 4,80
            </div>
            <span className="text-[10px] text-[#71717A]">Captação Qualificada</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
