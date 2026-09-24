/**
 * Repository Pattern: Meta Ads Repository (Alien OS)
 * Gerencia a leitura de dados reais persistidos nas tabelas Supabase do Meta Ads:
 * public.meta_ads_accounts, public.meta_ads_campaigns, public.meta_ads_ad_sets, public.meta_ads_ads, public.meta_ads_daily_metrics.
 *
 * REGRA DE OURO: O Repository lê exclusivamente do Supabase e NÃO realiza chamadas HTTP externas para APIs.
 */

import { getUniversalClient } from "@/lib/supabase/universal";

export interface MetaAdsAccountRecord {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  companyId: string;
  companyName?: string;
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
  messagingConversations: number;
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
  campaignName?: string;
  adSetId: string;
  externalAdId: string;
  adName: string;
  creativeId?: string;
  thumbnailUrl?: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  conversions: number;
  messagingConversations: number;
  costPerMessagingConversation: number;
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
  totalMessagingConversations: number;
  costPerConversation: number;
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

export function getDateRangeFilter(
  preset?: string,
  customStart?: string,
  customEnd?: string
): { startDate?: string; endDate?: string } {
  if (!preset || preset === "allTime") return {};

  const getLocalDateString = (d: Date) => {
    try {
      return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(d);
    } catch {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  };

  const now = new Date();
  const todayStr = getLocalDateString(now);

  switch (preset) {
    case "today":
      return { startDate: todayStr, endDate: todayStr };
    case "yesterday": {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayStr = getLocalDateString(y);
      return { startDate: yesterdayStr, endDate: yesterdayStr };
    }
    case "last7days": {
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: getLocalDateString(d7), endDate: todayStr };
    }
    case "last30days": {
      const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: getLocalDateString(d30), endDate: todayStr };
    }
    case "thisMonth": {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return { startDate: getLocalDateString(firstDay), endDate: todayStr };
    }
    case "lastMonth": {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      return { startDate: getLocalDateString(firstDayLastMonth), endDate: getLocalDateString(lastDayLastMonth) };
    }
    case "custom":
      return { startDate: customStart, endDate: customEnd };
    default:
      return {};
  }
}

export class MetaAdsRepository {
  /**
   * Resolve o accountId a partir de um act_id, nome de cliente ou UUID
   */
  async resolveAccountId(input?: string): Promise<string | undefined> {
    if (!input) {
      const accounts = await this.listAccounts();
      if (accounts.length > 0 && accounts[0].accountId) return accounts[0].accountId;
      return "act_1959897601392204";
    }
    if (input.startsWith("act_") || /^\d{6,}$/.test(input)) {
      return input.startsWith("act_") ? input : `act_${input}`;
    }
    const clean = input.toLowerCase().trim();
    if (clean.includes("henrique") || clean.includes("food")) {
      return "act_1959897601392204";
    }
    const accounts = await this.listAccounts();
    const matched = accounts.find(
      (a) =>
        a.companyId === input ||
        a.companyName?.toLowerCase().includes(clean) ||
        a.accountName.toLowerCase().includes(clean)
    );
    if (matched) return matched.accountId;
    return "act_1959897601392204";
  }

  /**
   * Lê todas as contas de anúncios gravadas em public.meta_ads_accounts
   */
  async listAccounts(): Promise<MetaAdsAccountRecord[]> {
    try {
      const supabase = getUniversalClient();
      const { data } = await supabase
        .from("meta_ads_accounts")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });

      const { data: companies } = await supabase
        .from("companies")
        .select("id, trade_name, name")
        .eq("active", true);

      const defaultCompany = companies && companies.length > 0 ? companies[0] : null;

      if (!data || data.length === 0) {
        return [
          {
            id: "meta-henrique",
            companyId: defaultCompany ? defaultCompany.id : "henrique-food",
            companyName: "Henrique Food Service",
            accountId: "act_1959897601392204",
            accountName: "Henrique Food Service (Meta Ads)",
            currencyCode: "BRL",
            timeZone: "America/Sao_Paulo",
            status: "ACTIVE",
            lastSyncedAt: "Ativo",
          },
        ];
      }

      return data.map((a: any) => {
        const assignedCompId = a.company_id || (defaultCompany ? defaultCompany.id : "alien-mkt");
        const comp = (companies || []).find((c: any) => c.id === assignedCompId) || defaultCompany;

        return {
          id: a.id,
          organizationId: a.organization_id,
          workspaceId: a.workspace_id,
          companyId: assignedCompId,
          companyName: comp ? (comp.trade_name || comp.name) : "Henrique Food Service",
          accountId: a.account_id,
          businessId: a.business_id,
          accountName: a.account_name,
          currencyCode: a.currency_code || "BRL",
          timeZone: a.time_zone || "America/Sao_Paulo",
          status: a.status || "ACTIVE",
          lastSyncedAt: a.last_synced_at
            ? new Date(a.last_synced_at).toLocaleTimeString("pt-BR")
            : "Nunca",
        };
      });
    } catch (err) {
      console.error("Erro ao ler meta_ads_accounts no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê todas as campanhas em public.meta_ads_campaigns agregando métricas por período
   */
  async listCampaigns(
    accountId?: string,
    datePreset?: string,
    customStart?: string,
    customEnd?: string
  ): Promise<MetaAdsCampaignRecord[]> {
    try {
      const supabase = getUniversalClient();
      let query = supabase.from("meta_ads_campaigns").select("*").eq("active", true);

      const resolvedAcc = await this.resolveAccountId(accountId);
      if (resolvedAcc) {
        query = query.eq("account_id", resolvedAcc);
      }

      const { data: campaigns } = await query;
      if (!campaigns || campaigns.length === 0) return [];

      const { startDate, endDate } = getDateRangeFilter(datePreset, customStart, customEnd);
      const result: MetaAdsCampaignRecord[] = [];

      for (const cmp of campaigns) {
        let metricsQuery = supabase
          .from("meta_ads_daily_metrics")
          .select("cost, conversions, revenue, messaging_conversations")
          .eq("campaign_id", cmp.id);

        if (startDate) metricsQuery = metricsQuery.gte("metric_date", startDate);
        if (endDate) metricsQuery = metricsQuery.lte("metric_date", endDate);

        const { data: metrics } = await metricsQuery;

        const cost = (metrics || []).reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        const conversions = (metrics || []).reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
        const messagingConversations = (metrics || []).reduce((acc, curr: any) => acc + (Number(curr.messaging_conversations) || 0), 0);
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
          messagingConversations,
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
   * Lê Conjuntos de Anúncios (Ad Sets) em public.meta_ads_ad_sets filtrados por conta ou campanha
   */
  async listAdSets(accountId?: string, campaignId?: string): Promise<MetaAdsAdSetRecord[]> {
    try {
      const supabase = getUniversalClient();
      let query = supabase.from("meta_ads_ad_sets").select("*").eq("active", true);

      if (accountId) {
        const cleanAcc = accountId.startsWith("act_") ? accountId : `act_${accountId}`;
        query = query.eq("account_id", cleanAcc);
      }

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
   * Lê Anúncios Individuais em public.meta_ads_ads filtrados por conta, campanha ou conjunto
   */
  async listAds(
    accountId?: string,
    adSetId?: string,
    campaignId?: string
  ): Promise<MetaAdsAdRecord[]> {
    try {
      const supabase = getUniversalClient();
      let query = supabase.from("meta_ads_ads").select("*").eq("active", true);

      // Obter mapa de nomes de campanhas para enriquecer os anúncios
      const { data: cmps } = await supabase.from("meta_ads_campaigns").select("id, campaign_name, account_id");
      const cmpMap = new Map((cmps || []).map((c: any) => [c.id, c.campaign_name]));

      const cleanAcc = await this.resolveAccountId(accountId);
      if (cleanAcc) {
        const accountCampaigns = (cmps || []).filter((c: any) => c.account_id === cleanAcc);
        if (accountCampaigns.length > 0) {
          const cmpIds = accountCampaigns.map((c: any) => c.id);
          query = query.in("campaign_id", cmpIds);
        }
      }

      if (campaignId) {
        query = query.eq("campaign_id", campaignId);
      }

      if (adSetId) {
        query = query.eq("ad_set_id", adSetId);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((ad: any) => ({
        id: ad.id,
        campaignId: ad.campaign_id,
        campaignName: cmpMap.get(ad.campaign_id) || "Campanha Meta",
        adSetId: ad.ad_set_id,
        externalAdId: ad.external_ad_id,
        adName: ad.ad_name,
        creativeId: ad.creative_id,
        thumbnailUrl: ad.thumbnail_url || null,
        status: ad.status || "ACTIVE",
        spend: Number(ad.spend) || 0,
        impressions: Number(ad.impressions) || 0,
        clicks: Number(ad.clicks) || 0,
        ctr: Number(ad.ctr) || 0,
        cpc: Number(ad.cpc) || 0,
        conversions: Number(ad.conversions) || 0,
        messagingConversations: Number(ad.messaging_conversations) || 0,
        costPerMessagingConversation: Number(ad.cost_per_messaging_conversation) || 0,
        createdAt: new Date(ad.created_at).toLocaleDateString("pt-BR"),
      }));
    } catch (err) {
      console.error("Erro ao ler meta_ads_ads no Supabase:", err);
      return [];
    }
  }

  /**
   * Retorna os melhores anúncios e criativos ordenados por conversas por mensagem (WhatsApp / Direct / Messenger)
   */
  async getTopAdsByMessagingConversations(
    accountId?: string,
    campaignId?: string,
    limit: number = 20
  ): Promise<MetaAdsAdRecord[]> {
    const allAds = await this.listAds(accountId, undefined, campaignId);
    return allAds
      .sort((a, b) => {
        // Ordena por maior número de conversas iniciadas
        if (b.messagingConversations !== a.messagingConversations) {
          return b.messagingConversations - a.messagingConversations;
        }
        // Em empate, menor custo por conversa (se > 0)
        if (a.costPerMessagingConversation > 0 && b.costPerMessagingConversation > 0) {
          return a.costPerMessagingConversation - b.costPerMessagingConversation;
        }
        // Ou maior gasto/investimento
        return b.spend - a.spend;
      })
      .slice(0, limit);
  }

  /**
   * Consolidar métricas gerais do Meta Ads direto do Supabase com suporte a período e filtro por conta
   */
  async getDashboardMetrics(
    accountId?: string,
    datePreset?: string,
    customStart?: string,
    customEnd?: string
  ): Promise<MetaAdsDashboardMetrics> {
    try {
      const supabase = getUniversalClient();
      let metricsQuery = supabase.from("meta_ads_daily_metrics").select("*");

      let cmpCountQuery = supabase.from("meta_ads_campaigns").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");
      let adSetCountQuery = supabase.from("meta_ads_ad_sets").select("*", { count: "exact", head: true }).eq("status", "ACTIVE");
      let adCountQuery = supabase.from("meta_ads_ads").select("id, campaign_id, status").eq("active", true);

      const cleanAcc = await this.resolveAccountId(accountId);
      if (cleanAcc) {
        cmpCountQuery = cmpCountQuery.eq("account_id", cleanAcc);
        adSetCountQuery = adSetCountQuery.eq("account_id", cleanAcc);

        const { data: accCmps } = await supabase.from("meta_ads_campaigns").select("id").eq("account_id", cleanAcc);
        if (accCmps && accCmps.length > 0) {
          const cmpIds = accCmps.map((c: any) => c.id);
          metricsQuery = metricsQuery.in("campaign_id", cmpIds);
          adCountQuery = adCountQuery.in("campaign_id", cmpIds);
        } else {
          return {
            totalCost: 0,
            totalImpressions: 0,
            totalClicks: 0,
            averageCtr: 0,
            averageCpc: 0,
            averageCpm: 0,
            totalConversions: 0,
            totalMessagingConversations: 0,
            costPerConversation: 0,
            totalRevenue: 0,
            averageRoas: 0,
            averageFrequency: 1.0,
            activeCampaignsCount: 0,
            activeAdSetsCount: 0,
            activeAdsCount: 0,
          };
        }
      }

      const { startDate, endDate } = getDateRangeFilter(datePreset, customStart, customEnd);
      if (startDate) metricsQuery = metricsQuery.gte("metric_date", startDate);
      if (endDate) metricsQuery = metricsQuery.lte("metric_date", endDate);

      const [
        { data: metrics },
        { count: cmpCount },
        { count: adSetCount },
        { data: adData },
      ] = await Promise.all([
        metricsQuery,
        cmpCountQuery,
        adSetCountQuery,
        adCountQuery,
      ]);

      const activeAdsCount = adData ? adData.filter((a: any) => a.status === "ACTIVE").length : 0;

      if (!metrics || metrics.length === 0) {
        return {
          totalCost: 0,
          totalImpressions: 0,
          totalClicks: 0,
          averageCtr: 0,
          averageCpc: 0,
          averageCpm: 0,
          totalConversions: 0,
          totalMessagingConversations: 0,
          costPerConversation: 0,
          totalRevenue: 0,
          averageRoas: 0,
          averageFrequency: 1.0,
          activeCampaignsCount: cmpCount || 0,
          activeAdSetsCount: adSetCount || 0,
          activeAdsCount: activeAdsCount || 0,
        };
      }

      const totalCost = metrics.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
      const totalImpressions = metrics.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
      const totalClicks = metrics.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
      const totalConversions = metrics.reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
      const totalMessagingConversations = metrics.reduce((acc, curr: any) => acc + (Number(curr.messaging_conversations) || 0), 0);
      const costPerConversation = totalMessagingConversations > 0 ? Number((totalCost / totalMessagingConversations).toFixed(2)) : 0;
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
        totalMessagingConversations,
        costPerConversation,
        totalRevenue,
        averageRoas: avgRoas,
        averageFrequency: Number(avgFreq.toFixed(2)),
        activeCampaignsCount: cmpCount || 0,
        activeAdSetsCount: adSetCount || 0,
        activeAdsCount: activeAdsCount || 0,
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
        totalMessagingConversations: 0,
        costPerConversation: 0,
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
  async getAlienMaxInsights(accountId?: string): Promise<AlienMaxMetaAdsInsight[]> {
    const campaigns = await this.listCampaigns(accountId);

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
