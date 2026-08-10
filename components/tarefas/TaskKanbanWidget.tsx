"use client";

import React from "react";
import { Badge } from "@/components/Badge";
import { TaskItem, TaskStatus } from "@/lib/repositories/taskRepository";
import { ClockIcon, CheckCircle2Icon, MessageSquareIcon, PaperclipIcon } from "@/components/icons";

export interface TaskKanbanWidgetProps {
  tasks: TaskItem[];
  onOpenDetailModal: (task: TaskItem) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskKanbanWidget({
  tasks,
  onOpenDetailModal,
  onStatusChange,
}: TaskKanbanWidgetProps) {
  const columns: { id: TaskStatus; label: string; color: string }[] = [
    { id: "Backlog", label: "Backlog", color: "border-zinc-300" },
    { id: "A Fazer", label: "A Fazer", color: "border-blue-400" },
    { id: "Em Andamento", label: "Em Andamento", color: "border-amber-400" },
    { id: "Em Revisão", label: "Em Revisão", color: "border-purple-400" },
    { id: "Concluído", label: "Concluído", color: "border-[#4A8237]" },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-1 no-scrollbar min-h-[600px] select-none">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="w-76 shrink-0 bg-white border border-[#E4E4E7] rounded-2xl flex flex-col justify-between shadow-xs overflow-hidden"
          >
            {/* Column Header */}
            <div className={`p-3.5 border-b border-[#F4F4F5] bg-[#FAFAFA] flex items-center justify-between border-t-4 ${col.color}`}>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#111111] tracking-tight">
                  {col.label}
                </h3>
                <span className="text-[10px] font-mono text-[#71717A]">
                  ({columnTasks.length})
                </span>
              </div>
              <span className="w-5 h-5 rounded-full bg-white border border-[#E4E4E7] text-[10px] font-mono font-bold text-[#111111] flex items-center justify-center">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Task Cards Feed */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[650px] bg-[#FAFAFA]/40">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => {
                  const completedChecklists = task.checklists.filter((i) => i.completed).length;
                  const totalChecklists = task.checklists.length;
                  const checklistProgress = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenDetailModal(task)}
                      className="p-4 rounded-xl bg-white border border-[#E4E4E7] hover:border-[#4A8237] shadow-xs hover:shadow-md transition-all space-y-3 cursor-pointer group"
                    >
                      {/* Priority & Client Header */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-semibold text-[#71717A] truncate">
                          {task.clientName}
                        </span>
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
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors leading-snug">
                          {task.title}
                        </h4>
                        {task.projectName && (
                          <span className="text-[10px] text-[#A1A1AA] block">
                            Projeto: {task.projectName}
                          </span>
                        )}
                      </div>

                      {/* Checklist Progress Bar */}
                      {totalChecklists > 0 && (
                        <div className="space-y-1 pt-1 border-t border-[#F4F4F5]">
                          <div className="flex items-center justify-between text-[9px] font-mono text-[#71717A]">
                            <span>Checklist ({completedChecklists}/{totalChecklists})</span>
                            <span>{checklistProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-[#E4E4E7] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4A8237] rounded-full"
                              style={{ width: `${checklistProgress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Footer Info: Assignee, SLA & Icons */}
                      <div className="pt-2 border-t border-[#F4F4F5] flex items-center justify-between text-[10px]">
                        <div className="flex items-center gap-1.5 text-[#52525B]">
                          <span className="w-4 h-4 rounded-full bg-[#111111] text-white text-[9px] font-bold font-mono flex items-center justify-center">
                            {task.assigneeName.charAt(0)}
                          </span>
                          <span className="truncate max-w-[90px]">{task.assigneeName}</span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[#71717A]">
                          <span className={task.slaPercentage < 60 ? "text-red-600 font-bold" : "text-[#4A8237]"}>
                            SLA {task.slaPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-[11px] text-[#A1A1AA] border border-dashed border-[#E4E4E7] rounded-xl">
                  Sem tarefas nesta coluna
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
