import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { sendText } from "@/lib/whatsapp/cloudApi";
import { insideServiceWindow } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

/** Aprovar (enviar, com edição opcional) ou descartar um rascunho do agente. body: { messageId, action: 'aprovar'|'descartar', text? } */
export async function POST(req: NextRequest) {
  const { messageId, action, text } = (await req.json().catch(() => ({}))) as { messageId?: string; action?: string; text?: string };
  if (!messageId || (action !== "aprovar" && action !== "descartar")) {
    return NextResponse.json({ error: "Informe o rascunho e a ação." }, { status: 400 });
  }
  const supabase = getUniversalClient();
  const { data: msg } = await supabase
    .from("wa_messages")
    .select("id, body, status, contact_id, wa_contacts(wa_id, last_inbound_at)")
    .eq("id", messageId)
    .maybeSingle();
  if (!msg || msg.status !== "Rascunho") return NextResponse.json({ error: "Rascunho não encontrado (talvez já tenha sido enviado)." }, { status: 404 });

  if (action === "descartar") {
    await supabase.from("wa_messages").update({ status: "Descartada" }).eq("id", messageId);
    return NextResponse.json({ ok: true });
  }

  const contact = msg.wa_contacts as unknown as { wa_id: string; last_inbound_at: string | null } | null;
  if (!contact) return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  if (!insideServiceWindow(contact.last_inbound_at)) {
    return NextResponse.json({ error: "Passaram mais de 24h desde a última mensagem do contato; a Meta não deixa enviar texto livre." }, { status: 409 });
  }
  const body = (text ?? msg.body).trim();
  if (!body) return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
  await supabase.from("wa_messages").update({ body, status: "Enviando" }).eq("id", messageId);
  try {
    const waId = await sendText(contact.wa_id, body);
    await supabase.from("wa_messages").update({ wa_message_id: waId, status: "Enviada", sent_at: new Date().toISOString() }).eq("id", messageId);
    await supabase.from("wa_contacts").update({ last_message_at: new Date().toISOString() }).eq("id", msg.contact_id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase.from("wa_messages").update({ status: "Rascunho", error: message }).eq("id", messageId);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
