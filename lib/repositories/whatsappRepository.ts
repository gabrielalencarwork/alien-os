/**
 * WhatsApp nas telas internas (navegador, com a sessão do usuário).
 * Valores canônicos em 20261106000038_whatsapp_agente.sql; leia sempre pelas funções normalize*.
 */

import { getUniversalClient } from "@/lib/supabase/universal";
import {
  normalizeAuthor,
  normalizeDirection,
  normalizeMode,
  normalizeStatus,
  type AgentSettings,
  type ContactMode,
  type WaContact,
  type WaMessage,
} from "@/lib/whatsapp/types";

const MISSING =
  "As tabelas do WhatsApp ainda não existem. Rode supabase/migrations/20261106000038_whatsapp_agente.sql no SQL Editor do Supabase.";

function friendly(message: string) {
  return /does not exist|schema cache|Could not find/i.test(message) ? MISSING : message;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapContact(r: any): WaContact {
  return {
    id: r.id,
    waId: r.wa_id,
    name: r.name,
    profileName: r.profile_name,
    mode: normalizeMode(r.mode),
    companyId: r.company_id,
    companyName: r.companies?.trade_name || r.companies?.name || null,
    prospectId: r.prospect_id,
    needsHuman: !!r.needs_human,
    humanReason: r.human_reason,
    agentPausedUntil: r.agent_paused_until,
    summary: r.summary,
    lastMessageAt: r.last_message_at,
    lastInboundAt: r.last_inbound_at,
    createdAt: r.created_at,
  };
}

function mapMessage(r: any): WaMessage {
  return {
    id: r.id,
    contactId: r.contact_id,
    waMessageId: r.wa_message_id,
    direction: normalizeDirection(r.direction),
    author: normalizeAuthor(r.author),
    type: r.type || "text",
    body: r.body || "",
    status: normalizeStatus(r.status),
    error: r.error,
    createdAt: r.created_at,
    sentAt: r.sent_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export class WhatsappRepository {
  async listContacts(): Promise<{ contacts: WaContact[]; drafts: Record<string, number>; error: string | null }> {
    const db = getUniversalClient();
    const { data, error } = await db
      .from("wa_contacts")
      .select("*, companies(name, trade_name)")
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(300);
    if (error) return { contacts: [], drafts: {}, error: friendly(error.message) };
    const { data: d } = await db.from("wa_messages").select("contact_id").eq("status", "Rascunho");
    const drafts: Record<string, number> = {};
    (d || []).forEach((r) => (drafts[r.contact_id] = (drafts[r.contact_id] || 0) + 1));
    return { contacts: (data || []).map(mapContact), drafts, error: null };
  }

  async listMessages(contactId: string): Promise<WaMessage[]> {
    const { data, error } = await getUniversalClient()
      .from("wa_messages")
      .select("*")
      .eq("contact_id", contactId)
      .neq("status", "Descartada")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) throw new Error(friendly(error.message));
    return (data || []).map(mapMessage);
  }

  async updateContact(id: string, patch: { mode?: ContactMode; name?: string | null; companyId?: string | null; needsHuman?: boolean; resumeAgent?: boolean }) {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.mode) row.mode = patch.mode;
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.companyId !== undefined) row.company_id = patch.companyId;
    if (patch.needsHuman === false) {
      row.needs_human = false;
      row.human_reason = null;
    }
    if (patch.resumeAgent) row.agent_paused_until = null;
    const { error } = await getUniversalClient().from("wa_contacts").update(row).eq("id", id);
    if (error) throw new Error(`Não foi possível salvar o contato: ${friendly(error.message)}`);
  }

  async getSettings(): Promise<AgentSettings> {
    const { data, error } = await getUniversalClient().from("agent_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error(friendly(error.message));
    return {
      enabled: !!data?.enabled,
      knowledge: data?.knowledge || "",
      instructions: data?.instructions || "",
      pauseMinutes: Number(data?.pause_minutes ?? 120),
      updatedAt: data?.updated_at || null,
    };
  }

  async saveSettings(patch: Partial<Pick<AgentSettings, "enabled" | "knowledge" | "instructions" | "pauseMinutes">>) {
    const row: Record<string, unknown> = { id: 1, updated_at: new Date().toISOString() };
    if (patch.enabled !== undefined) row.enabled = patch.enabled;
    if (patch.knowledge !== undefined) row.knowledge = patch.knowledge;
    if (patch.instructions !== undefined) row.instructions = patch.instructions;
    if (patch.pauseMinutes !== undefined) row.pause_minutes = Math.max(0, Math.round(patch.pauseMinutes));
    const { error } = await getUniversalClient().from("agent_settings").upsert(row, { onConflict: "id" });
    if (error) throw new Error(`Não foi possível salvar: ${friendly(error.message)}`);
  }

  async listClients(): Promise<{ id: string; name: string }[]> {
    const { data } = await getUniversalClient().from("companies").select("id, name, trade_name").order("name");
    return (data || []).map((c) => ({ id: c.id, name: c.trade_name || c.name }));
  }
}

export const whatsappRepository = new WhatsappRepository();
