/**
 * Varredura da Alien Max (roda sozinha pelo agendamento e também sob demanda).
 *
 * 1. Sincroniza Meta Ads, Google Ads e GA4 usando as conexões do servidor.
 * 2. Calcula os resultados reais de cada cliente (7 dias vs. 7 dias anteriores).
 * 3. Pede ao Claude as próximas ações de cada cliente, baseadas só nesses números.
 * 4. Substitui as ações pendentes antigas do cliente pelas novas (as antigas ficam como EXPIRED).
 *
 * Toda falha é registrada com a mensagem real em alien_max_runs.details.
 * Uso apenas no servidor.
 */

import { NextRequest } from "next/server";
import { getUniversalClient } from "@/lib/supabase/universal";
import { getAnthropic, ALIEN_MAX_MODEL } from "@/lib/ai/anthropic";
import { getClientResults, type ClientResult } from "@/lib/central/clientResults";
import { POST as syncMeta } from "@/app/api/integracoes/meta-ads/sync/route";
import { POST as syncGoogleAds } from "@/app/api/integracoes/google-ads/sync/route";
import { POST as syncGa4 } from "@/app/api/integracoes/google-analytics/sync/route";
import { normalizeTaskStatus } from "@/lib/repositories/taskRepository";
import type { InsightPriority, InsightPlatform, InsightCategory } from "@/lib/repositories/alienMaxInsightsRepository";

export type SweepTrigger = "cron" | "manual" | "auto";

export interface SweepResult {
  runId: string | null;
  status: "success" | "partial" | "error";
  clientsAnalyzed: number;
  actionsCreated: number;
  syncErrors: { source: string; error: string }[];
  analysisErrors: { client: string; error: string }[];
}

const ORIGIN = "http://alien-os.internal";

async function callRoute(
  handler: (req: NextRequest) => Promise<Response>,
  path: string,
  body: Record<string, unknown>
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await handler(
      new NextRequest(`${ORIGIN}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      })
    );
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error || `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/** Sincroniza todas as contas conectadas. Devolve os erros reais por conta. */
export async function syncAllAccounts(): Promise<{ source: string; error: string }[]> {
  const supabase = getUniversalClient();
  const errors: { source: string; error: string }[] = [];

  const [{ data: metaAccs }, { data: googleCusts }, { data: ga4Props }] = await Promise.all([
    supabase.from("meta_ads_accounts").select("account_id, account_name, active"),
    supabase.from("google_ads_customers").select("customer_id, descriptive_name, manager, active"),
    supabase.from("ga4_properties").select("property_id, display_name, active"),
  ]);

  const jobs: Promise<void>[] = [];

  for (const a of (metaAccs || []).filter((x) => x.active !== false)) {
    jobs.push(
      callRoute(syncMeta, "/api/integracoes/meta-ads/sync", {
        adAccountId: a.account_id,
        accountName: a.account_name,
        isFullSync: false,
      }).then((r) => {
        if (!r.ok) errors.push({ source: `Meta Ads · ${a.account_name}`, error: r.error || "Falha" });
      })
    );
  }

  // Google Ads: uma conta por vez (a API limita chamadas simultâneas com o mesmo token).
  jobs.push(
    (async () => {
      for (const c of (googleCusts || []).filter((x) => x.active !== false && !x.manager)) {
        const r = await callRoute(syncGoogleAds, "/api/integracoes/google-ads/sync", {
          customerId: c.customer_id,
          descriptiveName: c.descriptive_name,
          isFullSync: false,
        });
        if (!r.ok) errors.push({ source: `Google Ads · ${c.descriptive_name}`, error: r.error || "Falha" });
      }
    })()
  );

  jobs.push(
    (async () => {
      for (const p of (ga4Props || []).filter((x) => x.active !== false)) {
        const r = await callRoute(syncGa4, "/api/integracoes/google-analytics/sync", {
          propertyId: p.property_id,
          propertyName: p.display_name,
        });
        if (!r.ok) errors.push({ source: `GA4 · ${p.display_name}`, error: r.error || "Falha" });
      }
    })()
  );

  await Promise.all(jobs);
  return errors;
}

interface GeneratedAction {
  titulo: string;
  descricao: string;
  acao_recomendada: string;
  resultado_esperado: string;
  prioridade: InsightPriority;
  plataforma: InsightPlatform;
  categoria: InsightCategory;
  confianca: number;
  evidencia: string;
}

const ACTION_TOOL = {
  name: "registrar_proximas_acoes",
  description: "Registra as próximas ações recomendadas para o cliente na Central do Dia do Alien OS.",
  input_schema: {
    type: "object" as const,
    properties: {
      acoes: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: {
          type: "object",
          properties: {
            titulo: { type: "string", description: "Ação no imperativo, até 70 caracteres. Ex.: 'Pausar o conjunto X com CPL 2x acima da média'." },
            descricao: { type: "string", description: "O que os números mostram, em 1–2 frases curtas, citando os valores reais." },
            acao_recomendada: { type: "string", description: "Passo a passo objetivo do que fazer na conta (máx. 3 passos curtos)." },
            resultado_esperado: { type: "string", description: "O efeito esperado, sem inventar números que não estejam nos dados." },
            prioridade: { type: "string", enum: ["Crítica", "Alta", "Média", "Baixa"] },
            plataforma: { type: "string", enum: ["meta-ads", "google-ads", "ga4", "geral"] },
            categoria: { type: "string", enum: ["PAID_MEDIA", "ANALYTICS", "OPERATIONS", "COMMERCIAL", "FINANCIAL"] },
            confianca: { type: "integer", minimum: 0, maximum: 100 },
            evidencia: { type: "string", description: "Os números exatos usados (ex.: 'CPL R$ 18,40 → R$ 27,10; 3 conversas em 7 dias')." },
          },
          required: ["titulo", "descricao", "acao_recomendada", "resultado_esperado", "prioridade", "plataforma", "categoria", "confianca", "evidencia"],
        },
      },
    },
    required: ["acoes"],
  },
};

const SYSTEM_PROMPT = `Você é a Alien Max, a inteligência da Alien Marketing Inteligente, que gerencia tráfego pago de pequenos e médios negócios.
Sua tarefa: olhar os números reais de UM cliente e dizer ao gestor (Gabriel) quais são as próximas ações que mais vão melhorar o resultado desse cliente.

Regras:
- Use SOMENTE os números fornecidos. Nunca invente métricas, metas, benchmarks ou valores.
- Cada ação precisa ser específica e executável hoje: cite a campanha, a plataforma e o número que justifica.
- Quando houver metas na ficha do cliente, compare os números com elas (custo por resultado vs. meta, gasto projetado vs. verba). Se a ficha estiver incompleta e isso atrapalhar a análise, uma das ações pode ser preencher a ficha.
- Priorize: 1) dinheiro sendo gasto sem resultado; 2) piora do custo por resultado; 3) oportunidades de escalar o que está funcionando; 4) problemas de dados/integração que impedem a análise.
- Dias marcados como "sem dados" ficaram fora da sincronização: nunca trate isso como queda, pausa ou zero resultado. Se a conta estiver desatualizada, a ação é atualizar a sincronização.
- Se os dados forem insuficientes (sem conta vinculada, sem sincronização, sem gasto), a ação é resolver isso — diga exatamente o quê.
- "Resultados" = conversas iniciadas por mensagem (Meta) + conversões registradas (Meta e Google).
- Não repita ações que o gestor já dispensou ou concluiu recentemente (lista fornecida).
- Entre 1 e 4 ações, ordenadas da mais importante para a menos importante. Português do Brasil, frases curtas, sem jargão desnecessário.`;

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function describeClient(c: ClientResult, segment: string | null, openTasks: string[], recentHandled: string[]) {
  // Último dia com dados: a sincronização mais antiga entre as contas do cliente (horário de Brasília).
  const syncedUntil = c.lastSyncedAt
    ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(c.lastSyncedAt))
    : null;
  const lines = [
    `Cliente: ${c.name}${segment ? ` (segmento: ${segment})` : ""}`,
    `Contas: ${c.platforms.map((p) => `${p.platform} "${p.accountName}" (sincronizada em ${p.lastSyncedAt ?? "nunca"})`).join("; ") || "nenhuma"}`,
    `Campanhas ativas: ${c.activeCampaigns}`,
    "",
    "Ficha do cliente (metas definidas pelo gestor):",
    `- Objetivo: ${c.goals.objective || "não informado"}`,
    `- Resultado que importa: ${c.goals.resultLabel || "não informado"}`,
    `- Verba mensal de anúncios: ${c.goals.monthlyBudget ? brl(c.goals.monthlyBudget) : "não informada"}${c.goals.monthlyBudget ? ` (ritmo atual projetado: ${brl((c.current.spend / 7) * 30)}/mês)` : ""}`,
    `- Custo por resultado aceitável: ${c.goals.targetCostPerResult ? brl(c.goals.targetCostPerResult) : "não informado"}`,
    `- Ticket médio do cliente: ${c.goals.averageTicket ? brl(c.goals.averageTicket) : "não informado"}`,
    "",
    "Últimos 7 dias vs. 7 dias anteriores:",
    `- Investimento: ${brl(c.current.spend)} vs ${brl(c.previous.spend)}`,
    `- Conversas (Meta): ${c.current.conversations} vs ${c.previous.conversations}`,
    `- Conversões: ${c.current.conversions} vs ${c.previous.conversions}`,
    `- Custo por resultado: ${c.current.results ? brl(c.current.costPerResult) : "sem resultados"} vs ${c.previous.results ? brl(c.previous.costPerResult) : "sem resultados"}`,
    `- Cliques: ${c.current.clicks} vs ${c.previous.clicks} · CTR: ${c.current.ctr}% vs ${c.previous.ctr}%`,
    "",
    "Resultados por dia (14 dias, data: resultados / investimento):",
    c.dailyResults
      .map((d) => (syncedUntil && d.date > syncedUntil ? `${d.date}: sem dados (conta não sincronizada)` : `${d.date}: ${d.results} / ${brl(d.spend)}`))
      .join(" | "),
    syncedUntil && syncedUntil < c.dailyResults.at(-1)!.date
      ? `ATENÇÃO: os dados desta conta só vão até ${syncedUntil}. Dias depois disso NÃO são zero, são desconhecidos — não conclua que houve queda ou pausa nesses dias.`
      : "",
    "",
    "Campanhas com investimento nos últimos 7 dias:",
    ...(c.topCampaigns.length
      ? c.topCampaigns.map(
          (t) =>
            `- [${t.platform}] "${t.name}" (${t.status}): ${brl(t.spend)}, ${t.results} resultados, custo/resultado ${t.results ? brl(t.costPerResult) : "—"}, ${t.clicks} cliques, ${t.impressions} impressões`
        )
      : ["- nenhuma"]),
    "",
    `Alertas automáticos: ${c.signals.map((s) => s.text).join("; ")}`,
    `Tarefas em aberto deste cliente: ${openTasks.length ? openTasks.join("; ") : "nenhuma"}`,
    `Ações já concluídas ou dispensadas nos últimos 14 dias (não repetir): ${recentHandled.length ? recentHandled.join("; ") : "nenhuma"}`,
  ];
  return lines.join("\n");
}

export async function generateActions(prompt: string): Promise<GeneratedAction[]> {
  const anthropic = getAnthropic();
  const res = await anthropic.messages.create({
    model: ALIEN_MAX_MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    tools: [ACTION_TOOL],
    tool_choice: { type: "tool", name: ACTION_TOOL.name },
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("A Alien Max não devolveu ações.");
  const input = block.input as { acoes?: GeneratedAction[] };
  return (input.acoes || []).slice(0, 4);
}

export async function runAlienMaxSweep({ trigger, sync = true }: { trigger: SweepTrigger; sync?: boolean }): Promise<SweepResult> {
  const supabase = getUniversalClient();
  const result: SweepResult = {
    runId: null,
    status: "success",
    clientsAnalyzed: 0,
    actionsCreated: 0,
    syncErrors: [],
    analysisErrors: [],
  };

  const { data: run, error: runErr } = await supabase
    .from("alien_max_runs")
    .insert({ trigger, status: "running" })
    .select("id")
    .single();
  if (runErr) {
    throw new Error(
      `Não foi possível registrar a varredura: ${runErr.message}. Rode a migração supabase/migrations/20261025000035_central_do_dia.sql no Supabase.`
    );
  }
  result.runId = run.id;

  try {
    if (sync) result.syncErrors = await syncAllAccounts();

    const [{ clients }, companiesRes, tasksRes, handledRes] = await Promise.all([
      getClientResults(supabase),
      supabase.from("companies").select("id, segment"),
      supabase.from("tasks").select("company_id, title, status, due_date").eq("active", true),
      supabase
        .from("alien_max_insights")
        .select("company_id, title, status")
        .in("status", ["APPLIED", "DISMISSED"])
        .gte("updated_at", new Date(Date.now() - 14 * 864e5).toISOString()),
    ]);

    const segments = new Map((companiesRes.data || []).map((c) => [c.id, c.segment as string | null]));

    const targets = clients.filter((c) => c.platforms.length > 0);

    await Promise.all(
      targets.map(async (client) => {
        try {
          const openTasks = (tasksRes.data || [])
            .filter((t) => t.company_id === client.companyId && !["Concluído", "Cancelado"].includes(normalizeTaskStatus(t.status)))
            .map((t) => `${t.title}${t.due_date ? ` (prazo ${t.due_date})` : ""}`)
            .slice(0, 10);
          const recentHandled = (handledRes.data || [])
            .filter((i) => i.company_id === client.companyId)
            .map((i) => `${i.title} [${i.status === "APPLIED" ? "concluída" : "dispensada"}]`)
            .slice(0, 15);

          const actions = await generateActions(
            describeClient(client, segments.get(client.companyId) ?? null, openTasks, recentHandled)
          );

          // Ações antigas ainda pendentes deste cliente saem da lista (ficam no histórico).
          await supabase
            .from("alien_max_insights")
            .update({ status: "EXPIRED", updated_at: new Date().toISOString() })
            .eq("company_id", client.companyId)
            .eq("status", "PENDING");

          if (actions.length) {
            const { error: insErr } = await supabase.from("alien_max_insights").insert(
              actions.map((a) => ({
                company_id: client.companyId,
                run_id: run.id,
                category: a.categoria,
                platform: a.plataforma,
                priority: a.prioridade,
                title: a.titulo.slice(0, 255),
                description: a.descricao,
                recommended_action: a.acao_recomendada,
                expected_result: a.resultado_esperado,
                confidence_score: Math.max(0, Math.min(100, Math.round(a.confianca))),
                evidence: { texto: a.evidencia, periodo: "7 dias", investimento: client.current.spend, resultados: client.current.results },
                status: "PENDING",
              }))
            );
            if (insErr) throw new Error(insErr.message);
          }
          result.clientsAnalyzed += 1;
          result.actionsCreated += actions.length;
        } catch (err) {
          result.analysisErrors.push({ client: client.name, error: err instanceof Error ? err.message : String(err) });
        }
      })
    );

    if (result.analysisErrors.length && result.clientsAnalyzed === 0) result.status = "error";
    else if (result.analysisErrors.length || result.syncErrors.length) result.status = "partial";
  } catch (err) {
    result.status = "error";
    result.analysisErrors.push({ client: "geral", error: err instanceof Error ? err.message : String(err) });
  }

  await supabase
    .from("alien_max_runs")
    .update({
      status: result.status,
      finished_at: new Date().toISOString(),
      clients_analyzed: result.clientsAnalyzed,
      actions_created: result.actionsCreated,
      error_message:
        result.status === "error" ? result.analysisErrors.map((e) => `${e.client}: ${e.error}`).join(" | ").slice(0, 2000) : null,
      details: { syncErrors: result.syncErrors, analysisErrors: result.analysisErrors },
    })
    .eq("id", run.id);

  return result;
}
