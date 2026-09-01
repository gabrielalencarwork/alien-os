/**
 * Repository Pattern: Google Ads Repository (Alien OS)
 * Gerencia a leitura da hierarquia completa do Google Ads no Supabase:
 * public.google_ads_customers, public.google_ads_campaigns, public.google_ads_ad_groups, public.google_ads_ads, public.google_ads_daily_metrics.
 *
 * REGRA DE OURO: O Repository lê exclusivamente do Supabase e NÃO realiza chamadas HTTP externas para APIs.
 * NENHUM DADO FICTÍCIO / MOCK.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export interface GoogleAdsCustomerRecord {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  companyId: string;
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
  status: string;
  lastSyncedAt: string;
}

export interface GoogleAdsCampaignRecord {
  id: string;
  customerId: string;
  externalCampaignId: string;
  campaignName: string;
  status: string;
  campaignType: string;
  advertisingChannelType: string;
  advertisingChannelSubType: string;
  servingStatus: string;
  optimizationScore: number;
  objective: string;
  biddingStrategy: string;
  budget: number;
  cost: number;
  conversions: number;
  revenue: number;
  roas: number;
}

export interface GoogleAdsAdGroupRecord {
  id: string;
  companyId: string;
  customerId: string;
  campaignId: string;
  externalAdGroupId: string;
  adGroupName: string;
  status: string;
  type: string;
  createdAt: string;
}

export interface GoogleAdsAdRecord {
  id: string;
  companyId: string;
  campaignId: string;
  adGroupId: string;
  externalAdId: string;
  headline: string;
  description: string;
  finalUrl: string;
  status: string;
  createdAt: string;
}

export interface GoogleAdsDashboardMetrics {
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageCpc: number;
  totalConversions: number;
  totalAllConversions: number;
  totalRevenue: number;
  averageRoas: number;
  averageImpressionShare: number;
  averageSearchImpressionShare: number;
  averageSearchTopImpressionShare: number;
  averageOptimizationScore: number;
  activeCampaignsCount: number;
  activeAdGroupsCount: number;
  activeAdsCount: number;
}

export interface AlienMaxGoogleAdsInsight {
  id: string;
  type:
    | "Optimization Score"
    | "Impression Share"
    | "ROAS Baixo"
    | "Pronta P/ Escala"
    | "Orçamento Limitado"
    | "Baixo CTR"
    | "CPC Elevado"
    | "Oportunidade";
  campaignName: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

function getDateRangeFilter(preset: string): { startDate?: string; endDate?: string } {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  switch (preset) {
    case "today":
      return { startDate: formatDate(today), endDate: formatDate(today) };
    case "yesterday": {
      const y = new Date();
      y.setDate(today.getDate() - 1);
      return { startDate: formatDate(y), endDate: formatDate(y) };
    }
    case "last7days": {
      const d7 = new Date();
      d7.setDate(today.getDate() - 7);
      return { startDate: formatDate(d7), endDate: formatDate(today) };
    }
    case "last30days": {
      const d30 = new Date();
      d30.setDate(today.getDate() - 30);
      return { startDate: formatDate(d30), endDate: formatDate(today) };
    }
    case "thisMonth": {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: formatDate(firstDay), endDate: formatDate(today) };
    }
    case "lastMonth": {
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: formatDate(firstDayLastMonth), endDate: formatDate(lastDayLastMonth) };
    }
    default:
      return {};
  }
}

export class GoogleAdsRepository {
  /**
   * Lê todas as contas de anúncios em public.google_ads_customers
   */
  async listCustomers(): Promise<GoogleAdsCustomerRecord[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("google_ads_customers")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });

      if (!data || data.length === 0) return [];

      return data.map((c: any) => ({
        id: c.id,
        organizationId: c.organization_id,
        workspaceId: c.workspace_id,
        companyId: c.company_id || "alien-mkt",
        customerId: c.customer_id,
        descriptiveName: c.descriptive_name,
        currencyCode: c.currency_code || "BRL",
        timeZone: c.time_zone || "America/Sao_Paulo",
        manager: Boolean(c.manager),
        status: c.status || "ENABLED",
        lastSyncedAt: c.last_synced_at
          ? new Date(c.last_synced_at).toLocaleTimeString("pt-BR")
          : "Nunca",
      }));
    } catch (err) {
      console.error("Erro ao ler google_ads_customers no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê todas as campanhas em public.google_ads_campaigns
   */
  async listCampaigns(customerId?: string, dateRangePreset?: string): Promise<GoogleAdsCampaignRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("google_ads_campaigns").select("*").eq("active", true);

      if (customerId) {
        query = query.eq("customer_id", customerId.replace(/-/g, ""));
      }

      const { data: campaigns } = await query;
      if (!campaigns || campaigns.length === 0) return [];

      const { startDate, endDate } = dateRangePreset ? getDateRangeFilter(dateRangePreset) : {};

      const result: GoogleAdsCampaignRecord[] = [];

      for (const cmp of campaigns) {
        let metricsQuery = supabase
          .from("google_ads_daily_metrics")
          .select("cost, conversions, revenue")
          .eq("campaign_id", cmp.id);

        if (startDate) {
          metricsQuery = metricsQuery.gte("metric_date", startDate);
        }
        if (endDate) {
          metricsQuery = metricsQuery.lte("metric_date", endDate);
        }

        const { data: metrics } = await metricsQuery;

        const cost = (metrics || []).reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        const conversions = (metrics || []).reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
        const revenue = (metrics || []).reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
        const roas = cost > 0 ? Number((revenue / cost).toFixed(2)) : 0;

        result.push({
          id: cmp.id,
          customerId: cmp.customer_id,
          externalCampaignId: cmp.external_campaign_id,
          campaignName: cmp.campaign_name,
          status: cmp.status || "ENABLED",
          campaignType: cmp.campaign_type || "SEARCH",
          advertisingChannelType: cmp.advertising_channel_type || "SEARCH",
          advertisingChannelSubType: cmp.advertising_channel_sub_type || "SEARCH_EXPRESS",
          servingStatus: cmp.serving_status || "SERVING",
          optimizationScore: Number(cmp.optimization_score) || 0,
          objective: cmp.objective || "SEARCH",
          biddingStrategy: cmp.bidding_strategy || "MAXIMIZE_CONVERSIONS",
          budget: Number(cmp.budget) || 0,
          cost,
          conversions,
          revenue,
          roas,
        });
      }

      return result;
    } catch (err) {
      console.error("Erro ao ler google_ads_campaigns no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê Grupos de Anúncios em public.google_ads_ad_groups
   */
  async listAdGroups(campaignId?: string): Promise<GoogleAdsAdGroupRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("google_ads_ad_groups").select("*").eq("active", true);

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((ag: any) => ({
        id: ag.id,
        companyId: ag.company_id || "alien-mkt",
        customerId: ag.customer_id,
        campaignId: ag.campaign_id,
        externalAdGroupId: ag.external_ad_group_id,
        adGroupName: ag.ad_group_name,
        status: ag.status || "ENABLED",
        type: ag.type || "SEARCH_STANDARD",
        createdAt: new Date(ag.created_at).toLocaleDateString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler google_ads_ad_groups no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê Anúncios Individuais em public.google_ads_ads
   */
  async listAds(adGroupId?: string): Promise<GoogleAdsAdRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("google_ads_ads").select("*").eq("active", true);

      if (adGroupId) {
        query = query.eq("ad_group_id", adGroupId);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((ad: any) => ({
        id: ad.id,
        companyId: ad.company_id || "alien-mkt",
        campaignId: ad.campaign_id,
        adGroupId: ad.ad_group_id,
        externalAdId: ad.external_ad_id,
        headline: ad.headline || "Título do Anúncio",
        description: ad.description || "Descrição do Anúncio",
        finalUrl: ad.final_url || "",
        status: ad.status || "ENABLED",
        createdAt: new Date(ad.created_at).toLocaleDateString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler google_ads_ads no Supabase:", err);
      return [];
    }
  }

  /**
   * Consolida as métricas gerais e avançadas do Google Ads no Supabase
   */
  async getDashboardMetrics(dateRangePreset?: string): Promise<GoogleAdsDashboardMetrics> {
    const emptyMetrics: GoogleAdsDashboardMetrics = {
      totalCost: 0,
      totalImpressions: 0,
      totalClicks: 0,
      averageCtr: 0,
      averageCpc: 0,
      totalConversions: 0,
      totalAllConversions: 0,
      totalRevenue: 0,
      averageRoas: 0,
      averageImpressionShare: 0,
      averageSearchImpressionShare: 0,
      averageSearchTopImpressionShare: 0,
      averageOptimizationScore: 0,
      activeCampaignsCount: 0,
      activeAdGroupsCount: 0,
      activeAdsCount: 0,
    };

    try {
      const supabase = createBrowserClient();
      let metricsQuery = supabase.from("google_ads_daily_metrics").select("*");

      if (dateRangePreset) {
        const { startDate, endDate } = getDateRangeFilter(dateRangePreset);
        if (startDate) metricsQuery = metricsQuery.gte("metric_date", startDate);
        if (endDate) metricsQuery = metricsQuery.lte("metric_date", endDate);
      }

      const { data: metrics } = await metricsQuery;
      const { count: cmpCount } = await supabase.from("google_ads_campaigns").select("*", { count: "exact", head: true }).eq("status", "ENABLED");
      const { count: agCount } = await supabase.from("google_ads_ad_groups").select("*", { count: "exact", head: true }).eq("status", "ENABLED");
      const { count: adCount } = await supabase.from("google_ads_ads").select("*", { count: "exact", head: true }).eq("status", "ENABLED");
      const { data: campaigns } = await supabase.from("google_ads_campaigns").select("optimization_score").eq("status", "ENABLED");

      const avgOptScore =
        campaigns && campaigns.length > 0
          ? Number((campaigns.reduce((acc, c) => acc + (Number(c.optimization_score) || 0), 0) / campaigns.length).toFixed(1))
          : 0;

      if (!metrics || metrics.length === 0) {
        return {
          ...emptyMetrics,
          averageOptimizationScore: avgOptScore,
          activeCampaignsCount: cmpCount || 0,
          activeAdGroupsCount: agCount || 0,
          activeAdsCount: adCount || 0,
        };
      }

      const totalCost = metrics.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
      const totalImpressions = metrics.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
      const totalClicks = metrics.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
      const totalConversions = metrics.reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
      const totalAllConversions = metrics.reduce((acc, curr) => acc + (Number(curr.all_conversions) || curr.conversions || 0), 0);
      const totalRevenue = metrics.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);

      const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
      const avgCpc = totalClicks > 0 ? Number((totalCost / totalClicks).toFixed(2)) : 0;
      const avgRoas = totalCost > 0 ? Number((totalRevenue / totalCost).toFixed(2)) : 0;

      const validImpShares = metrics.map((m) => Number(m.impression_share)).filter((v) => !isNaN(v) && v > 0);
      const avgImpShare = validImpShares.length > 0 ? validImpShares.reduce((a, b) => a + b, 0) / validImpShares.length : 0;

      const validSearchImpShares = metrics.map((m) => Number(m.search_impression_share)).filter((v) => !isNaN(v) && v > 0);
      const avgSearchImpShare = validSearchImpShares.length > 0 ? validSearchImpShares.reduce((a, b) => a + b, 0) / validSearchImpShares.length : 0;

      const validSearchTopImpShares = metrics.map((m) => Number(m.search_top_impression_share)).filter((v) => !isNaN(v) && v > 0);
      const avgSearchTopImpShare = validSearchTopImpShares.length > 0 ? validSearchTopImpShares.reduce((a, b) => a + b, 0) / validSearchTopImpShares.length : 0;

      return {
        totalCost: Number(totalCost.toFixed(2)),
        totalImpressions,
        totalClicks,
        averageCtr: avgCtr,
        averageCpc: avgCpc,
        totalConversions,
        totalAllConversions,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageRoas: avgRoas,
        averageImpressionShare: Number(avgImpShare.toFixed(1)),
        averageSearchImpressionShare: Number(avgSearchImpShare.toFixed(1)),
        averageSearchTopImpressionShare: Number(avgSearchTopImpShare.toFixed(1)),
        averageOptimizationScore: avgOptScore,
        activeCampaignsCount: cmpCount || 0,
        activeAdGroupsCount: agCount || 0,
        activeAdsCount: adCount || 0,
      };
    } catch (err) {
      console.error("Erro ao calcular métricas avançadas no Supabase:", err);
      return emptyMetrics;
    }
  }

  /**
   * Diagnósticos autônomos baseados em Optimization Score e Search Impression Share do Supabase
   */
  async getAlienMaxInsights(): Promise<AlienMaxGoogleAdsInsight[]> {
    const campaigns = await this.listCampaigns();

    if (campaigns.length === 0) {
      return [
        {
          id: "gads-empty",
          type: "Oportunidade",
          campaignName: "Nenhuma Campanha",
          title: "Nenhuma conta ou campanha do Google Ads sincronizada",
          description: "Conecte sua conta Google via OAuth 2.0 e sincronize seu Customer ID para gerar diagnósticos de inteligência.",
          confidenceScore: 100,
          recommendedAction: "Conectar e Sincronizar Google Ads",
        },
      ];
    }

    const insights: AlienMaxGoogleAdsInsight[] = [];

    for (const cmp of campaigns) {
      if (cmp.optimizationScore > 0 && cmp.optimizationScore < 80) {
        insights.push({
          id: `ins-opt-${cmp.id}`,
          type: "Optimization Score",
          campaignName: cmp.campaignName,
          title: `Optimization Score abaixo do ideal (${cmp.optimizationScore}%)`,
          description: `A campanha "${cmp.campaignName}" possui recomendações automáticas pendentes no Google Ads console.`,
          confidenceScore: 96,
          recommendedAction: "Aplicar recomendações de extensões de anúncio e palavras-chave negativas",
        });
      }

      if (cmp.roas >= 4.0) {
        insights.push({
          id: `ins-scale-${cmp.id}`,
          type: "Impression Share",
          campaignName: cmp.campaignName,
          title: `Oportunidade de expansão de Search Impression Share`,
          description: `A campanha "${cmp.campaignName}" apresenta ROAS ${cmp.roas}x com potencial de ampliação de escala.`,
          confidenceScore: 98,
          recommendedAction: `Avaliar aumento de orçamento diário (Atual: R$ ${cmp.budget}/dia)`,
        });
      }
    }

    return insights;
  }
}

export const googleAdsRepository = new GoogleAdsRepository();
