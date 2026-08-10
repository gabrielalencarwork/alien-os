import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { ClockIcon } from "./icons";

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

const DEFAULT_TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: "tl-1",
    time: "10:30",
    title: "Escala de Mídia em Meta Ads",
    description: "Aumento de 35% no orçamento diário da Aura Health após ROAS atingir 5.2x.",
    category: "Tráfego Pago",
    status: "Concluído",
  },
  {
    id: "tl-2",
    time: "11:45",
    title: "Auditoria Alien Max Concluída",
    description: "Novo escaneamento digital finalizado para Lumina Skincare com Opportunity Score de +35 pts.",
    category: "Inteligência",
    status: "Concluído",
  },
  {
    id: "tl-3",
    time: "14:00",
    title: "Reunião de Diagnóstico de Onboarding",
    description: "Alinhamento de expectativas e liberação de acessos ao gerenciador de anúncios.",
    category: "Reunião",
    status: "Em andamento",
  },
  {
    id: "tl-4",
    time: "16:30",
    title: "Publicação de Régua de Klaviyo",
    description: "Ativação da sequência automática de carrinho abandonado com cupom dinâmico.",
    category: "Automação",
    status: "Agendado",
  },
];

export function AgencyTimeline({ events = DEFAULT_TIMELINE_EVENTS }: AgencyTimelineProps) {
  const displayEvents = events && events.length > 0 ? events : DEFAULT_TIMELINE_EVENTS;

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
    </Card>
  );
}
