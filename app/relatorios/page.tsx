"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { weeklyReportRepository } from "@/lib/repositories/weeklyReportRepository";
import type { WeeklyReport } from "@/lib/reports/weeklyReport";
import { brl } from "@/lib/format";
import { Panel, SmallButton, ErrorNote, Skeleton, EmptyState, Delta } from "@/components/central/ui";

function rangeLabel(start: string, end: string) {
  const f = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" });
  return `${f(start)} a ${f(end)}`;
}

function whatsappText(r: WeeklyReport, link: string) {
  return `Oi! Segue o relatório da semana de ${rangeLabel(r.weekStart, r.weekEnd)} da ${r.clientName}:\n${link}\n\n${r.summary}`;
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

  useEffect(() => {
    load();
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
            Um relatório por cliente, gerado toda segunda às 6h com os números da semana anterior. O cliente abre pelo link, sem login.
          </p>
        </div>
        <SmallButton variant="primary" onClick={() => generate({}, "all")} disabled={!!busy || !!error}>
          {busy === "all" ? "Gerando… (até 1 min)" : "Gerar da última semana"}
        </SmallButton>
      </div>

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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium text-ink">{r.clientName}</span>
                        <span className={`text-[11px] px-1.5 py-0.5 rounded ${r.status === "Enviado" ? "bg-accent/10 text-accent" : "bg-raised text-muted"}`}>
                          {r.status}
                        </span>
                      </div>
                      <div className="text-[12px] text-muted mt-0.5 flex flex-wrap gap-x-4">
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
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      <a
                        href={`/r/${r.shareToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center h-7 px-2.5 rounded-md text-xs border border-line text-body hover:text-ink bg-surface"
                      >
                        Abrir
                      </a>
                      <SmallButton onClick={() => copy(whatsappText(r, link), "Mensagem para WhatsApp")}>Copiar mensagem</SmallButton>
                      <SmallButton onClick={() => copy(link, "Link")}>Copiar link</SmallButton>
                      {r.status !== "Enviado" && <SmallButton onClick={() => markSent(r)}>Marcar enviado</SmallButton>}
                      <SmallButton
                        onClick={() => generate({ companyId: r.companyId, weekEnd: r.weekEnd }, r.id)}
                        disabled={!!busy}
                        title="Gera o texto e os números de novo"
                      >
                        {busy === r.id ? "Refazendo…" : "Refazer"}
                      </SmallButton>
                    </div>
                  </div>
                  <p className="text-[13px] text-body leading-relaxed max-w-[90ch]">{r.summary}</p>
                </li>
              );
            })}
          </ul>
        </Panel>
      ))}
    </main>
  );
}
