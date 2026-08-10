/**
 * Repository Pattern: Social Media Repository (TikTok & LinkedIn Ads) — Alien OS
 * Lê exclusivamente dados persistidos no Supabase das tabelas:
 * public.tiktok_ads_accounts, public.tiktok_ads_campaigns, public.tiktok_ads_daily_metrics,
 * public.linkedin_ads_accounts, public.linkedin_ads_campaigns, public.linkedin_ads_daily_metrics.
 *
 * REGRA DE OURO: O Repository lê exclusivamente do Supabase e NÃO realiza chamadas HTTP externas para APIs.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export interface SocialMediaCampaignRecord {
  id: string;
  providerSlug: "tiktok-ads" | "linkedin-ads";
  accountId: string;
  externalCampaignId: string;
  campaignName: string;
  status: string;
  objective: string;
  budget: number;
  cost: number;
  conversions: number;
  revenue: number;
  roas: number;
  leads?: number;
  cpl?: number;
  videoViews?: number;
}

export interface SocialMediaMetricsSummary {
  providerSlug: "tiktok-ads" | "linkedin-ads";
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageCpc: number;
  totalConversions: number;
  totalRevenue: number;
  averageRoas: number;
  totalLeads?: number;
  averageCpl?: number;
}

export class SocialMediaRepository {
  /**
   * Lê campanhas do TikTok Ads registradas no Supabase
   */
  async listTikTokCampaigns(): Promise<SocialMediaCampaignRecord[]> {
    try {
      const supabase = createBrowserClient();
      const { data: campaigns } = await supabase
        .from("tiktok_ads_campaigns")
        .select("*")
        .eq("active", true);

      if (!campaigns || campaigns.length === 0) return [];

      const result: SocialMediaCampaignRecord[] = [];

      for (const cmp of campaigns) {
        const { data: metrics } = await supabase
          .from("tiktok_ads_daily_metrics")
          .select("cost, conversions, revenue, video_views_p100")
          .eq("campaign_id", cmp.id);

        const cost = (metrics || []).reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        const conversions = (metrics || []).reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
        const revenue = (metrics || []).reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
        const videoViews = (metrics || []).reduce((acc, curr) => acc + (Number(curr.video_views_p100) || 0), 0);
        const roas = cost > 0 ? Number((revenue / cost).toFixed(2)) : 0;

        result.push({
          id: cmp.id,
          providerSlug: "tiktok-ads",
          accountId: cmp.account_id,
          externalCampaignId: cmp.external_campaign_id,
          campaignName: cmp.campaign_name,
          status: cmp.status || "ACTIVE",
          objective: cmp.objective || "SPARK_ADS",
          budget: Number(cmp.budget) || 0,
          cost,
          conversions,
          revenue,
          roas,
          videoViews,
        });
      }

      return result;
    } catch (err) {
      console.error("Erro ao ler tiktok_ads_campaigns no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê campanhas B2B do LinkedIn Ads registradas no Supabase
   */
  async listLinkedInCampaigns(): Promise<SocialMediaCampaignRecord[]> {
    try {
      const supabase = createBrowserClient();
      const { data: campaigns } = await supabase
        .from("linkedin_ads_campaigns")
        .select("*")
        .eq("active", true);

      if (!campaigns || campaigns.length === 0) return [];

      const result: SocialMediaCampaignRecord[] = [];

      for (const cmp of campaigns) {
        const { data: metrics } = await supabase
          .from("linkedin_ads_daily_metrics")
          .select("cost, conversions, revenue, leads, cpl")
          .eq("campaign_id", cmp.id);

        const cost = (metrics || []).reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
        const conversions = (metrics || []).reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
        const revenue = (metrics || []).reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);
        const leads = (metrics || []).reduce((acc, curr) => acc + (Number(curr.leads) || 0), 0);
        const roas = cost > 0 ? Number((revenue / cost).toFixed(2)) : 0;
        const cpl = leads > 0 ? Number((cost / leads).toFixed(2)) : 0;

        result.push({
          id: cmp.id,
          providerSlug: "linkedin-ads",
          accountId: cmp.account_id,
          externalCampaignId: cmp.external_campaign_id,
          campaignName: cmp.campaign_name,
          status: cmp.status || "ACTIVE",
          objective: cmp.objective || "LEAD_GENERATION",
          budget: Number(cmp.budget) || 0,
          cost,
          conversions,
          revenue,
          roas,
          leads,
          cpl,
        });
      }

      return result;
    } catch (err) {
      console.error("Erro ao ler linkedin_ads_campaigns no Supabase:", err);
      return [];
    }
  }
}

export const socialMediaRepository = new SocialMediaRepository();
