import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "ALIEN_OS_META_WEBHOOK_TOKEN";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Token de verificação inválido." }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServerClient();

    await supabase.from("integration_logs").insert({
      provider_id: "meta-ads",
      event_type: "WEBHOOK_EVENT_RECEIVED",
      message: `Evento de Webhook Meta recebido com sucesso.`,
      status_code: 200,
    });

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro no Webhook Meta." }, { status: 500 });
  }
}
