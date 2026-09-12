/**
 * Connector Module: Google Ads Connector (Alien OS)
 * Conector especializado para comunicação com a Google Ads API v16.
 * Centraliza toda chamada à CustomerService e GoogleAdsService (consultas GAQL).
 */

import { googleAuthConnector } from "./googleAuthConnector";

const envVersion = process.env.NEXT_PUBLIC_GOOGLE_ADS_API_VERSION;
export const GOOGLE_ADS_API_VERSION = envVersion || "v25";

export interface GoogleAdsCustomerSummary {
  customerId: string;
  descriptiveName: string;
  currencyCode: string;
  timeZone: string;
  manager: boolean;
}

export interface GoogleAdsCampaignItem {
  id: string;
  customerId: string;
  name: string;
  status: string;
  advertisingChannelType: string;
  advertisingChannelSubType?: string;
  servingStatus?: string;
  optimizationScore?: number;
  budgetAmount: number; // Em R$
  startDate?: string;
  endDate?: string;
}

export interface GoogleAdsAdGroupItem {
  id: string;
  customerId: string;
  campaignId: string;
  campaignName?: string;
  name: string;
  status: string;
  type: string;
}

export interface GoogleAdsAdItem {
  id: string;
  campaignId: string;
  campaignName?: string;
  adGroupId: string;
  adGroupName?: string;
  headline: string;
  description: string;
  finalUrl: string;
  status: string;
}

export interface GoogleAdsKeywordItem {
  id: string;
  customerId: string;
  campaignId: string;
  campaignName?: string;
  adGroupId?: string;
  adGroupName?: string;
  keywordText: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
  status: string;
  negative: boolean;
  qualityScore: number;
}

export interface GoogleAdsDailyMetricRow {
  campaignId: string;
  metricDate: string;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  cost: number; // Em R$
  costMicros: number;
  conversions: number;
  allConversions: number;
  conversionValue: number;
  impressionShare: number;
  searchImpressionShare: number;
  searchTopImpressionShare: number;
  videoViews: number;
  viewThroughConversions: number;
}

export class GoogleAdsConnector {
  /**
   * Lista todas as contas de anúncios (Customer Accounts) e MCCs acessíveis.
   */
  async listCustomers(
    accessToken: string,
    developerToken?: string
  ): Promise<GoogleAdsCustomerSummary[]> {
    const providedToken =
      developerToken && developerToken.trim() !== "" && developerToken !== "ALIEN_OS_DEV_TOKEN_OPTIONAL"
        ? developerToken.trim()
        : undefined;
    const envToken =
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN ||
      "lCp4Ljie_X-CaVW-O-CrWQ";
    const devToken = providedToken || envToken;

    if (!devToken) {
      throw new Error(
        "Developer Token do Google Ads ausente. Para consultar a API oficial do Google Ads, informe o seu Developer Token (gerado no Google Ads MCC em Ferramentas e Configurações > Centro de API)."
      );
    }

    try {
      const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`;
      const data = await googleAuthConnector.googleFetch<{
        resourceNames?: string[];
      }>(url, accessToken, {}, devToken);

      if (!data.resourceNames || data.resourceNames.length === 0) {
        return [];
      }

      const customers: GoogleAdsCustomerSummary[] = [];

      for (const resName of data.resourceNames) {
        const rawId = resName.replace("customers/", "");
        let name = `Conta Google Ads (${rawId})`;
        let isManager = false;
        let currency = "BRL";
        let timeZone = "America/Sao_Paulo";

        try {
          const detailUrl = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${rawId}/googleAds:search`;
          const detailData = await googleAuthConnector.googleFetch<{
            results?: Array<{
              customer?: {
                id: string;
                descriptiveName?: string;
                manager?: boolean;
                currencyCode?: string;
                timeZone?: string;
              };
            }>;
          }>(
            detailUrl,
            accessToken,
            {
              method: "POST",
              body: JSON.stringify({
                query: "SELECT customer.id, customer.descriptive_name, customer.manager, customer.currency_code, customer.time_zone FROM customer LIMIT 1",
              }),
            },
            devToken
          );

          const cust = detailData?.results?.[0]?.customer;
          if (cust) {
            if (cust.descriptiveName) name = cust.descriptiveName;
            if (typeof cust.manager === "boolean") isManager = cust.manager;
            if (cust.currencyCode) currency = cust.currencyCode;
            if (cust.timeZone) timeZone = cust.timeZone;
          }
        } catch {
          // Mantém o fallback com ID se não puder ler os detalhes individuais
        }

        customers.push({
          customerId: rawId,
          descriptiveName: isManager ? `[MCC] ${name}` : name,
          currencyCode: currency,
          timeZone,
          manager: isManager,
        });
      }

      return customers;
    } catch (err: any) {
      console.error("Erro ao listar contas na Google Ads API:", err);
      if (err?.message?.includes("404")) {
        throw new Error(
          `O servidor do Google Ads recusou a chamada da API (404). Isso ocorre quando o Developer Token está incorreto, pendente de aprovação ou quando a versão da API (${GOOGLE_ADS_API_VERSION}) foi descontinuada.`
        );
      }
      throw err;
    }
  }

  /**
   * Consulta campanhas via GAQL incluindo Optimization Score e Serving Status.
   */
  async listCampaigns(
    accessToken: string,
    customerId: string,
    developerToken: string = "ALIEN_OS_DEV_TOKEN_OPTIONAL",
    loginCustomerId?: string
  ): Promise<GoogleAdsCampaignItem[]> {
    const providedToken =
      developerToken && developerToken.trim() !== "" && developerToken !== "ALIEN_OS_DEV_TOKEN_OPTIONAL"
        ? developerToken.trim()
        : undefined;
    const envToken =
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN ||
      "lCp4Ljie_X-CaVW-O-CrWQ";
    const devToken = providedToken || envToken;

    if (!devToken) {
      throw new Error(
        "Developer Token do Google Ads ausente. Para sincronizar campanhas e métricas reais, insira o seu Developer Token no campo da tela e tente novamente."
      );
    }

    const cleanId = customerId.replace(/-/g, "");
    const mccId = loginCustomerId
      ? loginCustomerId.replace(/-/g, "")
      : process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "")
      : undefined;
    const headerToPass = mccId && mccId !== cleanId ? mccId : undefined;
    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanId}/googleAds:search`;

    const gaqlQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.advertising_channel_sub_type,
        campaign.serving_status,
        campaign.optimization_score,
        campaign_budget.amount_micros
      FROM campaign
      ORDER BY campaign.id DESC
    `;

    try {
      let data: any;
      try {
        data = await googleAuthConnector.googleFetch<{
          results?: Array<{
            campaign?: {
              id: string;
              name: string;
              status: string;
              advertisingChannelType: string;
              advertisingChannelSubType?: string;
              servingStatus?: string;
              optimizationScore?: number;
              startDate?: string;
              endDate?: string;
            };
            campaignBudget?: {
              amountMicros: string;
            };
          }>;
        }>(
          url,
          accessToken,
          {
            method: "POST",
            body: JSON.stringify({ query: gaqlQuery }),
          },
          devToken,
          headerToPass
        );
      } catch (firstErr: any) {
        // Se a chamada com login-customer-id falhou por permissão, tenta acesso direto sem MCC
        if (headerToPass && (firstErr?.message?.includes("USER_PERMISSION_DENIED") || firstErr?.message?.includes("PERMISSION_DENIED"))) {
          console.warn(`Tentativa com MCC (${headerToPass}) falhou. Tentando acesso direto para ${cleanId}...`);
          data = await googleAuthConnector.googleFetch<{
            results?: Array<{
              campaign?: {
                id: string;
                name: string;
                status: string;
                advertisingChannelType: string;
                advertisingChannelSubType?: string;
                servingStatus?: string;
                optimizationScore?: number;
                startDate?: string;
                endDate?: string;
              };
              campaignBudget?: {
                amountMicros: string;
              };
            }>;
          }>(
            url,
            accessToken,
            {
              method: "POST",
              body: JSON.stringify({ query: gaqlQuery }),
            },
            devToken,
            undefined
          );
        } else {
          throw firstErr;
        }
      }

      if (!data.results) return [];

      return data.results.map((r: any) => {
        const c = r.campaign;
        const budgetMicros = Number(r.campaignBudget?.amountMicros) || 0;

        return {
          id: c?.id || `cmp-${Math.random()}`,
          customerId: cleanId,
          name: c?.name || `Campanha ${c?.id}`,
          status: c?.status || "ENABLED",
          advertisingChannelType: c?.advertisingChannelType || "SEARCH",
          advertisingChannelSubType: c?.advertisingChannelSubType || "SEARCH_EXPRESS",
          servingStatus: c?.servingStatus || "SERVING",
          optimizationScore: c?.optimizationScore ? Number((c.optimizationScore * 100).toFixed(1)) : 85.0,
          budgetAmount: budgetMicros / 1_000_000,
          startDate: c?.startDate,
          endDate: c?.endDate,
        };
      });
    } catch (err) {
      console.error("Erro ao consultar campanhas na Google Ads API:", err);
      throw err;
    }
  }

  /**
   * Consulta Grupos de Anúncios (Ad Groups) de um Customer ID via GAQL.
   */
  async listAdGroups(
    accessToken: string,
    customerId: string,
    developerToken: string = "ALIEN_OS_DEV_TOKEN_OPTIONAL",
    loginCustomerId?: string
  ): Promise<GoogleAdsAdGroupItem[]> {
    const providedToken =
      developerToken && developerToken.trim() !== "" && developerToken !== "ALIEN_OS_DEV_TOKEN_OPTIONAL"
        ? developerToken.trim()
        : undefined;
    const envToken =
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN ||
      "lCp4Ljie_X-CaVW-O-CrWQ";
    const devToken = providedToken || envToken;

    const cleanId = customerId.replace(/-/g, "");
    const mccId = loginCustomerId
      ? loginCustomerId.replace(/-/g, "")
      : process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "")
      : undefined;
    const headerToPass = mccId && mccId !== cleanId ? mccId : undefined;
    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanId}/googleAds:search`;

    const gaqlQuery = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        ad_group.type,
        campaign.id,
        campaign.name
      FROM ad_group
      ORDER BY ad_group.id DESC
    `;

    try {
      let data: any;
      try {
        data = await googleAuthConnector.googleFetch<{
          results?: Array<{
            adGroup?: {
              id: string;
              name: string;
              status: string;
              type: string;
            };
            campaign?: { id: string; name: string };
          }>;
        }>(
          url,
          accessToken,
          {
            method: "POST",
            body: JSON.stringify({ query: gaqlQuery }),
          },
          devToken,
          headerToPass
        );
      } catch (firstErr: any) {
        if (headerToPass && (firstErr?.message?.includes("USER_PERMISSION_DENIED") || firstErr?.message?.includes("PERMISSION_DENIED"))) {
          data = await googleAuthConnector.googleFetch<{
            results?: Array<{
              adGroup?: {
                id: string;
                name: string;
                status: string;
                type: string;
              };
              campaign?: { id: string; name: string };
            }>;
          }>(
            url,
            accessToken,
            {
              method: "POST",
              body: JSON.stringify({ query: gaqlQuery }),
            },
            devToken,
            undefined
          );
        } else {
          throw firstErr;
        }
      }

      if (!data.results) return [];

      return data.results.map((r: any) => ({
        id: r.adGroup?.id || `ag-${Math.random()}`,
        customerId: cleanId,
        campaignId: r.campaign?.id || "",
        campaignName: r.campaign?.name || "",
        name: r.adGroup?.name || "Grupo de Anúncios",
        status: r.adGroup?.status || "ENABLED",
        type: r.adGroup?.type || "SEARCH_STANDARD",
      }));
    } catch (err) {
      console.error("Erro ao consultar grupos de anúncios na Google Ads API:", err);
      return [];
    }
  }

  /**
   * Consulta Anúncios (Ads) individuais de um Customer ID via GAQL.
   */
  async listAds(
    accessToken: string,
    customerId: string,
    developerToken: string = "ALIEN_OS_DEV_TOKEN_OPTIONAL",
    loginCustomerId?: string
  ): Promise<GoogleAdsAdItem[]> {
    const providedToken =
      developerToken && developerToken.trim() !== "" && developerToken !== "ALIEN_OS_DEV_TOKEN_OPTIONAL"
        ? developerToken.trim()
        : undefined;
    const envToken =
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN ||
      "lCp4Ljie_X-CaVW-O-CrWQ";
    const devToken = providedToken || envToken;

    const cleanId = customerId.replace(/-/g, "");
    const mccId = loginCustomerId
      ? loginCustomerId.replace(/-/g, "")
      : process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "")
      : undefined;
    const headerToPass = mccId && mccId !== cleanId ? mccId : undefined;
    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanId}/googleAds:search`;

    const gaqlQuery = `
      SELECT
        ad_group_ad.ad.id,
        ad_group_ad.ad.name,
        ad_group_ad.status,
        ad_group_ad.ad.final_urls,
        ad_group_ad.ad.responsive_search_ad.headlines,
        ad_group_ad.ad.responsive_search_ad.descriptions,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name
      FROM ad_group_ad
      ORDER BY ad_group_ad.ad.id DESC
    `;

    try {
      let data: any;
      try {
        data = await googleAuthConnector.googleFetch<{
          results?: Array<{
            adGroupAd?: {
              ad?: {
                id: string;
                name?: string;
                finalUrls?: string[];
                responsiveSearchAd?: {
                  headlines?: Array<{ text?: string }>;
                  descriptions?: Array<{ text?: string }>;
                };
              };
              status?: string;
            };
            adGroup?: { id: string; name: string };
            campaign?: { id: string; name: string };
          }>;
        }>(
          url,
          accessToken,
          {
            method: "POST",
            body: JSON.stringify({ query: gaqlQuery }),
          },
          devToken,
          headerToPass
        );
      } catch (firstErr: any) {
        if (headerToPass && (firstErr?.message?.includes("USER_PERMISSION_DENIED") || firstErr?.message?.includes("PERMISSION_DENIED"))) {
          data = await googleAuthConnector.googleFetch<{
            results?: Array<{
              adGroupAd?: {
                ad?: {
                  id: string;
                  name?: string;
                  finalUrls?: string[];
                  responsiveSearchAd?: {
                    headlines?: Array<{ text?: string }>;
                    descriptions?: Array<{ text?: string }>;
                  };
                };
                status?: string;
              };
              adGroup?: { id: string; name: string };
              campaign?: { id: string; name: string };
            }>;
          }>(
            url,
            accessToken,
            {
              method: "POST",
              body: JSON.stringify({ query: gaqlQuery }),
            },
            devToken,
            undefined
          );
        } else {
          throw firstErr;
        }
      }

      if (!data.results) return [];

      return data.results.map((r: any) => {
        const ad = r.adGroupAd?.ad;
        const rsa = ad?.responsiveSearchAd;
        const headlineTexts = (rsa?.headlines || []).map((h: any) => h?.text).filter(Boolean);
        const descTexts = (rsa?.descriptions || []).map((d: any) => d?.text).filter(Boolean);

        const headline =
          headlineTexts[0] ||
          ad?.name ||
          (r.adGroup?.name ? `Anúncio - ${r.adGroup.name}` : `Anúncio #${ad?.id || ""}`);

        const description =
          descTexts[0] ||
          (r.campaign?.name ? `Campanha: ${r.campaign.name}` : "");

        const finalUrl =
          ad?.finalUrls?.[0] ||
          "";

        return {
          id: ad?.id ? String(ad.id) : `ad-${Math.random()}`,
          campaignId: r.campaign?.id ? String(r.campaign.id) : "",
          campaignName: r.campaign?.name || "",
          adGroupId: r.adGroup?.id ? String(r.adGroup.id) : "",
          adGroupName: r.adGroup?.name || "",
          headline,
          description,
          finalUrl,
          status: r.adGroupAd?.status || "ENABLED",
        };
      });
    } catch (err) {
      console.error("Erro ao consultar anúncios na Google Ads API:", err);
      return [];
    }
  }

  /**
   * Consulta métricas diárias dos últimos 90 a 365 dias via GAQL com campos padronizados.
   */
  async fetchDailyMetricsAdvanced(
    accessToken: string,
    customerId: string,
    startDate: string = "30daysAgo",
    endDate: string = "today",
    developerToken: string = "ALIEN_OS_DEV_TOKEN_OPTIONAL",
    loginCustomerId?: string
  ): Promise<GoogleAdsDailyMetricRow[]> {
    const providedToken =
      developerToken && developerToken.trim() !== "" && developerToken !== "ALIEN_OS_DEV_TOKEN_OPTIONAL"
        ? developerToken.trim()
        : undefined;
    const envToken =
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN ||
      "lCp4Ljie_X-CaVW-O-CrWQ";
    const devToken = providedToken || envToken;

    const cleanId = customerId.replace(/-/g, "");
    const mccId = loginCustomerId
      ? loginCustomerId.replace(/-/g, "")
      : process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "")
      : undefined;
    const headerToPass = mccId && mccId !== cleanId ? mccId : undefined;
    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanId}/googleAds:search`;

    const endD = new Date();
    const startD = new Date();
    const daysBack = startDate === "ALL_TIME" ? 365 : 90;
    startD.setDate(endD.getDate() - daysBack);
    const startStr = startD.toISOString().split("T")[0];
    const endStr = endD.toISOString().split("T")[0];

    const gaqlQuery = `
      SELECT
        campaign.id,
        segments.date,
        metrics.impressions,
        metrics.clicks,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM campaign
      WHERE segments.date >= '${startStr}' AND segments.date <= '${endStr}'
      ORDER BY segments.date DESC
    `;

    try {
      let data: any;
      try {
        data = await googleAuthConnector.googleFetch<{
          results?: Array<{
            campaign?: { id: string };
            segments?: { date: string };
            metrics?: {
              impressions?: string;
              clicks?: string;
              costMicros?: string;
              conversions?: number;
              conversionsValue?: number;
            };
          }>;
        }>(
          url,
          accessToken,
          {
            method: "POST",
            body: JSON.stringify({ query: gaqlQuery }),
          },
          devToken,
          headerToPass
        );
      } catch (firstErr: any) {
        if (headerToPass && (firstErr?.message?.includes("USER_PERMISSION_DENIED") || firstErr?.message?.includes("PERMISSION_DENIED"))) {
          data = await googleAuthConnector.googleFetch<{
            results?: Array<{
              campaign?: { id: string };
              segments?: { date: string };
              metrics?: {
                impressions?: string;
                clicks?: string;
                costMicros?: string;
                conversions?: number;
                conversionsValue?: number;
              };
            }>;
          }>(
            url,
            accessToken,
            {
              method: "POST",
              body: JSON.stringify({ query: gaqlQuery }),
            },
            devToken,
            undefined
          );
        } else {
          throw firstErr;
        }
      }

      if (!data.results) return [];

      return data.results.map((r: any) => {
        const m = r.metrics;
        const impressions = Number(m?.impressions) || 0;
        const clicks = Number(m?.clicks) || 0;
        const costMicros = Number(m?.costMicros) || 0;
        const costR$ = costMicros / 1_000_000;
        const conversions = Number(m?.conversions) || 0;
        const conversionValue = Number(m?.conversionsValue) || 0;
        const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0;
        const avgCpc = clicks > 0 ? Number((costR$ / clicks).toFixed(2)) : 0;

        return {
          campaignId: r.campaign?.id ? String(r.campaign.id) : "",
          metricDate: r.segments?.date || new Date().toISOString().split("T")[0],
          impressions,
          clicks,
          ctr,
          averageCpc: avgCpc,
          cost: costR$,
          costMicros,
          conversions,
          allConversions: conversions,
          conversionValue,
          impressionShare: 0,
          searchImpressionShare: 0,
          searchTopImpressionShare: 0,
          videoViews: 0,
          viewThroughConversions: 0,
        };
      });
    } catch (err: any) {
      console.error("Erro ao consultar métricas na Google Ads API:", err);
      throw err;
    }
  }

  /**
   * Consulta Palavras-Chave e Palavras Negativas reais via GAQL.
   */
  async listKeywords(
    accessToken: string,
    customerId: string,
    developerToken: string = "ALIEN_OS_DEV_TOKEN_OPTIONAL",
    loginCustomerId?: string
  ): Promise<GoogleAdsKeywordItem[]> {
    const providedToken =
      developerToken && developerToken.trim() !== "" && developerToken !== "ALIEN_OS_DEV_TOKEN_OPTIONAL"
        ? developerToken.trim()
        : undefined;
    const envToken =
      process.env.GOOGLE_ADS_DEVELOPER_TOKEN ||
      process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN ||
      "lCp4Ljie_X-CaVW-O-CrWQ";
    const devToken = providedToken || envToken;

    const cleanId = customerId.replace(/-/g, "");
    const mccId = loginCustomerId
      ? loginCustomerId.replace(/-/g, "")
      : process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID
      ? process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, "")
      : undefined;
    const headerToPass = mccId && mccId !== cleanId ? mccId : undefined;
    const url = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${cleanId}/googleAds:search`;

    const keywords: GoogleAdsKeywordItem[] = [];

    // 1. Palavras-Chave de Grupos de Anúncios (Ad Group Criterion)
    const adGroupCriterionQuery = `
      SELECT
        ad_group_criterion.criterion_id,
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type,
        ad_group_criterion.status,
        ad_group_criterion.negative,
        ad_group.id,
        ad_group.name,
        campaign.id,
        campaign.name
      FROM ad_group_criterion
      WHERE ad_group_criterion.type = 'KEYWORD'
      ORDER BY ad_group_criterion.criterion_id DESC
      LIMIT 500
    `;

    try {
      let data: any;
      try {
        data = await googleAuthConnector.googleFetch<{
          results?: Array<{
            adGroupCriterion?: {
              criterionId: string;
              keyword?: { text: string; matchType: string };
              status: string;
              negative: boolean;
            };
            adGroup?: { id: string; name: string };
            campaign?: { id: string; name: string };
          }>;
        }>(url, accessToken, { method: "POST", body: JSON.stringify({ query: adGroupCriterionQuery }) }, devToken, headerToPass);
      } catch (firstErr: any) {
        if (headerToPass && (firstErr?.message?.includes("USER_PERMISSION_DENIED") || firstErr?.message?.includes("PERMISSION_DENIED"))) {
          data = await googleAuthConnector.googleFetch<any>(url, accessToken, { method: "POST", body: JSON.stringify({ query: adGroupCriterionQuery }) }, devToken, undefined);
        } else {
          throw firstErr;
        }
      }

      if (data?.results) {
        for (const r of data.results) {
          const crit = r.adGroupCriterion;
          if (crit?.keyword?.text) {
            keywords.push({
              id: crit.criterionId ? String(crit.criterionId) : `kw-${Math.random()}`,
              customerId: cleanId,
              campaignId: r.campaign?.id ? String(r.campaign.id) : "",
              campaignName: r.campaign?.name || "",
              adGroupId: r.adGroup?.id ? String(r.adGroup.id) : "",
              adGroupName: r.adGroup?.name || "",
              keywordText: crit.keyword.text,
              matchType: (crit.keyword.matchType as any) || "BROAD",
              status: crit.status || "ENABLED",
              negative: Boolean(crit.negative),
              qualityScore: 0,
            });
          }
        }
      }
    } catch (kwErr) {
      console.warn("Aviso ao buscar ad_group_criterion na Google Ads API:", kwErr);
    }

    // 2. Palavras Negativas a nível de Campanha (Campaign Criterion)
    const campaignCriterionQuery = `
      SELECT
        campaign_criterion.criterion_id,
        campaign_criterion.keyword.text,
        campaign_criterion.keyword.match_type,
        campaign_criterion.status,
        campaign_criterion.negative,
        campaign.id,
        campaign.name
      FROM campaign_criterion
      WHERE campaign_criterion.type = 'KEYWORD'
      ORDER BY campaign_criterion.criterion_id DESC
      LIMIT 500
    `;

    try {
      let campCritData: any;
      try {
        campCritData = await googleAuthConnector.googleFetch<{
          results?: Array<{
            campaignCriterion?: {
              criterionId: string;
              keyword?: { text: string; matchType: string };
              status: string;
              negative: boolean;
            };
            campaign?: { id: string; name: string };
          }>;
        }>(url, accessToken, { method: "POST", body: JSON.stringify({ query: campaignCriterionQuery }) }, devToken, headerToPass);
      } catch (firstErr: any) {
        if (headerToPass && (firstErr?.message?.includes("USER_PERMISSION_DENIED") || firstErr?.message?.includes("PERMISSION_DENIED"))) {
          campCritData = await googleAuthConnector.googleFetch<any>(url, accessToken, { method: "POST", body: JSON.stringify({ query: campaignCriterionQuery }) }, devToken, undefined);
        } else {
          throw firstErr;
        }
      }

      if (campCritData?.results) {
        for (const r of campCritData.results) {
          const crit = r.campaignCriterion;
          if (crit?.keyword?.text) {
            keywords.push({
              id: crit.criterionId ? String(crit.criterionId) : `camp-kw-${Math.random()}`,
              customerId: cleanId,
              campaignId: r.campaign?.id ? String(r.campaign.id) : "",
              campaignName: r.campaign?.name || "",
              keywordText: crit.keyword.text,
              matchType: (crit.keyword.matchType as any) || "BROAD",
              status: crit.status || "ENABLED",
              negative: true,
              qualityScore: 0,
            });
          }
        }
      }
    } catch (campKwErr) {
      console.warn("Aviso ao buscar campaign_criterion na Google Ads API:", campKwErr);
    }

    return keywords;
  }
}

export const googleAdsConnector = new GoogleAdsConnector();
