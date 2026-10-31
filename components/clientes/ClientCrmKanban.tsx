"use client";

import React from "react";
import Link from "next/link";
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
  // Uma coluna por etapa da Jornada de Abdução (mesmos valores gravados no banco).
  const columns: CrmColumn[] = [
    { id: "recepcao", name: "Recepção & Lead", stageName: "Recepção", color: "border-zinc-300" },
    { id: "escaneamento", name: "Escaneamento", stageName: "Escaneamento", color: "border-sky-400" },
    { id: "diagnostico", name: "Diagnóstico & Reunião", stageName: "Diagnóstico", color: "border-blue-400" },
    { id: "plano", name: "Plano & Proposta", stageName: "Plano", color: "border-indigo-400" },
    { id: "execucao", name: "Em Execução (Ativo)", stageName: "Execução", color: "border-ink" },
    { id: "otimizacao", name: "Otimização", stageName: "Otimização", color: "border-purple-400" },
    { id: "escala", name: "Em Escala (Growth)", stageName: "Escala", color: "border-accent" },
    { id: "case", name: "Case Alien (Apex)", stageName: "Case", color: "border-amber-400" },
  ];

  const getClientsForColumn = (columnStageName: string) =>
    clients.filter((c) => c.journeyStage === columnStageName);

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar min-h-[600px] select-none">
      {columns.map((col) => {
        const columnClients = getClientsForColumn(col.stageName);

        return (
          <div
            key={col.id}
            className="w-80 shrink-0 bg-surface border border-line rounded-2xl flex flex-col justify-between shadow-xs overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-line-soft bg-canvas flex items-center justify-between border-t-4 ${col.color}`}>
              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-ink tracking-tight">
                  {col.name}
                </h3>
                <span className="text-[10px] font-mono text-muted block">
                  {columnClients.length} {columnClients.length === 1 ? "Empresa" : "Empresas"}
                </span>
              </div>

              <span className="w-5 h-5 rounded-full bg-surface border border-line text-[10px] font-mono font-bold text-ink flex items-center justify-center">
                {columnClients.length}
              </span>
            </div>

            {/* Column Cards Feed */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[650px] bg-canvas/50">
              {columnClients.length > 0 ? (
                columnClients.map((client) => (
                  <Link key={client.id} href={`/clientes/${client.id}`} className="block group">
                    <div className="p-4 rounded-xl bg-surface border border-line hover:border-accent shadow-xs hover:shadow-md transition-all space-y-3">
                      {/* Title & Badge Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-ink group-hover:text-accent transition-colors">
                            {client.name}
                          </h4>
                          <span className="text-[10px] text-muted">
                            {client.company} · {client.segment}
                          </span>
                        </div>

                      </div>

                      {/* Services Chips */}
                      <div className="flex items-center gap-1 flex-wrap">
                        {client.contractedServices && client.contractedServices.length > 0 ? (
                          client.contractedServices.slice(0, 2).map((srv) => (
                            <span
                              key={srv.id || srv.name}
                              className="text-[9px] font-mono text-body bg-raised px-1.5 py-0.5 rounded border border-line"
                            >
                              {srv.category || srv.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] font-mono text-subtle">
                            Nenhum serviço cadastrado
                          </span>
                        )}
                      </div>

                      {/* Footer Info */}
                      <div className="pt-2 border-t border-line-soft flex items-center justify-between text-[10px]">
                        <span className="text-muted">
                          {client.contactPerson ? <>Contato: <strong className="text-ink">{client.contactPerson.split(" ")[0]}</strong></> : client.segment}
                        </span>

                        <span className="inline-flex items-center gap-0.5 font-semibold text-ink group-hover:text-accent transition-colors">
                          <span>Abrir CRM</span>
                          <ChevronRightIcon className="w-3 h-3 text-accent" />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-[11px] text-subtle border border-dashed border-line rounded-xl">
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
