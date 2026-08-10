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
      proj.serviceName.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Tabela Consolidada de Projetos ({filteredProjects.length} Projetos)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
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
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por projeto, cliente ou responsável..."
          className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
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
          <tbody className="divide-y divide-[#F4F4F5] text-xs">
            {filteredProjects.map((proj) => (
              <tr key={proj.id} className="hover:bg-[#FAFAFA] transition-colors group">
                <td className="py-3 px-3">
                  <Link
                    href={`/projetos/${proj.id}`}
                    className="font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors block"
                  >
                    {proj.name}
                  </Link>
                  <span className="text-[10px] text-[#71717A] block truncate max-w-xs">
                    {proj.description}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-[#111111] block">{proj.clientName}</span>
                  <span className="text-[10px] text-[#71717A] block">{proj.serviceName}</span>
                </td>

                <td className="py-3 px-3 text-[#52525B]">
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

                <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">
                  {proj.progressPercentage}%
                </td>

                <td className="py-3 px-3 font-mono text-[#111111]">
                  {proj.dueDate}
                </td>

                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/projetos/${proj.id}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#4A8237] group-hover:underline"
                  >
                    <span>Abrir</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
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
