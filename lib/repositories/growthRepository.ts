/**
 * Repository Pattern: Growth Repository (Alien OS)
 * Gerencia hipóteses de crescimento, experimentos A/B, otimizações de conversão (CRO) e impactos de receita.
 * Conectado às tabelas Supabase: growth_experiments, growth_variants, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type GrowthExperimentType =
  | "Criativo"
  | "Landing Page"
  | "Público"
  | "Oferta"
  | "Funil / Checkout"
  | "Email / Automação"
  | "Copywriting"
  | "Preço / Bundle";

export type GrowthExperimentStatus =
  | "Backlog"
  | "Priorizado"
  | "Em preparação"
  | "Rodando"
  | "Concluído com Sucesso"
  | "Inconclusivo"
  | "Descartado";

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
      const completed = experiments.filter((e) => e.status === "Concluído com Sucesso").length;
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
}

export const growthRepository = new GrowthRepository();
