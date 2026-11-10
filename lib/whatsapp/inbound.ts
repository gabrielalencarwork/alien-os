/**
 * Processa os webhooks da WhatsApp Cloud API. Só no servidor.
 * - messages ............ mensagens dos clientes
 * - statuses ............ enviada / entregue / lida / falhou das nossas mensagens
 * - smb_message_echoes .. (coexistência) mensagens que a equipe mandou pelo app do celular
 */

import type { SupabaseClient } from "@supabase/supabase-js";

type WaMsg = {
  id: string;
  from: string;
  to?: string;
  timestamp?: string;
  type: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
  image?: { caption?: string };
  video?: { caption?: string };
  document?: { caption?: string; filename?: string };
  location?: { name?: string; address?: string; latitude?: number; longitude?: number };
  contacts?: { name?: { formatted_name?: string } }[];
  referral?: { headline?: string; body?: string; source_url?: string; source_type?: string };
};
type WaStatus = { id: string; status: string; recipient_id?: string; errors?: { title?: string; message?: string; error_data?: { details?: string } }[] };
type ChangeValue = {
  metadata?: { phone_number_id?: string; display_phone_number?: string };
  contacts?: { wa_id: string; profile?: { name?: string } }[];
  messages?: WaMsg[];
  statuses?: WaStatus[];
  message_echoes?: WaMsg[];
};
export type WebhookPayload = { object?: string; entry?: { changes?: { field?: string; value?: ChangeValue }[] }[] };

function bodyOf(m: WaMsg): string {
  switch (m.type) {
    case "text":
      return m.text?.body || "";
    case "button":
      return m.button?.text || "";
    case "interactive":
      return m.interactive?.button_reply?.title || m.interactive?.list_reply?.title || "";
    case "image":
      return m.image?.caption ? `[imagem] ${m.image.caption}` : "[imagem]";
    case "video":
      return m.video?.caption ? `[vídeo] ${m.video.caption}` : "[vídeo]";
    case "audio":
      return "[áudio]";
    case "document":
      return `[arquivo${m.document?.filename ? `: ${m.document.filename}` : ""}]${m.document?.caption ? ` ${m.document.caption}` : ""}`;
    case "location":
      return `[localização] ${[m.location?.name, m.location?.address].filter(Boolean).join(" - ")}`;
    case "contacts":
      return `[contato] ${m.contacts?.[0]?.name?.formatted_name || ""}`;
    case "sticker":
      return "[figurinha]";
    default:
      return `[${m.type}]`;
  }
}

/** Celulares brasileiros: o WhatsApp às vezes entrega sem o 9 extra. Compara DDD + últimos 8 dígitos. */
function phoneKey(d: string) {
  const digits = d.replace(/\D/g, "").replace(/^0+/, "");
  const local = digits.startsWith("55") ? digits.slice(2) : digits;
  return local.length >= 10 ? `${local.slice(0, 2)}${local.slice(-8)}` : local;
}

async function findCompanyByPhone(supabase: SupabaseClient, waId: string) {
  const { data } = await supabase.from("companies").select("id, phone").not("phone", "is", null);
  const key = phoneKey(waId);
  return (data || []).find((c) => c.phone && phoneKey(String(c.phone)) === key)?.id || null;
}

/** Liga o contato ao alvo da lista de prospecção que tem o mesmo telefone (se houver). */
async function linkProspect(supabase: SupabaseClient, contactId: string, waId: string) {
  const { data } = await supabase.from("prospects").select("id, phone").eq("active", true).not("batch", "is", null).not("phone", "is", null);
  const key = phoneKey(waId);
  const hit = (data || []).find((p) => p.phone && phoneKey(String(p.phone)) === key);
  if (!hit) return null;
  await supabase.from("wa_contacts").update({ prospect_id: hit.id }).eq("id", contactId);
  return hit.id as string;
}

/**
 * Acompanha a prospecção ativa sozinho: mensagem do Gabriel pelo app = "Mensagem enviada";
 * resposta do lead = "Respondeu". Só avança, nunca volta um status que já andou.
 */
async function advanceProspect(supabase: SupabaseClient, contactId: string, waId: string, kind: "echo" | "reply") {
  const { data: c } = await supabase.from("wa_contacts").select("prospect_id").eq("id", contactId).maybeSingle();
  const prospectId = (c?.prospect_id as string | null) || (await linkProspect(supabase, contactId, waId));
  if (!prospectId) return;
  const { data: p } = await supabase.from("prospects").select("outreach_status, outreach_at, batch").eq("id", prospectId).maybeSingle();
  if (!p?.batch) return;
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {};
  if (kind === "echo" && p.outreach_status === "Não abordado") {
    patch.outreach_status = "Mensagem enviada";
    patch.stage = "Contato feito";
  }
  if (kind === "reply" && (p.outreach_status === "Não abordado" || p.outreach_status === "Mensagem enviada")) {
    patch.outreach_status = "Respondeu";
    patch.stage = "Contato feito";
  }
  if (!Object.keys(patch).length) return;
  if (!p.outreach_at) patch.outreach_at = now;
  patch.updated_at = now;
  await supabase.from("prospects").update(patch).eq("id", prospectId);
}

async function upsertContact(supabase: SupabaseClient, waId: string, profileName?: string) {
  const { data: existing } = await supabase.from("wa_contacts").select("id, profile_name, prospect_id").eq("wa_id", waId).maybeSingle();
  if (existing) {
    if (profileName && profileName !== existing.profile_name) {
      await supabase.from("wa_contacts").update({ profile_name: profileName, updated_at: new Date().toISOString() }).eq("id", existing.id);
    }
    if (!existing.prospect_id) await linkProspect(supabase, existing.id as string, waId);
    return existing.id as string;
  }
  // Contato novo: se o telefone é de um cliente cadastrado, entra como Cliente e a Aline fica em silêncio.
  const companyId = await findCompanyByPhone(supabase, waId);
  const { data, error } = await supabase
    .from("wa_contacts")
    .insert({ wa_id: waId, profile_name: profileName || null, company_id: companyId, mode: companyId ? "Silencioso" : "Automático", classification: companyId ? "Cliente" : "Lead" })
    .select("id")
    .single();
  if (!error && data) await linkProspect(supabase, data.id as string, waId);
  if (error) {
    // corrida entre dois webhooks do mesmo contato
    const { data: again } = await supabase.from("wa_contacts").select("id").eq("wa_id", waId).maybeSingle();
    if (again) return again.id as string;
    throw new Error(error.message);
  }
  return data.id as string;
}

const STATUS_MAP: Record<string, string> = { sent: "Enviada", delivered: "Entregue", read: "Lida", failed: "Falhou" };
const RANK: Record<string, number> = { Enviando: 0, Enviada: 1, Entregue: 2, Lida: 3 };

/** Grava tudo e devolve as mensagens novas de clientes que devem acionar o agente. */
export async function processWebhook(supabase: SupabaseClient, payload: WebhookPayload) {
  const triggers: { contactId: string; messageId: string; waMessageId: string }[] = [];
  const pauseMinutesRow = await supabase.from("agent_settings").select("pause_minutes").eq("id", 1).maybeSingle();
  const pauseMinutes = Number(pauseMinutesRow.data?.pause_minutes ?? 10);

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      const v = change.value || {};
      const names = new Map((v.contacts || []).map((c) => [c.wa_id, c.profile?.name]));

      for (const m of v.messages || []) {
        const contactId = await upsertContact(supabase, m.from, names.get(m.from));
        const at = m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString();
        let body = bodyOf(m);
        if (m.referral?.headline || m.referral?.body) body = `${body}\n[veio do anúncio: ${m.referral.headline || m.referral.body}]`;
        const { data, error } = await supabase
          .from("wa_messages")
          .insert({ contact_id: contactId, wa_message_id: m.id, direction: "Entrada", author: "Cliente", type: m.type, body, status: "Recebida", raw: m, created_at: at })
          .select("id")
          .single();
        if (error) continue; // já recebida (a Meta reenvia webhooks)
        await supabase.from("wa_contacts").update({ last_message_at: at, last_inbound_at: at, updated_at: new Date().toISOString() }).eq("id", contactId);
        await advanceProspect(supabase, contactId, m.from, "reply");
        triggers.push({ contactId, messageId: data.id, waMessageId: m.id });
      }

      // Coexistência: o que a equipe respondeu pelo app aparece aqui e pausa o agente nesse contato.
      for (const m of v.message_echoes || []) {
        const to = m.to || "";
        if (!to) continue;
        const contactId = await upsertContact(supabase, to);
        const at = m.timestamp ? new Date(Number(m.timestamp) * 1000).toISOString() : new Date().toISOString();
        const { error } = await supabase
          .from("wa_messages")
          .insert({ contact_id: contactId, wa_message_id: m.id, direction: "Saída", author: "Equipe", type: m.type, body: bodyOf(m), status: "Enviada", raw: m, created_at: at, sent_at: at });
        if (error) continue;
        await supabase
          .from("wa_contacts")
          .update({ last_message_at: at, agent_paused_until: new Date(Date.now() + pauseMinutes * 60000).toISOString() })
          .eq("id", contactId);
        await advanceProspect(supabase, contactId, to, "echo");
      }

      for (const s of v.statuses || []) {
        const next = STATUS_MAP[s.status];
        if (!next) continue;
        const { data: msg } = await supabase.from("wa_messages").select("id, status").eq("wa_message_id", s.id).maybeSingle();
        if (!msg) continue;
        if (next !== "Falhou" && (RANK[next] ?? 0) <= (RANK[msg.status] ?? -1)) continue;
        const err = s.errors?.[0];
        await supabase
          .from("wa_messages")
          .update({ status: next, error: err ? err.error_data?.details || err.message || err.title || null : null })
          .eq("id", msg.id);
      }
    }
  }
  return triggers;
}
