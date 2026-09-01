/**
 * Repository Pattern: Campaign Repository (Alien OS)
 * Gerencia a leitura, gravação e cálculo de métricas de mídia paga no Campaign Hub.
 * Conectado às tabelas Supabase: campaigns, campaign_platforms, campaign_daily_metrics, campaign_creatives.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type CampaignPlatform =
  | "Meta Ads"
  | "Google Ads"
  | "TikTok Ads"
  | "LinkedIn Ads"
  | "Pinterest Ads"
  | "Microsoft Ads";

export type CampaignObjective =
  | "Reconhecimento"
  | "Tráfego"
  | "Engajamento"
  | "Leads"
  | "Conversões"
  | "Vendas"
  | "Remarketing"
  | "Mensagens"
  | "Catálogo";

export type CampaignStatus =
  | "Planejada"
  | "Em preparação"
  | "Ativa"
  | "Pausada"
  | "Em otimização"
  | "Finalizada"
  | "Arquivada";

export interface CampaignDailyMetric {
  date: string;
  spent: number;
  revenue: number;
  roas: number;
  clicks: number;
  impressions: number;
  conversions: number;
  leads: number;
  ctr: number;
  cpm: number;
  cpa: number;
  cpl: number;
}

export interface CampaignCreativeItem {
  id: string;
  campaignId: string;
  title: string;
  format: string;
  thumbnailUrl?: string;
  ctrPercentage: number;
  conversionsCount: number;
  status: string;
}

export interface CampaignItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  name: string;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  type: string;
  description: string;
  managerName: string;
  priority: string;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  dailyBudget: number;
  monthlyBudget: number;
  spentAmount: number;
  revenueGenerated: number;
  roas: number;
  roiPercentage: number;
  cacAmount: number;
  cplAmount: number;
  cpaAmount: number;
  ctrPercentage: number;
  cpmAmount: number;
  conversionsCount: number;
  leadsCount: number;
  alienScore: number;
  healthStatus: "Excelente" | "Atenção" | "Crítico";
  dailyMetrics: CampaignDailyMetric[];
  creatives: CampaignCreativeItem[];
}

export interface CampaignStats {
  totalSpent: number;
  totalRevenue: number;
  averageRoas: number;
  averageRoiPercentage: number;
  averageCac: number;
  averageCpl: number;
  averageCtr: number;
  averageCpm: number;
  averageCpa: number;
  totalConversions: number;
  totalLeads: number;
  activeCampaignsCount: number;
  pausedCampaignsCount: number;
  completedCampaignsCount: number;
}

export interface AlienMaxCampaignInsight {
  id: string;
  type: "Queda ROAS" | "Frequência" | "Escala" | "Alerta CAC" | "Otimização";
  clientName: string;
  companyId: string;
  campaignName: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export class CampaignRepository {
  async getStats(): Promise<CampaignStats> {
    const emptyStats: CampaignStats = {
      totalSpent: 0,
      totalRevenue: 0,
      averageRoas: 0,
      averageRoiPercentage: 0,
      averageCac: 0,
      averageCpl: 0,
      averageCtr: 0,
      averageCpm: 0,
      averageCpa: 0,
      totalConversions: 0,
      totalLeads: 0,
      activeCampaignsCount: 0,
      pausedCampaignsCount: 0,
      completedCampaignsCount: 0,
    };

    try {
      const campaigns = await this.getCampaigns();
      if (campaigns.length === 0) return emptyStats;

      const totalSpent = campaigns.reduce((acc, c) => acc + (c.spentAmount || 0), 0);
      const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenueGenerated || 0), 0);
      const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversionsCount || 0), 0);
      const totalLeads = campaigns.reduce((acc, c) => acc + (c.leadsCount || 0), 0);
      const avgRoas = totalSpent > 0 ? Number((totalRevenue / totalSpent).toFixed(2)) : 0;

      const active = campaigns.filter((c) => c.status === "Ativa").length;
      const paused = campaigns.filter((c) => c.status === "Pausada").length;
      const completed = campaigns.filter((c) => c.status === "Finalizada").length;

      return {
        totalSpent,
        totalRevenue,
        averageRoas: avgRoas,
        averageRoiPercentage: totalSpent > 0 ? Math.round(((totalRevenue - totalSpent) / totalSpent) * 100) : 0,
        averageCac: totalConversions > 0 ? Number((totalSpent / totalConversions).toFixed(2)) : 0,
        averageCpl: totalLeads > 0 ? Number((totalSpent / totalLeads).toFixed(2)) : 0,
        averageCtr: 0,
        averageCpm: 0,
        averageCpa: totalConversions > 0 ? Number((totalSpent / totalConversions).toFixed(2)) : 0,
        totalConversions,
        totalLeads,
        activeCampaignsCount: active,
        pausedCampaignsCount: paused,
        completedCampaignsCount: completed,
      };
    } catch {
      return emptyStats;
    }
  }

  async getCampaigns(): Promise<CampaignItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("campaigns").select("*");
      if (data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          companyId: c.company_id,
          clientName: c.company_id,
          companyName: c.company_id,
          name: c.name,
          platform: c.platform as any,
          objective: c.objective as any,
          type: c.type || "CBO",
          description: c.description || "",
          managerName: c.manager_name || "Gestor de Tráfego",
          priority: c.priority || "Média",
          status: c.status as any,
          startDate: c.start_date || "",
          endDate: c.end_date,
          dailyBudget: Number(c.daily_budget) || 0,
          monthlyBudget: Number(c.monthly_budget) || 0,
          spentAmount: Number(c.spent_amount) || 0,
          revenueGenerated: Number(c.revenue_generated) || 0,
          roas: Number(c.roas) || 0,
          roiPercentage: Number(c.roi_percentage) || 0,
          cacAmount: Number(c.cac_amount) || 0,
          cplAmount: Number(c.cpl_amount) || 0,
          cpaAmount: Number(c.cpa_amount) || 0,
          ctrPercentage: Number(c.ctr_percentage) || 0,
          cpmAmount: Number(c.cpm_amount) || 0,
          conversionsCount: c.conversions_count || 0,
          leadsCount: c.leads_count || 0,
          alienScore: c.alien_score_impact || 90,
          healthStatus: (c.health_status as any) || "Excelente",
          dailyMetrics: [],
          creatives: [],
        }));
      }
    } catch (err) {
      console.error("Erro ao ler campanhas no Supabase:", err);
    }
    return [];
  }

  async getCampaignById(id: string): Promise<CampaignItem | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find((c) => c.id === id) || null;
  }

  async getAlienMaxInsights(): Promise<AlienMaxCampaignInsight[]> {
    const campaigns = await this.getCampaigns();
    const insights: AlienMaxCampaignInsight[] = [];

    for (const cmp of campaigns) {
      if (cmp.status === "Ativa" && cmp.roas > 0 && cmp.roas < 2.0) {
        insights.push({
          id: `ins-roas-${cmp.id}`,
          type: "Queda ROAS",
          clientName: cmp.clientName,
          companyId: cmp.companyId,
          campaignName: cmp.name,
          title: `ROAS crítico (${cmp.roas}x) na campanha "${cmp.name}"`,
          description: "O retorno sobre investimento está abaixo da meta estipulada para a conta.",
          confidenceScore: 94,
          recommendedAction: "Pausar criativos desgastados e reavaliar público-alvo.",
        });
      }

      if (cmp.status === "Ativa" && cmp.roas >= 4.0) {
        insights.push({
          id: `ins-scale-${cmp.id}`,
          type: "Escala",
          clientName: cmp.clientName,
          companyId: cmp.companyId,
          campaignName: cmp.name,
          title: `Oportunidade de escala na campanha "${cmp.name}"`,
          description: `Com ROAS ${cmp.roas}x mantido, a campanha possui margem para ampliação de orçamento.`,
          confidenceScore: 98,
          recommendedAction: `Aumentar orçamento diário em +20% (Atual: R$ ${cmp.dailyBudget})`,
        });
      }
    }

    return insights;
  }
}

export const campaignRepository = new CampaignRepository();
