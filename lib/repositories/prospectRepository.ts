/**
 * Pipeline de prospecção (tabela prospects).
 * Etapas canônicas documentadas em 20261025000035_central_do_dia.sql.
 */

import { getUniversalClient } from "@/lib/supabase/universal";

export const PROSPECT_STAGES = [
  "Novo",
  "Contato feito",
  "Diagnóstico",
  "Proposta enviada",
  "Negociação",
  "Fechado",
  "Perdido",
] as const;
export type ProspectStage = (typeof PROSPECT_STAGES)[number];

export const OPEN_STAGES: ProspectStage[] = ["Novo", "Contato feito", "Diagnóstico", "Proposta enviada", "Negociação"];

export const PROSPECT_SOURCES = ["Indicação", "Instagram", "Google", "Prospecção ativa", "Site", "Evento", "Outro"] as const;

function key(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
}
const STAGE_MAP: Record<string, ProspectStage> = Object.fromEntries(PROSPECT_STAGES.map((s) => [key(s), s]));
STAGE_MAP["lead"] = "Novo";
STAGE_MAP["proposta"] = "Proposta enviada";
STAGE_MAP["ganho"] = "Fechado";
STAGE_MAP["perdido"] = "Perdido";

export function normalizeProspectStage(v: unknown): ProspectStage {
  return STAGE_MAP[key(v)] ?? "Novo";
}

export interface Prospect {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  segment: string;
  source: string;
  stage: ProspectStage;
  estimatedValue: number;
  nextStep: string;
  nextStepDate: string;
  createdAt: string;
}

export interface NewProspectInput {
  name: string;
  contactName?: string;
  phone?: string;
  segment?: string;
  source?: string;
  stage?: ProspectStage;
  estimatedValue?: number;
  nextStep?: string;
  nextStepDate?: string;
}

export class ProspectRepository {
  /** Devolve os leads e o erro real de leitura, se houver. */
  async list(): Promise<{ prospects: Prospect[]; error: string | null }> {
    const supabase = getUniversalClient();
    const { data, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("active", true)
      .order("next_step_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (error) {
      const missing = /does not exist|schema cache|Could not find/i.test(error.message);
      return {
        prospects: [],
        error: missing
          ? "A tabela de prospecção ainda não existe. Falta rodar a atualização do banco 20261025000035_central_do_dia.sql no SQL Editor do Supabase."
          : error.message,
      };
    }
    return {
      prospects: (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        contactName: p.contact_name || "",
        phone: p.phone || "",
        segment: p.segment || "",
        source: p.source || "",
        stage: normalizeProspectStage(p.stage),
        estimatedValue: Number(p.estimated_value) || 0,
        nextStep: p.next_step || "",
        nextStepDate: p.next_step_date || "",
        createdAt: p.created_at,
      })),
      error: null,
    };
  }

  async create(input: NewProspectInput): Promise<void> {
    const supabase = getUniversalClient();
    const { error } = await supabase.from("prospects").insert({
      name: input.name.trim(),
      contact_name: input.contactName?.trim() || null,
      phone: input.phone?.trim() || null,
      segment: input.segment?.trim() || null,
      source: input.source || null,
      stage: input.stage || "Novo",
      estimated_value: input.estimatedValue ?? 0,
      next_step: input.nextStep?.trim() || null,
      next_step_date: input.nextStepDate || null,
    });
    if (error) throw new Error(`Não foi possível salvar o lead: ${error.message}`);
  }

  async updateStage(id: string, stage: ProspectStage): Promise<void> {
    const supabase = getUniversalClient();
    const { error } = await supabase
      .from("prospects")
      .update({ stage, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`Não foi possível mover o lead: ${error.message}`);
  }
}

export const prospectRepository = new ProspectRepository();
