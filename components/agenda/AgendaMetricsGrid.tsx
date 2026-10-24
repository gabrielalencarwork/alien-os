import React from "react";
import { Card } from "@/components/Card";
import { MeetingStats } from "@/lib/repositories/meetingRepository";

export interface AgendaMetricsGridProps {
  stats: MeetingStats;
}

export function AgendaMetricsGrid({ stats }: AgendaMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
      {/* Reuniões Hoje */}
      <Card padding="sm" className="space-y-1 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
          Reuniões Hoje
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {stats.todayMeetingsCount}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Compromissos do dia
        </span>
      </Card>

      {/* Reuniões da Semana */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Reuniões Semana
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.weekMeetingsCount}
        </div>
        <span className="text-[10px] text-muted">Próximos 7 dias</span>
      </Card>

      {/* Próximos Onboardings */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Onboardings
        </span>
        <div className="text-xl font-bold font-mono text-accent">
          {stats.nextOnboardingsCount}
        </div>
        <span className="text-[10px] text-muted">Novos clientes</span>
      </Card>

      {/* Diagnósticos Agendados */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Diagnósticos
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.scheduledDiagnosticsCount}
        </div>
        <span className="text-[10px] text-muted">Alien Max scans</span>
      </Card>

      {/* Entregas da Semana */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Entregas Semana
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.weekDeliveriesCount}
        </div>
        <span className="text-[10px] text-muted">Aprovações de mídia</span>
      </Card>

      {/* Follow-ups Pendentes */}
      <Card padding="sm" className="space-y-1 bg-amber-50/40 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Follow-ups
        </span>
        <div className="text-xl font-bold font-mono text-amber-950">
          {stats.pendingFollowupsCount}
        </div>
        <span className="text-[10px] text-amber-800 font-mono">Pendências</span>
      </Card>

      {/* Horas Agendadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Horas Agendadas
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.scheduledHoursTotal}h
        </div>
        <span className="text-[10px] text-muted">Tempo reservado</span>
      </Card>

      {/* Ocupação da Equipe */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Ocupação Equipe
        </span>
        <div className="text-xl font-bold font-mono text-accent">
          {stats.teamOccupancyPercentage}%
        </div>
        <span className="text-[10px] text-muted">Capacidade</span>
      </Card>

      {/* Reuniões Concluídas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Concluídas
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.completedMeetingsCount}
        </div>
        <span className="text-[10px] text-muted">Com atas salvas</span>
      </Card>
    </div>
  );
}
