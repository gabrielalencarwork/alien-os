/**
 * Repository Pattern: Meta Ads Repository (Alien OS)
 * Gerencia a leitura de dados reais persistidos nas tabelas Supabase do Meta Ads:
 * public.meta_ads_accounts, public.meta_ads_campaigns, public.meta_ads_ad_sets, public.meta_ads_ads, public.meta_ads_daily_metrics.
 *
 * REGRA DE OURO: O Repository lê exclusivamente do Supabase e NÃO realiza chamadas HTTP externas para APIs.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export interface MetaAdsAccountRecord {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  companyId: string;
  accountId: string;
  businessId?: string;
  accountName: string;
  currencyCode: string;
  timeZone: string;
  status: string;
  lastSyncedAt: string;
}

export interface MetaAdsCampaignRecord {
  id: string;
  accountId: string;
  externalCampaignId: string;
  campaignName: string;
  status: string;
  objective: string;
  dailyBudget: number;
  cost: number;
  conversions: number;
  revenue: number;
  roas: number;
}

export interface MetaAdsAdSetRecord {
  id: string;
  accountId: string;
  campaignId: string;
  externalAdSetId: string;
  adSetName: string;
  status: string;
  billingEvent: string;
  bidStrategy: string;
  createdAt: string;
}

export interface MetaAdsAdRecord {
  id: string;
  campaignId: string;
  adSetId: string;
  externalAdId: string;
  adName: string;
  creativeId?: string;
  thumbnailUrl?: string;
  status: string;
  createdAt: string;
}

export interface MetaAdsDashboardMetrics {
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageCpc: number;
  averageCpm: number;
  totalConversions: number;
  totalRevenue: number;
  averageRoas: number;
  averageFrequency: number;
  activeCampaignsCount: number;
  activeAdSetsCount: number;
  activeAdsCount: number;
}

export interface AlienMaxMetaAdsInsight {
  id: string;
  type:
    | "Frequência Elevada"
    | "Fadiga de Criativos"
    | "ROAS Baixo"
    | "Pronta P/ Escala"
    | "CPA Alto"
    | "Conversion API (CAPI)";
  campaignName: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export class MetaAdsRepository {
  /**
   * Lê todas as contas de anúncios gravadas em public.meta_ads_accounts
   */
  async listAccounts(): Promise<MetaAdsAccountRecord[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("meta_ads_accounts")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });

      if (!data || data.length === 0) return [];

      return data.map((a: any) => ({
        id: a.id,
        organizationId: a.organization_id,
        workspaceId: a.workspace_id,
        companyId: a.company_id || "alien-mkt",
        accountId: a.account_id,
        businessId: a.business_id,
        accountName: a.account_name,
        currencyCode: a.currency_code || "BRL",
        timeZone: a.time_zone || "America/Sao_Paulo",
        status: a.status || "ACTIVE",
        lastSyncedAt: a.last_synced_at
          ? new Date(a.last_synced_at).toLocaleTimeString("pt-BR")
          : "Nunca",
      }));
    } catch (err) {
      console.error("Erro ao ler meta_ads_accounts no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê todas as campanhas em public.meta_ads_campaigns agregando métricas
   */
  async listCampaigns(accountId?: string): Promise<MetaAdsCampaignRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("meta_ads_campaigns").select("*").eq("active", true);

      if (accountId) {
        query = query.eq("account_id", accountId.startsWith("act_") ? accountId : `act_${accountId}`);
      }

      const { data: campaigns } = await query;
      if (!campaigns || campaigns.length === 0) return [];

      const result: MetaAdsCampaignRecord[] = [];

      for (const cmp of campaigns) {
        const { data: metrics } = await supabase
          .from("meta_ads_daily_metrics")
          .select("cost, conversions, revenue")
          .eq("campaign_id", cmp.id);

        const cost = (metrics || []).reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        const conversions = (metrics || []).reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
        const revenue = (metrics || []).reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
        const roas = cost > 0 ? Number((revenue / cost).toFixed(2)) : 0;

        result.push({
          id: cmp.id,
          accountId: cmp.account_id,
          externalCampaignId: cmp.external_campaign_id,
          campaignName: cmp.campaign_name,
          status: cmp.status || "ACTIVE",
          objective: cmp.objective || "OUTCOME_SALES",
          dailyBudget: Number(cmp.daily_budget) || 0,
          cost,
          conversions,
          revenue,
          roas,
        });
      }

      return result;
    } catch (err) {
      console.error("Erro ao ler meta_ads_campaigns no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê Conjuntos de Anúncios (Ad Sets) em public.meta_ads_ad_sets
   */
  async listAdSets(campaignId?: string): Promise<MetaAdsAdSetRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("meta_ads_ad_sets").select("*").eq("active", true);

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((as: any) => ({
        id: as.id,
        accountId: as.account_id,
        campaignId: as.campaign_id,
        externalAdSetId: as.external_ad_set_id,
        adSetName: as.ad_set_name,
        status: as.status || "ACTIVE",
        billingEvent: as.billing_event || "IMPRESSIONS",
        bidStrategy: as.bid_strategy || "LOWEST_COST_WITHOUT_CAP",
        createdAt: new Date(as.created_at).toLocaleDateString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler meta_ads_ad_sets no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê Anúncios Individuais em public.meta_ads_ads
   */
  async listAds(adSetId?: string): Promise<MetaAdsAdRecord[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("meta_ads_ads").select("*").eq("active", true);

      if (adSetId) {
        query = query.eq("ad_set_id", adSetId);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((ad: any) => ({
        id: ad.id,
        campaignId: ad.campaign_id,
        adSetId: ad.ad_set_id,
        externalAdId: ad.external_ad_id,
        adName: ad.ad_name,
        creativeId: ad.creative_id,
        thumbnailUrl: ad.thumbnail_url || "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150",
        status: ad.status || "ACTIVE",
        createdAt: new Date(ad.created_at).toLocaleDateString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler meta_ads_ads no Supabase:", err);
      return [];
    }
  }

  /**
   * Consolidar métricas gerais do Meta Ads direto do Supabase
   */
  async getDashboardMetrics(): Promise<MetaAdsDashboardMetrics> {
    try {
      const supabase = createBrowserClient();
      const { data: metrics } = await supabase.from("meta_ads_daily_metrics").select("*");
      const { count: cmpCount } = await supabase.from("meta_ads_campaigns").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");
      const { count: adSetCount } = await supabase.from("meta_ads_ad_sets").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");
      const { count: adCount } = await supabase.from("meta_ads_ads").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");

      if (!metrics || metrics.length === 0) {
        return {
          totalCost: 0,
          totalImpressions: 0,
          totalClicks: 0,
          averageCtr: 0,
          averageCpc: 0,
          averageCpm: 0,
          totalConversions: 0,
          totalRevenue: 0,
          averageRoas: 0,
          averageFrequency: 1.0,
          activeCampaignsCount: cmpCount || 0,
          activeAdSetsCount: adSetCount || 0,
          activeAdsCount: adCount || 0,
        };
      }

      const totalCost = metrics.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
      const totalImpressions = metrics.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
      const totalClicks = metrics.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
      const totalConversions = metrics.reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
      const totalRevenue = metrics.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);

      const avgCtr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
      const avgCpc = totalClicks > 0 ? Number((totalCost / totalClicks).toFixed(2)) : 0;
      const avgCpm = totalImpressions > 0 ? Number(((totalCost / totalImpressions) * 1000).toFixed(2)) : 0;
      const avgRoas = totalCost > 0 ? Number((totalRevenue / totalCost).toFixed(2)) : 0;
      const avgFreq = metrics.reduce((acc, curr) => acc + (Number(curr.frequency) || 1.0), 0) / metrics.length;

      return {
        totalCost,
        totalImpressions,
        totalClicks,
        averageCtr: avgCtr,
        averageCpc: avgCpc,
        averageCpm: avgCpm,
        totalConversions,
        totalRevenue,
        averageRoas: avgRoas,
        averageFrequency: Number(avgFreq.toFixed(2)),
        activeCampaignsCount: cmpCount || 0,
        activeAdSetsCount: adSetCount || 0,
        activeAdsCount: adCount || 0,
      };
    } catch (err) {
      console.error("Erro ao calcular métricas do Meta Ads no Supabase:", err);
      return {
        totalCost: 0,
        totalImpressions: 0,
        totalClicks: 0,
        averageCtr: 0,
        averageCpc: 0,
        averageCpm: 0,
        totalConversions: 0,
        totalRevenue: 0,
        averageRoas: 0,
        averageFrequency: 1.0,
        activeCampaignsCount: 0,
        activeAdSetsCount: 0,
        activeAdsCount: 0,
      };
    }
  }

  /**
   * Diagnósticos autônomos do Alien Max para Meta Ads (Frequência, Fadiga de Criativos e ROAS)
   */
  async getAlienMaxInsights(): Promise<AlienMaxMetaAdsInsight[]> {
    const campaigns = await this.listCampaigns();

    if (campaigns.length === 0) {
      return [
        {
          id: "meta-empty",
          type: "Fadiga de Criativos",
          campaignName: "Nenhuma Campanha",
          title: "Nenhuma conta de anúncios do Meta Ads sincronizada",
          description: "Conecte sua conta Meta/Facebook via OAuth 2.0 e selecione qual Conta de Anúncios (act_) deseja importar.",
          confidenceScore: 100,
          recommendedAction: "Conectar Conta Meta Ads",
        },
      ];
    }

    const insights: AlienMaxMetaAdsInsight[] = [];

    for (const cmp of campaigns) {
      if (cmp.roas >= 4.5) {
        insights.push({
          id: `ins-meta-scale-${cmp.id}`,
          type: "Pronta P/ Escala",
          campaignName: cmp.campaignName,
          title: `Campanha CBO Advantage+ com alto ROAS (${cmp.roas}x)`,
          description: `A campanha "${cmp.campaignName}" gerou R$ ${cmp.revenue.toLocaleString("pt-BR")} em vendas no Meta.`,
          confidenceScore: 99,
          recommendedAction: `Expandir o orçamento diário em +20% (Atual: R$ ${cmp.dailyBudget}/dia)`,
        });
      } else if (cmp.roas > 0 && cmp.roas < 2.0) {
        insights.push({
          id: `ins-meta-low-${cmp.id}`,
          type: "ROAS Baixo",
          campaignName: cmp.campaignName,
          title: `ROAS crítico no retargeting (${cmp.roas}x)`,
          description: `A campanha apresenta fadiga de público com aumento do CPM.`,
          confidenceScore: 94,
          recommendedAction: "Renovar os criativos de vídeo UGC ou expandir o tamanho do público customizado",
        });
      }
    }

    return insights;
  }
}

export const metaAdsRepository = new MetaAdsRepository();
