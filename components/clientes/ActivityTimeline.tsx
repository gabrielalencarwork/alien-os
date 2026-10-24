import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import type { TimelineItem as ActivityLog } from "@/types";
import { SparklesIcon } from "@/components/icons";

export interface ActivityTimelineProps {
  activities?: ActivityLog[];
}

export function ActivityTimeline({ activities = [] }: ActivityTimelineProps) {
  const getTypeBadge = (type: ActivityLog["type"]) => {
    switch (type) {
      case "Reunião realizada":
        return <Badge variant="dark" size="sm">Reunião</Badge>;
      case "Criativo aprovado":
        return <Badge variant="alien" size="sm">Aprovado</Badge>;
      case "Landing Page publicada":
        return <Badge variant="gray" size="sm">Tech</Badge>;
      case "Campanha iniciada":
        return <Badge variant="alien" size="sm" showDot>Ativo</Badge>;
      case "Novo insight da IA":
        return <Badge variant="alien" size="sm"><SparklesIcon className="w-3 h-3 inline mr-1" />IA Insight</Badge>;
      default:
        return <Badge variant="outline" size="sm">Evento</Badge>;
    }
  };

  const list = activities || [];

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Timeline de Atividades
          </h3>
          <p className="text-xs text-muted">
            Histórico completo de reuniões, entregas, aprovações e insights da conta
          </p>
        </div>

        <Badge variant="outline" size="sm">
          {list.length} registros
        </Badge>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {list.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Circle */}
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-ink bg-surface group-hover:border-accent group-hover:bg-accent transition-colors" />

            <div className="p-3.5 rounded-xl bg-canvas border border-line space-y-1.5 hover:border-line-strong transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-muted bg-surface px-1.5 py-0.5 rounded border border-line">
                    {act.timestamp}
                  </span>
                  <h4 className="text-xs font-bold text-ink">
                    {act.title}
                  </h4>
                </div>

                {getTypeBadge(act.type)}
              </div>

              <p className="text-xs text-muted leading-relaxed">
                {act.description}
              </p>

              <div className="text-[10px] text-subtle pt-1">
                Registrado por: <span className="text-body font-medium">{act.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
