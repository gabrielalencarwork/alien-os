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
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Timeline Diária · Terça-feira, 04 de Agosto
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Cronograma vertical detalhado das reuniões e alinhamentos do dia
          </p>
        </div>

        <Badge variant="alien" size="sm">
          {todayMeetings.length} Reuniões Hoje
        </Badge>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
        {todayMeetings.map((mt) => (
          <div key={mt.id} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-inverse border-2 border-white ring-2 ring-accent" />

            <div className="p-4 rounded-xl bg-canvas border border-line space-y-2 hover:border-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-accent">
                    {mt.startTime} - {mt.endTime}
                  </span>
                  <Badge variant="dark" size="sm">
                    {mt.type}
                  </Badge>
                </div>
                <span className="text-[10px] font-mono text-muted">
                  Duração: {mt.durationMinutes} min
                </span>
              </div>

              <h4 className="text-sm font-bold text-ink">
                {mt.title}
              </h4>

              <p className="text-xs text-muted">
                Cliente: <strong className="text-ink">{mt.clientName}</strong> · Responsável:{" "}
                <span className="font-semibold text-ink">{mt.hostName}</span>
              </p>

              <div className="pt-2 border-t border-line flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-body">
                  Local: {mt.location}
                </span>

                <div className="flex items-center gap-2">
                  {mt.meetingLink && (
                    <a
                      href={mt.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-mono font-bold text-accent hover:underline"
                    >
                      <span>Entrar no Meet</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />
                    </a>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenNotesModal(mt)}
                    icon={<FileTextIcon className="w-3.5 h-3.5 text-accent" />}
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
