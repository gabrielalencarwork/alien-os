/**
 * CRM de prospecção ativa: a lista de clínicas que o Gabriel aborda todo dia (tabela prospects, colunas
 * batch/outreach_status de 20261109000040_prospeccao_ativa.sql). Depois da primeira mensagem a Aline
 * continua a conversa pelo WhatsApp e o status daqui acompanha.
 */

import { getUniversalClient } from "@/lib/supabase/universal";
import type { ProspectStage } from "@/lib/repositories/prospectRepository";

export const OUTREACH_STATUSES = [
  "Não abordado",
  "Mensagem enviada",
  "Respondeu",
  "Aline qualificando",
  "Diagnóstico solicitado",
  "Passado ao Gabriel",
  "Fechado",
  "Sem interesse",
  "Não contatar",
] as const;
export type OutreachStatus = (typeof OUTREACH_STATUSES)[number];

/** Status em que a conversa ainda está viva. */
export const ACTIVE_OUTREACH: OutreachStatus[] = ["Respondeu", "Aline qualificando", "Diagnóstico solicitado", "Passado ao Gabriel"];
export const CLOSED_OUTREACH: OutreachStatus[] = ["Fechado", "Sem interesse", "Não contatar"];

/** Etapa do funil geral (Central do Dia) que corresponde a cada status. Fechado vira Cliente no WhatsApp pelo gatilho do banco. */
export const STAGE_BY_STATUS: Record<OutreachStatus, ProspectStage> = {
  "Não abordado": "Novo",
  "Mensagem enviada": "Contato feito",
  Respondeu: "Contato feito",
  "Aline qualificando": "Contato feito",
  "Diagnóstico solicitado": "Diagnóstico",
  "Passado ao Gabriel": "Negociação",
  Fechado: "Fechado",
  "Sem interesse": "Perdido",
  "Não contatar": "Perdido",
};

function key(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
}
const STATUS_MAP: Record<string, OutreachStatus> = Object.fromEntries(OUTREACH_STATUSES.map((s) => [key(s), s]));
export function normalizeOutreachStatus(v: unknown): OutreachStatus {
  return STATUS_MAP[key(v)] ?? "Não abordado";
}

export interface Target {
  id: string;
  name: string;
  city: string;
  specialty: string;
  phone: string;
  whatsappConfirmed: boolean;
  rating: number | null;
  reviews: number | null;
  angle: string;
  instagram: string;
  notes: string;
  status: OutreachStatus;
  scheduledDate: string;
  batchDay: number | null;
  outreachAt: string | null;
  updatedAt: string;
}

export class ProspeccaoRepository {
  async list(): Promise<{ targets: Target[]; error: string | null }> {
    const supabase = getUniversalClient();
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("active", true)
      .not("batch", "is", null)
      .order("scheduled_date", { ascending: true })
      .order("batch_day", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      const missing = /does not exist|schema cache|Could not find/i.test(error.message);
      return {
        targets: [],
        error: missing
          ? "A lista de prospecção ainda não existe no banco. Falta rodar a atualização 20261109000040_prospeccao_ativa.sql no SQL Editor do Supabase."
          : error.message,
      };
    }
    return {
      targets: (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        city: p.city || "",
        specialty: p.specialty || "",
        phone: p.phone || "",
        whatsappConfirmed: p.whatsapp_confirmed !== false,
        rating: p.rating == null ? null : Number(p.rating),
        reviews: p.reviews_count == null ? null : Number(p.reviews_count),
        angle: p.angle || "",
        instagram: p.instagram || "",
        notes: p.notes || "",
        status: normalizeOutreachStatus(p.outreach_status),
        scheduledDate: p.scheduled_date || "",
        batchDay: p.batch_day ?? null,
        outreachAt: p.outreach_at || null,
        updatedAt: p.updated_at || p.created_at,
      })),
      error: null,
    };
  }

  /** Muda o status, acompanha a etapa do funil e marca a data da primeira mensagem. */
  async setStatus(id: string, status: OutreachStatus, firstContactDone: boolean): Promise<string | null> {
    const supabase = getUniversalClient();
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { outreach_status: status, stage: STAGE_BY_STATUS[status], updated_at: now };
    if (status !== "Não abordado" && !firstContactDone) patch.outreach_at = now;
    if (status === "Não abordado") patch.outreach_at = null;
    const { error } = await supabase.from("prospects").update(patch).eq("id", id);
    if (error) throw new Error(`Não foi possível mudar o status: ${error.message}`);
    return (patch.outreach_at as string | undefined) ?? null;
  }

  async saveDetails(id: string, input: { instagram: string; notes: string }): Promise<void> {
    const supabase = getUniversalClient();
    const { error } = await supabase
      .from("prospects")
      .update({ instagram: input.instagram.trim() || null, notes: input.notes.trim() || null, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`Não foi possível salvar: ${error.message}`);
  }
}

export const prospeccaoRepository = new ProspeccaoRepository();

/** Dia (AAAA-MM-DD, Brasília) de um instante ISO. */
export function localDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(iso));
}
