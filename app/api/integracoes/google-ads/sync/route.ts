import { NextRequest, NextResponse } from "next/server";
import { googleAdsConnector } from "@/lib/connectors/google/googleAdsConnector";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, customerId, descriptiveName, isFullSync } = await req.json();

    if (!accessToken || !customerId) {
      return NextResponse.json(
        { error: "Access Token e Customer ID são obrigatórios para a sincronização." },
        { status: 400 }
      );
    }

    const cleanCustomerId = customerId.replace(/-/g, "");
    const startTime = Date.now();
    const supabase = createServerClient();

    // 1. Salvar ou atualizar a conta em public.google_ads_customers
    await supabase.from("google_ads_customers").upsert(
      {
        customer_id: cleanCustomerId,
        descriptive_name: descriptiveName || `Conta Google Ads ${cleanCustomerId}`,
        currency_code: "BRL",
        time_zone: "America/Sao_Paulo",
        manager: false,
        status: "ENABLED",
        last_synced_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: "customer_id" }
    );

    // 2. Buscar campanhas via Connector
    const campaigns = await googleAdsConnector.listCampaigns(accessToken, cleanCustomerId);

    const insertedCampaignIds: Record<string, string> = {};

    // 3. Salvar campanhas em public.google_ads_campaigns
    for (const cmp of campaigns) {
      const { data: savedCmp } = await supabase
        .from("google_ads_campaigns")
        .upsert(
          {
            customer_id: cleanCustomerId,
            external_campaign_id: cmp.id,
            campaign_name: cmp.name,
            status: cmp.status,
            campaign_type: cmp.advertisingChannelType || "SEARCH",
            advertising_channel_type: cmp.advertisingChannelType || "SEARCH",
            advertising_channel_sub_type: cmp.advertisingChannelSubType || "SEARCH_EXPRESS",
            serving_status: cmp.servingStatus || "SERVING",
            optimization_score: cmp.optimizationScore || 85.0,
            objective: cmp.advertisingChannelType,
            budget: cmp.budgetAmount,
            start_date: cmp.startDate || null,
            end_date: cmp.endDate || null,
            active: true,
          },
          { onConflict: "external_campaign_id" }
        )
        .select("id")
        .single();

      if (savedCmp) {
        insertedCampaignIds[cmp.id] = savedCmp.id;
      }
    }

    // 4. Buscar Grupos de Anúncios via Connector e Salvar em public.google_ads_ad_groups
    const adGroups = await googleAdsConnector.listAdGroups(accessToken, cleanCustomerId);
    const insertedAdGroupIds: Record<string, string> = {};

    for (const ag of adGroups) {
      const parentCmpId = insertedCampaignIds[ag.campaignId] || Object.values(insertedCampaignIds)[0];
      if (parentCmpId) {
        const { data: savedAg } = await supabase
          .from("google_ads_ad_groups")
          .upsert(
            {
              customer_id: cleanCustomerId,
              campaign_id: parentCmpId,
              external_ad_group_id: ag.id,
              ad_group_name: ag.name,
              status: ag.status,
              type: ag.type,
              active: true,
            },
            { onConflict: "external_ad_group_id" }
          )
          .select("id")
          .single();

        if (savedAg) {
          insertedAdGroupIds[ag.id] = savedAg.id;
        }
      }
    }

    // 5. Buscar Anúncios Individuais via Connector e Salvar em public.google_ads_ads
    const ads = await googleAdsConnector.listAds(accessToken, cleanCustomerId);
    for (const ad of ads) {
      const parentCmpId = insertedCampaignIds[ad.campaignId] || Object.values(insertedCampaignIds)[0];
      const parentAgId = insertedAdGroupIds[ad.adGroupId] || Object.values(insertedAdGroupIds)[0];

      if (parentCmpId && parentAgId) {
        await supabase.from("google_ads_ads").upsert(
          {
            campaign_id: parentCmpId,
            ad_group_id: parentAgId,
            external_ad_id: ad.id,
            headline: ad.headline,
            description: ad.description,
            final_url: ad.finalUrl,
            status: ad.status,
            active: true,
          },
          { onConflict: "external_ad_id" }
        );
      }
    }

    // 6. Buscar métricas avançadas diárias dos últimos 30 dias via Connector
    const dailyMetrics = await googleAdsConnector.fetchDailyMetricsAdvanced(
      accessToken,
      cleanCustomerId,
      isFullSync ? "ALL_TIME" : "30daysAgo",
      "today"
    );

    let processedCount = 0;

    // 7. Salvar métricas avançadas em public.google_ads_daily_metrics
    if (dailyMetrics && dailyMetrics.length > 0) {
      const metricRows = dailyMetrics
        .filter((m) => insertedCampaignIds[m.campaignId])
        .map((m) => {
          const internalCmpId = insertedCampaignIds[m.campaignId];
          const roas = m.cost > 0 ? Number((m.conversionValue / m.cost).toFixed(2)) : 0;
          const costPerConv = m.conversions > 0 ? Number((m.cost / m.conversions).toFixed(2)) : 0;

          return {
            campaign_id: internalCmpId,
            metric_date: m.metricDate,
            impressions: m.impressions,
            clicks: m.clicks,
            ctr: Number(m.ctr.toFixed(2)),
            average_cpc: Number(m.averageCpc.toFixed(2)),
            cost: Number(m.cost.toFixed(2)),
            cost_micros: m.costMicros,
            conversions: m.conversions,
            all_conversions: m.allConversions,
            conversion_value: Number(m.conversionValue.toFixed(2)),
            cost_per_conversion: costPerConv,
            roas: roas,
            revenue: Number(m.conversionValue.toFixed(2)),
            impression_share: m.impressionShare,
            search_impression_share: m.searchImpressionShare,
            search_top_impression_share: m.searchTopImpressionShare,
            video_views: m.videoViews,
            view_through_conversions: m.viewThroughConversions,
            active: true,
          };
        });

      if (metricRows.length > 0) {
        await supabase.from("google_ads_daily_metrics").upsert(metricRows, {
          onConflict: "campaign_id,metric_date",
        });
        processedCount = metricRows.length;
      }
    }

    const durationMs = Date.now() - startTime;

    // 8. Gravar log de auditoria em public.google_ads_sync_history
    await supabase.from("google_ads_sync_history").insert({
      customer_id: cleanCustomerId,
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: durationMs,
      records_processed: processedCount,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      campaignsSynced: campaigns.length,
      adGroupsSynced: adGroups.length,
      adsSynced: ads.length,
      metricsSynced: processedCount,
      durationMs,
    });
  } catch (error: any) {
    console.error("Erro na sincronização hierárquica do Google Ads:", error);
    return NextResponse.json(
      { error: error?.message || "Erro durante a sincronização com a Google Ads API." },
      { status: 500 }
    );
  }
}
