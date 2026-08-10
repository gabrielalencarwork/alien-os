import { NextRequest, NextResponse } from "next/server";
import { metaAdsConnector } from "@/lib/connectors/meta/metaAdsConnector";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, adAccountId, accountName, isFullSync } = await req.json();

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: "Access Token e Account ID são obrigatórios para a sincronização." },
        { status: 400 }
      );
    }

    const cleanAccId = adAccountId.startsWith("act_") ? adAccountId : `act_${adAccountId}`;
    const startTime = Date.now();
    const supabase = createServerClient();

    // 1. Salvar ou atualizar a conta em public.meta_ads_accounts E em public.marketing_accounts
    const { data: savedAcc } = await supabase
      .from("meta_ads_accounts")
      .upsert(
        {
          provider_slug: "meta-ads",
          account_id: cleanAccId,
          account_name: accountName || `Conta Meta Ads ${cleanAccId}`,
          currency_code: "BRL",
          time_zone: "America/Sao_Paulo",
          status: "ACTIVE",
          last_synced_at: new Date().toISOString(),
          active: true,
        },
        { onConflict: "account_id" }
      )
      .select("id")
      .single();

    // Alimentar tabela universal marketing_accounts
    await supabase.from("marketing_accounts").upsert(
      {
        provider_slug: "meta-ads",
        external_account_id: cleanAccId,
        account_name: accountName || `Conta Meta Ads ${cleanAccId}`,
        currency_code: "BRL",
        time_zone: "America/Sao_Paulo",
        status: "ACTIVE",
        last_synced_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: "provider_slug,external_account_id" }
    );

    // 2. Buscar campanhas via Connector
    const campaigns = await metaAdsConnector.fetchCampaigns(accessToken, cleanAccId);
    const insertedCampaignIds: Record<string, string> = {};

    // 3. Salvar campanhas em public.meta_ads_campaigns E em public.marketing_campaigns
    for (const cmp of campaigns) {
      const { data: savedCmp } = await supabase
        .from("meta_ads_campaigns")
        .upsert(
          {
            account_id: cleanAccId,
            external_campaign_id: cmp.id,
            campaign_name: cmp.name,
            status: cmp.status,
            objective: cmp.objective,
            daily_budget: cmp.dailyBudget,
            start_date: cmp.startTime ? cmp.startTime.split("T")[0] : null,
            end_date: cmp.stopTime ? cmp.stopTime.split("T")[0] : null,
            active: true,
          },
          { onConflict: "external_campaign_id" }
        )
        .select("id")
        .single();

      if (savedCmp) {
        insertedCampaignIds[cmp.id] = savedCmp.id;
      }

      // Se existir conta universal salva
      if (savedAcc) {
        await supabase.from("marketing_campaigns").upsert(
          {
            account_id: savedAcc.id,
            provider_slug: "meta-ads",
            external_campaign_id: cmp.id,
            campaign_name: cmp.name,
            status: cmp.status,
            objective: cmp.objective,
            daily_budget: cmp.dailyBudget,
            start_date: cmp.startTime ? cmp.startTime.split("T")[0] : null,
            end_date: cmp.stopTime ? cmp.stopTime.split("T")[0] : null,
            active: true,
          },
          { onConflict: "provider_slug,external_campaign_id" }
        );
      }
    }

    // 4. Buscar Conjuntos de Anúncios (Ad Sets) e Salvar em public.meta_ads_ad_sets
    const adSets = await metaAdsConnector.fetchAdSets(accessToken, cleanAccId);
    const insertedAdSetIds: Record<string, string> = {};

    for (const as of adSets) {
      const parentCmpId = insertedCampaignIds[as.campaignId] || Object.values(insertedCampaignIds)[0];
      if (parentCmpId) {
        const { data: savedAdSet } = await supabase
          .from("meta_ads_ad_sets")
          .upsert(
            {
              account_id: cleanAccId,
              campaign_id: parentCmpId,
              external_ad_set_id: as.id,
              ad_set_name: as.name,
              status: as.status,
              billing_event: as.billingEvent,
              bid_strategy: as.bidStrategy,
              active: true,
            },
            { onConflict: "external_ad_set_id" }
          )
          .select("id")
          .single();

        if (savedAdSet) {
          insertedAdSetIds[as.id] = savedAdSet.id;
        }
      }
    }

    // 5. Buscar Anúncios Individuais e Salvar em public.meta_ads_ads
    const ads = await metaAdsConnector.fetchAds(accessToken, cleanAccId);
    for (const ad of ads) {
      const parentCmpId = insertedCampaignIds[ad.campaignId] || Object.values(insertedCampaignIds)[0];
      const parentAdSetId = insertedAdSetIds[ad.adSetId] || Object.values(insertedAdSetIds)[0];

      if (parentCmpId && parentAdSetId) {
        await supabase.from("meta_ads_ads").upsert(
          {
            campaign_id: parentCmpId,
            ad_set_id: parentAdSetId,
            external_ad_id: ad.id,
            ad_name: ad.name,
            creative_id: ad.creativeId || null,
            thumbnail_url: ad.thumbnailUrl || null,
            status: ad.status,
            active: true,
          },
          { onConflict: "external_ad_id" }
        );
      }
    }

    // 6. Buscar métricas diárias dos últimos 30 dias via Connector
    const dailyInsights = await metaAdsConnector.fetchDailyInsights(
      accessToken,
      cleanAccId,
      isFullSync ? "maximum" : "last_30days"
    );

    let processedCount = 0;

    // 7. Salvar métricas em public.meta_ads_daily_metrics E em public.marketing_daily_metrics
    if (dailyInsights && dailyInsights.length > 0) {
      const metricRows = dailyInsights
        .filter((m) => insertedCampaignIds[m.campaignId])
        .map((m) => {
          const internalCmpId = insertedCampaignIds[m.campaignId];
          const roas = m.cost > 0 ? Number((m.revenue / m.cost).toFixed(2)) : 0;
          const cpa = m.conversions > 0 ? Number((m.cost / m.conversions).toFixed(2)) : 0;

          return {
            campaign_id: internalCmpId,
            metric_date: m.metricDate,
            impressions: m.impressions,
            clicks: m.clicks,
            ctr: m.ctr,
            cpc: m.cpc,
            cpm: m.cpm,
            cost: m.cost,
            conversions: m.conversions,
            revenue: m.revenue,
            roas,
            cpa,
            frequency: m.frequency,
            quality_ranking: "AVERAGE",
            active: true,
          };
        });

      if (metricRows.length > 0) {
        await supabase.from("meta_ads_daily_metrics").upsert(metricRows, {
          onConflict: "campaign_id,metric_date",
        });
        processedCount = metricRows.length;
      }
    }

    const durationMs = Date.now() - startTime;

    // 8. Gravar log de auditoria em public.meta_ads_sync_history
    await supabase.from("meta_ads_sync_history").insert({
      account_id: cleanAccId,
      started_at: new Date(startTime).toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: durationMs,
      records_processed: processedCount,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      campaignsSynced: campaigns.length,
      adSetsSynced: adSets.length,
      adsSynced: ads.length,
      metricsSynced: processedCount,
      durationMs,
    });
  } catch (error: any) {
    console.error("Erro na sincronização do Meta Ads:", error);
    return NextResponse.json(
      { error: error?.message || "Erro durante a sincronização com a Meta Marketing API." },
      { status: 500 }
    );
  }
}
