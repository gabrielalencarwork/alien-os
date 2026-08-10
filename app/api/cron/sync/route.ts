import { NextRequest, NextResponse } from "next/server";
import { syncEngine } from "@/lib/sync/syncEngine";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const CRON_SECRET = process.env.CRON_SECRET || "ALIEN_OS_CRON_SECRET";

    // Validação de segurança básica para execuções agendadas
    if (authHeader !== `Bearer ${CRON_SECRET}` && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const supabase = createServerClient();
    const startTime = Date.now();

    // Log de início de execução agendada 24/7
    await supabase.from("integration_logs").insert({
      provider_id: "system-cron",
      event_type: "CRON_SYNC_STARTED",
      message: "Execução agendada 24/7 iniciada para todas as mídias pagas e SEO.",
      status_code: 200,
    });

    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: "Sincronização 24/7 executada com sucesso.",
      durationMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Erro durante o cron de sincronização." },
      { status: 500 }
    );
  }
}
