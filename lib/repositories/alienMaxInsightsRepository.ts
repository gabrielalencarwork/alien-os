/**
 * Próximas ações geradas pela Alien Max (tabela alien_max_insights) e histórico de varreduras
 * (alien_max_runs). Valores canônicos documentados em 20261025000035_central_do_dia.sql.
 */

import { getUniversalClient } from "@/lib/supabase/universal";

export type InsightPriority = "Crítica" | "Alta" | "Média" | "Baixa";
export type InsightStatus = "PENDING" | "APPLIED" | "DISMISSED" | "EXPIRED";
export type InsightPlatform = "meta-ads" | "google-ads" | "ga4" | "geral";
export type InsightCategory = "PAID_MEDIA" | "ANALYTICS" | "OPERATIONS" | "COMMERCIAL" | "FINANCIAL";

function key(v: unknown) {
  return typeof v === "string" ? v.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
}

const PRIORITIES: Record<string, InsightPriority> = {
  critica: "Crítica",
  critical: "Crítica",
  urgente: "Crítica",
  alta: "Alta",
  high: "Alta",
  media: "Média",
  medium: "Média",
  baixa: "Baixa",
  low: "Baixa",
};
export function normalizeInsightPriority(v: unknown): InsightPriority {
  return PRIORITIES[key(v)] ?? "Média";
}

const STATUSES: Record<string, InsightStatus> = {
  pending: "PENDING",
  applied: "APPLIED",
  done: "APPLIED",
  dismissed: "DISMISSED",
  expired: "EXPIRED",
};
export function normalizeInsightStatus(v: unknown): InsightStatus {
  return STATUSES[key(v)] ?? "PENDING";
}

const PLATFORMS: InsightPlatform[] = ["meta-ads", "google-ads", "ga4", "geral"];
export function normalizeInsightPlatform(v: unknown): InsightPlatform {
  const k = key(v);
  return (PLATFORMS as string[]).includes(k) ? (k as InsightPlatform) : "geral";
}

export const PRIORITY_ORDER: Record<InsightPriority, number> = { Crítica: 0, Alta: 1, Média: 2, Baixa: 3 };

export interface NextAction {
  id: string;
  companyId: string | null;
  clientName: string;
  priority: InsightPriority;
  platform: InsightPlatform;
  category: string;
  title: string;
  description: string;
  recommendedAction: string;
  expectedResult: string;
  evidence: string;
  confidence: number;
  status: InsightStatus;
  createdAt: string;
}

export interface SweepRun {
  id: string;
  trigger: string;
  status: "running" | "success" | "partial" | "error";
  startedAt: string;
  finishedAt: string | null;
  clientsAnalyzed: number;
  actionsCreated: number;
  errorMessage: string | null;
  details: { syncErrors?: { source: string; error: string }[]; analysisErrors?: { client: string; error: string }[] };
}

export interface NextActionsResult {
  actions: NextAction[];
  lastRun: SweepRun | null;
  /** Erro real de leitura (ex.: tabela ainda não criada) */
  error: string | null;
}

export class AlienMaxInsightsRepository {
  async getPendingActions(): Promise<NextActionsResult> {
    const supabase = getUniversalClient();
    const [actionsRes, runRes] = await Promise.all([
      supabase
        .from("alien_max_insights")
        .select("*, companies(name, trade_name)")
        .eq("status", "PENDING")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(60),
      supabase.from("alien_max_runs").select("*").order("started_at", { ascending: false }).limit(1),
    ]);

    const err = actionsRes.error || runRes.error;
    if (err) {
      const missing = /does not exist|schema cache|Could not find/i.test(err.message);
      return {
        actions: [],
        lastRun: null,
        error: missing
          ? "As tabelas da Alien Max 24h ainda não existem no banco. Falta rodar a atualização do banco 20261025000035_central_do_dia.sql no SQL Editor do Supabase."
          : err.message,
      };
    }

    const actions: NextAction[] = (actionsRes.data || []).map((r) => {
      const evidence = r.evidence && typeof r.evidence === "object" ? (r.evidence as { texto?: string }).texto ?? "" : "";
      return {
        id: r.id,
        companyId: r.company_id,
        clientName: r.companies?.trade_name || r.companies?.name || "Alien (interno)",
        priority: normalizeInsightPriority(r.priority),
        platform: normalizeInsightPlatform(r.platform),
        category: r.category,
        title: r.title,
        description: r.description || "",
        recommendedAction: r.recommended_action || "",
        expectedResult: r.expected_result || "",
        evidence,
        confidence: Number(r.confidence_score) || 0,
        status: normalizeInsightStatus(r.status),
        createdAt: r.created_at,
      };
    });
    actions.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] || b.createdAt.localeCompare(a.createdAt));

    const r = runRes.data?.[0];
    const lastRun: SweepRun | null = r
      ? {
          id: r.id,
          trigger: r.trigger,
          status: r.status,
          startedAt: r.started_at,
          finishedAt: r.finished_at,
          clientsAnalyzed: r.clients_analyzed,
          actionsCreated: r.actions_created,
          errorMessage: r.error_message,
          details: r.details || {},
        }
      : null;

    return { actions, lastRun, error: null };
  }

  async setStatus(id: string, status: Extract<InsightStatus, "APPLIED" | "DISMISSED">): Promise<void> {
    const supabase = getUniversalClient();
    const { error } = await supabase
      .from("alien_max_insights")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`Não foi possível atualizar a ação: ${error.message}`);
  }

  /** Transforma a ação em tarefa no quadro de Tarefas e marca a ação como concluída. */
  async convertToTask(action: NextAction, dueDate: string): Promise<void> {
    const supabase = getUniversalClient();
    const priority = action.priority;
    const { error } = await supabase.from("tasks").insert({
      company_id: action.companyId,
      title: action.title.slice(0, 255),
      description: [action.description, action.recommendedAction && `Como fazer: ${action.recommendedAction}`]
        .filter(Boolean)
        .join("\n\n"),
      priority,
      status: "A Fazer",
      due_date: dueDate,
      start_date: dueDate,
      assignee_name: "Gabriel Alencar",
      insight_id: action.id,
    });
    if (error) throw new Error(`Não foi possível criar a tarefa: ${error.message}`);
    await this.setStatus(action.id, "APPLIED");
  }
}

export const alienMaxInsightsRepository = new AlienMaxInsightsRepository();
