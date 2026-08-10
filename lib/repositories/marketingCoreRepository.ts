/**
 * Repository Pattern: Marketing Core Repository (Alien OS)
 * Consolida dados e métricas universais de TODAS as plataformas de mídia paga (Google Ads, Meta Ads, TikTok Ads)
 * lendo exclusivamente das tabelas universais do Supabase:
 * public.marketing_accounts, public.marketing_campaigns, public.marketing_daily_metrics.
 *
 * REGRA DE OURO: O Repository lê exclusivamente do Supabase e NÃO realiza chamadas HTTP externas para APIs.
 */

import { createBrowserClient } from "@/lib/supabase/client";
import {
  UniversalMediaAccount,
  UniversalMediaCampaign,
  UniversalMediaMetrics,
  MarketingCoreNormalizer,
} from "@/lib/core/marketingCore";

export interface ConsolidatedMediaDashboard {
  totalCost: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  averageCpc: number;
  averageCpm: number;
  totalConversions: number;
  totalRevenue: number;
  averageRoas: number;
  averageCpa: number;
  activeAccountsCount: number;
  activeCampaignsCount: number;
}

export class MarketingCoreRepository {
  /**
   * Lê todas as contas universais de anúncios de todas as mídias no Supabase.
   */
  async listAccounts(): Promise<UniversalMediaAccount[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase
        .from("marketing_accounts")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false });

      if (!data || data.length === 0) return [];

      return data.map((a: any) => ({
        id: a.id,
        organizationId: a.organization_id,
        workspaceId: a.workspace_id,
        companyId: a.company_id || "alien-mkt",
        providerSlug: a.provider_slug,
        externalAccountId: a.external_account_id,
        accountName: a.account_name,
        currencyCode: a.currency_code || "BRL",
        timeZone: a.time_zone || "America/Sao_Paulo",
        status: a.status || "ENABLED",
        lastSyncedAt: a.last_synced_at
          ? new Date(a.last_synced_at).toLocaleTimeString("pt-BR")
          : "Nunca",
      }));
    } catch (err) {
      console.error("Erro ao ler marketing_accounts no Supabase:", err);
      return [];
    }
  }

  /**
   * Lê todas as campanhas universais unificadas no Supabase.
   */
  async listCampaigns(providerSlug?: string): Promise<UniversalMediaCampaign[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase.from("marketing_campaigns").select("*").eq("active", true);

      if (providerSlug) {
        query = query.eq("provider_slug", providerSlug);
      }

      const { data } = await query;
      if (!data || data.length === 0) return [];

      return data.map((c: any) => ({
        id: c.id,
        accountId: c.account_id,
        providerSlug: c.provider_slug,
        externalCampaignId: c.external_campaign_id,
        campaignName: c.campaign_name,
        status: c.status || "ENABLED",
        objective: c.objective || "CONVERSIONS",
        dailyBudget: Number(c.daily_budget) || 0,
        startDate: c.start_date,
        endDate: c.end_date,
      }));
    } catch (err) {
      console.error("Erro ao ler marketing_campaigns no Supabase:", err);
      return [];
    }
  }

  /**
   * Agrega o Dashboard Consolidado Multimídia (Google, Meta, TikTok, LinkedIn) lendo do Supabase.
   */
  async getConsolidatedDashboard(): Promise<ConsolidatedMediaDashboard> {
    try {
      const supabase = createBrowserClient();
      const { data: metrics } = await supabase.from("marketing_daily_metrics").select("*");
      const { count: accCount } = await supabase.from("marketing_accounts").select("*", { count: "exact", head: true }).eq("active", true);
      const { count: cmpCount } = await supabase.from("marketing_campaigns").select("*", { count: "exact", head: true }).eq("active", true);

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
          averageCpa: 0,
          activeAccountsCount: accCount || 0,
          activeCampaignsCount: cmpCount || 0,
        };
      }

      const totalCost = metrics.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
      const totalImpressions = metrics.reduce((acc, curr) => acc + (Number(curr.impressions) || 0), 0);
      const totalClicks = metrics.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
      const totalConversions = metrics.reduce((acc, curr) => acc + (Number(curr.conversions) || 0), 0);
      const totalRevenue = metrics.reduce((acc, curr) => acc + (Number(curr.revenue) || 0), 0);

      const calculated = MarketingCoreNormalizer.calculateUniversalMetrics(
        totalImpressions,
        totalClicks,
        totalCost,
        totalConversions,
        totalRevenue
      );

      return {
        totalCost: calculated.cost,
        totalImpressions: calculated.impressions,
        totalClicks: calculated.clicks,
        averageCtr: calculated.ctr,
        averageCpc: calculated.cpc,
        averageCpm: calculated.cpm,
        totalConversions: calculated.conversions,
        totalRevenue: calculated.revenue,
        averageRoas: calculated.roas,
        averageCpa: calculated.cpa,
        activeAccountsCount: accCount || 0,
        activeCampaignsCount: cmpCount || 0,
      };
    } catch (err) {
      console.error("Erro ao consolidar dashboard multimídia no Supabase:", err);
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
        averageCpa: 0,
        activeAccountsCount: 0,
        activeCampaignsCount: 0,
      };
    }
  }
}

export const marketingCoreRepository = new MarketingCoreRepository();
