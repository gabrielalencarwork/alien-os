import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { ClockIcon, CheckCircle2Icon } from "./icons";

export interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  category: string;
  status: "Concluído" | "Em andamento" | "Agendado";
}

export interface AgencyTimelineProps {
  events?: TimelineEvent[];
}

export function AgencyTimeline({ events = [] }: AgencyTimelineProps) {
  const displayEvents = events;

  return (
    <Card className="border-[#E4E4E7] bg-white">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-[#111111] flex items-center justify-center">
            <ClockIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#111111] tracking-tight">
              Timeline da Agência
            </h3>
            <p className="text-xs text-[#71717A]">
              Fluxo cronológico de entregas, otimizações e marcos operacionais
            </p>
          </div>
        </div>

        <Badge variant="outline" size="sm">
          Hoje · {new Date().toLocaleDateString("pt-BR")}
        </Badge>
      </div>

      {displayEvents.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
            <ClockIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#111111] block">
              Nenhuma atividade recente registrada hoje
            </span>
            <p className="text-xs text-[#71717A] leading-relaxed">
              O histórico cronológico é preenchido automaticamente conforme novas reuniões, sincronizações e tarefas forem concluídas.
            </p>
          </div>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E4E7]">
          {displayEvents.map((event) => (
            <div key={event.id} className="relative group">
              {/* Timeline Dot */}
              <div
                className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-white transition-colors ${
                  event.status === "Concluído"
                    ? "border-[#4A8237] bg-[#4A8237]"
                    : event.status === "Em andamento"
                    ? "border-[#111111] bg-white"
                    : "border-[#D4D4D8] bg-white"
                }`}
              />

              <div className="p-3.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] space-y-1.5 hover:border-[#D4D4D8] transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#71717A] bg-white px-1.5 py-0.5 rounded border border-[#E4E4E7]">
                      {event.time}
                    </span>
                    <h4 className="text-xs font-semibold text-[#111111]">
                      {event.title}
                    </h4>
                  </div>

                  <Badge
                    variant={
                      event.status === "Concluído"
                        ? "alien"
                        : event.status === "Em andamento"
                        ? "dark"
                        : "gray"
                    }
                    size="sm"
                  >
                    {event.status}
                  </Badge>
                </div>

                <p className="text-xs text-[#71717A] leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
