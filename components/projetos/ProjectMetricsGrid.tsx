import React from "react";
import { Card } from "@/components/Card";
import { ProjectStats } from "@/lib/repositories/projectRepository";

export interface ProjectMetricsGridProps {
  stats: ProjectStats;
}

export function ProjectMetricsGrid({ stats }: ProjectMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
      {/* Projetos Ativos */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Projetos Ativos
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {stats.activeProjectsCount}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Em operação
        </span>
      </Card>

      {/* Projetos Finalizados */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Finalizados
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.completedProjectsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Cases concluídos</span>
      </Card>

      {/* Projetos em Atraso */}
      <Card padding="sm" className="space-y-1 bg-red-50/40 border-red-200">
        <span className="text-[10px] font-mono uppercase text-red-800 font-semibold block">
          Em Atraso
        </span>
        <div className="text-xl font-bold font-mono text-red-950">
          {stats.delayedProjectsCount}
        </div>
        <span className="text-[10px] text-red-800 font-mono font-semibold">Gargalo</span>
      </Card>

      {/* Em Planejamento */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Planejamento
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.planningProjectsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Setup & Briefing</span>
      </Card>

      {/* Em Execução */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Em Execução
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.inProgressProjectsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Mídia & Dev</span>
      </Card>

      {/* Em Revisão */}
      <Card padding="sm" className="space-y-1 bg-amber-50/40 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Em Revisão
        </span>
        <div className="text-xl font-bold font-mono text-amber-950">
          {stats.inReviewProjectsCount}
        </div>
        <span className="text-[10px] text-amber-800 font-mono">Aprovação</span>
      </Card>

      {/* Horas Previstas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Horas Previstas
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.totalEstimatedHours}h
        </div>
        <span className="text-[10px] text-[#71717A]">Estimativa total</span>
      </Card>

      {/* Horas Executadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Horas Realizadas
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.totalExecutedHours}h
        </div>
        <span className="text-[10px] text-[#71717A]">Horas trabalhadas</span>
      </Card>

      {/* Percentual Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Progresso Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.averageProgressPercentage}%
        </div>
        <span className="text-[10px] text-[#71717A]">Conclusão global</span>
      </Card>
    </div>
  );
}
