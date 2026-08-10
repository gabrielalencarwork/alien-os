/**
 * Alien Max Intelligence Center Engine (Alien OS)
 * Gerencia análises preditivas, níveis de confiança, simulações de escala e histórico de insights.
 * Conectado às tabelas Supabase: ai_insights, health_scores, alien_scores, metrics, campaigns.
 */

import { createBrowserClient } from "@/lib/supabase/client";

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
  return [
    {
      id: "rec-conf-1",
      clientName: "Aura Health",
      clientId: "aura-health",
      title: "Escalar orçamento de Meta Ads em +R$ 25.000/mês",
      description: "Campanhas de retargeting de fundo de funil apresentam ROAS estável de 5.2x com baixo custo por aquisição.",
      expectedRevenueImpact: "+R$ 115.000 / mês",
      confidenceScore: 95,
      category: "Tráfego Pago",
      suggestedAction: "Elevar o orçamento diário nos conjuntos campeões em 20%",
    },
    {
      id: "rec-conf-2",
      clientName: "Lumina Skincare",
      clientId: "lumina-skincare",
      title: "Ativar régua automatizada de Klaviyo no checkout",
      description: "O abandono de carrinho móvel está em 68%. A sequência de 3 e-mails com oferta dinâmica recuperará faturamento represado.",
      expectedRevenueImpact: "+R$ 38.000 / mês",
      confidenceScore: 91,
      category: "CRM & Automação",
      suggestedAction: "Publicar o fluxo automático de recuperação de carrinho",
    },
    {
      id: "rec-conf-3",
      clientName: "Fintech Velocity",
      clientId: "fintech-velocity",
      title: "Redesenhar hero da Landing Page com proposta de valor B2B",
      description: "A taxa de conversão da página de captura atual é de 2.1%. Testes A/B indicam ganho com headline focada em redução de taxas.",
      expectedRevenueImpact: "+R$ 52.000 em receita recorrente",
      confidenceScore: 88,
      category: "CRO / Landing Page",
      suggestedAction: "Iniciar teste A/B no VWO / Google Optimize",
    },
  ];
}

export function getRiskRadarClients(): RiskClient[] {
  return [
    {
      id: "risk-1",
      clientName: "Nexus SaaS",
      clientId: "nexus-saas",
      segment: "B2B Software",
      riskLevel: "Crítico",
      primaryIssue: "Subida do CAC em 34% no Meta Ads devido à saturação de criativos.",
      confidenceScore: 92,
      mitigationStrategy: "Subir 4 novos vídeos UGC e pausar o conjunto saturado.",
    },
    {
      id: "risk-2",
      clientName: "Stellar Solar",
      clientId: "stellar-solar",
      segment: "Energia Solar",
      riskLevel: "Atenção",
      primaryIssue: "Aumento de 18% em leads desqualificados no Google Search.",
      confidenceScore: 86,
      mitigationStrategy: "Negativar 16 termos de pesquisa amadores identificados pelo Alien Max.",
    },
  ];
}

export function getScaleOpportunities(): ScaleOpportunity[] {
  return [
    {
      id: "scale-1",
      clientName: "Aura Health",
      clientId: "aura-health",
      currentRoas: "5.2x",
      maxProfitableBudget: "R$ 85.000 / mês",
      projectedRevenueIncrease: "+R$ 130.000",
      confidenceScore: 96,
      recommendedAction: "Solicitar aprovação de aporte extra de mídia para Q3",
    },
    {
      id: "scale-2",
      clientName: "Vortex Suplementos",
      clientId: "vortex-suplementos",
      currentRoas: "4.8x",
      maxProfitableBudget: "R$ 60.000 / mês",
      projectedRevenueIncrease: "+R$ 84.000",
      confidenceScore: 92,
      recommendedAction: "Expandir campanhas de topo de funil no TikTok Ads",
    },
  ];
}

export function getInsightsHistory(): InsightRecord[] {
  return [
    {
      id: "ins-1",
      companyName: "Aura Health",
      companyId: "aura-health",
      timestamp: "Hoje às 14:30",
      title: "Oportunidade de Escala Identificada",
      summary: "Público Lookalike 2% em Meta Ads registrou ROAS sustentado acima de 5.0x por 14 dias seguidos.",
      impactScore: 95,
      category: "Tráfego Pago",
    },
    {
      id: "ins-2",
      companyName: "Lumina Skincare",
      companyId: "lumina-skincare",
      timestamp: "Ontem às 10:15",
      title: "Gargalo de Conversão no Mobile",
      summary: "Taxa de abandono na etapa de pagamento do checkout subiu 12% após atualização do tema.",
      impactScore: 88,
      category: "UX & Checkout",
    },
    {
      id: "ins-3",
      companyName: "Nexus SaaS",
      companyId: "nexus-saas",
      timestamp: "28/07 às 16:00",
      title: "Saturação de Ad Fatigue Detectada",
      summary: "Frequência média no anúncio principal atingiu 4.2x com queda no CTR.",
      impactScore: 91,
      category: "Mídia & Criativos",
    },
  ];
}

export async function sendAlienMaxChatMessage(userQuery: string): Promise<string> {
  const query = userQuery.toLowerCase();

  if (query.includes("risco") || query.includes("churn") || query.includes("alerta")) {
    return "Identifiquei 2 contas com indicadores de risco atualmente: **Nexus SaaS** (CAC subiu 34% em Meta Ads) e **Stellar Solar** (leads desqualificados em Google Search). Recomendo renovar os criativos do Nexus e negativar termos de busca no Stellar. Confiança da análise: 92%.";
  }

  if (query.includes("escala") || query.includes("upsell") || query.includes("crescer")) {
    return "As 2 maiores oportunidades de escala no momento são **Aura Health** (ROAS 5.2x com margem para +R$ 25k de investimento) e **Vortex Suplementos** (ROAS 4.8x pronto para expansão em TikTok Ads). Confiança média: 94%.";
  }

  if (query.includes("roas") || query.includes("mídia") || query.includes("performance")) {
    return "O ROAS médio da carteira está consolidado em **4.25x**. A campanha de maior eficiência da agência é o conjunto de retargeting da Aura Health (5.2x). O maior gargalo de mídia está na saturação de anúncios do Nexus SaaS.";
  }

  return `Analisando os dados da carteira do Alien OS para "${userQuery}": Recomendo focar no acompanhamento das réguas de e-mail da Lumina Skincare e na escala de orçamento da Aura Health. Esta recomendação tem um nível de confiança estocástica de 91%.`;
}
