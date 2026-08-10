import React from "react";
import { Card } from "@/components/Card";
import { GA4Stats } from "@/lib/repositories/googleAnalyticsRepository";

export interface GA4MetricsGridProps {
  stats: GA4Stats;
}

export function GA4MetricsGrid({ stats }: GA4MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
      {/* Usuários Totais */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
          Usuários
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {(stats.totalUsers / 1000).toFixed(1)}k
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">Últimos 30 dias</span>
      </Card>

      {/* Novos Usuários */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Novos Usuários
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {(stats.totalNewUsers / 1000).toFixed(1)}k
        </div>
        <span className="text-[10px] text-[#71717A]">Primeiro acesso</span>
      </Card>

      {/* Sessões */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Sessões
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {(stats.totalSessions / 1000).toFixed(1)}k
        </div>
        <span className="text-[10px] text-[#71717A]">Visitas totais</span>
      </Card>

      {/* Sessões Engajadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Engajadas
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {(stats.totalEngagedSessions / 1000).toFixed(1)}k
        </div>
        <span className="text-[10px] text-[#71717A]">&gt; 10s ou 2+ pgs</span>
      </Card>

      {/* Conversões */}
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
          Conversões
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.totalConversions.toLocaleString("pt-BR")}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono">Metas atingidas</span>
      </Card>

      {/* Receita GA4 */}
      <Card padding="sm" className="space-y-1 bg-[rgba(74,130,55,0.08)] border-[#4A8237]">
        <span className="text-[10px] font-mono uppercase text-[#4A8237] font-bold block">
          Receita GA4
        </span>
        <div className="text-base font-bold font-mono text-[#111111]">
          R$ {(stats.totalRevenue / 1000).toFixed(1)}k
        </div>
        <span className="text-[10px] text-[#4A8237] font-mono font-semibold">Atribuição GA4</span>
      </Card>

      {/* Bounce Rate */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Bounce Rate
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.averageBounceRate}%
        </div>
        <span className="text-[10px] text-[#71717A]">Taxa Rejeição</span>
      </Card>

      {/* Duração Média */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Tempo Médio
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {Math.floor(stats.averageSessionDuration / 60)}m {stats.averageSessionDuration % 60}s
        </div>
        <span className="text-[10px] text-[#71717A]">Permanência</span>
      </Card>
    </div>
  );
}
