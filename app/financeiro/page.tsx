"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  financialRepository,
  FinancialKpis,
  Contract,
  Invoice,
  ClientFinancialSummary,
  AlienMaxFinancialInsight,
} from "@/lib/repositories/financialRepository";
import { FinancialMetricsGrid } from "@/components/financeiro/FinancialMetricsGrid";
import { InvoicesBillingWidget } from "@/components/financeiro/InvoicesBillingWidget";
import { ContractsManagementWidget } from "@/components/financeiro/ContractsManagementWidget";
import { AlienMaxFinancialAdvisorWidget } from "@/components/financeiro/AlienMaxFinancialAdvisorWidget";
import {
  WalletIcon,
  SearchIcon,
  PlusIcon,
  FileTextIcon,
  ClockIcon,
  TrendingUpIcon,
  ChevronRightIcon,
} from "@/components/icons";

export default function FinanceiroPage() {
  const [kpis, setKpis] = useState<FinancialKpis | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clientSummaries, setClientSummaries] = useState<ClientFinancialSummary[]>([]);
  const [insights, setInsights] = useState<AlienMaxFinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state for Clients Table
  const [clientSearch, setClientSearch] = useState("");
  const [activeClientFilter, setActiveClientFilter] = useState("Todos");
  const [activeTab, setActiveTab] = useState<"overview" | "cobranças" | "contratos" | "clientes">("overview");

  useEffect(() => {
    async function loadFinancialData() {
      try {
        const [kpiRes, contractRes, invoiceRes, summaryRes, insightRes] = await Promise.all([
          financialRepository.getKpis(),
          financialRepository.getContracts(),
          financialRepository.getInvoices(),
          financialRepository.getClientSummaries(),
          financialRepository.getAlienMaxInsights(),
        ]);

        setKpis(kpiRes);
        setContracts(contractRes);
        setInvoices(invoiceRes);
        setClientSummaries(summaryRes);
        setInsights(insightRes);
      } finally {
        setLoading(false);
      }
    }
    loadFinancialData();
  }, []);

  const filteredClientSummaries = clientSummaries.filter((c) => {
    const matchesSearch =
      c.clientName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.companyName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.accountManager.toLowerCase().includes(clientSearch.toLowerCase());

    if (!matchesSearch) return false;

    if (activeClientFilter === "Em dia") return c.status === "Em dia";
    if (activeClientFilter === "A vencer") return c.status === "A vencer";
    if (activeClientFilter === "Em atraso") return c.status === "Em atraso";
    if (activeClientFilter === "Cancelado") return c.status === "Cancelado";

    return true;
  });

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header do Módulo Financeiro */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 12 · Módulo Financeiro
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  Operação Financeira Alien OS
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Gestão Financeira & MRR
              </h1>
              <p className="text-sm text-body">
                Acompanhamento completo de contratos, mensalidades, cobranças, reajustes e projeção de faturamento
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button variant="primary" size="md" icon={<PlusIcon className="w-4 h-4" />}>
                Nova Fatura / Contrato
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-surface p-2 rounded-xl border border-line">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-inverse text-white"
                  : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Visão Geral Executiva
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cobranças")}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === "cobranças"
                  ? "bg-inverse text-white"
                  : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Gestão de Cobranças
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("contratos")}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === "contratos"
                  ? "bg-inverse text-white"
                  : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Gestão de Contratos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("clientes")}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === "clientes"
                  ? "bg-inverse text-white"
                  : "bg-canvas text-body hover:text-ink"
              }`}
            >
              Financeiro por Cliente
            </button>
          </div>
        </section>

        {/* 2. Executive Indicators Dashboard */}
        {loading || !kpis ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Carregando dados financeiros da agência...</span>
          </div>
        ) : (
          <>
            <section>
              <FinancialMetricsGrid kpis={kpis} />
            </section>

            {/* 3. Main Grid (Left Content + Right Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {(activeTab === "overview" || activeTab === "cobranças") && (
                  <InvoicesBillingWidget invoices={invoices} />
                )}

                {(activeTab === "overview" || activeTab === "contratos") && (
                  <ContractsManagementWidget contracts={contracts} />
                )}

                {(activeTab === "overview" || activeTab === "clientes") && (
                  /* 4. Gestão Financeira dos Clientes (Tabela) */
                  <Card className="border-line bg-surface space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
                      <div>
                        <div className="flex items-center gap-2">
                          <WalletIcon className="w-4 h-4 text-ink" />
                          <h3 className="text-base font-bold text-ink tracking-tight">
                            Gestão Financeira por Cliente
                          </h3>
                        </div>
                        <p className="text-xs text-muted mt-0.5">
                          Acompanhamento individual de mensalidades, vencimentos e reajustes
                        </p>
                      </div>

                      {/* Filter Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                        {["Todos", "Em dia", "A vencer", "Em atraso", "Cancelado"].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => setActiveClientFilter(st)}
                            className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                              activeClientFilter === st
                                ? "bg-inverse text-white"
                                : "bg-raised text-body hover:text-ink"
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
                            <th className="py-3 px-3 font-semibold">Cliente & Empresa</th>
                            <th className="py-3 px-3 font-semibold">Serviços Contratados</th>
                            <th className="py-3 px-3 font-semibold">Valor Mensal</th>
                            <th className="py-3 px-3 font-semibold">Vencimento</th>
                            <th className="py-3 px-3 font-semibold">Situação</th>
                            <th className="py-3 px-3 font-semibold">Tempo de Contrato</th>
                            <th className="py-3 px-3 font-semibold">Próximo Reajuste</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line-soft text-xs">
                          {filteredClientSummaries.map((cs) => (
                            <tr key={cs.clientId} className="hover:bg-canvas transition-colors">
                              <td className="py-3 px-3">
                                <span className="font-bold text-ink block">{cs.clientName}</span>
                                <span className="text-[10px] text-muted block">{cs.companyName}</span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1 flex-wrap">
                                  {cs.contractedServices.map((srv, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] font-mono text-body bg-raised px-1.5 py-0.5 rounded border border-line"
                                    >
                                      {srv}
                                    </span>
                                  ))}
                                </div>
                              </td>

                              <td className="py-3 px-3 font-mono font-bold text-ink">
                                R$ {cs.monthlyFee.toLocaleString("pt-BR")} /mês
                              </td>

                              <td className="py-3 px-3 font-mono text-body">
                                {cs.dueDate}
                              </td>

                              <td className="py-3 px-3">
                                <Badge
                                  variant={
                                    cs.status === "Em dia"
                                      ? "alien"
                                      : cs.status === "Em atraso"
                                      ? "dark"
                                      : "gray"
                                  }
                                  size="sm"
                                  className={
                                    cs.status === "Em atraso"
                                      ? "bg-red-950 text-red-200 border-red-800"
                                      : ""
                                  }
                                >
                                  {cs.status}
                                </Badge>
                              </td>

                              <td className="py-3 px-3 text-body">
                                {cs.contractTimeMonths} meses
                              </td>

                              <td className="py-3 px-3 font-mono text-muted">
                                {cs.nextAdjustmentDate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}

                {/* 5. Gráficos & Distribuição Financeira */}
                {activeTab === "overview" && (
                  <Card className="border-line bg-surface space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-line-soft">
                      <div className="flex items-center gap-2">
                        <TrendingUpIcon className="w-4 h-4 text-accent" />
                        <h3 className="text-base font-bold text-ink">
                          Distribuição de Receita por Serviço & Segmento
                        </h3>
                      </div>
                      <Badge variant="alien" size="sm">
                        MRR Consolidado
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Receita por Serviço */}
                      <div className="p-4 rounded-xl bg-canvas border border-line space-y-3">
                        <h4 className="text-xs font-bold text-ink">
                          Receita por Serviço Contratado
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>Gestão de Tráfego Pago</span>
                              <span className="font-mono font-bold text-accent">R$ 85.000 (46%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: "46%" }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>CRM & Automações de Vendas</span>
                              <span className="font-mono font-bold text-ink">R$ 48.000 (26%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                              <div className="h-full bg-inverse rounded-full" style={{ width: "26%" }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>Branding & Produção de Vídeos</span>
                              <span className="font-mono font-bold text-ink">R$ 32.000 (17%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                              <div className="h-full bg-zinc-600 rounded-full" style={{ width: "17%" }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Receita por Segmento */}
                      <div className="p-4 rounded-xl bg-canvas border border-line space-y-3">
                        <h4 className="text-xs font-bold text-ink">
                          Receita por Segmento de Mercado
                        </h4>
                        <div className="space-y-2 text-xs">
                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>E-commerce & D2C</span>
                              <span className="font-mono font-bold text-accent">R$ 95.000 (51%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                              <div className="h-full bg-accent rounded-full" style={{ width: "51%" }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>SaaS & B2B Software</span>
                              <span className="font-mono font-bold text-ink">R$ 55.000 (30%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                              <div className="h-full bg-inverse rounded-full" style={{ width: "30%" }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>Serviços de Alto Ticket</span>
                              <span className="font-mono font-bold text-ink">R$ 35.000 (19%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                              <div className="h-full bg-zinc-600 rounded-full" style={{ width: "19%" }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Right Column: Alien Max Financial Advisor Side Panel (1 Col) */}
              <div className="space-y-6">
                <AlienMaxFinancialAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
