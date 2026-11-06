import { NextRequest, NextResponse } from "next/server";
import { runAlienMaxSweep } from "@/lib/alienMax/sweep";
import { generateWeeklyReports, lastCompleteWeekEnd } from "@/lib/reports/weeklyReport";
import { sendReportEmails } from "@/lib/reports/delivery";
import { getUniversalClient } from "@/lib/supabase/universal";

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
    // Envio por e-mail dos relatórios/lembretes da semana para quem ainda não recebeu
    // (na segunda sai para todos; e-mail cadastrado na segunda sai na terça).
    // Só até terça: depois disso o relatório já está velho e o envio fica no botão da tela Relatórios.
    let emails: unknown = null;
    try {
      const weekEnd = lastCompleteWeekEnd();
      const daysAfter = Math.floor((Date.now() - new Date(`${weekEnd}T23:59:00-03:00`).getTime()) / 86_400_000);
      const weekStart = new Date(`${weekEnd}T12:00:00Z`);
      weekStart.setUTCDate(weekStart.getUTCDate() - 6);
      emails =
        daysAfter <= 1
          ? await sendReportEmails(getUniversalClient(), { weekStart: weekStart.toISOString().slice(0, 10), onlyUnsent: true })
          : { skipped: "Envio automático só na segunda e na terça." };
    } catch (err) {
      emails = { error: err instanceof Error ? err.message : String(err) };
    }
    return NextResponse.json({ ...result, reports, emails }, { status: result.status === "error" ? 500 : 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
