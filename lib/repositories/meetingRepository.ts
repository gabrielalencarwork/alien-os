/**
 * Repository Pattern: Meeting Repository (Alien OS)
 * Gerencia a agenda executiva, reuniões de diagnóstico, alinhamentos semanais e atas.
 * Conectado às tabelas Supabase: meetings, meeting_participants, meeting_notes, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

// Valores canônicos — os mesmos documentados na migration da tabela `meetings`.
export type MeetingType =
  | "Onboarding"
  | "Diagnóstico"
  | "Reunião Estratégica"
  | "Follow-up"
  | "Aprovação"
  | "Planejamento"
  | "Apresentação"
  | "Entrega"
  | "Reunião Interna"
  | "Outro";

export const MEETING_TYPES: MeetingType[] = [
  "Onboarding",
  "Diagnóstico",
  "Reunião Estratégica",
  "Follow-up",
  "Aprovação",
  "Planejamento",
  "Apresentação",
  "Entrega",
  "Reunião Interna",
  "Outro",
];

export type MeetingStatus =
  | "Agendada"
  | "Confirmada"
  | "Em Andamento"
  | "Concluída"
  | "Cancelada"
  | "Reagendada";

function normalizeKey(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : "";
}

const TYPE_MAP: Record<string, MeetingType> = {
  ...Object.fromEntries(MEETING_TYPES.map((t) => [normalizeKey(t), t])),
  // nomes antigos usados em versões anteriores do sistema
  "reuniao de onboarding": "Onboarding",
  "diagnostico inicial": "Diagnóstico",
  "alinhamento semanal": "Follow-up",
  "apresentacao de resultados": "Apresentação",
  "entrega de criativos": "Entrega",
  "revisao contratual": "Outro",
  "emergencial / alinhamento": "Outro",
};

const STATUS_MAP: Record<string, MeetingStatus> = {
  "agendada": "Agendada",
  "confirmada": "Confirmada",
  "em andamento": "Em Andamento",
  "concluida": "Concluída",
  "concluido": "Concluída",
  "cancelada": "Cancelada",
  "reagendada": "Reagendada",
};

export function normalizeMeetingType(value: unknown): MeetingType {
  return TYPE_MAP[normalizeKey(value)] ?? "Outro";
}

export function normalizeMeetingStatus(value: unknown): MeetingStatus {
  return STATUS_MAP[normalizeKey(value)] ?? "Agendada";
}

export interface NewMeetingInput {
  companyId?: string;
  title: string;
  type: MeetingType;
  hostName?: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  location?: string;
  meetingLink?: string;
  description?: string;
}

export interface NewMeetingNotesInput {
  meetingId: string;
  companyId?: string;
  summary: string;
  decisions?: string;
  pendingIssues?: string;
  nextSteps?: string;
  authorName?: string;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

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
      const onboardings = meetings.filter((m) => m.type === "Onboarding").length;
      const diagnostics = meetings.filter((m) => m.type === "Diagnóstico").length;

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
      const { data, error } = await supabase
        .from("meetings")
        .select("*, companies(trade_name, legal_name), meeting_notes(*)")
        .eq("active", true)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((m) => {
          const note = Array.isArray(m.meeting_notes)
            ? [...m.meeting_notes].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))[0]
            : undefined;
          return {
          id: m.id,
          companyId: m.company_id,
          clientName: m.companies?.trade_name || m.companies?.legal_name || "Interno",
          companyName: m.companies?.legal_name || m.companies?.trade_name || "",
          title: m.title,
          type: normalizeMeetingType(m.type),
          description: m.description || "",
          hostName: m.host_name || "Organizador Alien",
          date: m.date || m.scheduled_date || "",
          scheduledDate: m.scheduled_date || m.date || "",
          startTime: String(m.start_time || m.scheduled_time || "").slice(0, 5),
          scheduledTime: String(m.scheduled_time || m.start_time || "").slice(0, 5),
          endTime: String(m.end_time || "").slice(0, 5),
          durationMinutes: Number(m.duration_minutes) || 60,
          location: m.location || "Online",
          meetingLink: m.meeting_link,
          status: normalizeMeetingStatus(m.status),
          journeyStage: m.journey_stage || "Geral",
          tags: m.tags || [],
          participants: [],
          notes: note
            ? {
                id: note.id,
                meetingId: note.meeting_id,
                summary: note.summary || "",
                decisions: note.decisions || "",
                pendingIssues: note.pending_issues || "",
                nextSteps: note.next_steps || "",
                authorName: note.author_name || "",
                createdAt: note.created_at,
              }
            : undefined,
        };
        });
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

  async createMeeting(input: NewMeetingInput): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("meetings").insert({
      company_id: input.companyId || null,
      title: input.title.trim(),
      type: input.type,
      host_name: input.hostName?.trim() || undefined,
      date: input.date,
      start_time: input.startTime,
      end_time: addMinutes(input.startTime, input.durationMinutes),
      duration_minutes: input.durationMinutes,
      location: input.location?.trim() || undefined,
      meeting_link: input.meetingLink?.trim() || null,
      description: input.description?.trim() || null,
      status: "Agendada",
    });
    if (error) {
      console.error("Erro ao agendar reunião:", error);
      throw new Error(`Não foi possível agendar a reunião: ${error.message}`);
    }
  }

  /** Salva a ata oficial da reunião em `meeting_notes`. */
  async saveMeetingNotes(input: NewMeetingNotesInput): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("meeting_notes").insert({
      meeting_id: input.meetingId,
      company_id: input.companyId || null,
      summary: input.summary.trim(),
      decisions: input.decisions?.trim() || null,
      pending_issues: input.pendingIssues?.trim() || null,
      next_steps: input.nextSteps?.trim() || null,
      author_name: input.authorName?.trim() || undefined,
    });
    if (error) {
      console.error("Erro ao salvar ata:", error);
      throw new Error(`Não foi possível salvar a ata: ${error.message}`);
    }
  }
}

export const meetingRepository = new MeetingRepository();
