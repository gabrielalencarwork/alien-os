import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnóstico da conexão do WhatsApp com a Meta (só para a equipe logada).
 * GET  → mostra o número, se o app está inscrito na conta do WhatsApp (WABA) e os campos do webhook.
 * POST → corrige: inscreve o app na WABA e assina o campo "messages" do webhook.
 * Usa: WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN e o app do WhatsApp
 * (WHATSAPP_APP_ID + WHATSAPP_APP_SECRET; sem eles, cai no app Alien OS: META_APP_ID + META_APP_SECRET).
 * WABA: ?waba=<id> ou WHATSAPP_BUSINESS_ACCOUNT_ID.
 */

const GRAPH = "https://graph.facebook.com/v21.0";
const APP_ID = process.env.WHATSAPP_APP_SECRET
  ? process.env.WHATSAPP_APP_ID || "1119068657434626"
  : process.env.META_APP_ID || "962619026128533";
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || "";
// messages = conversas; smb_message_echoes = o que a equipe responde pelo app do WhatsApp Business (coexistência).
const FIELDS = "messages,smb_message_echoes";
const CALLBACK = `${(process.env.NEXT_PUBLIC_APP_URL || "https://os.alienmkt.com.br").replace(/\/$/, "")}/api/webhooks/whatsapp`;

async function graph(path: string, token: string, init?: RequestInit) {
  const sep = path.includes("?") ? "&" : "?";
  const res = await fetch(`${GRAPH}/${path}${sep}access_token=${encodeURIComponent(token)}`, init);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && !data.error, status: res.status, data };
}

function cfg(req: NextRequest) {
  return {
    token: process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN || "",
    phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    waba: req.nextUrl.searchParams.get("waba") || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    appToken: APP_SECRET ? `${APP_ID}|${APP_SECRET}` : "",
  };
}

const short = (r: { ok: boolean; status: number; data: unknown }) =>
  r.ok ? r.data : { erro: (r.data as { error?: { message?: string } })?.error?.message || `HTTP ${r.status}` };

export async function GET(req: NextRequest) {
  const c = cfg(req);
  const out: Record<string, unknown> = {
    app: APP_ID,
    segredos_configurados: {
      WHATSAPP_APP_SECRET: !!process.env.WHATSAPP_APP_SECRET,
      META_APP_SECRET: !!process.env.META_APP_SECRET,
    },
    callback: CALLBACK,
  };
  if (c.token && c.appToken) {
    // De qual app é o token do WhatsApp, permissões e validade (nunca devolve o token).
    const dbg = await graph(`debug_token?input_token=${encodeURIComponent(c.token)}`, c.appToken);
    const d = (dbg.data as { data?: { app_id?: string; is_valid?: boolean; scopes?: string[]; expires_at?: number; type?: string } }).data;
    out.token_whatsapp = dbg.ok && d
      ? { app_do_token: d.app_id, valido: d.is_valid, tipo: d.type, permissoes: d.scopes, expira: d.expires_at ? new Date(d.expires_at * 1000).toISOString() : "nunca" }
      : short(dbg);
  }
  if (c.phoneId && c.token) out.numero = short(await graph(`${c.phoneId}?fields=display_phone_number,verified_name,quality_rating,code_verification_status`, c.token));
  if (c.waba && c.token) out.waba_apps_inscritos = short(await graph(`${c.waba}/subscribed_apps`, c.token));
  else out.waba_apps_inscritos = "Informe ?waba=<id da conta do WhatsApp>";
  if (c.appToken) out.webhook_do_app = short(await graph(`${APP_ID}/subscriptions`, c.appToken));
  else out.webhook_do_app = "Falta WHATSAPP_APP_SECRET (ou META_APP_SECRET)";
  return NextResponse.json(out);
}

export async function POST(req: NextRequest) {
  const c = cfg(req);
  const out: Record<string, unknown> = { app: APP_ID };
  if (c.waba && c.token) {
    out.inscrever_app_na_waba = short(await graph(`${c.waba}/subscribed_apps`, c.token, { method: "POST" }));
  } else out.inscrever_app_na_waba = "Falta o id da WABA (?waba=) ou o token.";
  if (c.appToken && process.env.WHATSAPP_VERIFY_TOKEN) {
    const body = new URLSearchParams({
      object: "whatsapp_business_account",
      callback_url: CALLBACK,
      verify_token: process.env.WHATSAPP_VERIFY_TOKEN,
      fields: FIELDS,
      include_values: "true",
    });
    out.assinar_campos = short(
      await graph(`${APP_ID}/subscriptions`, c.appToken, { method: "POST", body, headers: { "Content-Type": "application/x-www-form-urlencoded" } })
    );
  } else out.assinar_campos = "Falta WHATSAPP_APP_SECRET (ou META_APP_SECRET) ou WHATSAPP_VERIFY_TOKEN.";
  return NextResponse.json(out);
}
