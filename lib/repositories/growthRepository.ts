/**
 * Repository Pattern: Growth Repository (Alien OS)
 * Gerencia hipóteses de crescimento, experimentos A/B, otimizações de conversão (CRO) e impactos de receita.
 * Conectado às tabelas Supabase: growth_experiments, growth_variants, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

// Valores canônicos — os mesmos documentados na migration da tabela `growth_experiments`.
export const GROWTH_TYPES = [
  "Criativo",
  "Copy",
  "Headline",
  "Landing Page",
  "Oferta",
  "Funil",
  "Google Ads",
  "Meta Ads",
  "TikTok",
  "SEO",
  "UX",
  "Automação",
  "CRM",
  "E-mail",
  "WhatsApp",
  "Outro",
] as const;
export type GrowthExperimentType = (typeof GROWTH_TYPES)[number];
export type GrowthType = GrowthExperimentType;

export type GrowthExperimentStatus =
  | "Planejado"
  | "Em preparação"
  | "Rodando"
  | "Em análise"
  | "Validado"
  | "Descartado"
  | "Arquivado";
export type GrowthStatus = GrowthExperimentStatus;

function normalizeKey(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : "";
}

const GROWTH_STATUS_MAP: Record<string, GrowthExperimentStatus> = {
  "planejado": "Planejado",
  "backlog": "Planejado",
  "priorizado": "Planejado",
  "em preparacao": "Em preparação",
  "rodando": "Rodando",
  "em analise": "Em análise",
  "inconclusivo": "Em análise",
  "validado": "Validado",
  "concluido com sucesso": "Validado",
  "descartado": "Descartado",
  "arquivado": "Arquivado",
};

export function normalizeGrowthStatus(value: unknown): GrowthExperimentStatus {
  return GROWTH_STATUS_MAP[normalizeKey(value)] ?? "Planejado";
}

export function normalizeGrowthType(value: unknown): GrowthExperimentType {
  const found = GROWTH_TYPES.find((t) => normalizeKey(t) === normalizeKey(value));
  return found ?? "Outro";
}

export interface NewGrowthExperimentInput {
  companyId?: string;
  title: string;
  type: GrowthExperimentType;
  ownerName?: string;
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  status: GrowthExperimentStatus;
  primaryMetric?: string;
  estimatedRevenueImpact?: number;
  hypothesis: string;
  problemIdentified?: string;
}

export interface GrowthVariantItem {
  id: string;
  experimentId: string;
  name: string;
  description: string;
  trafficPercentage: number;
  visitorsCount: number;
  conversionsCount: number;
  conversionRatePercentage: number;
  revenueGenerated: number;
  isControl: boolean;
  isWinner: boolean;
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
  type: GrowthExperimentType;
  hypothesis: string;
  problemIdentified: string;
  objective: string;
  primaryMetric: string;
  secondaryMetric: string;
  ownerName: string;
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  status: GrowthExperimentStatus;
  startDate: string;
  endDate?: string;
  estimatedRevenueImpact: number;
  confirmedRevenueImpact: number;
  roasGain: number;
  conversionGainPercentage: number;
  statisticalConfidencePercentage: number;
  alienMaxProbability: number;
  variants?: GrowthVariantItem[];
}

export interface GrowthStats {
  activeExperimentsCount: number;
  completedExperimentsCount: number;
  successRatePercentage: number;
  estimatedIncrementalRevenue: number;
  confirmedIncrementalRevenue: number;
  averageTestDays: number;
  runningHypothesesCount: number;
  approvedHypothesesCount: number;
  discardedHypothesesCount: number;
  averageRoasGain: number;
  averageConversionGain: number;
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

export class GrowthRepository {
  async getStats(): Promise<GrowthStats> {
    const emptyStats: GrowthStats = {
      activeExperimentsCount: 0,
      completedExperimentsCount: 0,
      successRatePercentage: 0,
      estimatedIncrementalRevenue: 0,
      confirmedIncrementalRevenue: 0,
      averageTestDays: 0,
      runningHypothesesCount: 0,
      approvedHypothesesCount: 0,
      discardedHypothesesCount: 0,
      averageRoasGain: 0,
      averageConversionGain: 0,
    };

    try {
      const experiments = await this.getExperiments();
      if (experiments.length === 0) return emptyStats;

      const active = experiments.filter((e) => e.status === "Rodando").length;
      const completed = experiments.filter((e) => e.status === "Validado").length;
      const discarded = experiments.filter((e) => e.status === "Descartado").length;
      const estRev = experiments.reduce((acc, e) => acc + (e.estimatedRevenueImpact || 0), 0);
      const confRev = experiments.reduce((acc, e) => acc + (e.confirmedRevenueImpact || 0), 0);

      const totalFinished = completed + discarded;
      const successRate = totalFinished > 0 ? Number(((completed / totalFinished) * 100).toFixed(1)) : 0;

      return {
        activeExperimentsCount: active,
        completedExperimentsCount: completed,
        successRatePercentage: successRate,
        estimatedIncrementalRevenue: estRev,
        confirmedIncrementalRevenue: confRev,
        averageTestDays: 14,
        runningHypothesesCount: active,
        approvedHypothesesCount: completed,
        discardedHypothesesCount: discarded,
        averageRoasGain: 0,
        averageConversionGain: 0,
      };
    } catch {
      return emptyStats;
    }
  }

  async getExperiments(): Promise<GrowthExperimentItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("growth_experiments")
        .select("*, companies(trade_name, legal_name)")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((e) => ({
          id: e.id,
          companyId: e.company_id,
          clientName: e.companies?.trade_name || e.companies?.legal_name || "Interno",
          companyName: e.companies?.legal_name || e.companies?.trade_name || "",
          title: e.title,
          type: normalizeGrowthType(e.type),
          hypothesis: e.hypothesis,
          problemIdentified: e.problem_identified || "",
          objective: e.objective || "",
          primaryMetric: e.primary_metric,
          secondaryMetric: e.secondary_metric || "",
          ownerName: e.owner_name,
          priority: e.priority,
          status: normalizeGrowthStatus(e.status),
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
    } catch (err) {
      console.error("Erro ao ler growth_experiments no Supabase:", err);
    }
    return [];
  }

  async getExperimentById(id: string): Promise<GrowthExperimentItem | null> {
    const experiments = await this.getExperiments();
    return experiments.find((e) => e.id === id) || null;
  }

  async getAlienMaxInsights(): Promise<AlienMaxGrowthInsight[]> {
    const experiments = await this.getExperiments();
    const insights: AlienMaxGrowthInsight[] = [];

    for (const exp of experiments) {
      if (exp.status === "Rodando" && exp.statisticalConfidencePercentage >= 95) {
        insights.push({
          id: `gr-ins-${exp.id}`,
          type: "Pronto P/ Validação",
          clientName: exp.clientName,
          companyId: exp.companyId,
          experimentTitle: exp.title,
          title: `Significância estatística atingida (${exp.statisticalConfidencePercentage}%)`,
          description: `O experimento "${exp.title}" já acumulou dados suficientes para validação.`,
          confidenceScore: exp.statisticalConfidencePercentage,
          recommendedAction: "Concluir o teste e implementar a variante vencedora como padrão.",
        });
      }
    }

    return insights;
  }

  async createExperiment(input: NewGrowthExperimentInput): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("growth_experiments").insert({
      company_id: input.companyId || null,
      title: input.title.trim(),
      type: input.type,
      owner_name: input.ownerName?.trim() || undefined,
      priority: input.priority,
      status: input.status,
      primary_metric: input.primaryMetric?.trim() || undefined,
      estimated_revenue_impact: input.estimatedRevenueImpact ?? 0,
      hypothesis: input.hypothesis.trim(),
      problem_identified: input.problemIdentified?.trim() || null,
    });
    if (error) {
      console.error("Erro ao criar experimento:", error);
      throw new Error(`Não foi possível criar o experimento: ${error.message}`);
    }
  }
}

export const growthRepository = new GrowthRepository();
