import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { emailConfigured, sendTestEmail } from "@/lib/reports/delivery";

export const dynamic = "force-dynamic";

/** Envia um relatório de teste só para a Alien (REPORTS_REPLY_TO). body: { reportId? } */
export async function POST(req: NextRequest) {
  if (!emailConfigured()) return NextResponse.json({ error: "E-mail não configurado: falta RESEND_API_KEY no Vercel." }, { status: 503 });
  const body = (await req.json().catch(() => ({}))) as { reportId?: string };
  try {
    return NextResponse.json(await sendTestEmail(getUniversalClient(), body.reportId));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 502 });
  }
}
