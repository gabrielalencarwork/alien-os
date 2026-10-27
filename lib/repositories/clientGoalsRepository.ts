/**
 * Ficha do cliente: objetivo e metas usadas pela Alien Max (colunas em public.companies,
 * criadas na migração 20261025000035_central_do_dia.sql).
 */

import { getUniversalClient } from "@/lib/supabase/universal";
import type { ClientGoals } from "@/lib/central/clientResults";

export const RESULT_LABELS = ["Conversa no WhatsApp", "Lead (formulário)", "Ligação", "Venda", "Reserva", "Agendamento"] as const;

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

const MISSING =
  "Os campos de metas ainda não existem no banco. Falta rodar a atualização 20261025000035_central_do_dia.sql no SQL Editor do Supabase.";

export class ClientGoalsRepository {
  async get(companyId: string): Promise<{ goals: ClientGoals | null; error: string | null }> {
    const supabase = getUniversalClient();
    const { data, error } = await supabase.from("companies").select("*").eq("id", companyId).maybeSingle();
    if (error) return { goals: null, error: error.message };
    if (!data) return { goals: null, error: "Cliente não encontrado." };
    const migrated = "target_cost_per_result" in data;
    return {
      goals: {
        objective: data.primary_objective ?? null,
        resultLabel: data.result_label ?? null,
        monthlyBudget: numOrNull(data.monthly_ad_budget),
        targetCostPerResult: numOrNull(data.target_cost_per_result),
        averageTicket: numOrNull(data.average_ticket),
      },
      error: migrated ? null : MISSING,
    };
  }

  async save(companyId: string, goals: ClientGoals): Promise<void> {
    const supabase = getUniversalClient();
    const { error } = await supabase
      .from("companies")
      .update({
        primary_objective: goals.objective?.trim() || null,
        result_label: goals.resultLabel || null,
        monthly_ad_budget: goals.monthlyBudget,
        target_cost_per_result: goals.targetCostPerResult,
        average_ticket: goals.averageTicket,
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId);
    if (error) {
      const missing = /column|schema cache|Could not find/i.test(error.message);
      throw new Error(missing ? MISSING : `Não foi possível salvar a ficha: ${error.message}`);
    }
  }
}

export const clientGoalsRepository = new ClientGoalsRepository();
