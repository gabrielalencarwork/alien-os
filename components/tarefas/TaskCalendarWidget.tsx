"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { TaskItem } from "@/lib/repositories/taskRepository";

export interface TaskCalendarWidgetProps {
  tasks: TaskItem[];
  onOpenDetailModal: (task: TaskItem) => void;
}

export function TaskCalendarWidget({ tasks, onOpenDetailModal }: TaskCalendarWidgetProps) {
  const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  
  // Simulação de calendário para o mês de Agosto 2026 (31 dias)
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Calendário Operacional Mensal · Agosto 2026
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Mapeamento visual de entregas, reuniões, campanhas e prazos de SLA
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Visão Mensal
        </Badge>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center font-mono text-[11px] font-bold text-[#71717A] py-1 border-b border-[#E4E4E7]">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid (31 Days) */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {calendarDays.map((day) => {
          // Formata data simples '2026-08-0X'
          const dateStr = `2026-08-${day < 10 ? "0" + day : day}`;
          const dayTasks = tasks.filter((t) => t.dueDate === dateStr || (day === 3 && t.dueDate.endsWith("-03")) || (day === 4 && t.dueDate.endsWith("-04")) || (day === 5 && t.dueDate.endsWith("-05")));

          return (
            <div
              key={day}
              className={`min-h-[100px] p-2 rounded-xl border text-left flex flex-col justify-between transition-colors ${
                day === 3
                  ? "border-[#4A8237] bg-[rgba(74,130,55,0.06)]"
                  : "border-[#E4E4E7] bg-[#FAFAFA]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold ${day === 3 ? "text-[#4A8237]" : "text-[#111111]"}`}>
                  {day}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[9px] font-mono font-bold text-[#4A8237] bg-white px-1.5 py-0.5 rounded border border-[#E4E4E7]">
                    {dayTasks.length} {dayTasks.length === 1 ? "entrega" : "entregas"}
                  </span>
                )}
              </div>

              {/* Tasks List inside Calendar Day */}
              <div className="space-y-1 mt-1 overflow-y-auto max-h-16">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onOpenDetailModal(t)}
                    className="p-1 rounded bg-white border border-[#E4E4E7] text-[9px] font-semibold text-[#111111] hover:border-[#4A8237] truncate cursor-pointer"
                  >
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
