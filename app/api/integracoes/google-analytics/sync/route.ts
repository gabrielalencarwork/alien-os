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

    // 2. Salvar/Atualizar a propriedade em public.ga4_properties (colunas: property_id, display_name, account_name, last_synced_at, active)
    const { error: propError } = await supabase.from("ga4_properties").upsert(
      {
        property_id: cleanPropertyId,
        display_name: propertyName || `Propriedade GA4 ${cleanPropertyId}`,
        account_name: accountEmail || "alientrafego@gmail.com",
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

    // 4. Salvar métricas no Supabase em public.ga4_daily_metrics (colunas: property_id, metric_date, active_users, new_users, sessions, screen_page_views, conversions, total_revenue)
    if (rows && rows.length > 0) {
      const dbRows = rows.map((r) => ({
        property_id: cleanPropertyId,
        metric_date: r.date,
        active_users: r.activeUsers,
        new_users: r.newUsers,
        sessions: r.sessions,
        screen_page_views: r.screenPageViews,
        conversions: r.conversions,
        total_revenue: r.totalRevenue,
      }));

      const { error: metricsError } = await supabase.from("ga4_daily_metrics").upsert(dbRows, {
        onConflict: "property_id,metric_date",
      });

      if (metricsError) {
        console.error("Aviso ao salvar métricas diárias no Supabase:", metricsError);
      }
    }

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
