import React from "react";
import { Card } from "@/components/Card";
import { GrowthStats } from "@/lib/repositories/growthRepository";

export interface GrowthMetricsGridProps {
  stats: GrowthStats;
}

export function GrowthMetricsGrid({ stats }: GrowthMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-11 gap-2.5">
      {/* Experimentos Ativos */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[9px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Exp. Ativos
        </span>
        <div className="text-lg font-bold font-mono text-white tracking-tight">
          {stats.activeExperimentsCount}
        </div>
        <span className="text-[9px] text-zinc-300 font-mono block">Rodando agora</span>
      </Card>

      {/* Experimentos Concluídos */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Concluídos
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          {stats.completedExperimentsCount}
        </div>
        <span className="text-[9px] text-[#71717A]">Validados</span>
      </Card>

      {/* Taxa de Sucesso */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Taxa Sucesso
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          {stats.successRatePercentage}%
        </div>
        <span className="text-[9px] text-[#71717A]">Win Rate</span>
      </Card>

      {/* Receita Incremental Estimada */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Rec. Estimada
        </span>
        <div className="text-base font-bold font-mono text-[#111111]">
          R$ {(stats.estimatedIncrementalRevenue / 1000).toFixed(0)}k
        </div>
        <span className="text-[9px] text-[#71717A]">Impacto projeto</span>
      </Card>

      {/* Receita Incremental Confirmada */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[9px] font-mono uppercase text-[#4A8237] font-semibold block">
          Rec. Confirmada
        </span>
        <div className="text-base font-bold font-mono text-[#4A8237]">
          R$ {(stats.confirmedIncrementalRevenue / 1000).toFixed(1)}k
        </div>
        <span className="text-[9px] text-zinc-300 font-mono">Ganho real</span>
      </Card>

      {/* Tempo Médio */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Tempo Médio
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          {stats.averageTestDays}d
        </div>
        <span className="text-[9px] text-[#71717A]">Duração teste</span>
      </Card>

      {/* Hipóteses em Execução */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Em Execução
        </span>
        <div className="text-lg font-bold font-mono text-[#111111]">
          {stats.runningHypothesesCount}
        </div>
        <span className="text-[9px] text-[#71717A]">Testes ativos</span>
      </Card>

      {/* Aprovadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Aprovadas
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          {stats.approvedHypothesesCount}
        </div>
        <span className="text-[9px] text-[#71717A]">Subiram prod</span>
      </Card>

      {/* Descartadas */}
      <Card padding="sm" className="space-y-1 bg-amber-50/40 border-amber-200">
        <span className="text-[9px] font-mono uppercase text-amber-800 font-semibold block">
          Descartadas
        </span>
        <div className="text-lg font-bold font-mono text-amber-950">
          {stats.discardedHypothesesCount}
        </div>
        <span className="text-[9px] text-amber-800 font-mono">Sem ganho</span>
      </Card>

      {/* Ganho ROAS */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Ganho ROAS
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          +{stats.averageRoasGain}x
        </div>
        <span className="text-[9px] text-[#71717A]">Uplift médio</span>
      </Card>

      {/* Ganho Conversão */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[9px] font-mono uppercase text-[#A1A1AA] block">
          Ganho Conv.
        </span>
        <div className="text-lg font-bold font-mono text-[#4A8237]">
          +{stats.averageConversionGain}%
        </div>
        <span className="text-[9px] text-[#71717A]">CRO Uplift</span>
      </Card>
    </div>
  );
}
