/**
 * Repository Pattern: Meeting Repository (Alien OS)
 * Gerencia a agenda executiva, reuniões de diagnóstico, alinhamentos semanais e atas.
 * Conectado às tabelas Supabase: meetings, meeting_participants, meeting_notes, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type MeetingType =
  | "Diagnóstico Inicial"
  | "Reunião de Onboarding"
  | "Alinhamento Semanal"
  | "Apresentação de Resultados"
  | "Reunião Estratégica"
  | "Entrega de Criativos"
  | "Revisão Contratual"
  | "Emergencial / Alinhamento";

export type MeetingStatus =
  | "Agendada"
  | "Confirmada"
  | "Em andamento"
  | "Concluída"
  | "Cancelada"
  | "Reagendada";

export interface MeetingParticipantItem {
  id: string;
  meetingId: string;
  name: string;
  role: string;
  avatarUrl?: string;
  confirmed: boolean;
}

export interface MeetingNotesItem {
  id: string;
  meetingId: string;
  summary: string;
  decisions: string;
  pendingIssues: string;
  nextSteps: string;
  authorName: string;
  createdAt: string;
}

export interface MeetingItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  serviceName?: string;
  title: string;
  type: MeetingType;
  description: string;
  hostName: string;
  hostAvatar?: string;
  date: string;
  scheduledDate?: string;
  startTime: string;
  scheduledTime?: string;
  endTime: string;
  durationMinutes: number;
  location: string;
  meetingLink?: string;
  status: MeetingStatus;
  journeyStage: string;
  tags: string[];
  participants: MeetingParticipantItem[];
  notes?: MeetingNotesItem;
}

export interface MeetingStats {
  todayMeetingsCount: number;
  weekMeetingsCount: number;
  nextOnboardingsCount: number;
  scheduledDiagnosticsCount: number;
  weekDeliveriesCount: number;
  pendingFollowupsCount: number;
  scheduledHoursTotal: number;
  teamOccupancyPercentage: number;
  completedMeetingsCount: number;
}

export interface AlienMaxAgendaInsight {
  id: string;
  type: "Sem Reunião" | "Onboarding" | "Conflito" | "Sugestão" | "Performance";
  clientName: string;
  companyId: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export class MeetingRepository {
  async getStats(): Promise<MeetingStats> {
    const emptyStats: MeetingStats = {
      todayMeetingsCount: 0,
      weekMeetingsCount: 0,
      nextOnboardingsCount: 0,
      scheduledDiagnosticsCount: 0,
      weekDeliveriesCount: 0,
      pendingFollowupsCount: 0,
      scheduledHoursTotal: 0,
      teamOccupancyPercentage: 0,
      completedMeetingsCount: 0,
    };

    try {
      const meetings = await this.getMeetings();
      if (meetings.length === 0) return emptyStats;

      const today = new Date().toISOString().split("T")[0];
      const todayCount = meetings.filter((m) => m.date === today).length;
      const completed = meetings.filter((m) => m.status === "Concluída").length;
      const onboardings = meetings.filter((m) => m.type === "Reunião de Onboarding").length;
      const diagnostics = meetings.filter((m) => m.type === "Diagnóstico Inicial").length;

      const totalMinutes = meetings.reduce((acc, m) => acc + (m.durationMinutes || 60), 0);

      return {
        todayMeetingsCount: todayCount,
        weekMeetingsCount: meetings.length,
        nextOnboardingsCount: onboardings,
        scheduledDiagnosticsCount: diagnostics,
        weekDeliveriesCount: 0,
        pendingFollowupsCount: 0,
        scheduledHoursTotal: Math.round(totalMinutes / 60),
        teamOccupancyPercentage: 0,
        completedMeetingsCount: completed,
      };
    } catch {
      return emptyStats;
    }
  }

  async getMeetings(): Promise<MeetingItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("meetings").select("*");
      if (data && data.length > 0) {
        return data.map((m) => ({
          id: m.id,
          companyId: m.company_id,
          clientName: m.company_id,
          companyName: m.company_id,
          title: m.title,
          type: m.type as any,
          description: m.description || "",
          hostName: m.host_name || "Organizador Alien",
          date: m.date || m.scheduled_date || "",
          scheduledDate: m.scheduled_date || m.date || "",
          startTime: m.start_time || m.scheduled_time || "",
          scheduledTime: m.scheduled_time || m.start_time || "",
          endTime: m.end_time || "",
          durationMinutes: Number(m.duration_minutes) || 60,
          location: m.location || "Online",
          meetingLink: m.meeting_link,
          status: m.status as any,
          journeyStage: m.journey_stage || "Geral",
          tags: m.tags || [],
          participants: [],
        }));
      }
    } catch (err) {
      console.error("Erro ao ler meetings no Supabase:", err);
    }
    return [];
  }

  async getMeetingById(id: string): Promise<MeetingItem | null> {
    const meetings = await this.getMeetings();
    return meetings.find((m) => m.id === id) || null;
  }

  async getAlienMaxInsights(): Promise<AlienMaxAgendaInsight[]> {
    return [];
  }
}

export const meetingRepository = new MeetingRepository();
