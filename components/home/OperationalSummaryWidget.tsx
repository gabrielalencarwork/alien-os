import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import {
  BriefcaseIcon,
  CheckCircle2Icon,
  ClockIcon,
} from "@/components/icons";

export function OperationalSummaryWidget() {
  const tasks = [
    {
      id: "tsk-1",
      title: "Subir 3 conjuntos de retargeting no Meta Ads",
      client: "Lumina Skincare",
      due: "Hoje às 14:00",
      status: "Em Execução",
    },
    {
      id: "tsk-2",
      title: "Validar DataLayer do GA4 e eventos e-commerce",
      client: "Vortex Suplementos",
      due: "Hoje às 16:30",
      status: "Pendente",
    },
    {
      id: "tsk-3",
      title: "Elaborar pauta de gravação para vídeos de UGC",
      client: "Aura Health",
      due: "Amanhã às 10:00",
      status: "Pendente",
    },
  ];

  const meetings = [
    {
      id: "mtg-1",
      title: "Alinhamento Semanal de ROAS & Mídia",
      client: "Aura Health",
      time: "Hoje às 15:00",
      attendees: "Gabriel & Equipe de Growth",
    },
    {
      id: "mtg-2",
      title: "Reunião de Diagnóstico de Onboarding",
      client: "Lumina Skincare",
      time: "Hoje às 17:00",
      attendees: "Gabriel & Suporte Técnico",
    },
  ];

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-[#111111]" />
          <h3 className="text-base font-bold text-[#111111]">
            Resumo Operacional & Entregáveis
          </h3>
        </div>
        <Badge variant="dark" size="sm">
          85% de Eficiência
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarefas Prioritárias */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold">
              Tarefas Prioritárias do Dia
            </span>
            <span className="text-xs font-mono text-[#4A8237]">3 Ativas</span>
          </div>

          <div className="space-y-2">
            {tasks.map((tsk) => (
              <div
                key={tsk.id}
                className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-mono text-[#A1A1AA] block">
                    {tsk.client} · {tsk.due}
                  </span>
                  <p className="text-xs font-semibold text-[#111111] truncate">
                    {tsk.title}
                  </p>
                </div>
                <Badge
                  variant={tsk.status === "Em Execução" ? "alien" : "gray"}
                  size="sm"
                >
                  {tsk.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Reuniões do Dia */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold">
              Agenda de Reuniões de Hoje
            </span>
            <span className="text-xs font-mono text-[#111111]">2 Confirmadas</span>
          </div>

          <div className="space-y-2">
            {meetings.map((mtg) => (
              <div
                key={mtg.id}
                className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">
                    {mtg.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#4A8237] font-semibold">
                    {mtg.time}
                  </span>
                </div>
                <p className="text-xs text-[#71717A]">
                  Cliente: <strong className="text-[#111111]">{mtg.client}</strong> · {mtg.attendees}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
