/**
 * Connector Module: Meta Ads Connector (Alien OS)
 * Conector especializado para consumo da Meta Marketing API (Graph API v19.0).
 * Executa requisições de contas, campanhas, conjuntos de anúncios (Ad Sets), anúncios e insights.
 */

import { metaAuthConnector } from "./metaAuthConnector";

export interface MetaAdAccountSummary {
  accountId: string; // ex: act_123456789
  businessId?: string;
  accountName: string;
  currencyCode: string;
  timeZone: string;
  status: string;
}

export interface MetaCampaignItem {
  id: string;
  accountId: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget: number; // Em R$
  startTime?: string;
  stopTime?: string;
}

export interface MetaAdSetItem {
  id: string;
  accountId: string;
  campaignId: string;
  name: string;
  status: string;
  billingEvent: string;
  bidStrategy: string;
}

export interface MetaAdItem {
  id: string;
  campaignId: string;
  adSetId: string;
  name: string;
  creativeId?: string;
  thumbnailUrl?: string;
  status: string;
}

export interface MetaDailyInsightRow {
  campaignId: string;
  metricDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cost: number;
  conversions: number;
  revenue: number;
  frequency: number;
}

export class MetaAdsConnector {
  /**
   * Lista todas as contas de anúncios ativas do usuário (/me/adaccounts)
   */
  async listAdAccounts(accessToken: string): Promise<MetaAdAccountSummary[]> {
    try {
      const data = await metaAuthConnector.metaFetch<{
        data?: Array<{
          id: string;
          name: string;
          account_id: string;
          currency: string;
          timezone_name: string;
          account_status: number;
          business?: { id: string; name: string };
        }>;
      }>("me/adaccounts?fields=id,name,account_id,currency,timezone_name,account_status,business", accessToken);

      if (!data.data || data.data.length === 0) return [];

      return data.data.map((acc) => ({
        accountId: acc.id.startsWith("act_") ? acc.id : `act_${acc.account_id}`,
        businessId: acc.business?.id,
        accountName: acc.name || `Conta Meta (${acc.account_id})`,
        currencyCode: acc.currency || "BRL",
        timeZone: acc.timezone_name || "America/Sao_Paulo",
        status: acc.account_status === 1 ? "ACTIVE" : "DISABLED",
      }));
    } catch (err) {
      console.error("Erro ao listar contas na Meta Marketing API:", err);
      throw err;
    }
  }

  /**
   * Consulta campanhas de uma conta de anúncios do Meta (/act_ID/campaigns)
   */
  async fetchCampaigns(accessToken: string, adAccountId: string): Promise<MetaCampaignItem[]> {
    const cleanAccId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

    try {
      const data = await metaAuthConnector.metaFetch<{
        data?: Array<{
          id: string;
          name: string;
          status: string;
          objective: string;
          daily_budget?: string;
          start_time?: string;
          stop_time?: string;
        }>;
      }>(`${cleanAccId}/campaigns?fields=id,name,status,objective,daily_budget,start_time,stop_time`, accessToken);

      if (!data.data) return [];

      return data.data.map((c) => ({
        id: c.id,
        accountId: cleanAccId,
        name: c.name,
        status: c.status || "ACTIVE",
        objective: c.objective || "OUTCOME_SALES",
        dailyBudget: Number(c.daily_budget || 0) / 100, // Cents para R$
        startTime: c.start_time,
        stopTime: c.stop_time,
      }));
    } catch (err) {
      console.error("Erro ao consultar campanhas na Meta Marketing API:", err);
      throw err;
    }
  }

  /**
   * Consulta conjuntos de anúncios / Ad Sets (/act_ID/adsets)
   */
  async fetchAdSets(accessToken: string, adAccountId: string): Promise<MetaAdSetItem[]> {
    const cleanAccId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

    try {
      const data = await metaAuthConnector.metaFetch<{
        data?: Array<{
          id: string;
          name: string;
          status: string;
          campaign_id: string;
          billing_event?: string;
          bid_strategy?: string;
        }>;
      }>(`${cleanAccId}/adsets?fields=id,name,status,campaign_id,billing_event,bid_strategy`, accessToken);

      if (!data.data) return [];

      return data.data.map((as) => ({
        id: as.id,
        accountId: cleanAccId,
        campaignId: as.campaign_id,
        name: as.name,
        status: as.status || "ACTIVE",
        billingEvent: as.billing_event || "IMPRESSIONS",
        bidStrategy: as.bid_strategy || "LOWEST_COST_WITHOUT_CAP",
      }));
    } catch (err) {
      console.error("Erro ao consultar adsets na Meta Marketing API:", err);
      return [];
    }
  }

  /**
   * Consulta anúncios individuais (/act_ID/ads)
   */
  async fetchAds(accessToken: string, adAccountId: string): Promise<MetaAdItem[]> {
    const cleanAccId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

    try {
      const data = await metaAuthConnector.metaFetch<{
        data?: Array<{
          id: string;
          name: string;
          status: string;
          campaign_id: string;
          adset_id: string;
          creative?: { id: string };
        }>;
      }>(`${cleanAccId}/ads?fields=id,name,status,campaign_id,adset_id,creative`, accessToken);

      if (!data.data) return [];

      return data.data.map((ad) => ({
        id: ad.id,
        campaignId: ad.campaign_id,
        adSetId: ad.adset_id,
        name: ad.name,
        creativeId: ad.creative?.id,
        thumbnailUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150",
        status: ad.status || "ACTIVE",
      }));
    } catch (err) {
      console.error("Erro ao consultar anúncios na Meta Marketing API:", err);
      return [];
    }
  }

  /**
   * Consulta métricas diárias de performance via Graph API (/act_ID/insights)
   */
  async fetchDailyInsights(
    accessToken: string,
    adAccountId: string,
    datePreset: string = "last_30days"
  ): Promise<MetaDailyInsightRow[]> {
    const cleanAccId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;

    try {
      const data = await metaAuthConnector.metaFetch<{
        data?: Array<{
          campaign_id: string;
          date_start: string;
          impressions: string;
          clicks: string;
          ctr: string;
          cpc: string;
          cpm: string;
          spend: string;
          frequency: string;
          actions?: Array<{ action_type: string; value: string }>;
          action_values?: Array<{ action_type: string; value: string }>;
        }>;
      }>(`${cleanAccId}/insights?level=campaign&time_increment=1&date_preset=${datePreset}&fields=campaign_id,date_start,impressions,clicks,ctr,cpc,cpm,spend,frequency,actions,action_values`, accessToken);

      if (!data.data) return [];

      return data.data.map((row) => {
        const spend = Number(row.spend) || 0;
        const impressions = Number(row.impressions) || 0;
        const clicks = Number(row.clicks) || 0;
        const ctr = Number(row.ctr) || (impressions > 0 ? (clicks / impressions) * 100 : 0);
        const cpc = Number(row.cpc) || (clicks > 0 ? spend / clicks : 0);
        const cpm = Number(row.cpm) || (impressions > 0 ? (spend / impressions) * 1000 : 0);

        // Extrair conversões e valor de conversão
        const purchaseAction = row.actions?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase" || a.action_type === "lead");
        const conversions = Number(purchaseAction?.value) || 0;

        const purchaseValueAction = row.action_values?.find((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase");
        const revenue = Number(purchaseValueAction?.value) || 0;

        return {
          campaignId: row.campaign_id,
          metricDate: row.date_start,
          impressions,
          clicks,
          ctr: Number(ctr.toFixed(2)),
          cpc: Number(cpc.toFixed(2)),
          cpm: Number(cpm.toFixed(2)),
          cost: Number(spend.toFixed(2)),
          conversions,
          revenue: Number(revenue.toFixed(2)),
          frequency: Number(Number(row.frequency || 1).toFixed(2)),
        };
      });
    } catch (err) {
      console.error("Erro ao consultar insights na Meta Marketing API:", err);
      throw err;
    }
  }
}

export const metaAdsConnector = new MetaAdsConnector();
