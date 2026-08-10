"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { MeetingItem } from "@/lib/repositories/meetingRepository";
import { ClockIcon, ArrowUpRightIcon, FileTextIcon } from "@/components/icons";

export interface AgendaDayWidgetProps {
  meetings: MeetingItem[];
  onOpenNotesModal: (meeting: MeetingItem) => void;
}

export function AgendaDayWidget({
  meetings,
  onOpenNotesModal,
}: AgendaDayWidgetProps) {
  // Compromissos do dia selecionado (04/08/2026)
  const todayMeetings = meetings.filter((m) => m.date === "2026-08-04");

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Timeline Diária · Terça-feira, 04 de Agosto
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Cronograma vertical detalhado das reuniões e alinhamentos do dia
          </p>
        </div>

        <Badge variant="alien" size="sm">
          {todayMeetings.length} Reuniões Hoje
        </Badge>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E4E4E7]">
        {todayMeetings.map((mt) => (
          <div key={mt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-[#111111] border-2 border-white ring-2 ring-[#4A8237]" />

            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2 hover:border-[#4A8237] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#4A8237]">
                    {mt.startTime} - {mt.endTime}
                  </span>
                  <Badge variant="dark" size="sm">
                    {mt.type}
                  </Badge>
                </div>
                <span className="text-[10px] font-mono text-[#71717A]">
                  Duração: {mt.durationMinutes} min
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#111111]">
                {mt.title}
              </h4>

              <p className="text-xs text-[#71717A]">
                Cliente: <strong className="text-[#111111]">{mt.clientName}</strong> · Responsável:{" "}
                <span className="font-semibold text-[#111111]">{mt.hostName}</span>
              </p>

              <div className="pt-2 border-t border-[#E4E4E7] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-[#52525B]">
                  Local: {mt.location}
                </span>

                <div className="flex items-center gap-2">
                  {mt.meetingLink && (
                    <a
                      href={mt.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#4A8237] hover:underline"
                    >
                      <span>Entrar no Meet</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenNotesModal(mt)}
                    icon={<FileTextIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                  >
                    Ata da Reunião
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
