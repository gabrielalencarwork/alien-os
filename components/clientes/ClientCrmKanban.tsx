"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Cliente } from "@/types";
import { ChevronRightIcon, BotIcon, SparklesIcon } from "@/components/icons";

export interface ClientCrmKanbanProps {
  clients: Cliente[];
}

export interface CrmColumn {
  id: string;
  name: string;
  stageName: string;
  color: string;
}

export function ClientCrmKanban({ clients }: ClientCrmKanbanProps) {
  const columns: CrmColumn[] = [
    { id: "prospeccao", name: "Prospecção & Lead", stageName: "Lead", color: "border-zinc-300" },
    { id: "diagnostico", name: "Diagnóstico & Reunião", stageName: "Em Diagnóstico", color: "border-blue-400" },
    { id: "proposta", name: "Proposta & Negociação", stageName: "Recepção", color: "border-indigo-400" },
    { id: "onboarding", name: "Onboarding & Contrato", stageName: "Setup", color: "border-purple-400" },
    { id: "execucao", name: "Em Execução (Ativo)", stageName: "Em Execução", color: "border-[#111111]" },
    { id: "escala", name: "Em Escala (Growth)", stageName: "Em Escala", color: "border-[#4A8237]" },
    { id: "case", name: "Case Alien (Apex)", stageName: "Case", color: "border-amber-400" },
  ];

  const getClientsForColumn = (columnStageName: string) => {
    return clients.filter((c) => {
      if (columnStageName === "Em Diagnóstico" && c.journeyStage === "Em Diagnóstico") return true;
      if (columnStageName === "Em Execução" && c.journeyStage === "Em Execução") return true;
      if (columnStageName === "Em Escala" && c.journeyStage === "Em Escala") return true;
      if (columnStageName === "Case" && c.journeyStage === "Case") return true;
      if (columnStageName === "Recepção" && c.journeyStage === "Recepção") return true;
      if (columnStageName === "Lead" && (c.journeyStage as string) === "Lead") return true;
      if (columnStageName === "Setup" && (c.journeyStage as string) === "Setup") return true;

      // Fallback para distribuição equilibrada no Kanban
      if (columnStageName === "Em Execução" && c.journeyStage !== "Em Escala" && c.journeyStage !== "Case") return true;
      return false;
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar min-h-[600px] select-none">
      {columns.map((col) => {
        const columnClients = getClientsForColumn(col.stageName);

        return (
          <div
            key={col.id}
            className="w-80 shrink-0 bg-white border border-[#E4E4E7] rounded-2xl flex flex-col justify-between shadow-xs overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-[#F4F4F5] bg-[#FAFAFA] flex items-center justify-between border-t-4 ${col.color}`}>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-[#111111] tracking-tight">
                  {col.name}
                </h3>
                <span className="text-[10px] font-mono text-[#71717A] block">
                  {columnClients.length} {columnClients.length === 1 ? "Empresa" : "Empresas"}
                </span>
              </div>

              <span className="w-5 h-5 rounded-full bg-white border border-[#E4E4E7] text-[10px] font-mono font-bold text-[#111111] flex items-center justify-center">
                {columnClients.length}
              </span>
            </div>

            {/* Column Cards Feed */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[650px] bg-[#FAFAFA]/50">
              {columnClients.length > 0 ? (
                columnClients.map((client) => (
                  <Link key={client.id} href={`/clientes/${client.id}`} className="block group">
                    <div className="p-4 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#4A8237] shadow-xs hover:shadow-md transition-all space-y-3">
                      {/* Title & Badge Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors">
                            {client.name}
                          </h4>
                          <span className="text-[10px] text-[#71717A]">
                            {client.company} · {client.segment}
                          </span>
                        </div>
                        <Badge variant="alien" size="sm">
                          Score {client.alienScore}
                        </Badge>
                      </div>

                      {/* Financial & ROAS Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-[#FAFAFA] border border-[#F4F4F5]">
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
                            Ticket MRR
                          </span>
                          <span className="font-mono font-bold text-[#111111]">
                            R$ 12.500
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
                            ROAS Atual
                          </span>
                          <span className="font-mono font-bold text-[#4A8237]">
                            {client.currentRoas}
                          </span>
                        </div>
                      </div>

                      {/* Services Chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {client.contractedServices && client.contractedServices.length > 0 ? (
                          client.contractedServices.slice(0, 2).map((srv) => (
                            <span
                              key={srv.id || srv.name}
                              className="text-[9px] font-mono text-[#52525B] bg-[#F4F4F5] px-1.5 py-0.5 rounded border border-[#E4E4E7]"
                            >
                              {srv.category || srv.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-mono text-[#A1A1AA]">
                            Growth Full Stack
                          </span>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-[#F4F4F5] flex items-center justify-between text-[10px]">
                        <span className="text-[#71717A]">
                          Resp: <strong className="text-[#111111]">{client.contactPerson.split(" ")[0]}</strong>
                        </span>

                        <span className="inline-flex items-center gap-0.5 font-semibold text-[#111111] group-hover:text-[#4A8237] transition-colors">
                          <span>Abrir CRM</span>
                          <ChevronRightIcon className="w-3 h-3 text-[#4A8237]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-[11px] text-[#A1A1AA] border border-dashed border-[#E4E4E7] rounded-xl">
                  Nenhuma conta nesta etapa
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
