import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = createServerClient();

    await supabase.from("integration_logs").insert({
      provider_id: "google-ads",
      event_type: "WEBHOOK_EVENT_RECEIVED",
      message: `Notificação em tempo real do Google recebida com sucesso.`,
      status_code: 200,
    });

    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Erro no Webhook Google." }, { status: 500 });
  }
}
