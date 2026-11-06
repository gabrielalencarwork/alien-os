"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { weeklyReportRepository } from "@/lib/repositories/weeklyReportRepository";
import type { WeeklyReport } from "@/lib/reports/weeklyReport";
import { brl } from "@/lib/format";
import { whatsappLink, whatsappMessage } from "@/lib/reports/messages";
import { Panel, SmallButton, ErrorNote, Skeleton, EmptyState, Delta } from "@/components/central/ui";

function rangeLabel(start: string, end: string) {
  const f = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  return `${f(start)} a ${f(end)}`;
}

function sentDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
}

/** Relatórios semanais por cliente: gerados toda segunda pela Alien Max, prontos para enviar. */
export default function RelatoriosPage() {
  const [reports, setReports] = useState<WeeklyReport[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await weeklyReportRepository.list();
    setReports(res.reports);
    setError(res.error);
  }, []);

  const [emailOn, setEmailOn] = useState<boolean | null>(null);

  useEffect(() => {
    load();
    fetch("/api/relatorios/teste")
      .then((r) => r.json())
      .then((d) => setEmailOn(!!d.configured))
      .catch(() => setEmailOn(null));
  }, [load]);

  const weeks = useMemo(() => {
    const m = new Map<string, WeeklyReport[]>();
    (reports || []).forEach((r) => m.set(r.weekStart, [...(m.get(r.weekStart) || []), r]));
    return [...m.entries()];
  }, [reports]);

  const generate = async (opts: { companyId?: string; weekEnd?: string }, key: string) => {
    setBusy(key);
    setNotice(null);
    try {
      const res = await fetch("/api/relatorios/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opts),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok && !data.created?.length) throw new Error(data.error || data.errors?.map((e: { client: string; error: string }) => `${e.client}: ${e.error}`).join(" · ") || `Erro ${res.status}`);
      const errs = (data.errors || []).map((e: { client: string; error: string }) => `${e.client}: ${e.error}`);
      setNotice(
        `${data.created?.length || 0} relatório(s) gerado(s) para ${rangeLabel(data.weekStart, data.weekEnd)}.${errs.length ? ` Avisos: ${errs.join(" · ")}` : ""}`
      );
      await load();
    } catch (err) {
      setNotice(`Não foi possível gerar: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(`${what} copiado.`);
    } catch {
      setNotice("Não foi possível copiar. Selecione e copie manualmente.");
    }
  };

  const sendEmail = async (r: WeeklyReport) => {
    setBusy(`mail-${r.id}`);
    setNotice(null);
    try {
      const res = await fetch("/api/relatorios/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId: r.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      setNotice(`E-mail enviado para ${data.to}.`);
      await load();
    } catch (err) {
      setNotice(`E-mail não enviado: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  const sendTest = async () => {
    setBusy("test");
    setNotice(null);
    try {
      const res = await fetch("/api/relatorios/teste", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      setNotice(`E-mail de teste (relatório de ${data.client}) enviado para ${data.to}. Confira a caixa de entrada e o spam.`);
    } catch (err) {
      setNotice(`Teste não enviado: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setBusy(null);
    }
  };

  const openWhatsapp = (r: WeeklyReport) => {
    window.open(whatsappLink(r.clientPhone, whatsappMessage(r, origin)), "_blank", "noopener");
    if (r.status !== "Enviado") markSent(r);
  };

  const markSent = async (r: WeeklyReport) => {
    try {
      await weeklyReportRepository.markSent(r.id);
      setReports((prev) => (prev || []).map((x) => (x.id === r.id ? { ...x, status: "Enviado", sentAt: new Date().toISOString() } : x)));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink leading-tight">Relatórios</h1>
          <p className="text-[13px] text-muted mt-0.5">
            Toda segunda às 6h: relatório para quem teve anúncios rodando na semana e lembrete educado para quem ficou parado. O e-mail sai sozinho para quem tem e-mail cadastrado; o WhatsApp é com 1 clique.
          </p>
        </div>
        <div className="shrink-0 whitespace-nowrap flex gap-1.5">
          <SmallButton onClick={sendTest} disabled={!!busy || !!error} title="Envia o relatório mais recente só para o e-mail da Alien">
            {busy === "test" ? "Enviando teste…" : "Enviar e-mail de teste"}
          </SmallButton>
          <SmallButton variant="primary" onClick={() => generate({}, "all")} disabled={!!busy || !!error}>
            {busy === "all" ? "Gerando… (até 1 min)" : "Gerar da última semana"}
          </SmallButton>
        </div>
      </div>

      {emailOn === false && (
        <ErrorNote message="Envio automático por e-mail desligado: falta a variável RESEND_API_KEY no Vercel. O WhatsApp com 1 clique continua funcionando." />
      )}
      {error && <ErrorNote message={error} />}
      {notice && <ErrorNote message={notice} />}
      {reports === null && <Skeleton rows={3} />}

      {reports && !error && reports.length === 0 && (
        <Panel title="Nenhum relatório ainda">
          <EmptyState
            title="O primeiro sai na próxima segunda às 6h"
            text="Ou gere agora os relatórios da última semana encerrada (segunda a domingo)."
            action={
              <SmallButton variant="primary" onClick={() => generate({}, "all")} disabled={!!busy}>
                Gerar agora
              </SmallButton>
            }
          />
        </Panel>
      )}

      {weeks.map(([week, list]) => (
        <Panel key={week} title={`Semana de ${rangeLabel(list[0].weekStart, list[0].weekEnd)}`} meta={`${list.filter((r) => r.status === "Enviado").length} de ${list.length} enviados`}>
          <ul className="divide-y divide-line-soft border-t border-line-soft">
            {list.map((r) => {
              const link = `${origin}/r/${r.shareToken}`;
              const m = r.metrics;
              return (
                <li key={r.id} className="px-5 py-4 space-y-2">
                  <div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-medium text-ink">{r.clientName}</span>
                        {r.kind === "lembrete" && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800" title="Sem investimento na semana: vai um lembrete educado no lugar do relatório">
                            Lembrete · anúncios parados
                          </span>
                        )}
                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${r.status === "Enviado" ? "bg-accent/10 text-accent" : "bg-raised text-muted"}`}>
                          {r.status === "Enviado" ? "WhatsApp enviado" : "WhatsApp pendente"}
                        </span>
                        <span
                          className={`text-[11px] px-1.5 py-0.5 rounded ${
                            r.emailSentAt ? "bg-accent/10 text-accent" : r.emailError ? "bg-red-100 text-red-800" : "bg-raised text-muted"
                          }`}
                          title={r.emailError || r.emailTo || r.clientEmail || "Cadastre o e-mail em Clientes → Editar dados"}
                        >
                          {r.emailSentAt
                            ? `E-mail enviado ${sentDate(r.emailSentAt)}`
                            : r.emailError
                              ? "E-mail com erro"
                              : r.clientEmail
                                ? "E-mail pendente"
                                : "Sem e-mail cadastrado"}
                        </span>
                      </div>
                      {r.emailError && <div className="text-[12px] text-danger mt-0.5">E-mail: {r.emailError}</div>}
                      <div className={`text-[12px] text-muted mt-0.5 flex flex-wrap gap-x-4 ${r.kind === "lembrete" ? "hidden" : ""}`}>
                        <span>
                          Investido <span className="font-mono text-ink">{brl(m.current.spend)}</span>
                        </span>
                        <span>
                          Resultados <span className="font-mono text-ink">{m.current.results}</span> <Delta value={m.resultsChange} />
                        </span>
                        <span>
                          Custo/res. <span className="font-mono text-ink">{m.current.results ? brl(m.current.costPerResult) : "—"}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[13px] text-body leading-relaxed max-w-[90ch]">{r.summary}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <SmallButton variant="primary" onClick={() => openWhatsapp(r)} title={r.clientPhone ? `Abre a conversa com ${r.clientPhone}` : "Sem telefone cadastrado: o WhatsApp pede para escolher o contato"}>
                      Enviar no WhatsApp
                    </SmallButton>
                    <SmallButton
                      onClick={() => sendEmail(r)}
                      disabled={!!busy || !r.clientEmail}
                      title={r.clientEmail ? `Enviar para ${r.clientEmail}` : "Cadastre o e-mail em Clientes → Editar dados"}
                    >
                      {busy === `mail-${r.id}` ? "Enviando…" : r.emailSentAt ? "Reenviar e-mail" : "Enviar e-mail"}
                    </SmallButton>
                    {r.kind === "relatorio" && (
                      <a
                        href={`/r/${r.shareToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center h-7 px-2.5 rounded-md text-xs border border-line text-body hover:text-ink bg-surface"
                      >
                        Abrir
                      </a>
                    )}
                    <SmallButton onClick={() => copy(r.kind === "relatorio" ? whatsappMessage(r, origin) : r.summary, "Mensagem")}>Copiar mensagem</SmallButton>
                    {r.kind === "relatorio" && <SmallButton onClick={() => copy(link, "Link")}>Copiar link</SmallButton>}
                    {r.status !== "Enviado" && <SmallButton onClick={() => markSent(r)}>Marcar enviado</SmallButton>}
                    <SmallButton
                      onClick={() => generate({ companyId: r.companyId, weekEnd: r.weekEnd }, r.id)}
                      disabled={!!busy}
                      title="Gera o texto e os números de novo"
                    >
                      {busy === r.id ? "Refazendo…" : "Refazer"}
                    </SmallButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </main>
  );
}
