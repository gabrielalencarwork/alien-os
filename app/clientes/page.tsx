"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { financialRepository } from "@/lib/repositories/financialRepository";
import { marketingCoreRepository } from "@/lib/repositories/marketingCoreRepository";
import { ClientCrmKanban } from "@/components/clientes/ClientCrmKanban";
import {
  SearchIcon,
  PlusIcon,
  ChevronRightIcon,
  LayoutDashboardIcon,
  UsersIcon,
  BriefcaseIcon,
  WalletIcon,
} from "@/components/icons";

export default function ClientsPage() {
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("Todos");
  const [mrrTotal, setMrrTotal] = useState<number>(0);
  const [consolidatedRoas, setConsolidatedRoas] = useState<number>(0);

  const filterOptions = [
    "Todos",
    "Em Diagnóstico",
    "Em Execução",
    "Em Escala",
    "Alien Cases",
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsData, financialKpis, marketingDashboard] = await Promise.all([
          clientRepository.getAll(),
          financialRepository.getKpis(),
          marketingCoreRepository.getConsolidatedDashboard(),
        ]);
        setClients(clientsData);
        setMrrTotal(financialKpis?.mrr || 0);
        setConsolidatedRoas(marketingDashboard?.averageRoas || 0);
      } catch (err) {
        console.error("Erro ao carregar dados do CRM:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filtering Logic
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.segment.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === "Todos") return matchesSearch;
    if (activeFilter === "Alien Cases")
      return matchesSearch && client.journeyStage === "Case";
    return matchesSearch && client.journeyStage === activeFilter;
  });

  return (
    <PageContainer>
      {/* 1. Header / Topo CRM */}
      <section className="space-y-4 pt-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="alien" showDot>
                CRM Operacional de Agência
              </Badge>
              <span className="text-xs font-mono text-subtle">
                {clients.length} Empresas na Carteira
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-ink">
              Central de Clientes & CRM
            </h1>
            <p className="text-base text-body font-normal leading-relaxed">
              Gestão comercial, operacional e estratégica 360° de todas as contas da Alien.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher Toggle */}
            <div className="p-1 rounded-xl bg-surface border border-line flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "kanban"
                    ? "bg-inverse text-white"
                    : "text-body hover:text-ink"
                }`}
              >
                <LayoutDashboardIcon className="w-3.5 h-3.5" />
                <span>Pipeline (Kanban)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-inverse text-white"
                    : "text-body hover:text-ink"
                }`}
              >
                <BriefcaseIcon className="w-3.5 h-3.5" />
                <span>Tabela</span>
              </button>
            </div>

            <Link href="/clientes/novo">
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Nova Empresa
              </Button>
            </Link>
          </div>
        </div>

        {/* CRM Portfolio Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-subtle">
              MRR Total Contratado
            </span>
            <div className="text-xl font-bold font-mono text-ink">
              {mrrTotal > 0
                ? `R$ ${mrrTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / mês`
                : "R$ 0,00 / mês"}
            </div>
            <span className="text-[10px] text-accent font-semibold">
              {mrrTotal > 0 ? "Receita Recorrente" : "Nenhum contrato ativo"}
            </span>
          </Card>

          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-subtle">
              Contas Ativas em Escala
            </span>
            <div className="text-xl font-bold font-mono text-accent">
              {clients.filter((c) => c.journeyStage === "Escala" || c.journeyStage === "Case").length} Empresas
            </div>
            <span className="text-[10px] text-muted">Foco em Growth</span>
          </Card>

          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-subtle">
              ROAS Médio Consolidado
            </span>
            <div className="text-xl font-bold font-mono text-ink">
              {consolidatedRoas > 0 ? `${consolidatedRoas.toFixed(2)}x` : "0.0x"}
            </div>
            <span className="text-[10px] text-muted">Meta Ads + Google Ads</span>
          </Card>

          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-subtle">
              Clientes ativos
            </span>
            <div className="text-xl font-bold font-mono text-ink">{clients.length}</div>
            <span className="text-[10px] text-muted">Cadastrados no Alien OS</span>
          </Card>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter
                    ? "bg-inverse text-white"
                    : "bg-surface border border-line text-body hover:text-ink hover:bg-raised"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, segmento, responsável..."
              className="w-full pl-9 pr-4 py-2 bg-surface border border-line focus:border-accent rounded-lg text-xs text-ink placeholder:text-subtle outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* 2. CRM Content (Kanban vs Table) */}
      <section className="space-y-4">
        {loading ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Carregando CRM Operacional do Supabase...</span>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 bg-surface border border-line rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-line flex items-center justify-center mx-auto text-accent">
              <UsersIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-ink">Nenhum cliente cadastrado</h3>
              <p className="text-xs text-muted leading-relaxed">
                Inicie o cadastro do seu primeiro cliente para ativar o CRM da Jornada de Abdução e acompanhamento de indicadores.
              </p>
            </div>
            <div>
              <Link href="/clientes/novo">
                <Button variant="primary" size="md" icon={<PlusIcon className="w-4 h-4" />}>
                  Cadastrar Primeiro Cliente
                </Button>
              </Link>
            </div>
          </div>
        ) : viewMode === "kanban" ? (
          /* KANBAN CRM PIPELINE VIEW */
          <ClientCrmKanban clients={filteredClients} />
        ) : (
          /* TABLE VIEW */
          <div className="bg-surface border border-line rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-mono uppercase tracking-wider text-muted">
                  <th className="py-3 px-4 font-semibold">Cliente & Empresa</th>
                  <th className="py-3 px-4 font-semibold">Segmento</th>
                  <th className="py-3 px-4 font-semibold">Estágio do CRM</th>
                  <th className="py-3 px-4 font-semibold">Serviços Contratados</th>
                  <th className="py-3 px-4 font-semibold">ROAS</th>
                  <th className="py-3 px-4 font-semibold">Responsável</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft text-xs">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-canvas transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <Link href={`/clientes/${client.id}`} className="block">
                        <div className="font-bold text-ink group-hover:text-accent transition-colors">
                          {client.name}
                        </div>
                        <div className="text-[11px] text-muted">
                          {client.company}
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs text-body">
                        {client.segment}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          client.journeyStage === "Escala" ||
                          client.journeyStage === "Case"
                            ? "alien"
                            : client.journeyStage === "Execução" || client.journeyStage === "Otimização"
                            ? "dark"
                            : "gray"
                        }
                        size="sm"
                        showDot
                      >
                        {client.journeyStage}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 flex-wrap max-w-xs">
                        {client.contractedServices && client.contractedServices.length > 0 ? (
                          client.contractedServices.slice(0, 2).map((srv) => (
                            <span
                              key={srv.id || srv.name}
                              className="text-[10px] font-mono text-body bg-raised px-1.5 py-0.5 rounded border border-line"
                            >
                              {srv.category || srv.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-mono text-subtle">
                            Nenhum serviço cadastrado
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-accent">
                        {client.currentRoas}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-muted">
                        {client.contactPerson || "—"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/clientes/${client.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-ink group-hover:text-accent transition-colors"
                      >
                        <span>Abrir CRM</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-accent" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageContainer>
  );
}
