import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { notifyTeam } from "@/lib/reports/delivery";
import { APP_URL } from "@/lib/reports/messages";
import { localDay } from "@/lib/repositories/prospeccaoRepository";
import { addDays, todayLocal } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Lembrete diário (seg a sex, 07:30 em Brasília): manda um e-mail com quantas mensagens de prospecção
 * estão para enviar hoje e quantos follow-ups venceram. Mesma autenticação do cron de sincronização.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET não está configurada no Vercel. O lembrete de prospecção está desligado." }, { status: 503 });
  }
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = getUniversalClient();
  const { data, error } = await supabase
    .from("prospects")
    .select("scheduled_date, outreach_status, outreach_at")
    .eq("active", true)
    .not("batch", "is", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const today = todayLocal();
  const limit = addDays(today, -3);
  const rows = data || [];
  const toSend = rows.filter((r) => r.outreach_status === "Não abordado" && r.scheduled_date && r.scheduled_date <= today).length;
  const followups = rows.filter((r) => r.outreach_status === "Mensagem enviada" && r.outreach_at && localDay(r.outreach_at) <= limit).length;
  const replied = rows.filter((r) => r.outreach_status === "Respondeu").length;

  if (!toSend && !followups && !replied) {
    return NextResponse.json({ sent: false, reason: "Nada pendente hoje." });
  }

  const lines = [
    toSend ? `${toSend} ${toSend === 1 ? "mensagem para enviar" : "mensagens para enviar"} hoje` : "",
    followups ? `${followups} ${followups === 1 ? "follow-up vencido" : "follow-ups vencidos"} (sem resposta há 3 dias ou mais)` : "",
    replied ? `${replied} ${replied === 1 ? "lead respondeu" : "leads responderam"} e ${replied === 1 ? "espera" : "esperam"} classificação` : "",
  ].filter(Boolean);

  const sent = await notifyTeam("Prospecção de hoje", `Bom dia, Gabriel.\n\n${lines.join("\n")}`, `${APP_URL}/prospeccao`);
  return NextResponse.json({ sent, toSend, followups, replied });
}
