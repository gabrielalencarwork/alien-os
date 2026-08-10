import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ActivityLog } from "@/lib/clientsData";
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
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Timeline de Atividades
          </h3>
          <p className="text-xs text-[#71717A]">
            Histórico completo de reuniões, entregas, aprovações e insights da conta
          </p>
        </div>

        <Badge variant="outline" size="sm">
          {list.length} registros
        </Badge>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E4E7]">
        {list.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Circle */}
            <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-[#111111] bg-white group-hover:border-[#4A8237] group-hover:bg-[#4A8237] transition-colors" />

            <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1.5 hover:border-[#D4D4D8] transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#71717A] bg-white px-1.5 py-0.5 rounded border border-[#E4E4E7]">
                    {act.timestamp}
                  </span>
                  <h4 className="text-xs font-bold text-[#111111]">
                    {act.title}
                  </h4>
                </div>

                {getTypeBadge(act.type)}
              </div>

              <p className="text-xs text-[#71717A] leading-relaxed">
                {act.description}
              </p>

              <div className="text-[10px] text-[#A1A1AA] pt-1">
                Registrado por: <span className="text-[#52525B] font-medium">{act.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
