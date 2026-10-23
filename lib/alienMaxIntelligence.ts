/**
 * Alien Max Intelligence Center Engine (Alien OS)
 * Gerencia análises preditivas, níveis de confiança, simulações de escala e histórico de insights.
 * Conectado às tabelas Supabase: ai_insights, health_scores, alien_scores, metrics, campaigns.
 */

export interface ConfidenceRecommendation {
  id: string;
  clientName: string;
  clientId: string;
  title: string;
  description: string;
  expectedRevenueImpact: string;
  confidenceScore: number; // e.g. 94 (%)
  category: "Tráfego Pago" | "CRM & Automação" | "CRO / Landing Page" | "Branding";
  suggestedAction: string;
}

export interface RiskClient {
  id: string;
  clientName: string;
  clientId: string;
  segment: string;
  riskLevel: "Crítico" | "Atenção";
  primaryIssue: string;
  confidenceScore: number;
  mitigationStrategy: string;
}

export interface ScaleOpportunity {
  id: string;
  clientName: string;
  clientId: string;
  currentRoas: string;
  maxProfitableBudget: string;
  projectedRevenueIncrease: string;
  confidenceScore: number;
  recommendedAction: string;
}

export interface InsightRecord {
  id: string;
  companyName: string;
  companyId: string;
  timestamp: string;
  title: string;
  summary: string;
  impactScore: number;
  category: string;
}

export interface GrowthSimulationResult {
  currentBudget: number;
  targetBudget: number;
  currentRoas: number;
  projectedRoas: number;
  currentRevenue: number;
  projectedRevenue: number;
  incrementalRevenue: number;
  confidenceScore: number;
  riskAnalysis: string;
}

export function calculateGrowthScenario(
  currentBudget: number,
  currentRoas: number,
  targetBudget: number
): GrowthSimulationResult {
  const currentRevenue = currentBudget * currentRoas;
  
  // Curva de retorno decrescente conforme o orçamento aumenta
  const budgetRatio = targetBudget / Math.max(1, currentBudget);
  const roasEfficiencyFactor = Math.max(0.65, 1 - (budgetRatio - 1) * 0.12);
  const projectedRoas = Number((currentRoas * roasEfficiencyFactor).toFixed(2));
  
  const projectedRevenue = targetBudget * projectedRoas;
  const incrementalRevenue = Math.max(0, projectedRevenue - currentRevenue);
  
  // Confiança da simulação baseada na intensidade da escala
  const confidenceScore = Math.max(65, Math.min(98, Math.round(96 - (budgetRatio - 1) * 8)));

  let riskAnalysis = "Escala conservadora com baixo risco de diluição de ROAS.";
  if (budgetRatio > 2) {
    riskAnalysis = "Escala agressiva: exige renovação de criativos e expansão de públicos Lookalike.";
  } else if (budgetRatio > 1.4) {
    riskAnalysis = "Escala moderada: recomendável monitorar frequência e CTR a cada 48h.";
  }

  return {
    currentBudget,
    targetBudget,
    currentRoas,
    projectedRoas,
    currentRevenue,
    projectedRevenue,
    incrementalRevenue,
    confidenceScore,
    riskAnalysis,
  };
}

export function getConfidenceRecommendations(): ConfidenceRecommendation[] {
  return [];
}

export function getRiskRadarClients(): RiskClient[] {
  return [];
}

export function getScaleOpportunities(): ScaleOpportunity[] {
  return [];
}

export function getInsightsHistory(): InsightRecord[] {
  return [];
}

/**
 * Envia a pergunta para o Alien Max real (Claude + ferramentas com dados do Supabase/APIs).
 * Antes esta função devolvia respostas prontas com clientes fictícios.
 */
export async function sendAlienMaxChatMessage(userQuery: string): Promise<string> {
  const res = await fetch("/api/alien-max", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: userQuery }],
      context: { clientName: "Todas as Contas (Agência)" },
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
  if (!res.ok) {
    throw new Error(data.error || `Erro ${res.status} ao consultar o Alien Max`);
  }
  return data.reply || "O Alien Max não retornou resposta.";
}
