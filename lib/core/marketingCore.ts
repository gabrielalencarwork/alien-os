/**
 * Core Module: Marketing Core Universal (Alien OS)
 * Abstrai a comunicação e os dados de todas as mídias pagas (Google Ads, Meta Ads, TikTok Ads, LinkedIn Ads)
 * em uma estrutura de tipos e normalização universal reutilizável por toda a aplicação.
 */

export type ProviderSlug = "google-ads" | "meta-ads" | "tiktok-ads" | "linkedin-ads" | "ga4";

export interface UniversalMediaAccount {
  id: string;
  organizationId?: string;
  workspaceId?: string;
  companyId: string;
  providerSlug: ProviderSlug;
  externalAccountId: string;
  accountName: string;
  currencyCode: string;
  timeZone: string;
  status: string;
  lastSyncedAt: string;
}

export interface UniversalMediaCampaign {
  id: string;
  accountId: string;
  providerSlug: ProviderSlug;
  externalCampaignId: string;
  campaignName: string;
  status: string;
  objective: string;
  dailyBudget: number;
  startDate?: string;
  endDate?: string;
}

export interface UniversalMediaAdGroup {
  id: string;
  campaignId: string;
  providerSlug: ProviderSlug;
  externalAdGroupId: string;
  adGroupName: string;
  status: string;
}

export interface UniversalMediaAd {
  id: string;
  adGroupId: string;
  providerSlug: ProviderSlug;
  externalAdId: string;
  headline: string;
  description: string;
  finalUrl: string;
  status: string;
}

export interface UniversalMediaMetrics {
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  cost: number;
  conversions: number;
  revenue: number;
  roas: number;
  cpa: number;
}

export class MarketingCoreNormalizer {
  /**
   * Calcula métricas universais comuns a partir de impressões, cliques, custo, conversões e receita.
   */
  static calculateUniversalMetrics(
    impressions: number,
    clicks: number,
    cost: number,
    conversions: number,
    revenue: number
  ): UniversalMediaMetrics {
    const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
    const cpc = clicks > 0 ? Number((cost / clicks).toFixed(2)) : 0;
    const cpm = impressions > 0 ? Number(((cost / impressions) * 1000).toFixed(2)) : 0;
    const roas = cost > 0 ? Number((revenue / cost).toFixed(2)) : 0;
    const cpa = conversions > 0 ? Number((cost / conversions).toFixed(2)) : 0;

    return {
      impressions,
      clicks,
      ctr,
      cpc,
      cpm,
      cost,
      conversions,
      revenue,
      roas,
      cpa,
    };
  }
}
