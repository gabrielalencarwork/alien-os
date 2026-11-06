import { NextRequest, NextResponse } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { decide, getSettings, buildContextNote, type ChatLine } from "@/lib/whatsapp/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Teste do agente sem WhatsApp: recebe uma conversa e devolve o que o agente responderia.
 * Usa a base de conhecimento salva (ou a enviada no corpo, para testar antes de salvar). Não envia nada.
 * body: { history: [{ author: 'Cliente'|'Agente', text }], knowledge?, instructions?, isClient? }
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { history?: ChatLine[]; knowledge?: string; instructions?: string; isClient?: string };
  const history = (body.history || []).filter((h) => h && h.text).slice(-40);
  if (!history.length) return NextResponse.json({ error: "Escreva uma mensagem de cliente para testar." }, { status: 400 });
  try {
    const saved = await getSettings(getUniversalClient());
    const settings = { knowledge: body.knowledge ?? saved.knowledge, instructions: body.instructions ?? saved.instructions };
    const context = buildContextNote({ nome: "Contato de teste", telefone: "teste", cliente: body.isClient || null });
    return NextResponse.json(await decide(settings, context, history));
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
