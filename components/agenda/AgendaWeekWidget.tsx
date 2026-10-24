"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MeetingItem } from "@/lib/repositories/meetingRepository";

export interface AgendaWeekWidgetProps {
  meetings: MeetingItem[];
  onOpenNotesModal: (meeting: MeetingItem) => void;
}

export function AgendaWeekWidget({
  meetings,
  onOpenNotesModal,
}: AgendaWeekWidgetProps) {
  const weekDays = [
    { dayName: "Segunda", dateStr: "2026-08-03", dayNumber: "03" },
    { dayName: "Terça", dateStr: "2026-08-04", dayNumber: "04" },
    { dayName: "Quarta", dateStr: "2026-08-05", dayNumber: "05" },
    { dayName: "Quinta", dateStr: "2026-08-06", dayNumber: "06" },
    { dayName: "Sexta", dateStr: "2026-08-07", dayNumber: "07" },
  ];

  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Agenda Semanal Executiva (Estilo Google Calendar / Cron)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Grade horária interativa da semana corrente com alinhamentos, onboardings e diagnósticos
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Semana 32 · Agosto 2026
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[700px] grid grid-cols-6 gap-2">
          {/* Time Slot Column */}
          <div className="space-y-6 pt-10 text-right pr-2 text-[10px] font-mono text-subtle">
            {timeSlots.map((time) => (
              <div key={time} className="h-16">
                {time}
              </div>
            ))}
          </div>

          {/* 5 Working Days Columns */}
          {weekDays.map((day) => {
            const dayMeetings = meetings.filter((m) => m.date === day.dateStr);

            return (
              <div key={day.dateStr} className="space-y-2">
                {/* Day Header */}
                <div className="p-2 text-center rounded-xl bg-canvas border border-line">
                  <span className="text-[10px] font-mono uppercase text-muted block">
                    {day.dayName}
                  </span>
                  <span className="text-xs font-bold text-ink font-mono">
                    Agost {day.dayNumber}
                  </span>
                </div>

                {/* Day Content Area */}
                <div className="p-2 rounded-xl bg-canvas/40 border border-line-soft min-h-[480px] space-y-2">
                  {dayMeetings.length > 0 ? (
                    dayMeetings.map((mt) => (
                      <div
                        key={mt.id}
                        onClick={() => onOpenNotesModal(mt)}
                        className="p-3 rounded-xl bg-surface border border-line hover:border-accent shadow-xs hover:shadow-md transition-all space-y-1.5 cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold text-accent">
                            {mt.startTime} - {mt.endTime}
                          </span>
                          <Badge variant="dark" size="sm" className="text-[8px] px-1 py-0">
                            {mt.type}
                          </Badge>
                        </div>

                        <h4 className="text-xs font-bold text-ink group-hover:text-accent transition-colors leading-tight">
                          {mt.title}
                        </h4>

                        <span className="text-[10px] text-muted block truncate">
                          {mt.clientName} · Resp: {mt.hostName.split(" ")[0]}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-[10px] text-subtle pt-12">
                      Sem compromissos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
