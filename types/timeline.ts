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

/**
 * Normaliza valores de etapa vindos do banco. Registros antigos usam nomes
 * como "Em Escala" ou "Em Diagnóstico"; aqui eles são convertidos para a
 * etapa canônica da Jornada de Abdução. Valores desconhecidos viram "Recepção".
 */
const LEGACY_STAGE_MAP: Record<string, JourneyStage> = {
  "recepcao": "Recepção",
  "lead": "Recepção",
  "onboarding": "Recepção",
  "escaneamento": "Escaneamento",
  "diagnostico": "Diagnóstico",
  "em diagnostico": "Diagnóstico",
  "plano": "Plano",
  "setup": "Plano",
  "execucao": "Execução",
  "em execucao": "Execução",
  "otimizacao": "Otimização",
  "escala": "Escala",
  "em escala": "Escala",
  "case": "Case",
  "case alien": "Case",
};

export function normalizeJourneyStage(value: unknown): JourneyStage {
  if (typeof value !== "string" || !value.trim()) return "Recepção";
  const key = value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return LEGACY_STAGE_MAP[key] ?? "Recepção";
}

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
