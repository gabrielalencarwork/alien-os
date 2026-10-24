"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Invoice } from "@/lib/repositories/financialRepository";
import { ClockIcon, SearchIcon } from "@/components/icons";

export interface InvoicesBillingWidgetProps {
  invoices: Invoice[];
}

export function InvoicesBillingWidget({ invoices }: InvoicesBillingWidgetProps) {
  const [activeTab, setActiveTab] = useState<string>("todos");
  const [search, setSearch] = useState("");

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.clientName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.servicesSummary.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    const todayStr = new Date().toISOString().split("T")[0];
    if (activeTab === "pagos") return inv.status === "Pago";
    if (activeTab === "pendentes") return inv.status === "Pendente" || inv.status === "A Vencer";
    if (activeTab === "hoje") return inv.dueDate === todayStr;
    if (activeTab === "semana") return inv.status === "A Vencer";
    if (activeTab === "atraso") return inv.status === "Em Atraso";
    return true;
  });

  const tabOptions = [
    { id: "todos", label: "Todas" },
    { id: "pagos", label: "Pagos" },
    { id: "pendentes", label: "Pendentes" },
    { id: "hoje", label: "Vencendo Hoje" },
    { id: "semana", label: "Vencendo esta Semana" },
    { id: "atraso", label: "Em Atraso" },
  ];

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-ink" />
            <h3 className="text-base font-bold text-ink tracking-tight">
              Gestão de Cobranças & Mensalidades (Invoices)
            </h3>
            <Badge variant="alien" size="sm">
              Conexão Gateways
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Acompanhamento em tempo real de faturas, liquidações e cobranças pendentes
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {tabOptions.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setActiveTab(tb.id)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tb.id
                  ? "bg-inverse text-white"
                  : "bg-raised text-body hover:text-ink"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar fatura por cliente ou número..."
          className="w-full pl-9 pr-4 py-2 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none transition-all"
        />
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Fatura / Contrato</th>
              <th className="py-3 px-3 font-semibold">Cliente & Empresa</th>
              <th className="py-3 px-3 font-semibold">Valor</th>
              <th className="py-3 px-3 font-semibold">Vencimento</th>
              <th className="py-3 px-3 font-semibold">Situação</th>
              <th className="py-3 px-3 font-semibold">Método de Pagamento</th>
              <th className="py-3 px-3 font-semibold">Serviços Incluídos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft text-xs">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-xs text-muted">
                  Nenhuma fatura encontrada.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-canvas transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-ink">
                    {inv.invoiceNumber}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-ink block">{inv.clientName}</span>
                    <span className="text-[10px] text-muted block">{inv.companyName}</span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-ink">
                    R$ {inv.amount.toLocaleString("pt-BR")}
                  </td>

                  <td className="py-3 px-3 font-mono text-body">
                    {inv.dueDate}
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        inv.status === "Pago"
                          ? "alien"
                          : inv.status === "Em Atraso"
                          ? "dark"
                          : "gray"
                      }
                      size="sm"
                      className={
                        inv.status === "Em Atraso"
                          ? "bg-red-950 text-red-200 border-red-800"
                          : ""
                      }
                    >
                      {inv.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-body">
                    {inv.paymentMethod}
                  </td>

                  <td className="py-3 px-3 text-muted max-w-xs truncate">
                    {inv.servicesSummary}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
