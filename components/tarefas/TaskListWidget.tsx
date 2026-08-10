"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { TaskItem, TaskPriority } from "@/lib/repositories/taskRepository";
import { SearchIcon, ChevronRightIcon } from "@/components/icons";

export interface TaskListWidgetProps {
  tasks: TaskItem[];
  onOpenDetailModal: (task: TaskItem) => void;
}

export function TaskListWidget({ tasks, onOpenDetailModal }: TaskListWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("Todas");

  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      priorityFilter === "Todas" || task.priority === priorityFilter;

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.projectName && task.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPriority && matchesSearch;
  });

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Tabela Operacional de Tarefas ({filteredTasks.length} Atividades)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Filtros por prioridade, cliente, responsável, prazos e nível de SLA
          </p>
        </div>

        {/* Priority Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["Todas", "Crítica", "Alta", "Média", "Baixa"].map((pr) => (
            <button
              key={pr}
              type="button"
              onClick={() => setPriorityFilter(pr)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                priorityFilter === pr
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111]"
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar tarefa, cliente, projeto ou responsável..."
          className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
        />
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Título da Tarefa</th>
              <th className="py-3 px-3 font-semibold">Cliente & Projeto</th>
              <th className="py-3 px-3 font-semibold">Serviço</th>
              <th className="py-3 px-3 font-semibold">Responsável</th>
              <th className="py-3 px-3 font-semibold">Prioridade</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Prazo / SLA</th>
              <th className="py-3 px-3 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-xs">
            {filteredTasks.map((task) => (
              <tr
                key={task.id}
                onClick={() => onOpenDetailModal(task)}
                className="hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
              >
                <td className="py-3 px-3">
                  <span className="font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors block">
                    {task.title}
                  </span>
                  <span className="text-[10px] text-[#71717A] block truncate max-w-xs">
                    {task.description}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <span className="font-bold text-[#111111] block">{task.clientName}</span>
                  <span className="text-[10px] text-[#71717A] block">
                    {task.projectName || "Geral"}
                  </span>
                </td>

                <td className="py-3 px-3 text-[#52525B]">
                  {task.serviceName || "Growth Full Stack"}
                </td>

                <td className="py-3 px-3 font-medium text-[#111111]">
                  {task.assigneeName}
                </td>

                <td className="py-3 px-3">
                  <Badge
                    variant={
                      task.priority === "Crítica"
                        ? "dark"
                        : task.priority === "Alta"
                        ? "alien"
                        : "gray"
                    }
                    size="sm"
                    className={
                      task.priority === "Crítica"
                        ? "bg-red-950 text-red-200 border-red-800"
                        : ""
                    }
                  >
                    {task.priority}
                  </Badge>
                </td>

                <td className="py-3 px-3">
                  <Badge variant="outline" size="sm">
                    {task.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-mono">
                  <span className="text-[#111111] font-bold block">{task.dueDate}</span>
                  <span className={task.slaPercentage < 60 ? "text-red-600 font-bold text-[10px]" : "text-[#4A8237] text-[10px]"}>
                    SLA {task.slaPercentage}%
                  </span>
                </td>

                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#4A8237] group-hover:underline">
                    <span>Detalhes</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
