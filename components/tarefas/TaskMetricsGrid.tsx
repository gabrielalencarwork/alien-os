import React from "react";
import { Card } from "@/components/Card";
import { TaskStats } from "@/lib/repositories/taskRepository";

export interface TaskMetricsGridProps {
  stats: TaskStats;
}

export function TaskMetricsGrid({ stats }: TaskMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
      {/* Total de Tarefas */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Total Tarefas
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {stats.totalTasks}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Operação Geral
        </span>
      </Card>

      {/* Em Andamento */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Em Andamento
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.inProgressCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Em execução</span>
      </Card>

      {/* Concluídas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Concluídas
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.completedCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Entregas validadas</span>
      </Card>

      {/* Atrasadas */}
      <Card padding="sm" className="space-y-1 bg-red-50/40 border-red-200">
        <span className="text-[10px] font-mono uppercase text-red-800 font-semibold block">
          Atrasadas
        </span>
        <div className="text-xl font-bold font-mono text-red-950">
          {stats.overdueCount}
        </div>
        <span className="text-[10px] text-red-800 font-mono font-semibold">Exige ação</span>
      </Card>

      {/* Críticas */}
      <Card padding="sm" className="space-y-1 bg-amber-50/40 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Prioridade Crítica
        </span>
        <div className="text-xl font-bold font-mono text-amber-950">
          {stats.criticalCount}
        </div>
        <span className="text-[10px] text-amber-800 font-mono">Alta relevância</span>
      </Card>

      {/* Vencendo Hoje */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Vencendo Hoje
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.dueTodayCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Entregas do dia</span>
      </Card>

      {/* Vencendo esta Semana */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Vencendo Semana
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.dueThisWeekCount}
        </div>
        <span className="text-[10px] text-[#71717A]">SLA 7 dias</span>
      </Card>

      {/* SLA Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          SLA Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.averageSlaPercentage}%
        </div>
        <span className="text-[10px] text-[#71717A]">Cumprimento</span>
      </Card>

      {/* Tempo Médio de Conclusão */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Tempo Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.averageCompletionDays}d
        </div>
        <span className="text-[10px] text-[#71717A]">Ciclo de entrega</span>
      </Card>
    </div>
  );
}
