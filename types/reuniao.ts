/**
 * Definições de Reuniões e Agenda (Alien OS)
 * Tabela Supabase: meetings / agendas
 */

export type MeetingStatus = "Agendada" | "Concluída" | "Cancelada" | "Reagendada";

export type MeetingType = "Diagnóstico" | "Alinhamento Quinzanal" | "Review QBR" | "Emergencial";

export interface Reuniao {
  id: string; // UUID
  clientId: string;
  clientName: string;
  title: string;
  type: MeetingType;
  status: MeetingStatus;
  scheduledAt: string; // ISO String
  durationMinutes: number;
  locationOrUrl?: string;
  hostName: string;
  notesSummary?: string;
  actionItems?: string[];
  createdAt: string;
}
