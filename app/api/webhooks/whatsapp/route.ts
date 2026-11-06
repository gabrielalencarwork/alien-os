import { NextRequest, NextResponse, after } from "next/server";
import crypto from "crypto";
import { getUniversalClient } from "@/lib/supabase/universal";
import { processWebhook, type WebhookPayload } from "@/lib/whatsapp/inbound";
import { runAgent, markReadAndTyping, getSettings } from "@/lib/whatsapp/agent";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Webhook da WhatsApp Cloud API.
 * GET  → verificação da Meta (WHATSAPP_VERIFY_TOKEN).
 * POST → eventos assinados com o segredo do app (META_APP_SECRET, cabeçalho X-Hub-Signature-256).
 * Responde 200 na hora e roda o agente depois (after), como a Meta exige.
 */
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  if (!expected) return NextResponse.json({ error: "WHATSAPP_VERIFY_TOKEN não configurado no Vercel." }, { status: 503 });
  if (p.get("hub.mode") === "subscribe" && p.get("hub.verify_token") === expected) {
    return new NextResponse(p.get("hub.challenge") || "", { status: 200 });
  }
  return NextResponse.json({ error: "Token de verificação inválido." }, { status: 403 });
}

function validSignature(raw: string, header: string | null) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex");
  const got = header.slice(7);
  return got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!process.env.META_APP_SECRET) {
    console.error("[whatsapp] META_APP_SECRET não configurado: webhook recusado.");
    return NextResponse.json({ error: "META_APP_SECRET não configurado no Vercel." }, { status: 503 });
  }
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const supabase = getUniversalClient();
  let triggers: Awaited<ReturnType<typeof processWebhook>> = [];
  try {
    triggers = await processWebhook(supabase, payload);
  } catch (err) {
    console.error("[whatsapp] erro ao gravar webhook:", err);
    // 500 faz a Meta reenviar depois.
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }

  if (triggers.length) {
    after(async () => {
      const settings = await getSettings(supabase).catch(() => null);
      // Uma execução por contato (a última mensagem), contatos em paralelo.
      const last = new Map(triggers.map((t) => [t.contactId, t]));
      await Promise.all(
        [...last.values()].map(async (t) => {
          if (settings?.enabled) await markReadAndTyping(t.waMessageId);
          try {
            await runAgent(supabase, t.contactId, t.messageId);
          } catch (err) {
            console.error("[whatsapp] erro do agente:", err);
            await supabase
              .from("wa_contacts")
              .update({ needs_human: true, human_reason: `Erro do agente: ${err instanceof Error ? err.message : String(err)}` })
              .eq("id", t.contactId);
          }
        })
      );
    });
  }
  return NextResponse.json({ received: true });
}
