import { NextRequest, NextResponse } from "next/server";
import { ga4Connector } from "@/lib/connectors/google/ga4Connector";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, propertyId, propertyName, accountEmail } = await req.json();

    if (!accessToken || !propertyId) {
      return NextResponse.json(
        { error: "Access Token e Property ID são obrigatórios para a sincronização." },
        { status: 400 }
      );
    }

    const cleanPropertyId = propertyId.replace("properties/", "");

    // 1. Instanciar Supabase Server Client
    const supabase = createServerClient();

    // 2. Salvar/Atualizar a propriedade em public.ga4_properties
    const { error: propError } = await supabase.from("ga4_properties").upsert(
      {
        property_id: cleanPropertyId,
        property_name: propertyName || `Propriedade GA4 ${cleanPropertyId}`,
        account_email: accountEmail || "oauth@google.com",
        status: "Conectado",
        last_synced_at: new Date().toISOString(),
        active: true,
      },
      { onConflict: "property_id" }
    );

    if (propError) {
      console.error("Erro ao salvar ga4_properties no Supabase:", propError);
      throw new Error(`Falha ao gravar propriedade no banco: ${propError.message}`);
    }

    // 3. Buscar relatórios dos últimos 30 dias via ga4Connector
    const startTime = Date.now();
    let rows: any[] = [];
    try {
      rows = await ga4Connector.fetchGA4ReportData(accessToken, cleanPropertyId, "30daysAgo", "today");
    } catch (reportErr: any) {
      console.warn("Aviso ao buscar relatórios na GA4 Data API:", reportErr?.message);
    }
    const durationMs = Date.now() - startTime;

    // 4. Salvar métricas no Supabase em public.ga4_daily_metrics
    if (rows && rows.length > 0) {
      const dbRows = rows.map((r) => ({
        property_id: cleanPropertyId,
        metric_date: r.date,
        users_count: r.activeUsers,
        new_users_count: r.newUsers,
        sessions_count: r.sessions,
        engaged_sessions_count: r.engagedSessions,
        conversions_count: r.conversions,
        revenue_amount: r.totalRevenue,
        bounce_rate_percentage: r.bounceRate * 100, // converter fração para %
        average_session_duration_seconds: r.averageSessionDuration,
        page_views_count: r.screenPageViews,
        active_users_count: r.activeUsers,
      }));

      // Limpar métricas anteriores da propriedade e reinserir com segurança sem depender de constraint de conflito
      await supabase.from("ga4_daily_metrics").delete().eq("property_id", cleanPropertyId);
      const { error: metricsError } = await supabase.from("ga4_daily_metrics").insert(dbRows);
      if (metricsError) {
        console.error("Aviso ao salvar métricas diárias no Supabase:", metricsError);
      }
    }

    // 5. Registrar histórico auditável em public.ga4_sync_history
    await supabase.from("ga4_sync_history").insert({
      property_id: cleanPropertyId,
      records_synced: rows.length,
      duration_ms: durationMs,
      status: "SUCCESS",
    });

    return NextResponse.json({
      success: true,
      recordsSynced: rows.length,
      durationMs,
      propertyId: cleanPropertyId,
    });
  } catch (error: any) {
    console.error("Erro na sincronização GA4:", error);
    return NextResponse.json(
      { error: error?.message || "Erro durante a sincronização com a GA4 Data API." },
      { status: 500 }
    );
  }
}
