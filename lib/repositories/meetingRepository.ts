/**
 * Repository Pattern: Meeting Repository (Alien OS)
 * Gerencia a leitura, agendamento, atas de reunião e integração com CRM/Jornada de Abdução.
 * Conectado às tabelas Supabase: meetings, meeting_participants, meeting_notes, timeline, tasks.
 */

import { createBrowserClient } from "@/lib/supabase/client";

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

export type MeetingStatus = "Agendada" | "Em Andamento" | "Concluída" | "Cancelada" | "Reagendada";

export interface MeetingParticipant {
  id: string;
  meetingId: string;
  name: string;
  email?: string;
  role: "Organizador" | "Participante Interno" | "Cliente";
  confirmed: boolean;
}

export interface MeetingNote {
  id: string;
  meetingId: string;
  summary: string;
  decisions?: string;
  pendingIssues?: string;
  nextSteps?: string;
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
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  location: string;
  meetingLink?: string;
  status: MeetingStatus;
  journeyStage?: string;
  tags?: string[];
  participants: MeetingParticipant[];
  notes?: MeetingNote;
}

export interface MeetingStats {
  todayMeetingsCount: number;
  weekMeetingsCount: number;
  nextOnboardingsCount: number;
  scheduledDiagnosticsCount: number;
  weekDeliveriesCount: number;
  pendingFollowupsCount: number;
  scheduledHoursTotal: number;
  teamOccupancyPercentage: number; // ex: 82%
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

export const mockMeetingStats: MeetingStats = {
  todayMeetingsCount: 4,
  weekMeetingsCount: 18,
  nextOnboardingsCount: 2,
  scheduledDiagnosticsCount: 3,
  weekDeliveriesCount: 6,
  pendingFollowupsCount: 5,
  scheduledHoursTotal: 24,
  teamOccupancyPercentage: 82,
  completedMeetingsCount: 38,
};

export const mockMeetings: MeetingItem[] = [
  {
    id: "meet-101",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    projectName: "Escala Q3 Meta Ads",
    serviceName: "Gestão de Tráfego",
    title: "Alinhamento Quinzenal de ROAS & Escala Q3",
    type: "Reunião Estratégica",
    description: "Revisão dos resultados de Meta Ads (ROAS 5.2x) e apresentação da proposta de aporte incremental.",
    hostName: "Gabriel Alencar",
    date: "2026-08-04",
    startTime: "10:00",
    endTime: "11:00",
    durationMinutes: 60,
    location: "Online (Google Meet)",
    meetingLink: "https://meet.google.com/ali-enos-mkt",
    status: "Agendada",
    journeyStage: "Estruturação de Mídia & Tech",
    tags: ["ROAS", "Meta Ads", "Escala"],
    participants: [
      { id: "pt-1", meetingId: "meet-101", name: "Gabriel Alencar", role: "Organizador", confirmed: true },
      { id: "pt-2", meetingId: "meet-101", name: "Lucas Mendes", role: "Participante Interno", confirmed: true },
      { id: "pt-3", meetingId: "meet-101", name: "Dr. Roberto (Aura)", role: "Cliente", confirmed: true },
    ],
    notes: {
      id: "nt-1",
      meetingId: "meet-101",
      summary: "Apresentados resultados de ROAS 5.2x no retargeting.",
      decisions: "Aprovado aumento de orçamento em +R$ 25.000/mês para o Meta Ads.",
      pendingIssues: "Aprovação final do termo aditivo contratual pelo jurídico.",
      nextSteps: "Subir 3 novos conjuntos CBO e ativar réguas Klaviyo.",
      authorName: "Gabriel Alencar",
      createdAt: "2026-08-04T11:05:00Z",
    },
  },
  {
    id: "meet-102",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    projectName: "Branding & CRO",
    serviceName: "Social Media",
    title: "Apresentação da Nova Identidade Visual & UGC",
    type: "Apresentação",
    description: "Demonstração das novas peças de criativos UGC e protótipo da Landing Page móvel.",
    hostName: "Fernanda Lima",
    date: "2026-08-04",
    startTime: "14:30",
    endTime: "15:30",
    durationMinutes: 60,
    location: "Online (Google Meet)",
    meetingLink: "https://meet.google.com/lum-ina-skn",
    status: "Agendada",
    journeyStage: "Estruturação de Mídia & Tech",
    tags: ["Branding", "UGC", "CRO"],
    participants: [
      { id: "pt-4", meetingId: "meet-102", name: "Fernanda Lima", role: "Organizador", confirmed: true },
      { id: "pt-5", meetingId: "meet-102", name: "Mariana Skincare", role: "Cliente", confirmed: true },
    ],
  },
  {
    id: "meet-103",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    projectName: "Kick-off & Setup",
    serviceName: "Growth B2B",
    title: "Kick-off de Onboarding & Liberar Acessos Tech",
    type: "Onboarding",
    description: "Reunião inicial para preenchimento de briefing e configuração de acessos Google Ads e GA4.",
    hostName: "Matheus Silva",
    date: "2026-08-05",
    startTime: "09:00",
    endTime: "10:30",
    durationMinutes: 90,
    location: "Online (Google Meet)",
    meetingLink: "https://meet.google.com/nex-uss-aas",
    status: "Agendada",
    journeyStage: "Assinatura & Onboarding",
    tags: ["Onboarding", "Setup", "GA4"],
    participants: [
      { id: "pt-6", meetingId: "meet-103", name: "Matheus Silva", role: "Organizador", confirmed: true },
      { id: "pt-7", meetingId: "meet-103", name: "Carla Ramos", role: "Participante Interno", confirmed: true },
      { id: "pt-8", meetingId: "meet-103", name: "Carlos Tech (Nexus)", role: "Cliente", confirmed: true },
    ],
  },
  {
    id: "meet-104",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    projectName: "Diagnóstico Alien Max",
    serviceName: "Mídia Full Stack",
    title: "Reunião de Diagnóstico de Performance & Alien Score",
    type: "Diagnóstico",
    description: "Apresentação dos gargalos mapeados pela engine do Alien Max v1.",
    hostName: "Gabriel Alencar",
    date: "2026-08-06",
    startTime: "16:00",
    endTime: "17:00",
    durationMinutes: 60,
    location: "Online (Google Meet)",
    meetingLink: "https://meet.google.com/vor-tex-sup",
    status: "Agendada",
    journeyStage: "Diagnóstico & Setup",
    tags: ["Diagnóstico", "Alien Max", "Performance"],
    participants: [
      { id: "pt-9", meetingId: "meet-104", name: "Gabriel Alencar", role: "Organizador", confirmed: true },
      { id: "pt-10", meetingId: "meet-104", name: "Vitor Nutri", role: "Cliente", confirmed: true },
    ],
  },
];

export const mockAlienMaxAgendaInsights: AlienMaxAgendaInsight[] = [
  {
    id: "mt-ins-1",
    type: "Sem Reunião",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    title: "Cliente sem reunião de alinhamento há mais de 30 dias",
    description: "O último alinhamento ocorreu há 34 dias. O Alien Max sugere agendar uma reunião de prestação de contas de Google Ads.",
    confidenceScore: 95,
    recommendedAction: "Enviar convite de reunião quinzenal ao fundador do Nexus SaaS",
  },
  {
    id: "mt-ins-2",
    type: "Performance",
    clientName: "Stellar Solar",
    companyId: "stellar-solar",
    title: "A Stellar Solar necessita de uma reunião urgente de performance",
    description: "Queda pontual de 18% no volume de leads qualificados. Apresentar os 16 termos negativados no Google Search.",
    confidenceScore: 92,
    recommendedAction: "Agendar reunião técnica de revisão de palavras-chave",
  },
  {
    id: "mt-ins-3",
    type: "Onboarding",
    clientName: "Vortex Suplementos",
    companyId: "vortex-suplementos",
    title: "Onboarding atrasado em 4 dias",
    description: "A reunião de kick-off de onboarding não foi realizada devido à falta de liberações no Meta BM.",
    confidenceScore: 94,
    recommendedAction: "Reagendar reunião com o gestor de acessos da marca",
  },
  {
    id: "mt-ins-4",
    type: "Conflito",
    clientName: "Gabriel Alencar",
    companyId: "alien-team",
    title: "Conflito de agenda identificado às 15:00 na quinta-feira",
    description: "Você possui duas reuniões overlapping no mesmo horário. Sugestão: antecipar a reunião da Lumina para amanhã às 11h.",
    confidenceScore: 98,
    recommendedAction: "Remanejar horário da reunião com o cliente Lumina",
  },
];

export class MeetingRepository {
  async getStats(): Promise<MeetingStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("meetings").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockMeetingStats,
          todayMeetingsCount: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockMeetingStats;
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
          hostName: m.host_name,
          date: m.date,
          startTime: m.start_time,
          endTime: m.end_time,
          durationMinutes: m.duration_minutes,
          location: m.location || "Online",
          meetingLink: m.meeting_link,
          status: m.status as any,
          journeyStage: m.journey_stage,
          tags: m.tags || [],
          participants: [],
        }));
      }
    } catch {
      // Fallback
    }
    return mockMeetings;
  }

  async getAlienMaxInsights(): Promise<AlienMaxAgendaInsight[]> {
    return mockAlienMaxAgendaInsights;
  }

  async saveMeetingNotesAndCreateTimeline(
    meetingId: string,
    companyId: string,
    notes: MeetingNote
  ): Promise<void> {
    try {
      const supabase = createBrowserClient();
      await supabase.from("meeting_notes").insert({
        meeting_id: meetingId,
        company_id: companyId,
        summary: notes.summary,
        decisions: notes.decisions,
        pending_issues: notes.pendingIssues,
        next_steps: notes.nextSteps,
        author_name: notes.authorName,
      });

      // Cria automaticamente um evento na timeline do cliente
      await supabase.from("timeline").insert({
        company_id: companyId,
        title: `Ata de Reunião Concluída: ${notes.summary.slice(0, 40)}...`,
        activity_type: "Reunião",
        description: `Decisões: ${notes.decisions}. Próximos Passos: ${notes.nextSteps}`,
        author_name: notes.authorName,
      });
    } catch {
      // Ignora em modo local
    }
  }
}

export const meetingRepository = new MeetingRepository();
