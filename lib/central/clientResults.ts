/**
 * Resultados por cliente para a Central do Dia e para a varredura da Alien Max.
 * Lê só o que já foi sincronizado no Supabase (Meta Ads e Google Ads). Nada é estimado:
 * cliente sem conta ou sem dados aparece com zeros e um aviso explicando o motivo.
 *
 * Uso apenas no servidor (precisa da chave de serviço para ler todas as contas).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getUniversalClient } from "@/lib/supabase/universal";

export type Platform = "meta-ads" | "google-ads";

export interface PeriodTotals {
  spend: number;
  impressions: number;
  clicks: number;
  /** Conversas iniciadas por mensagem (Meta) */
  conversations: number;
  /** Conversões registradas (Meta + Google) */
  conversions: number;
  /** conversas + conversões */
  results: number;
  costPerResult: number;
  ctr: number;
}

export interface CampaignSummary {
  platform: Platform;
  name: string;
  status: string;
  spend: number;
  results: number;
  costPerResult: number;
  clicks: number;
  impressions: number;
}

export interface ClientSignal {
  level: "critico" | "atencao" | "ok";
  text: string;
}

export interface ClientGoals {
  objective: string | null;
  resultLabel: string | null;
  monthlyBudget: number | null;
  targetCostPerResult: number | null;
  averageTicket: number | null;
}

export interface ClientResult {
  companyId: string;
  name: string;
  goals: ClientGoals;
  platforms: { platform: Platform; accountId: string; accountName: string; lastSyncedAt: string | null }[];
  current: PeriodTotals;
  previous: PeriodTotals;
  /** Variação % do custo por resultado e dos resultados vs. os 7 dias anteriores (null = sem base) */
  costPerResultChange: number | null;
  resultsChange: number | null;
  spendChange: number | null;
  /** Resultados por dia, do mais antigo ao mais recente (14 dias) */
  dailyResults: { date: string; results: number; spend: number }[];
  activeCampaigns: number;
  topCampaigns: CampaignSummary[];
  lastSyncedAt: string | null;
  signals: ClientSignal[];
  /** Investimento dos últimos 7 dias por plataforma */
  spendByPlatform: Partial<Record<Platform, number>>;
  /** Status e saldo das contas Meta (preenchido por attachMetaHealth, ao vivo) */
  metaHealth?: import("@/lib/connectors/meta/accountHealth").MetaAccountHealth[];
}

export interface ClientResultsResponse {
  generatedAt: string;
  period: { start: string; end: string; previousStart: string; previousEnd: string };
  clients: ClientResult[];
}

const TZ = "America/Sao_Paulo";

function localDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(d);
}

function shift(dateStr: string, days: number): string {
  const d = new Date(`${dateStr}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function emptyTotals(): PeriodTotals {
  return { spend: 0, impressions: 0, clicks: 0, conversations: 0, conversions: 0, results: 0, costPerResult: 0, ctr: 0 };
}

function finish(t: PeriodTotals): PeriodTotals {
  t.spend = round2(t.spend);
  t.results = t.conversations + t.conversions;
  t.costPerResult = t.results > 0 ? round2(t.spend / t.results) : 0;
  t.ctr = t.impressions > 0 ? round2((t.clicks / t.impressions) * 100) : 0;
  return t;
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function pctChange(curr: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

/** Busca todas as linhas (o PostgREST limita cada resposta a 1000). */
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>): Promise<T[]> {
  const out: T[] = [];
  const page = 1000;
  for (let from = 0; ; from += page) {
    const { data, error } = await build(from, from + page - 1);
    if (error) throw new Error(error.message);
    out.push(...(data || []));
    if (!data || data.length < page) break;
  }
  return out;
}

interface MetricRow {
  campaign_id: string;
  metric_date: string;
  cost: number | null;
  impressions: number | null;
  clicks: number | null;
  conversions: number | null;
  messaging_conversations?: number | null;
}

export async function getClientResults(supabaseArg?: SupabaseClient): Promise<ClientResultsResponse> {
  const supabase = supabaseArg ?? getUniversalClient();

  const end = localDate(new Date());
  const start = shift(end, -6);
  const previousEnd = shift(start, -1);
  const previousStart = shift(previousEnd, -6);

  const [companiesRes, metaAccRes, googleCustRes] = await Promise.all([
    // "*" para funcionar antes e depois da migração das metas (colunas novas ficam undefined).
    supabase.from("companies").select("*").eq("active", true),
    supabase.from("meta_ads_accounts").select("account_id, account_name, company_id, last_synced_at, active"),
    supabase.from("google_ads_customers").select("customer_id, descriptive_name, company_id, last_synced_at, active, manager"),
  ]);
  if (companiesRes.error) throw new Error(`companies: ${companiesRes.error.message}`);
  if (metaAccRes.error) throw new Error(`meta_ads_accounts: ${metaAccRes.error.message}`);
  if (googleCustRes.error) throw new Error(`google_ads_customers: ${googleCustRes.error.message}`);

  const metaAccounts = (metaAccRes.data || []).filter((a) => a.company_id && a.active !== false);
  const googleCustomers = (googleCustRes.data || []).filter((c) => c.company_id && c.active !== false && !c.manager);

  const metaAccIds = metaAccounts.map((a) => a.account_id);
  const googleCustIds = googleCustomers.map((c) => c.customer_id);

  const [metaCampaigns, googleCampaigns] = await Promise.all([
    metaAccIds.length
      ? fetchAll<{ id: string; account_id: string; campaign_name: string; status: string }>((f, t) =>
          supabase.from("meta_ads_campaigns").select("id, account_id, campaign_name, status").in("account_id", metaAccIds).range(f, t)
        )
      : Promise.resolve([]),
    googleCustIds.length
      ? fetchAll<{ id: string; customer_id: string; campaign_name: string; status: string }>((f, t) =>
          supabase.from("google_ads_campaigns").select("id, customer_id, campaign_name, status").in("customer_id", googleCustIds).range(f, t)
        )
      : Promise.resolve([]),
  ]);

  const metaCampIds = metaCampaigns.map((c) => c.id);
  const googleCampIds = googleCampaigns.map((c) => c.id);

  const chunk = <T,>(arr: T[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

  const loadMetrics = async (table: string, cols: string, ids: string[]): Promise<MetricRow[]> => {
    const rows: MetricRow[] = [];
    for (const part of chunk(ids, 150)) {
      rows.push(
        ...(await fetchAll<MetricRow>((f, t) =>
          supabase
            .from(table)
            .select(cols)
            .in("campaign_id", part)
            .gte("metric_date", previousStart)
            .lte("metric_date", end)
            .range(f, t) as unknown as PromiseLike<{ data: MetricRow[] | null; error: { message: string } | null }>
        ))
      );
    }
    return rows;
  };

  const [metaMetrics, googleMetrics] = await Promise.all([
    metaCampIds.length
      ? loadMetrics("meta_ads_daily_metrics", "campaign_id, metric_date, cost, impressions, clicks, conversions, messaging_conversations", metaCampIds)
      : Promise.resolve([]),
    googleCampIds.length
      ? loadMetrics("google_ads_daily_metrics", "campaign_id, metric_date, cost, impressions, clicks, conversions", googleCampIds)
      : Promise.resolve([]),
  ]);

  // Índices campanha → cliente
  const metaAccCompany = new Map(metaAccounts.map((a) => [a.account_id, a.company_id as string]));
  const googleCustCompany = new Map(googleCustomers.map((c) => [c.customer_id, c.company_id as string]));
  const campaignInfo = new Map<string, { companyId: string; platform: Platform; name: string; status: string }>();
  for (const c of metaCampaigns) {
    const companyId = metaAccCompany.get(c.account_id);
    if (companyId) campaignInfo.set(c.id, { companyId, platform: "meta-ads", name: c.campaign_name, status: c.status });
  }
  for (const c of googleCampaigns) {
    const companyId = googleCustCompany.get(c.customer_id);
    if (companyId) campaignInfo.set(c.id, { companyId, platform: "google-ads", name: c.campaign_name, status: c.status });
  }

  const days: string[] = [];
  for (let d = previousStart; d <= end; d = shift(d, 1)) days.push(d);

  const clients: ClientResult[] = [];
  for (const company of companiesRes.data || []) {
    const platforms = [
      ...metaAccounts
        .filter((a) => a.company_id === company.id)
        .map((a) => ({ platform: "meta-ads" as Platform, accountId: a.account_id, accountName: a.account_name, lastSyncedAt: a.last_synced_at })),
      ...googleCustomers
        .filter((c) => c.company_id === company.id)
        .map((c) => ({ platform: "google-ads" as Platform, accountId: c.customer_id, accountName: c.descriptive_name, lastSyncedAt: c.last_synced_at })),
    ];

    const current = emptyTotals();
    const spendByPlatform: Partial<Record<Platform, number>> = {};
    const previous = emptyTotals();
    const daily = new Map(days.map((d) => [d, { date: d, results: 0, spend: 0 }]));
    const perCampaign = new Map<string, CampaignSummary>();

    const add = (row: MetricRow, platform: Platform) => {
      const info = campaignInfo.get(row.campaign_id);
      if (!info || info.companyId !== company.id) return;
      const spend = Number(row.cost) || 0;
      const conv = Number(row.conversions) || 0;
      const msgs = platform === "meta-ads" ? Number(row.messaging_conversations) || 0 : 0;
      const target = row.metric_date >= start ? current : previous;
      target.spend += spend;
      if (row.metric_date >= start) spendByPlatform[platform] = (spendByPlatform[platform] || 0) + spend;
      target.impressions += Number(row.impressions) || 0;
      target.clicks += Number(row.clicks) || 0;
      target.conversions += conv;
      target.conversations += msgs;
      const day = daily.get(row.metric_date);
      if (day) {
        day.results += conv + msgs;
        day.spend += spend;
      }
      if (row.metric_date >= start) {
        const c = perCampaign.get(row.campaign_id) ?? {
          platform,
          name: info.name,
          status: info.status,
          spend: 0,
          results: 0,
          costPerResult: 0,
          clicks: 0,
          impressions: 0,
        };
        c.spend += spend;
        c.results += conv + msgs;
        c.clicks += Number(row.clicks) || 0;
        c.impressions += Number(row.impressions) || 0;
        perCampaign.set(row.campaign_id, c);
      }
    };
    for (const r of metaMetrics) add(r, "meta-ads");
    for (const r of googleMetrics) add(r, "google-ads");

    finish(current);
    finish(previous);

    const activeCampaigns = [...campaignInfo.values()].filter(
      (c) => c.companyId === company.id && (c.status === "ACTIVE" || c.status === "ENABLED")
    ).length;

    const topCampaigns = [...perCampaign.values()]
      .map((c) => ({ ...c, spend: round2(c.spend), costPerResult: c.results > 0 ? round2(c.spend / c.results) : 0 }))
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 6);

    const syncs = platforms.map((p) => p.lastSyncedAt).filter(Boolean) as string[];
    const lastSyncedAt = syncs.length ? syncs.sort()[0] : null; // a conta mais desatualizada

    const result: ClientResult = {
      companyId: company.id,
      name: company.trade_name || company.name,
      goals: {
        objective: company.primary_objective ?? null,
        resultLabel: company.result_label ?? null,
        monthlyBudget: numOrNull(company.monthly_ad_budget),
        targetCostPerResult: numOrNull(company.target_cost_per_result),
        averageTicket: numOrNull(company.average_ticket),
      },
      platforms,
      current,
      previous,
      costPerResultChange: current.results > 0 && previous.results > 0 ? pctChange(current.costPerResult, previous.costPerResult) : null,
      resultsChange: pctChange(current.results, previous.results),
      spendChange: pctChange(current.spend, previous.spend),
      dailyResults: [...daily.values()].map((d) => ({ ...d, spend: round2(d.spend) })),
      activeCampaigns,
      topCampaigns,
      lastSyncedAt,
      signals: [],
      spendByPlatform,
    };
    result.signals = buildSignals(result);
    clients.push(result);
  }

  // Clientes com mídia primeiro, ordenados por investimento.
  clients.sort((a, b) => (b.platforms.length ? 1 : 0) - (a.platforms.length ? 1 : 0) || b.current.spend - a.current.spend);

  return {
    generatedAt: new Date().toISOString(),
    period: { start, end, previousStart, previousEnd },
    clients,
  };
}

/** Sinais objetivos calculados a partir dos números reais (sem IA). */
function buildSignals(c: ClientResult): ClientSignal[] {
  const s: ClientSignal[] = [];
  if (c.platforms.length === 0) {
    s.push({ level: "atencao", text: "Nenhuma conta de anúncios vinculada" });
    return s;
  }
  if (c.lastSyncedAt) {
    const hours = (Date.now() - new Date(c.lastSyncedAt).getTime()) / 36e5;
    if (hours > 36) s.push({ level: "atencao", text: `Dados sem atualizar há ${Math.round(hours / 24)} dia(s)` });
  } else {
    s.push({ level: "atencao", text: "Conta ainda não sincronizada" });
  }
  if (c.current.spend >= 50 && c.current.results === 0) {
    s.push({ level: "critico", text: "Investimento sem nenhum resultado na semana" });
  }
  const target = c.goals.targetCostPerResult;
  if (target && c.current.results > 0 && c.current.costPerResult > target * 1.2) {
    const over = Math.round((c.current.costPerResult / target - 1) * 100);
    s.push({ level: "critico", text: `Custo por resultado ${over}% acima da meta` });
  }
  if (c.goals.monthlyBudget && c.current.spend > 0) {
    const projected = (c.current.spend / 7) * 30;
    if (projected > c.goals.monthlyBudget * 1.15) {
      s.push({ level: "atencao", text: "Ritmo de gasto acima da verba mensal" });
    }
  }
  if (c.costPerResultChange !== null && c.costPerResultChange >= 25) {
    s.push({ level: "critico", text: `Custo por resultado subiu ${c.costPerResultChange.toLocaleString("pt-BR")}%` });
  }
  if (c.activeCampaigns > 0 && c.current.spend === 0) {
    s.push({ level: "atencao", text: "Campanhas ativas sem gasto nos últimos 7 dias" });
  }
  if (c.activeCampaigns === 0) {
    s.push({ level: "atencao", text: "Nenhuma campanha ativa" });
  }
  if (s.length === 0) s.push({ level: "ok", text: "Sem alertas" });
  return s;
}
