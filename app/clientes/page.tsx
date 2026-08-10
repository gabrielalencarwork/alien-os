"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import { clientRepository } from "@/lib/repositories/clientRepository";
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
        const data = await clientRepository.getAll();
        setClients(data);
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="alien" showDot>
                CRM Operacional de Agência
              </Badge>
              <span className="text-xs font-mono text-[#A1A1AA]">
                {clients.length} Empresas na Carteira
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
              Central de Clientes & CRM
            </h1>
            <p className="text-base text-[#52525B] font-normal leading-relaxed">
              Gestão comercial, operacional e estratégica 360° de todas as contas da Alien.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Switcher Toggle */}
            <div className="p-1 rounded-xl bg-white border border-[#E4E4E7] flex items-center gap-1 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  viewMode === "kanban"
                    ? "bg-[#111111] text-white"
                    : "text-[#52525B] hover:text-[#111111]"
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
                    ? "bg-[#111111] text-white"
                    : "text-[#52525B] hover:text-[#111111]"
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
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              MRR Total Contratado
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              R$ 185.000 / mês
            </div>
            <span className="text-[10px] text-[#4A8237] font-semibold">
              Receita Recorrente
            </span>
          </Card>

          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Contas Ativas em Escala
            </span>
            <div className="text-xl font-bold font-mono text-[#4A8237]">
              {clients.filter((c) => c.journeyStage === "Em Escala" || c.journeyStage === "Case").length} Empresas
            </div>
            <span className="text-[10px] text-[#71717A]">Foco em Growth</span>
          </Card>

          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              ROAS Médio Consolidado
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              4.25x
            </div>
            <span className="text-[10px] text-[#71717A]">Meta Ads + Google Ads</span>
          </Card>

          <Card padding="sm" className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              Health Score Excelente
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              {clients.filter((c) => c.healthStatus === "Excelente").length} / {clients.length}
            </div>
            <span className="text-[10px] text-[#71717A]">Retenção de 97%</span>
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
                    ? "bg-[#111111] text-white"
                    : "bg-white border border-[#E4E4E7] text-[#52525B] hover:text-[#111111] hover:bg-[#F4F4F5]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, segmento, responsável..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E4E4E7] focus:border-[#4A8237] rounded-lg text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
            />
          </div>
        </div>
      </section>

      {/* 2. CRM Content (Kanban vs Table) */}
      <section className="space-y-4">
        {loading ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando CRM Operacional do Supabase...</span>
          </div>
        ) : viewMode === "kanban" ? (
          /* KANBAN CRM PIPELINE VIEW */
          <ClientCrmKanban clients={filteredClients} />
        ) : (
          /* TABLE VIEW */
          <div className="bg-white border border-[#E4E4E7] rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[11px] font-mono uppercase tracking-wider text-[#71717A]">
                  <th className="py-3 px-4 font-semibold">Cliente & Empresa</th>
                  <th className="py-3 px-4 font-semibold">Segmento</th>
                  <th className="py-3 px-4 font-semibold text-center">Alien Score</th>
                  <th className="py-3 px-4 font-semibold">Estágio do CRM</th>
                  <th className="py-3 px-4 font-semibold">Serviços Contratados</th>
                  <th className="py-3 px-4 font-semibold">ROAS</th>
                  <th className="py-3 px-4 font-semibold">Responsável</th>
                  <th className="py-3 px-4 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F4F4F5] text-xs">
                {filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-[#FAFAFA] transition-colors group cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <Link href={`/clientes/${client.id}`} className="block">
                        <div className="font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors">
                          {client.name}
                        </div>
                        <div className="text-[11px] text-[#71717A]">
                          {client.company}
                        </div>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-xs text-[#52525B]">
                        {client.segment}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-[rgba(74,130,55,0.1)] text-[#4A8237] border border-[rgba(74,130,55,0.2)]">
                        {client.alienScore}/100
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          client.journeyStage === "Em Escala" ||
                          client.journeyStage === "Case"
                            ? "alien"
                            : client.journeyStage === "Em Execução"
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
                              className="text-[10px] font-mono text-[#52525B] bg-[#F4F4F5] px-1.5 py-0.5 rounded border border-[#E4E4E7]"
                            >
                              {srv.category || srv.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] font-mono text-[#A1A1AA]">
                            Growth Full Stack
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-[#4A8237]">
                        {client.currentRoas}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] text-[#71717A]">
                        {client.contactPerson}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/clientes/${client.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] group-hover:text-[#4A8237] transition-colors"
                      >
                        <span>Abrir CRM</span>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
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
