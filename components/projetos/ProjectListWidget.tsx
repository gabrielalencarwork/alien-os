"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ProjectItem } from "@/lib/repositories/projectRepository";
import { SearchIcon, ChevronRightIcon } from "@/components/icons";

export interface ProjectListWidgetProps {
  projects: ProjectItem[];
}

export function ProjectListWidget({ projects }: ProjectListWidgetProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Todos");

  const filteredProjects = projects.filter((proj) => {
    const matchesStatus = statusFilter === "Todos" || proj.status === statusFilter;
    const matchesSearch =
      proj.name.toLowerCase().includes(search.toLowerCase()) ||
      proj.clientName.toLowerCase().includes(search.toLowerCase()) ||
      proj.leadName.toLowerCase().includes(search.toLowerCase()) ||
      (proj.serviceName ?? "").toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Tabela Consolidada de Projetos ({filteredProjects.length} Projetos)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Visão em lista com prazos, horas executadas, rentabilidade e progresso
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["Todos", "Em Andamento", "Em Revisão", "Aguardando Cliente", "Planejamento", "Concluído"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-inverse text-white"
                  : "bg-raised text-body hover:text-ink"
              }`}
            >
              {st}
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
          placeholder="Buscar por projeto, cliente ou responsável..."
          className="w-full pl-9 pr-4 py-2 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Nome do Projeto</th>
              <th className="py-3 px-3 font-semibold">Cliente & Serviço</th>
              <th className="py-3 px-3 font-semibold">Responsável</th>
              <th className="py-3 px-3 font-semibold">Prioridade</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Progresso %</th>
              <th className="py-3 px-3 font-semibold">Prazo Final</th>
              <th className="py-3 px-3 font-semibold text-right">Workspace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft text-xs">
            {filteredProjects.map((proj) => (
              <tr key={proj.id} className="hover:bg-canvas transition-colors group">
                <td className="py-3 px-3">
                  <Link
                    href={`/projetos/${proj.id}`}
                    className="font-bold text-ink group-hover:text-accent transition-colors block"
                  >
                    {proj.name}
                  </Link>
                  <span className="text-[10px] text-muted block truncate max-w-xs">
                    {proj.description}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-ink block">{proj.clientName}</span>
                  <span className="text-[10px] text-muted block">{proj.serviceName}</span>
                </td>

                <td className="py-3 px-3 text-body">
                  {proj.leadName}
                </td>

                <td className="py-3 px-3">
                  <Badge
                    variant={
                      proj.priority === "Crítica"
                        ? "dark"
                        : proj.priority === "Alta"
                        ? "alien"
                        : "gray"
                    }
                    size="sm"
                  >
                    {proj.priority}
                  </Badge>
                </td>

                <td className="py-3 px-3">
                  <Badge variant="outline" size="sm">
                    {proj.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-mono font-bold text-accent">
                  {proj.progressPercentage}%
                </td>

                <td className="py-3 px-3 font-mono text-ink">
                  {proj.dueDate}
                </td>

                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/projetos/${proj.id}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent group-hover:underline"
                  >
                    <span>Abrir</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-accent" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
