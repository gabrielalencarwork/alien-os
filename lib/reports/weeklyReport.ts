/**
 * Relatório semanal por cliente (segunda a domingo), com texto escrito pela Alien Max para o cliente.
 * Usa só números reais do Meta Ads e do Google Ads já sincronizados.
 * Uso apenas no servidor.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getUniversalClient } from "@/lib/supabase/universal";
import { getAnthropic, ALIEN_MAX_MODEL } from "@/lib/ai/anthropic";
import { getClientResults, type ClientResult, type PeriodTotals, type CampaignSummary, type ClientGoals } from "@/lib/central/clientResults";
import { attachMetaHealth } from "@/lib/connectors/meta/accountHealth";

const TZ = "America/Sao_Paulo";

export interface WeeklyReportMetrics {
  period: { start: string; end: string; previousStart: string; previousEnd: string };
  current: PeriodTotals;
  previous: PeriodTotals;
  costPerResultChange: number | null;
  resultsChange: number | null;
  spendChange: number | null;
  goals: ClientGoals;
  daily: { date: string; results: number; spend: number }[];
  topCampaigns: CampaignSummary[];
  platforms: string[];
}

export interface WeeklyReport {
  id: string;
  companyId: string;
  clientName: string;
  weekStart: string;
  weekEnd: string;
  metrics: WeeklyReportMetrics;
  summary: string;
  highlights: string[];
  nextSteps: string[];
  shareToken: string;
  status: "Gerado" | "Enviado";
  sentAt: string | null;
  createdAt: string;
}

function localDate(d: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

function shift(dateStr: string, days: number) {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Último domingo já encerrado (horário de Brasília). Num domingo, devolve o domingo anterior. */
export function lastCompleteWeekEnd(now = new Date()): string {
  const today = localDate(now);
  const weekday = new Date(`${today}T12:00:00Z`).getUTCDay(); // 0 = domingo
  return shift(today, weekday === 0 ? -7 : -weekday);
}

function weekdayPt(date: string) {
  return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][new Date(`${date}T12:00:00Z`).getUTCDay()];
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const REPORT_TOOL = {
  name: "registrar_relatorio",
  description: "Registra o texto do relatório semanal que será enviado ao cliente.",
  input_schema: {
    type: "object" as const,
    properties: {
      resumo: {
        type: "string",
        description: "2 a 3 frases curtas sobre como foi a semana, com os números principais. Linguagem simples, para o dono do negócio.",
      },
      destaques: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: { type: "string" },
        description: "O que aconteceu de mais relevante (bom ou ruim), cada item com o número que comprova.",
      },
      proximos_passos: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: { type: "string" },
        description: "O que a Alien vai fazer (ou precisa do cliente) na próxima semana, em frases curtas e concretas.",
      },
    },
    required: ["resumo", "destaques", "proximos_passos"],
  },
};

const SYSTEM_PROMPT = `Você escreve o relatório semanal que a Alien Marketing Inteligente envia aos clientes de tráfego pago.
O leitor é o dono do negócio, não um especialista em anúncios.

Regras:
- Use SOMENTE os números fornecidos. Nunca invente valores, metas, comparações de mercado ou previsões.
- Português do Brasil, frases curtas, tom profissional e próximo. Sem jargão: diga "pessoas que chamaram no WhatsApp" em vez de "conversas iniciadas", "custo por contato" em vez de "CPR/CPL", "taxa de cliques" em vez de "CTR".
- Seja honesto: se a semana foi pior, diga e explique o que os números mostram, sem culpar o cliente.
- Se a conta de anúncios ficou sem saldo ou atingiu o limite, diga que os anúncios pararam por isso e que é preciso recarregar.
- Dias "sem dados" não são zero: não conclua queda a partir deles.
- Não use emojis. Não afirme que algo foi a "estreia" ou "primeira vez" se isso não estiver nos dados — semana anterior zerada pode ser pausa.
- O status e o saldo da conta Meta são de hoje (situação atual), não da semana: escreva assim.
- Não mencione ferramentas internas, IA ou "Alien Max". Fale como a equipe da Alien ("vamos", "nossa equipe").
- Próximos passos: só ações que fazem sentido com os dados (ex.: reforçar a campanha que teve o menor custo por contato, testar novos anúncios, ajustar verba à meta). Nada vago.`;

export function describeForReport(c: ClientResult, weekStart: string, weekEnd: string, syncedUntil: string | null) {
  const label = c.goals.resultLabel || "resultado";
  const lines = [
    `Cliente: ${c.name}`,
    `Semana: ${weekStart} a ${weekEnd} (comparada com a semana anterior)`,
    `O que conta como resultado para este cliente: ${label}`,
    c.goals.objective ? `Objetivo do cliente: ${c.goals.objective}` : "",
    c.goals.targetCostPerResult ? `Custo por resultado aceitável combinado: ${brl(c.goals.targetCostPerResult)}` : "",
    c.goals.monthlyBudget ? `Verba mensal combinada: ${brl(c.goals.monthlyBudget)}` : "",
    "",
    `Investimento: ${brl(c.current.spend)} (semana anterior: ${brl(c.previous.spend)})`,
    `Pessoas que chamaram por mensagem (Meta): ${c.current.conversations} (anterior: ${c.previous.conversations})`,
    `Conversões registradas: ${c.current.conversions} (anterior: ${c.previous.conversions})`,
    `Custo por resultado: ${c.current.results ? brl(c.current.costPerResult) : "sem resultados"} (anterior: ${c.previous.results ? brl(c.previous.costPerResult) : "sem resultados"})`,
    `Cliques: ${c.current.clicks} · Impressões: ${c.current.impressions} · Taxa de cliques: ${c.current.ctr}%`,
    "",
    "Por dia (resultados / investimento):",
    c.dailyResults
      .slice(-7)
      .map((d) => {
        const label = `${weekdayPt(d.date)} ${d.date.slice(8, 10)}/${d.date.slice(5, 7)}`;
        return syncedUntil && d.date > syncedUntil ? `${label}: sem dados` : `${label}: ${d.results} / ${brl(d.spend)}`;
      })
      .join(" | "),
    "",
    "Campanhas:",
    ...(c.topCampaigns.length
      ? c.topCampaigns.map(
          (t) => `- "${t.name}" (${t.platform === "meta-ads" ? "Meta" : "Google"}): ${brl(t.spend)}, ${t.results} resultados${t.results ? `, ${brl(t.costPerResult)} por resultado` : ""}`
        )
      : ["- nenhuma campanha com investimento"]),
    ...(c.metaHealth || [])
      .filter((h) => !h.error)
      .map(
        (h) =>
          `Situação atual (hoje) da conta Meta "${h.accountName}": ${h.statusLabel}${h.isPrepay && h.availableBalance !== null ? `, saldo atual ${brl(h.availableBalance)}` : ""}${h.spendCapReached ? ", limite de gasto atingido (anúncios parados)" : ""}`
      ),
  ];
  return lines.filter((l) => l !== null).join("\n");
}

export async function writeReportText(prompt: string) {
  const res = await getAnthropic().messages.create({
    model: ALIEN_MAX_MODEL,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    tools: [REPORT_TOOL],
    tool_choice: { type: "tool", name: REPORT_TOOL.name },
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("A Alien Max não devolveu o texto do relatório.");
  const input = block.input as { resumo?: string; destaques?: string[]; proximos_passos?: string[] };
  return {
    summary: input.resumo || "",
    highlights: (input.destaques || []).slice(0, 4),
    nextSteps: (input.proximos_passos || []).slice(0, 4),
  };
}

/**
 * Gera (ou refaz) o relatório da semana que termina em weekEnd para os clientes com conta de anúncios.
 * onlyMissing = true pula clientes que já têm relatório dessa semana (usado pelo agendamento diário).
 */
export async function generateWeeklyReports({
  weekEnd = lastCompleteWeekEnd(),
  companyIds,
  onlyMissing = false,
  supabase = getUniversalClient(),
}: {
  weekEnd?: string;
  companyIds?: string[];
  onlyMissing?: boolean;
  supabase?: SupabaseClient;
} = {}): Promise<{ weekStart: string; weekEnd: string; created: string[]; skipped: string[]; errors: { client: string; error: string }[] }> {
  const weekStart = shift(weekEnd, -6);
  const out = { weekStart, weekEnd, created: [] as string[], skipped: [] as string[], errors: [] as { client: string; error: string }[] };

  const { data: existing, error: exErr } = await supabase.from("weekly_reports").select("company_id").eq("week_start", weekStart);
  if (exErr) {
    throw new Error(
      /does not exist|schema cache|Could not find/i.test(exErr.message)
        ? "A tabela de relatórios ainda não existe. Rode supabase/migrations/20261031000036_relatorios_semanais.sql no SQL Editor do Supabase."
        : exErr.message
    );
  }
  const done = new Set((existing || []).map((r) => r.company_id));

  const results = await getClientResults(supabase, weekEnd);
  let targets = results.clients.filter((c) => c.platforms.length > 0);
  if (companyIds) targets = targets.filter((c) => companyIds.includes(c.companyId));
  if (onlyMissing) {
    for (const c of targets.filter((t) => done.has(t.companyId))) out.skipped.push(c.name);
    targets = targets.filter((t) => !done.has(t.companyId));
  }
  if (!targets.length) return out;

  await attachMetaHealth(targets);

  await Promise.all(
    targets.map(async (c) => {
      try {
        const syncedUntil = c.lastSyncedAt ? localDate(new Date(c.lastSyncedAt)) : null;
        const text = await writeReportText(describeForReport(c, weekStart, weekEnd, syncedUntil));
        const metrics: WeeklyReportMetrics = {
          period: results.period,
          current: c.current,
          previous: c.previous,
          costPerResultChange: c.costPerResultChange,
          resultsChange: c.resultsChange,
          spendChange: c.spendChange,
          goals: c.goals,
          daily: c.dailyResults.slice(-7),
          topCampaigns: c.topCampaigns,
          platforms: c.platforms.map((p) => (p.platform === "meta-ads" ? "Meta Ads" : "Google Ads")),
        };
        const { error } = await supabase.from("weekly_reports").upsert(
          {
            company_id: c.companyId,
            week_start: weekStart,
            week_end: weekEnd,
            metrics,
            summary: text.summary,
            highlights: text.highlights,
            next_steps: text.nextSteps,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "company_id,week_start" }
        );
        if (error) throw new Error(error.message);
        out.created.push(c.name);
      } catch (err) {
        out.errors.push({ client: c.name, error: err instanceof Error ? err.message : String(err) });
      }
    })
  );
  return out;
}

type Row = {
  id: string;
  company_id: string;
  week_start: string;
  week_end: string;
  metrics: WeeklyReportMetrics;
  summary: string;
  highlights: string[];
  next_steps: string[];
  share_token: string;
  status: string;
  sent_at: string | null;
  created_at: string;
  companies?: { name?: string; trade_name?: string } | null;
};

export function mapReport(r: Row): WeeklyReport {
  return {
    id: r.id,
    companyId: r.company_id,
    clientName: r.companies?.trade_name || r.companies?.name || "Cliente",
    weekStart: r.week_start,
    weekEnd: r.week_end,
    metrics: r.metrics,
    summary: r.summary,
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    nextSteps: Array.isArray(r.next_steps) ? r.next_steps : [],
    shareToken: r.share_token,
    status: r.status === "Enviado" ? "Enviado" : "Gerado",
    sentAt: r.sent_at,
    createdAt: r.created_at,
  };
}

/** Relatório pelo código do link público (usado pela página /r/<token>, sem login). */
export async function getReportByToken(token: string): Promise<WeeklyReport | null> {
  if (!/^[a-f0-9]{32,}$/i.test(token)) return null;
  const { data } = await getUniversalClient()
    .from("weekly_reports")
    .select("*, companies(name, trade_name)")
    .eq("share_token", token)
    .maybeSingle();
  return data ? mapReport(data as Row) : null;
}
