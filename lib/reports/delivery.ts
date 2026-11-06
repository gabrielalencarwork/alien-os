/**
 * Envio dos relatórios semanais aos clientes.
 *
 * - Cliente que teve investimento na semana  → "relatorio": resumo + números + link do relatório completo.
 * - Cliente sem investimento na semana       → "lembrete": mensagem curta e educada avisando que os anúncios
 *   ficaram parados (e o motivo, quando a Meta informa: sem saldo / limite de gastos).
 *
 * E-mail sai pelo Resend (https://resend.com) — variáveis no Vercel:
 *   RESEND_API_KEY ....... chave da API
 *   REPORTS_FROM_EMAIL ... remetente, ex.: "Alien Marketing Inteligente <relatorios@alienmkt.com.br>"
 *   REPORTS_REPLY_TO ..... e-mail que recebe as respostas dos clientes e o resumo de cada envio
 *
 * WhatsApp: por enquanto é "1 clique" (link wa.me com o texto pronto), montado na tela Relatórios.
 * Uso de e-mail apenas no servidor.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { APP_URL, rangeLabel, type ReportKind } from "./messages";

export type { ReportKind } from "./messages";

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ---------------------------------------------------------------------------
// E-mail
// ---------------------------------------------------------------------------

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function layout(title: string, inner: string) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;background:#f3f5f4;font-family:Arial,Helvetica,sans-serif;color:#05070a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f4;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e0e6e2;border-radius:12px">
<tr><td style="padding:22px 28px;border-bottom:1px solid #ecf0ed"><span style="font-size:18px;font-weight:bold;color:#05070a">Alien</span><span style="font-size:18px;color:#00874f"> Marketing Inteligente</span></td></tr>
<tr><td style="padding:26px 28px 8px">${inner}</td></tr>
<tr><td style="padding:18px 28px 24px;font-size:12px;color:#65716b;border-top:1px solid #ecf0ed">Alien Marketing Inteligente · Montes Claros, MG<br>Responda este e-mail para falar com a nossa equipe.</td></tr>
</table></td></tr></table></body></html>`;
}

type EmailReport = {
  kind: ReportKind;
  clientName: string;
  weekStart: string;
  weekEnd: string;
  summary: string;
  highlights: string[];
  nextSteps: string[];
  shareToken: string;
  metrics: { current?: { spend: number; results: number; costPerResult: number }; goals?: { resultLabel?: string | null } };
};

export function renderEmail(r: EmailReport) {
  const period = rangeLabel(r.weekStart, r.weekEnd);
  if (r.kind === "lembrete") {
    return {
      subject: `${r.clientName}: seus anúncios ficaram parados na semana de ${period}`,
      text: r.summary,
      html: layout("Lembrete", `<p style="font-size:15px;line-height:1.6;margin:0 0 18px">${esc(r.summary)}</p>`),
    };
  }
  const link = `${APP_URL}/r/${r.shareToken}`;
  const c = r.metrics.current || { spend: 0, results: 0, costPerResult: 0 };
  const label = r.metrics.goals?.resultLabel || "Resultados";
  const kpi = (name: string, value: string) =>
    `<td style="padding:12px 10px;border:1px solid #e0e6e2;border-radius:8px;width:33%"><div style="font-size:11px;color:#65716b;text-transform:uppercase;letter-spacing:.04em">${esc(name)}</div><div style="font-size:20px;font-weight:bold;margin-top:4px">${esc(value)}</div></td>`;
  const list = (title: string, items: string[]) =>
    items.length
      ? `<p style="font-size:13px;font-weight:bold;margin:20px 0 6px">${esc(title)}</p><ul style="margin:0;padding-left:18px;font-size:14px;line-height:1.6;color:#3d4742">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
      : "";
  const inner = `<p style="font-size:13px;color:#65716b;margin:0 0 4px">Relatório semanal · ${period}</p>
<h1 style="font-size:22px;margin:0 0 14px">${esc(r.clientName)}</h1>
<p style="font-size:15px;line-height:1.6;margin:0 0 18px;color:#3d4742">${esc(r.summary)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="6" style="border-collapse:separate"><tr>
${kpi("Investido", brl(c.spend))}${kpi(label, String(c.results))}${kpi("Custo por resultado", c.results ? brl(c.costPerResult) : "—")}
</tr></table>
${list("Destaques da semana", r.highlights)}
${list("Próximos passos", r.nextSteps)}
<p style="margin:24px 0 8px"><a href="${link}" style="display:inline-block;background:#00874f;color:#ffffff;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 20px;border-radius:8px">Ver relatório completo</a></p>`;
  const text = `Relatório semanal · ${period}\n${r.clientName}\n\n${r.summary}\n\nInvestido: ${brl(c.spend)} · ${label}: ${c.results} · Custo por resultado: ${c.results ? brl(c.costPerResult) : "—"}\n${r.highlights.length ? `\nDestaques:\n- ${r.highlights.join("\n- ")}\n` : ""}${r.nextSteps.length ? `\nPróximos passos:\n- ${r.nextSteps.join("\n- ")}\n` : ""}\nRelatório completo: ${link}`;
  return { subject: `Relatório semanal ${r.clientName} · ${period}`, text, html: layout("Relatório semanal", inner) };
}

export function emailConfigured() {
  return !!process.env.RESEND_API_KEY;
}

export async function sendEmail(msg: { to: string; subject: string; html: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("E-mail não configurado: falta RESEND_API_KEY no Vercel.");
  const from = process.env.REPORTS_FROM_EMAIL || "Alien Marketing Inteligente <relatorios@alienmkt.com.br>";
  const replyTo = process.env.REPORTS_REPLY_TO;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, ...(replyTo ? { reply_to: replyTo } : {}) }),
  });
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };
  if (!res.ok) throw new Error(`Resend ${res.status}: ${body.message || body.name || "erro desconhecido"}`);
  return body.id || null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DeliveryRow = {
  id: string;
  week_start: string;
  week_end: string;
  metrics: EmailReport["metrics"] & { kind?: ReportKind };
  summary: string;
  highlights: string[];
  next_steps: string[];
  share_token: string;
  email_sent_at?: string | null;
  companies?: { name?: string; trade_name?: string; email?: string | null } | null;
};

export type DeliveryResult = { client: string; kind: ReportKind; status: "enviado" | "sem_email" | "erro" | "ja_enviado"; to?: string; error?: string };

const MIGRATION_HINT =
  "Faltam as colunas de envio. Rode supabase/migrations/20261106000037_envio_relatorios.sql no SQL Editor do Supabase.";

/**
 * Envia por e-mail os relatórios/lembretes de uma semana (ou só os ids informados).
 * onlyUnsent = true pula quem já recebeu (agendamento). Grava email_sent_at / email_error em cada relatório.
 */
export async function sendReportEmails(
  supabase: SupabaseClient,
  { weekStart, reportIds, onlyUnsent = true, notifyOwner = true }: { weekStart?: string; reportIds?: string[]; onlyUnsent?: boolean; notifyOwner?: boolean }
): Promise<{ configured: boolean; results: DeliveryResult[]; error?: string }> {
  if (!emailConfigured()) return { configured: false, results: [], error: "E-mail não configurado: falta RESEND_API_KEY no Vercel." };

  let q = supabase.from("weekly_reports").select("id, week_start, week_end, metrics, summary, highlights, next_steps, share_token, email_sent_at, companies(name, trade_name, email)");
  if (reportIds?.length) q = q.in("id", reportIds);
  else if (weekStart) q = q.eq("week_start", weekStart);
  else return { configured: true, results: [], error: "Informe a semana ou os relatórios." };
  const { data, error } = await q;
  if (error) return { configured: true, results: [], error: /email_sent_at|column/i.test(error.message) ? MIGRATION_HINT : error.message };

  const results: DeliveryResult[] = [];
  for (const row of (data || []) as unknown as DeliveryRow[]) {
    const client = row.companies?.trade_name || row.companies?.name || "Cliente";
    const kind: ReportKind = row.metrics?.kind === "lembrete" ? "lembrete" : "relatorio";
    if (onlyUnsent && row.email_sent_at) {
      results.push({ client, kind, status: "ja_enviado" });
      continue;
    }
    const to = (row.companies?.email || "").trim();
    if (!EMAIL_RE.test(to)) {
      results.push({ client, kind, status: "sem_email" });
      continue;
    }
    const mail = renderEmail({
      kind,
      clientName: client,
      weekStart: row.week_start,
      weekEnd: row.week_end,
      summary: row.summary,
      highlights: Array.isArray(row.highlights) ? row.highlights : [],
      nextSteps: Array.isArray(row.next_steps) ? row.next_steps : [],
      shareToken: row.share_token,
      metrics: row.metrics || {},
    });
    try {
      await sendEmail({ to, ...mail });
      await supabase
        .from("weekly_reports")
        .update({ email_to: to, email_sent_at: new Date().toISOString(), email_error: null, updated_at: new Date().toISOString() })
        .eq("id", row.id);
      results.push({ client, kind, status: "enviado", to });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await supabase.from("weekly_reports").update({ email_to: to, email_error: message, updated_at: new Date().toISOString() }).eq("id", row.id);
      results.push({ client, kind, status: "erro", to, error: message });
    }
  }

  const owner = process.env.REPORTS_REPLY_TO;
  const acted = results.filter((r) => r.status !== "ja_enviado");
  if (notifyOwner && owner && EMAIL_RE.test(owner) && acted.length) {
    const line = (r: DeliveryResult) =>
      `${r.client} (${r.kind === "lembrete" ? "lembrete: sem anúncios na semana" : "relatório"}): ${
        r.status === "enviado" ? `enviado para ${r.to}` : r.status === "sem_email" ? "sem e-mail cadastrado — envie pelo WhatsApp na tela Relatórios" : `ERRO — ${r.error}`
      }`;
    const lines = acted.map(line);
    try {
      await sendEmail({
        to: owner,
        subject: `Relatórios da semana: ${acted.filter((r) => r.status === "enviado").length} de ${acted.length} enviados por e-mail`,
        text: `${lines.join("\n")}\n\nVer e enviar pelo WhatsApp: ${APP_URL}/relatorios`,
        html: layout(
          "Resumo do envio",
          `<p style="font-size:15px;margin:0 0 12px">Resumo do envio dos relatórios da semana:</p><ul style="font-size:14px;line-height:1.7;padding-left:18px;margin:0 0 18px">${lines
            .map((l) => `<li>${esc(l)}</li>`)
            .join("")}</ul><p><a href="${APP_URL}/relatorios" style="color:#00874f;font-weight:bold">Abrir Relatórios no Alien OS</a></p>`
        ),
      });
    } catch {
      // O resumo é só um aviso; falha aqui não muda o status dos envios aos clientes.
    }
  }
  return { configured: true, results };
}

/**
 * E-mail de teste: envia um relatório (o mais recente, ou o informado) só para REPORTS_REPLY_TO,
 * com "[TESTE]" no assunto. Não grava nada no relatório e não envia ao cliente.
 */
export async function sendTestEmail(supabase: SupabaseClient, reportId?: string): Promise<{ to: string; client: string }> {
  const owner = (process.env.REPORTS_REPLY_TO || "").trim();
  if (!EMAIL_RE.test(owner)) throw new Error("Falta REPORTS_REPLY_TO no Vercel (o e-mail que recebe o teste).");
  let q = supabase
    .from("weekly_reports")
    .select("id, week_start, week_end, metrics, summary, highlights, next_steps, share_token, companies(name, trade_name, email)")
    .order("week_start", { ascending: false })
    .limit(1);
  if (reportId) q = q.eq("id", reportId);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const row = (data || [])[0] as unknown as DeliveryRow | undefined;
  if (!row) throw new Error("Nenhum relatório gerado ainda.");
  const client = row.companies?.trade_name || row.companies?.name || "Cliente";
  const mail = renderEmail({
    kind: row.metrics?.kind === "lembrete" ? "lembrete" : "relatorio",
    clientName: client,
    weekStart: row.week_start,
    weekEnd: row.week_end,
    summary: row.summary,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    nextSteps: Array.isArray(row.next_steps) ? row.next_steps : [],
    shareToken: row.share_token,
    metrics: row.metrics || {},
  });
  await sendEmail({ to: owner, ...mail, subject: `[TESTE] ${mail.subject}` });
  return { to: owner, client };
}

/** Aviso interno para a equipe (REPORTS_REPLY_TO). Não lança erro: avisos não podem travar o fluxo. */
export async function notifyTeam(subject: string, text: string, link?: string): Promise<boolean> {
  const owner = (process.env.REPORTS_REPLY_TO || "").trim();
  if (!emailConfigured() || !EMAIL_RE.test(owner)) return false;
  try {
    await sendEmail({
      to: owner,
      subject,
      text: link ? `${text}\n\n${link}` : text,
      html: layout(
        subject,
        `<p style="font-size:15px;line-height:1.6;margin:0 0 16px;white-space:pre-line">${esc(text)}</p>${
          link ? `<p><a href="${link}" style="color:#00874f;font-weight:bold">Abrir no Alien OS</a></p>` : ""
        }`
      ),
    });
    return true;
  } catch {
    return false;
  }
}
