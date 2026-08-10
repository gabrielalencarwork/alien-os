/**
 * Alien Max v1 Engine de Diagnóstico (Rule-Based Strategy Engine)
 * Arquitetura desacoplada para fácil substituição/complementação por modelos de IA Generativa.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export interface ScanAnswers {
  // Site (0 - 10)
  siteSpeed: number; // 0-10
  siteMobile: boolean;
  siteCheckout: boolean;

  // Branding (0 - 10)
  brandConsistency: number;
  clearValueProp: boolean;

  // Google Meu Negócio (0 - 10)
  gmbVerified: boolean;
  gmbReviews: number; // 0-10

  // Redes Sociais (0 - 10)
  socialRegularity: number;
  socialEngagement: number;

  // Tráfego Pago (0 - 10)
  paidTracking: boolean; // Pixel / CAPI
  paidRetargeting: boolean;
  paidCreativeTesting: boolean;

  // SEO (0 - 10)
  seoRankings: number;
  seoMetaTags: boolean;

  // Dados & Analytics (0 - 10)
  ga4Configured: boolean;
  conversionEventsValidated: boolean;

  // Automações & CRM (0 - 10)
  emailFlowsActive: boolean;
  whatsappBotActive: boolean;
}

export interface AlienMaxReportResult {
  id: string;
  clientId: string;
  clientName: string;
  createdAt: string;
  alienScore: number;
  healthScore: "Excelente" | "Atenção" | "Crítico";
  opportunityScore: number;
  executiveSummary: string;
  strongPoints: string[];
  weakPoints: string[];
  priorities: string[];
  nextSteps: {
    title: string;
    description: string;
    impact: "Alto Impacto" | "Crítico" | "Médio Impacto";
  }[];
  categoryScores: {
    site: number;
    branding: number;
    gmb: number;
    social: number;
    traffic: number;
    seo: number;
    data: number;
    automations: number;
  };
}

export function calculateCategoryScores(answers: ScanAnswers) {
  const site = Math.round(
    ((answers.siteSpeed + (answers.siteMobile ? 10 : 0) + (answers.siteCheckout ? 10 : 0)) / 30) * 100
  );

  const branding = Math.round(
    ((answers.brandConsistency + (answers.clearValueProp ? 10 : 0)) / 20) * 100
  );

  const gmb = Math.round(
    (((answers.gmbVerified ? 10 : 0) + answers.gmbReviews) / 20) * 100
  );

  const social = Math.round(
    ((answers.socialRegularity + answers.socialEngagement) / 20) * 100
  );

  const traffic = Math.round(
    (((answers.paidTracking ? 10 : 0) +
      (answers.paidRetargeting ? 10 : 0) +
      (answers.paidCreativeTesting ? 10 : 0)) /
      30) *
      100
  );

  const seo = Math.round(
    ((answers.seoRankings + (answers.seoMetaTags ? 10 : 0)) / 20) * 100
  );

  const data = Math.round(
    (((answers.ga4Configured ? 10 : 0) + (answers.conversionEventsValidated ? 10 : 0)) / 20) *
      100
  );

  const automations = Math.round(
    (((answers.emailFlowsActive ? 10 : 0) + (answers.whatsappBotActive ? 10 : 0)) / 20) * 100
  );

  return { site, branding, gmb, social, traffic, seo, data, automations };
}

export async function runAlienMaxScan(
  clientId: string,
  clientName: string,
  answers: ScanAnswers
): Promise<AlienMaxReportResult> {
  const catScores = calculateCategoryScores(answers);

  // Alien Score = Média Ponderada das 8 Categorias
  const rawScore =
    catScores.traffic * 0.25 +
    catScores.site * 0.2 +
    catScores.data * 0.15 +
    catScores.automations * 0.15 +
    catScores.branding * 0.1 +
    catScores.social * 0.05 +
    catScores.seo * 0.05 +
    catScores.gmb * 0.05;

  const alienScore = Math.min(100, Math.max(10, Math.round(rawScore)));

  // Health Score
  let healthScore: "Excelente" | "Atenção" | "Crítico" = "Excelente";
  if (alienScore < 60) {
    healthScore = "Crítico";
  } else if (alienScore < 82) {
    healthScore = "Atenção";
  }

  // Opportunity Score = 100 - Alien Score (Potencial de Crescimento Incremental)
  const opportunityScore = Math.min(95, Math.max(15, 100 - alienScore + 10));

  // Geração de Pontos Fortes e Gargalos
  const strongPoints: string[] = [];
  const weakPoints: string[] = [];
  const priorities: string[] = [];

  if (answers.paidTracking) {
    strongPoints.push("Rastreamento avançado de mídia (Pixel/CAPI) ativado e validado.");
  } else {
    weakPoints.push("Falta de rastreamento CAPI em Meta Ads gerando perda de atribuição de conversões.");
    priorities.push("Ativar API de Conversões (CAPI) no servidor.");
  }

  if (answers.siteCheckout) {
    strongPoints.push("Checkout simplificado e otimizado para alta conversão móvel.");
  } else {
    weakPoints.push("Checkout com múltiplos campos gerando atrito e abandono de carrinho.");
    priorities.push("Implementar checkout em 1-etapa para reduzir o abandono.");
  }

  if (answers.ga4Configured && answers.conversionEventsValidated) {
    strongPoints.push("Google Analytics 4 com eventos de conversão e e-commerce validados.");
  } else {
    weakPoints.push("Eventos de conversão no GA4 desalinhados com o faturamento real.");
    priorities.push("Refazer a camada de dados (DataLayer) do GA4.");
  }

  if (answers.emailFlowsActive) {
    strongPoints.push("Automação de e-mail marketing ativa gerando receita recorrente pós-venda.");
  } else {
    weakPoints.push("Ausência de réguas automatizadas de e-mail para carrinho abandonado e LTV.");
    priorities.push("Ativar fluxo automático de recuperação de carrinho no Klaviyo/CRM.");
  }

  if (answers.whatsappBotActive) {
    strongPoints.push("Atendimento instantâneo via WhatsApp reduzindo tempo de resposta de leads.");
  } else {
    weakPoints.push("Tempo de resposta superior a 30 minutos em leads de topo de funil.");
    priorities.push("Implementar bot de qualificação automática no WhatsApp.");
  }

  if (strongPoints.length === 0) {
    strongPoints.push("Posicionamento inicial com grande margem de evolução no mercado.");
  }

  // Executive Summary
  const executiveSummary = `O escaneamento digital da conta ${clientName} registrou um Alien Score de ${alienScore}/100 com nível de saúde "${healthScore}". Identificamos um Potencial de Crescimento de ${opportunityScore} pts através da otimização das réguas de tráfego, automações e velocidade de conversão.`;

  const nextSteps = [
    {
      title: priorities[0] || "Otimizar estrutura de anúncios em Meta Ads",
      description: "Ajustar segmentações e renovar criativos com foco em ROAS acima de 4.0x.",
      impact: "Crítico" as const,
    },
    {
      title: priorities[1] || "Ativar régua de automação de e-mail pós-venda",
      description: "Implementar sequências automáticas para aumentar a taxa de recompra.",
      impact: "Alto Impacto" as const,
    },
    {
      title: "Realizar teste A/B da chamada principal da Landing Page",
      description: "Testar novo gancho de proposta de valor para aumentar a taxa de conversão em 15%.",
      impact: "Médio Impacto" as const,
    },
  ];

  const reportResult: AlienMaxReportResult = {
    id: `scan-${Date.now()}`,
    clientId,
    clientName,
    createdAt: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    alienScore,
    healthScore,
    opportunityScore,
    executiveSummary,
    strongPoints,
    weakPoints,
    priorities,
    nextSteps,
    categoryScores: catScores,
  };

  // Tentar salvar na tabela `ai_insights` no Supabase
  try {
    const supabase = createBrowserClient();
    await supabase.from("ai_insights").insert({
      company_id: clientId,
      title: `Escaneamento Digital Alien Max - ${clientName}`,
      summary: executiveSummary,
      biggest_bottleneck: weakPoints[0] || "Falta de automação no pós-venda",
      biggest_opportunity: `Potencial de crescimento de ${opportunityScore} pts com escala de mídias`,
      weekly_priority: priorities[0] || "Ativar rastreamento CAPI",
      impact_score: alienScore,
      recommendations_json: nextSteps,
    });
  } catch {
    // Ignora erro se for execução em modo local/demonstração
  }

  return reportResult;
}
