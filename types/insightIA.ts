/**
 * Definições de Inteligência Artificial e Automação (Alien OS)
 * Tabela Supabase: ai_insights / ai_recommendations
 * Nota: A IA Apenas Recomenda, Nunca Toma Decisões Autônomas de Execução.
 */

export type InsightCategory =
  | "Escala de Mídia"
  | "Retenção / LTV"
  | "Conversão / CRO"
  | "Otimização de CAC"
  | "Risco de Churn"
  | "Geral";

export interface AIRecommendation {
  id: string;
  category?: string;
  title: string;
  description: string;
  expectedImpact: string;
  action: string;
  appliedStatus?: "Pendente" | "Aprovado" | "Rejeitado";
}

export interface InsightIA {
  id: string;
  clientId?: string;
  clientName?: string;
  category: InsightCategory;
  title: string;
  summary: string;
  biggestBottleneck: string;
  biggestOpportunity: string;
  weeklyPriority: string;
  impactScore: number; // 0-100
  recommendations: AIRecommendation[];
  createdAt: string;
}
