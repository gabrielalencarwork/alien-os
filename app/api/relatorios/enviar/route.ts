import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { sendReportEmails } from "@/lib/reports/delivery";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** Envia (ou reenvia) por e-mail um relatório. body: { reportId } */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { reportId?: string };
  if (!body.reportId) return NextResponse.json({ error: "Informe o relatório." }, { status: 400 });
  const out = await sendReportEmails(getUniversalClient(), { reportIds: [body.reportId], onlyUnsent: false, notifyOwner: false });
  if (out.error) return NextResponse.json({ error: out.error }, { status: out.configured ? 500 : 503 });
  const r = out.results[0];
  if (!r) return NextResponse.json({ error: "Relatório não encontrado." }, { status: 404 });
  if (r.status === "sem_email") return NextResponse.json({ error: `${r.client} não tem e-mail cadastrado. Preencha em Clientes → Editar dados.` }, { status: 400 });
  if (r.status === "erro") return NextResponse.json({ error: r.error }, { status: 502 });
  return NextResponse.json(r);
}
