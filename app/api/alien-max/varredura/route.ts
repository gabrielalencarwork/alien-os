import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { runAlienMaxSweep } from "@/lib/alienMax/sweep";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const AUTO_INTERVAL_HOURS = 6;

/**
 * Roda a varredura da Alien Max sob demanda.
 * body.trigger = "manual" (botão "Analisar agora") ou "auto" (ao abrir a Central do Dia,
 * só roda se a última varredura tiver mais de 6 horas).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { trigger?: string };
  const trigger = body.trigger === "auto" ? "auto" : "manual";

  const supabase = getUniversalClient();
  const { data: last, error } = await supabase
    .from("alien_max_runs")
    .select("status, started_at")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        error: `Não foi possível ler o histórico de varreduras: ${error.message}. Rode supabase/migrations/20261025000035_central_do_dia.sql no Supabase.`,
      },
      { status: 500 }
    );
  }

  if (last) {
    const ageMin = (Date.now() - new Date(last.started_at).getTime()) / 60000;
    if (last.status === "running" && ageMin < 10) {
      return NextResponse.json({ skipped: true, reason: "Já existe uma varredura em andamento." });
    }
    if (trigger === "auto" && ageMin < AUTO_INTERVAL_HOURS * 60) {
      return NextResponse.json({ skipped: true, reason: "Última varredura ainda recente." });
    }
  }

  try {
    const result = await runAlienMaxSweep({ trigger, sync: true });
    return NextResponse.json(result, { status: result.status === "error" ? 500 : 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
