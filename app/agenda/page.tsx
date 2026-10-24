"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  meetingRepository,
  MeetingStats,
  MeetingItem,
  AlienMaxAgendaInsight,
} from "@/lib/repositories/meetingRepository";
import { AgendaMetricsGrid } from "@/components/agenda/AgendaMetricsGrid";
import { AgendaWeekWidget } from "@/components/agenda/AgendaWeekWidget";
import { AgendaDayWidget } from "@/components/agenda/AgendaDayWidget";
import { AgendaListWidget } from "@/components/agenda/AgendaListWidget";
import { MeetingCreateModal } from "@/components/agenda/MeetingCreateModal";
import { MeetingNotesModal } from "@/components/agenda/MeetingNotesModal";
import { AlienMaxAgendaAdvisorWidget } from "@/components/agenda/AlienMaxAgendaAdvisorWidget";
import {
  PlusIcon,
  ClockIcon,
  LayoutDashboardIcon,
  BriefcaseIcon,
  FileTextIcon,
} from "@/components/icons";

export default function AgendaPage() {
  const [stats, setStats] = useState<MeetingStats | null>(null);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxAgendaInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'week', 'day', 'list', 'month'
  const [viewMode, setViewMode] = useState<"week" | "day" | "list" | "month">("week");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedNotesMeeting, setSelectedNotesMeeting] = useState<MeetingItem | null>(null);

  const loadAgendaData = useCallback(async () => {
    try {
      const [statRes, meetRes, insightRes] = await Promise.all([
        meetingRepository.getStats(),
        meetingRepository.getMeetings(),
        meetingRepository.getAlienMaxInsights(),
      ]);

      setStats(statRes);
      setMeetings(meetRes);
      setInsights(insightRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgendaData();
  }, [loadAgendaData]);

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header & View Switcher */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 15 · Agenda Inteligente
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  Central de Reuniões & Compromissos
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Agenda Inteligente & Central de Reuniões
              </h1>
              <p className="text-sm text-body">
                Gestão unificada de alinhamentos, onboardings, diagnósticos e atas integradas ao CRM e Jornada de Abdução
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* 4 View Switcher Toggle */}
              <div className="p-1 rounded-xl bg-surface border border-line flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("week")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "week"
                      ? "bg-inverse text-white"
                      : "text-body hover:text-ink"
                  }`}
                >
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>Semanal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("day")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "day"
                      ? "bg-inverse text-white"
                      : "text-body hover:text-ink"
                  }`}
                >
                  <LayoutDashboardIcon className="w-3.5 h-3.5" />
                  <span>Diário</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "list"
                      ? "bg-inverse text-white"
                      : "text-body hover:text-ink"
                  }`}
                >
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  <span>Lista</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Agendar Reunião
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Carregando agenda executiva da agência...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <AgendaMetricsGrid stats={stats} />
            </section>

            {/* 3. Main 2-Column Layout (Agenda View + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Agenda View (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {viewMode === "week" && (
                  <AgendaWeekWidget
                    meetings={meetings}
                    onOpenNotesModal={setSelectedNotesMeeting}
                  />
                )}

                {viewMode === "day" && (
                  <AgendaDayWidget
                    meetings={meetings}
                    onOpenNotesModal={setSelectedNotesMeeting}
                  />
                )}

                {viewMode === "list" && (
                  <AgendaListWidget
                    meetings={meetings}
                    onOpenNotesModal={setSelectedNotesMeeting}
                  />
                )}
              </div>

              {/* Alien Max Agenda Advisor (1 Col) */}
              <div>
                <AlienMaxAgendaAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <MeetingCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={loadAgendaData}
      />

      <MeetingNotesModal
        key={selectedNotesMeeting?.id ?? "none"}
        meeting={selectedNotesMeeting}
        onClose={() => {
          setSelectedNotesMeeting(null);
          loadAgendaData();
        }}
      />
    </PageContainer>
  );
}
