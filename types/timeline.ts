/**
 * Definições de Timeline e Jornada de Abdução (Alien OS)
 */

export type JourneyStage =
  | "Recepção"
  | "Escaneamento"
  | "Diagnóstico"
  | "Plano"
  | "Execução"
  | "Otimização"
  | "Escala"
  | "Case";

export const ABDUCTION_STAGES: JourneyStage[] = [
  "Recepção",
  "Escaneamento",
  "Diagnóstico",
  "Plano",
  "Execução",
  "Otimização",
  "Escala",
  "Case",
];

export type ActivityType =
  | "Reunião realizada"
  | "Criativo aprovado"
  | "Landing Page publicada"
  | "Campanha iniciada"
  | "Novo insight da IA"
  | "Marco atingido";

export interface TimelineItem {
  id: string;
  clientId?: string;
  title: string;
  type: ActivityType;
  timestamp: string;
  description: string;
  author: string;
  metadata?: Record<string, unknown>;
}
