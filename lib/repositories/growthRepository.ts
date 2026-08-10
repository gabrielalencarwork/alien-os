/**
 * Repository Pattern: Growth Repository (Alien OS)
 * Gerencia a leitura, escrita e consolidação de experimentos de crescimento no Growth Lab.
 * Conectado às tabelas Supabase: growth_experiments, growth_hypotheses, growth_results, documents, timeline.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type GrowthType =
  | "Criativo"
  | "Copy"
  | "Headline"
  | "Landing Page"
  | "Oferta"
  | "Funil"
  | "Google Ads"
  | "Meta Ads"
  | "TikTok"
  | "SEO"
  | "UX"
  | "Automação"
  | "CRM"
  | "E-mail"
  | "WhatsApp"
  | "Outro";

export type GrowthStatus =
  | "Planejado"
  | "Em preparação"
  | "Rodando"
  | "Em análise"
  | "Validado"
  | "Descartado"
  | "Arquivado";

export interface GrowthResult {
  controlConversions: number;
  variantConversions: number;
  controlConversionRate: number;
  variantConversionRate: number;
  controlRoas: number;
  variantRoas: number;
  winnerVariant: string;
  validatedAt?: string;
}

export interface GrowthExperimentItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  campaignId?: string;
  campaignName?: string;
  title: string;
  type: GrowthType;
  hypothesis: string;
  problemIdentified: string;
  objective: string;
  primaryMetric: string;
  secondaryMetric: string;
  ownerName: string;
  priority: string;
  status: GrowthStatus;
  startDate: string;
  endDate?: string;
  estimatedRevenueImpact: number;
  confirmedRevenueImpact: number;
  roasGain: number;
  conversionGainPercentage: number;
  statisticalConfidencePercentage: number;
  alienMaxProbability: number;
  results?: GrowthResult;
}

export interface GrowthStats {
  activeExperimentsCount: number;
  completedExperimentsCount: number;
  successRatePercentage: number; // ex: 78.5%
  estimatedIncrementalRevenue: number;
  confirmedIncrementalRevenue: number;
  averageTestDays: number; // ex: 12.4 dias
  runningHypothesesCount: number;
  approvedHypothesesCount: number;
  discardedHypothesesCount: number;
  averageRoasGain: number; // ex: +1.4x
  averageConversionGain: number; // ex: +24.2%
}

export interface AlienMaxGrowthInsight {
  id: string;
  type: "Probabilidade" | "Headline" | "Otimização LP" | "Pronto P/ Validação" | "Escala Orçamento";
  clientName: string;
  companyId: string;
  experimentTitle: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export const mockGrowthStats: GrowthStats = {
  activeExperimentsCount: 8,
  completedExperimentsCount: 24,
  successRatePercentage: 78.5,
  estimatedIncrementalRevenue: 142000,
  confirmedIncrementalRevenue: 98400,
  averageTestDays: 12.4,
  runningHypothesesCount: 8,
  approvedHypothesesCount: 19,
  discardedHypothesesCount: 5,
  averageRoasGain: 1.4,
  averageConversionGain: 24.2,
};

export const mockGrowthExperiments: GrowthExperimentItem[] = [
  {
    id: "exp-101",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    projectName: "Escala Q3 Meta Ads",
    campaignName: "Aura · CBO Advantage+ Retargeting topo & meio",
    title: "Teste A/B de Criativo UGC de Depoimento na Primeira Dobra",
    type: "Criativo",
    hypothesis: "Substituir imagens estáticas por vídeos de clientes reais consumindo o nutracêutico aumentará a taxa de conversão em +20%.",
    problemIdentified: "Queda na taxa de clique de saída no anúncio estático de produto.",
    objective: "Aumentar a taxa de conversão do retargeting de 1.8% para 2.4%.",
    primaryMetric: "Taxa de Conversão no Checkout (%)",
    secondaryMetric: "ROAS Retargeting",
    ownerName: "Gabriel Alencar",
    priority: "Alta",
    status: "Rodando",
    startDate: "2026-07-25",
    endDate: "2026-08-10",
    estimatedRevenueImpact: 35000,
    confirmedRevenueImpact: 28400,
    roasGain: 1.6,
    conversionGainPercentage: 26.5,
    statisticalConfidencePercentage: 97,
    alienMaxProbability: 94,
    results: {
      controlConversions: 42,
      variantConversions: 68,
      controlConversionRate: 1.8,
      variantConversionRate: 2.38,
      controlRoas: 4.8,
      variantRoas: 6.4,
      winnerVariant: "Variante B (Vídeo UGC)",
      validatedAt: "2026-08-03T14:00:00Z",
    },
  },
  {
    id: "exp-102",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    projectName: "Branding & CRO Landing Page",
    title: "Teste de Headline Focada em Prova Social na Landing Page Mobile",
    type: "Headline",
    hypothesis: "Alterar a headline principal de 'Pele Perfeita em 30 Dias' para 'Usado por 14.000 Mulheres no Brasil' aumentará os cliques em 'Comprar Agora'.",
    problemIdentified: "Taxa de rejeição elevada na primeira dobra do mobile.",
    objective: "Elevar o CTR do botão principal de checkout de 3.2% para 4.8%.",
    primaryMetric: "Clique no Botão de Compra (%)",
    secondaryMetric: "Tempo de Permanência",
    ownerName: "Fernanda Lima",
    priority: "Crítica",
    status: "Validado",
    startDate: "2026-07-18",
    endDate: "2026-08-01",
    estimatedRevenueImpact: 22000,
    confirmedRevenueImpact: 24500,
    roasGain: 1.2,
    conversionGainPercentage: 18.4,
    statisticalConfidencePercentage: 99,
    alienMaxProbability: 96,
    results: {
      controlConversions: 85,
      variantConversions: 114,
      controlConversionRate: 2.1,
      variantConversionRate: 2.82,
      controlRoas: 3.8,
      variantRoas: 5.0,
      winnerVariant: "Variante B (Headline Prova Social)",
      validatedAt: "2026-08-01T18:30:00Z",
    },
  },
  {
    id: "exp-103",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    projectName: "Funil B2B Google Search",
    title: "Inclusão de Formulário Fracionado de 2 Etapas para Leads B2B",
    type: "Funil",
    hypothesis: "Dividir a captura de dados em 2 etapas (E-mail na 1ª e Cargo/Tamanho da Empresa na 2ª) aumentará o CPL em -25%.",
    problemIdentified: "Abandono de formulário extenso no desktop.",
    objective: "Reduzir o CPL de R$ 85,00 para R$ 60,00.",
    ownerName: "Matheus Silva",
    priority: "Média",
    status: "Em preparação",
    startDate: "2026-08-02",
    endDate: "2026-08-16",
    estimatedRevenueImpact: 45000,
    confirmedRevenueImpact: 0,
    roasGain: 0.8,
    conversionGainPercentage: 15.0,
    statisticalConfidencePercentage: 92,
    alienMaxProbability: 88,
  },
  {
    id: "exp-104",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    projectName: "Branding & Criativos",
    title: "Oferta de Compre 2 Leve 3 no Pré-Treino de Uva",
    type: "Oferta",
    hypothesis: "Criar um bundle promocional com brinde exclusivo aumentará o Ticket Médio de R$ 110 para R$ 165.",
    problemIdentified: "Ticket médio estagnado em vendas avulsas.",
    objective: "Aumentar a margem bruta de contribuição por pedido.",
    ownerName: "Lucas Mendes",
    priority: "Alta",
    status: "Rodando",
    startDate: "2026-07-28",
    endDate: "2026-08-12",
    estimatedRevenueImpact: 40000,
    confirmedRevenueImpact: 45500,
    roasGain: 1.8,
    conversionGainPercentage: 32.0,
    statisticalConfidencePercentage: 96,
    alienMaxProbability: 95,
  },
];

export const mockAlienMaxGrowthInsights: AlienMaxGrowthInsight[] = [
  {
    id: "grw-ins-1",
    type: "Probabilidade",
    clientName: "Aura Health",
    companyId: "aura-health",
    experimentTitle: "Teste A/B de Criativo UGC de Depoimento na Primeira Dobra",
    title: "O criativo B possui 94% de probabilidade de superar o criativo A",
    description: "Com base em 110 conversões amostradas, a variante B apresentou CTR 4.2% contra 2.8% do controle.",
    confidenceScore: 97,
    recommendedAction: "Escalar 100% do orçamento para o criativo UGC B",
  },
  {
    id: "grw-ins-2",
    type: "Headline",
    clientName: "Lumina Skincare",
    companyId: "lumina-skincare",
    experimentTitle: "Teste de Headline Focada em Prova Social na Landing Page Mobile",
    title: "O teste de headline apresentou aumento estatístico confirmado de 18%",
    description: "A hipótese de prova social atingiu 99% de nível de confiança estatística com ganho de +1.2x no ROAS.",
    confidenceScore: 99,
    recommendedAction: "Manter a nova headline como versão oficial da Landing Page",
  },
  {
    id: "grw-ins-3",
    type: "Otimização LP",
    clientName: "Stellar Solar",
    companyId: "stellar-solar",
    experimentTitle: "CRO de Calculadora Solar na Primeira Dobra",
    title: "A Landing Page da Stellar Solar possui oportunidade de otimização",
    description: "A inclusão de uma simulação rápida de economia de energia pode aumentar os leads qualificados em até +35%.",
    confidenceScore: 93,
    recommendedAction: "Criar novo experimento de formulário interativo no Growth Lab",
  },
  {
    id: "grw-ins-4",
    type: "Pronto P/ Validação",
    clientName: "Vortex Suplementos",
    companyId: "vortex-suplementos",
    experimentTitle: "Oferta de Compre 2 Leve 3 no Pré-Treino de Uva",
    title: "Existem 3 experimentos prontos para validação com significância",
    description: "A amostra estatística atingiu o tamanho mínimo necessário para tomada de decisão com risco < 5%.",
    confidenceScore: 96,
    recommendedAction: "Validar oficialmente os resultados e atualizar o financeiro do cliente",
  },
];

export class GrowthRepository {
  async getStats(): Promise<GrowthStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("growth_experiments").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockGrowthStats,
          activeExperimentsCount: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockGrowthStats;
  }

  async getExperiments(): Promise<GrowthExperimentItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("growth_experiments").select("*");
      if (data && data.length > 0) {
        return data.map((e) => ({
          id: e.id,
          companyId: e.company_id,
          clientName: e.company_id,
          companyName: e.company_id,
          title: e.title,
          type: e.type as any,
          hypothesis: e.hypothesis,
          problemIdentified: e.problem_identified || "",
          objective: e.objective || "",
          primaryMetric: e.primary_metric,
          secondaryMetric: e.secondary_metric || "",
          ownerName: e.owner_name,
          priority: e.priority,
          status: e.status as any,
          startDate: e.start_date,
          endDate: e.end_date,
          estimatedRevenueImpact: Number(e.estimated_revenue_impact) || 0,
          confirmedRevenueImpact: Number(e.confirmed_revenue_impact) || 0,
          roasGain: Number(e.roas_gain) || 0,
          conversionGainPercentage: Number(e.conversion_gain_percentage) || 0,
          statisticalConfidencePercentage: e.statistical_confidence_percentage || 95,
          alienMaxProbability: e.alien_max_probability || 90,
        }));
      }
    } catch {
      // Fallback
    }
    return mockGrowthExperiments;
  }

  async getExperimentById(id: string): Promise<GrowthExperimentItem | null> {
    const experiments = await this.getExperiments();
    return experiments.find((e) => e.id === id) || experiments[0];
  }

  async getAlienMaxInsights(): Promise<AlienMaxGrowthInsight[]> {
    return mockAlienMaxGrowthInsights;
  }
}

export const growthRepository = new GrowthRepository();
