import { NextRequest, NextResponse } from "next/server";
import { runAlienMaxSweep } from "@/lib/alienMax/sweep";
import { generateWeeklyReports } from "@/lib/reports/weeklyReport";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Agendamento diário (vercel.json → crons). O Vercel envia
 * "Authorization: Bearer <CRON_SECRET>" quando a variável CRON_SECRET está configurada no projeto.
 * Sem CRON_SECRET a rota recusa a chamada — nunca roda aberta.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET não está configurada no Vercel. A varredura automática está desligada." },
      { status: 503 }
    );
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    const result = await runAlienMaxSweep({ trigger: "cron", sync: true });
    // Relatório semanal: gera para quem ainda não tem o da última semana encerrada
    // (na segunda gera todos; nos outros dias só cobre o que tiver faltado).
    let reports: unknown = null;
    try {
      reports = await generateWeeklyReports({ onlyMissing: true });
    } catch (err) {
      reports = { error: err instanceof Error ? err.message : String(err) };
    }
    return NextResponse.json({ ...result, reports }, { status: result.status === "error" ? 500 : 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
