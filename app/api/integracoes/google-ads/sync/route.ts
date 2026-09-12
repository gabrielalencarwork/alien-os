import { NextRequest, NextResponse } from "next/server";
import { googleAdsConnector } from "@/lib/connectors/google/googleAdsConnector";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, customerId, descriptiveName, isFullSync, developerToken, loginCustomerId } = await req.json();

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
    const { error: custErr } = await supabase.from("google_ads_customers").upsert(
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

    if (custErr) {
      console.error("Erro no Supabase ao salvar google_ads_customers:", custErr);
      throw new Error(
        `Erro ao registrar conta no Supabase: ${custErr.message} (Código ${custErr.code}). Verifique as permissões de gravação da tabela no banco de dados.`
      );
    }

    // 2. Buscar campanhas via Connector (chamada real à API do Google)
    const campaigns = await googleAdsConnector.listCampaigns(accessToken, cleanCustomerId, developerToken, loginCustomerId);

    const insertedCampaignIds: Record<string, string> = {};

    // 3. Salvar campanhas em public.google_ads_campaigns
    for (const cmp of campaigns) {
      const { data: savedCmp, error: cmpErr } = await supabase
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

      if (cmpErr) {
        console.warn(`Aviso ao salvar campanha ${cmp.id}:`, cmpErr);
      }
      if (savedCmp) {
        insertedCampaignIds[cmp.id] = savedCmp.id;
      }
    }

    // 4. Mapear todas as campanhas no Supabase para garantir vínculos perfeitos
    const { data: dbCampaigns } = await supabase
      .from("google_ads_campaigns")
      .select("id, external_campaign_id")
      .eq("customer_id", cleanCustomerId);

    const campaignMap: Record<string, string> = { ...insertedCampaignIds };
    (dbCampaigns || []).forEach((c: any) => {
      const ext = String(c.external_campaign_id);
      campaignMap[ext] = c.id;
      campaignMap[ext.replace(/.*\//, "")] = c.id;
    });

    // 5. Buscar Grupos de Anúncios via Connector
    const adGroups = await googleAdsConnector.listAdGroups(accessToken, cleanCustomerId, developerToken, loginCustomerId);
    const insertedAdGroupIds: Record<string, string> = {};

    for (const ag of adGroups) {
      const agCmpId = String(ag.campaignId).replace(/.*\//, "");
      const parentCmpId = campaignMap[agCmpId] || campaignMap[String(ag.campaignId)];
      if (parentCmpId) {
        const { data: savedAg } = await supabase
          .from("google_ads_ad_groups")
          .upsert(
            {
              customer_id: cleanCustomerId,
              campaign_id: parentCmpId,
              external_ad_group_id: String(ag.id),
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
          insertedAdGroupIds[String(ag.id)] = savedAg.id;
        }
      }
    }

    // 6. Mapear todos os Grupos de Anúncios no Supabase
    const { data: dbAdGroups } = await supabase
      .from("google_ads_ad_groups")
      .select("id, external_ad_group_id")
      .eq("customer_id", cleanCustomerId);

    const adGroupMap: Record<string, string> = { ...insertedAdGroupIds };
    (dbAdGroups || []).forEach((ag: any) => {
      const ext = String(ag.external_ad_group_id);
      adGroupMap[ext] = ag.id;
      adGroupMap[ext.replace(/.*\//, "")] = ag.id;
    });

    // 7. Buscar Anúncios Individuais via Connector
    const ads = await googleAdsConnector.listAds(accessToken, cleanCustomerId, developerToken, loginCustomerId);
    for (const ad of ads) {
      const adCmpId = String(ad.campaignId).replace(/.*\//, "");
      const adAgId = String(ad.adGroupId).replace(/.*\//, "");
      const parentCmpId = campaignMap[adCmpId] || campaignMap[String(ad.campaignId)];
      const parentAgId = adGroupMap[adAgId] || adGroupMap[String(ad.adGroupId)];

      if (parentCmpId && parentAgId) {
        await supabase.from("google_ads_ads").upsert(
          {
            campaign_id: parentCmpId,
            ad_group_id: parentAgId,
            external_ad_id: String(ad.id),
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

    // 8. Buscar Palavras-Chave e Palavras Negativas via Connector
    let keywordsSyncedCount = 0;
    let negativeKeywordsSyncedCount = 0;
    try {
      const allKeywords = await googleAdsConnector.listKeywords(
        accessToken,
        cleanCustomerId,
        developerToken,
        loginCustomerId
      );

      if (allKeywords && allKeywords.length > 0) {
        const kwRows = allKeywords.map((k) => {
          const kCmpId = String(k.campaignId).replace(/.*\//, "");
          const kAgId = k.adGroupId ? String(k.adGroupId).replace(/.*\//, "") : "";
          const parentCmpId = campaignMap[kCmpId] || campaignMap[String(k.campaignId)] || null;
          const parentAgId = kAgId ? (adGroupMap[kAgId] || adGroupMap[String(k.adGroupId)] || null) : null;

          if (k.negative) negativeKeywordsSyncedCount++;
          else keywordsSyncedCount++;

          return {
            customer_id: cleanCustomerId,
            campaign_id: parentCmpId,
            ad_group_id: parentAgId,
            external_criterion_id: String(k.id),
            keyword_text: k.keywordText,
            match_type: k.matchType,
            status: k.status,
            negative: Boolean(k.negative),
            campaign_name: k.campaignName,
            ad_group_name: k.adGroupName,
            quality_score: k.qualityScore || 0,
            active: true,
          };
        });

        const { error: kwUpsertErr } = await supabase.from("google_ads_keywords").upsert(kwRows, {
          onConflict: "external_criterion_id",
        });

        if (kwUpsertErr) {
          console.warn("Aviso ao gravar palavras-chave no Supabase:", kwUpsertErr);
        }
      }
    } catch (kwErr) {
      console.warn("Aviso ao sincronizar palavras-chave:", kwErr);
    }

    // 9. Buscar métricas diárias via Connector
    let dailyMetrics: any[] = [];
    try {
      dailyMetrics = await googleAdsConnector.fetchDailyMetricsAdvanced(
        accessToken,
        cleanCustomerId,
        isFullSync ? "ALL_TIME" : "30daysAgo",
        "today",
        developerToken,
        loginCustomerId
      );
    } catch (metricErr: any) {
      console.error("Erro ao buscar métricas diárias no Google Ads:", metricErr);
      throw new Error(`Falha ao sincronizar métricas diárias: ${metricErr?.message || metricErr}`);
    }

    let processedCount = 0;

    // 10. Salvar métricas em public.google_ads_daily_metrics
    if (dailyMetrics && dailyMetrics.length > 0) {
      const metricRows = dailyMetrics
        .map((m) => {
          const internalCmpId = campaignMap[m.campaignId] || campaignMap[m.campaignId.replace(/.*\//, "")];
          if (!internalCmpId) return null;

          const rawRoas = m.cost > 0 ? Number((m.conversionValue / m.cost).toFixed(2)) : 0;
          const clampedRoas = Math.min(Math.max(rawRoas, 0), 999.99);
          const costPerConv = m.conversions > 0 ? Number((m.cost / m.conversions).toFixed(2)) : 0;
          const convInt = Math.round(Number(m.conversions) || 0);
          const allConvInt = Math.round(Number(m.allConversions || m.conversions) || 0);

          return {
            campaign_id: internalCmpId,
            metric_date: m.metricDate,
            impressions: Math.round(Number(m.impressions) || 0),
            clicks: Math.round(Number(m.clicks) || 0),
            ctr: Number((Number(m.ctr) || 0).toFixed(2)),
            average_cpc: Number((Number(m.averageCpc) || 0).toFixed(2)),
            cost: Number((Number(m.cost) || 0).toFixed(2)),
            cost_micros: Math.round(Number(m.costMicros) || 0),
            conversions: convInt,
            all_conversions: allConvInt,
            conversion_value: Number((Number(m.conversionValue) || 0).toFixed(2)),
            cost_per_conversion: Number(costPerConv.toFixed(2)),
            roas: clampedRoas,
            revenue: Number((Number(m.conversionValue) || 0).toFixed(2)),
            impression_share: 0,
            search_impression_share: 0,
            search_top_impression_share: 0,
            video_views: 0,
            view_through_conversions: 0,
            active: true,
          };
        })
        .filter(Boolean);

      if (metricRows.length > 0) {
        const { error: metricUpsertErr } = await supabase.from("google_ads_daily_metrics").upsert(metricRows, {
          onConflict: "campaign_id,metric_date",
        });

        if (metricUpsertErr) {
          console.error("Erro ao salvar métricas no Supabase:", metricUpsertErr);
          throw new Error(`Erro ao gravar métricas diárias no Supabase: ${metricUpsertErr.message}`);
        }

        processedCount = metricRows.length;
      }
    }

    const durationMs = Date.now() - startTime;

    // 11. Gravar log de auditoria
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
      customerName: descriptiveName || `Conta Google Ads ${cleanCustomerId}`,
      customerId: cleanCustomerId,
      campaignsSynced: campaigns.length,
      adGroupsSynced: adGroups.length,
      adsSynced: ads.length,
      keywordsSynced: keywordsSyncedCount,
      negativeKeywordsSynced: negativeKeywordsSyncedCount,
      metricsSynced: processedCount,
      durationMs,
    });
  } catch (error: any) {
    console.error("Erro na sincronização hierárquica do Google Ads:", error);

    const rawMessage: string = error?.message || "Erro desconhecido durante a sincronização.";
    let userMessage = rawMessage;
    let specificTip = "Após corrigir o problema, clique em 'Selecionar & Sincronizar' novamente.";

    const upper = rawMessage.toUpperCase();

    if (
      upper.includes("DEVELOPER_TOKEN_PROHIBITED") ||
      upper.includes("DEVELOPER_TOKEN_INVALID") ||
      (upper.includes("DEVELOPER TOKEN") && (upper.includes("INVALID") || upper.includes("PROHIBITED")))
    ) {
      userMessage =
        "Developer Token inválido. Verifique se o Developer Token inserido é a chave alfanumérica correta da Google Ads API (ex: lCp4Ljie_X-CaVW-O-CrWQ) e não o nome do cliente.";
      specificTip = "Insira o Developer Token oficial no campo de configurações da API e tente novamente.";
    } else if (upper.includes("DEVELOPER_TOKEN_NOT_APPROVED") || upper.includes("TEST ACCOUNTS")) {
      userMessage =
        "Developer Token sem 'Basic Access' (está em modo Test Access). Com acesso de teste, a Google Ads API só permite conectar contas de teste. Para contas reais em produção, solicite o Acesso Básico no Centro de API do seu Google Ads MCC.";
      specificTip = "Acesse seu Google Ads MCC > Ferramentas > Centro de API do Google Ads e solicite o Basic Access (aprovação em 1-3 dias úteis).";
    } else if (upper.includes("CANNOT_EXECUTE_QUERY_ON_MANAGER_ACCOUNT") || upper.includes("MANAGER_ACCOUNT")) {
      userMessage =
        "A conta selecionada é uma Conta de Administrador (MCC). Contas gestoras não possuem campanhas próprias. Selecione uma conta de anúncios vinculada para sincronizar.";
      specificTip = "No seletor de contas, escolha uma conta de anúncios (não gestora/MCC).";
    } else if (upper.includes("USER_PERMISSION_DENIED") || upper.includes("PERMISSION_DENIED")) {
      if (upper.includes("MANAGER") || upper.includes("LOGIN-CUSTOMER-ID")) {
        userMessage =
          "Permissão negada através da conta gestora (MCC). A conta Google conectada não tem acesso para consultar esta conta através do MCC informado.";
        specificTip = "Se esta for uma conta direta, deixe o campo MCC em branco para autenticar diretamente.";
      } else {
        userMessage =
          "Permissão negada pela Google Ads API. A conta Google conectada não possui nível de acesso suficiente (necessário Administrador ou Padrão) na conta selecionada.";
        specificTip = "Verifique os usuários da conta no painel do Google Ads (Ferramentas > Acesso e segurança).";
      }
    } else if (upper.includes("OAUTH_TOKEN_INVALID") || upper.includes("INVALID_GRANT") || upper.includes("UNAUTHENTICATED")) {
      userMessage =
        "Token OAuth expirado ou inválido. Desconecte e reconecte sua conta Google no Alien OS.";
      specificTip = "Clique em 'Conectar Conta Google Ads (OAuth 2.0)' no topo da tela para renovar o acesso.";
    } else if (upper.includes("CUSTOMER_NOT_ENABLED")) {
      userMessage =
        `A conta de anúncios selecionada (${cleanCustomerId}) está desativada ou cancelada no Google Ads.`;
      specificTip =
        "No painel do Google Ads (ads.google.com), acesse Administrador > Preferências > Status da conta e clique em 'Reativar minha conta', ou selecione uma das outras contas ativas no seletor acima.";
    } else if (upper.includes("CUSTOMER_NOT_FOUND")) {
      userMessage =
        "Customer ID não encontrado. Verifique o ID da conta e se ela pertence ao usuário conectado.";
      specificTip = "Confira se o ID possui 10 dígitos numéricos.";
    }

    return NextResponse.json(
      {
        error: userMessage,
        rawGoogleError: rawMessage,
        errorCode: rawMessage.match(/[A-Z_]{5,}/)?.[0] || "SYNC_ERROR",
        tip: specificTip,
      },
      { status: 500 }
    );
  }
}
