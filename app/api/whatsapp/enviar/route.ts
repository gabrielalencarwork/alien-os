import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { sendText } from "@/lib/whatsapp/cloudApi";
import { insideServiceWindow } from "@/lib/whatsapp/types";

export const dynamic = "force-dynamic";

/** A equipe envia uma mensagem pelo Alien OS. Pausa o agente nesse contato. body: { contactId, text } */
export async function POST(req: NextRequest) {
  const { contactId, text } = (await req.json().catch(() => ({}))) as { contactId?: string; text?: string };
  const body = (text || "").trim();
  if (!contactId || !body) return NextResponse.json({ error: "Informe o contato e a mensagem." }, { status: 400 });

  const supabase = getUniversalClient();
  const { data: contact } = await supabase.from("wa_contacts").select("id, wa_id, last_inbound_at").eq("id", contactId).maybeSingle();
  if (!contact) return NextResponse.json({ error: "Contato não encontrado." }, { status: 404 });
  if (!insideServiceWindow(contact.last_inbound_at)) {
    return NextResponse.json(
      { error: "Passaram mais de 24h desde a última mensagem do contato. Pela regra da Meta, só dá para enviar um modelo aprovado (em breve no Alien OS)." },
      { status: 409 }
    );
  }
  const { data: settings } = await supabase.from("agent_settings").select("pause_minutes").eq("id", 1).maybeSingle();
  const { data: msg, error } = await supabase
    .from("wa_messages")
    .insert({ contact_id: contactId, direction: "Saída", author: "Equipe", type: "text", body, status: "Enviando" })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try {
    const waId = await sendText(contact.wa_id, body);
    const now = new Date();
    await supabase.from("wa_messages").update({ wa_message_id: waId, status: "Enviada", sent_at: now.toISOString() }).eq("id", msg.id);
    await supabase
      .from("wa_contacts")
      .update({
        last_message_at: now.toISOString(),
        agent_paused_until: new Date(now.getTime() + Number(settings?.pause_minutes ?? 120) * 60000).toISOString(),
      })
      .eq("id", contactId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase.from("wa_messages").update({ status: "Falhou", error: message }).eq("id", msg.id);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
