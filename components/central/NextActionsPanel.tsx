"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  alienMaxInsightsRepository,
  type NextAction,
  type SweepRun,
  type InsightPriority,
} from "@/lib/repositories/alienMaxInsightsRepository";
import { clockTime, timeAgo, todayLocal } from "@/lib/format";
import { Panel, SmallButton, EmptyState, ErrorNote, Skeleton } from "./ui";
import { ChevronRightIcon, RefreshCwIcon } from "@/components/icons";

const PRIORITY_STYLE: Record<InsightPriority, { bar: string; label: string }> = {
  Crítica: { bar: "bg-danger", label: "text-danger" },
  Alta: { bar: "bg-warning", label: "text-warning" },
  Média: { bar: "bg-accent", label: "text-accent" },
  Baixa: { bar: "bg-line-strong", label: "text-muted" },
};

const PLATFORM_LABEL: Record<string, string> = {
  "meta-ads": "Meta Ads",
  "google-ads": "Google Ads",
  ga4: "GA4",
  geral: "Geral",
};

const VISIBLE = 6;

export function NextActionsPanel({ onActionsChanged }: { onActionsChanged?: () => void }) {
  const [actions, setActions] = useState<NextAction[]>([]);
  const [lastRun, setLastRun] = useState<SweepRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<"manual" | "auto" | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [client, setClient] = useState<string>("todos");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const autoTried = useRef(false);

  const load = useCallback(async () => {
    const res = await alienMaxInsightsRepository.getPendingActions();
    setActions(res.actions);
    setLastRun(res.lastRun);
    setError(res.error);
    setLoading(false);
    return res;
  }, []);

  const runSweep = useCallback(
    async (trigger: "manual" | "auto") => {
      setRunning(trigger);
      setRunMessage(null);
      try {
        const res = await fetch("/api/alien-max/varredura", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trigger }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok && !data.runId) throw new Error(data.error || `Erro ${res.status}`);
        if (data.skipped) {
          if (trigger === "manual") setRunMessage(data.reason);
        } else {
          const problems = [
            ...(data.syncErrors || []).map((e: { source: string; error: string }) => `${e.source}: ${e.error}`),
            ...(data.analysisErrors || []).map((e: { client: string; error: string }) => `${e.client}: ${e.error}`),
          ];
          if (problems.length) setRunMessage(`Análise concluída com avisos — ${problems.join(" · ")}`);
        }
        await load();
      } catch (err) {
        setRunMessage(`A análise falhou: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setRunning(null);
      }
    },
    [load]
  );

  useEffect(() => {
    load().then((res) => {
      // Mantém as ações frescas: se a última análise tiver mais de 6 h, roda outra em segundo plano.
      if (autoTried.current || res.error) return;
      autoTried.current = true;
      const age = res.lastRun ? Date.now() - new Date(res.lastRun.startedAt).getTime() : Infinity;
      if (age > 6 * 36e5) runSweep("auto");
    });
  }, [load, runSweep]);

  const clients = useMemo(() => {
    const m = new Map<string, number>();
    actions.forEach((a) => m.set(a.clientName, (m.get(a.clientName) || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [actions]);

  const filtered = client === "todos" ? actions : actions.filter((a) => a.clientName === client);
  const visible = showAll ? filtered : filtered.slice(0, VISIBLE);

  const act = async (a: NextAction, kind: "done" | "dismiss" | "task") => {
    setBusyId(a.id);
    try {
      if (kind === "task") await alienMaxInsightsRepository.convertToTask(a, todayLocal());
      else await alienMaxInsightsRepository.setStatus(a.id, kind === "done" ? "APPLIED" : "DISMISSED");
      setActions((prev) => prev.filter((x) => x.id !== a.id));
      if (kind === "task") onActionsChanged?.();
    } catch (err) {
      setRunMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  const statusLine = (() => {
    if (running) return running === "manual" ? "Sincronizando contas e analisando… leva até 2 minutos" : "Atualizando a análise em segundo plano…";
    if (!lastRun) return "Ainda não analisou suas contas";
    const when = lastRun.finishedAt ?? lastRun.startedAt;
    const base = `Analisou ${lastRun.clientsAnalyzed} ${lastRun.clientsAnalyzed === 1 ? "cliente" : "clientes"} ${timeAgo(when)} (${clockTime(when)})`;
    return lastRun.status === "error" ? `Última análise falhou ${timeAgo(when)}` : base;
  })();

  return (
    <Panel
      hud
      title="Próximas ações"
      meta={
        <span className="inline-flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full bg-neon ${running ? "alien-pulse" : ""}`} aria-hidden />
          Alien Max · {statusLine}
        </span>
      }
      action={
        <SmallButton variant="outline" onClick={() => runSweep("manual")} disabled={!!running || !!error} title="Sincronizar as contas e gerar novas ações agora">
          <RefreshCwIcon className={`w-3.5 h-3.5 ${running ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Analisar agora</span>
        </SmallButton>
      }
    >
      {error && <ErrorNote message={error} />}
      {runMessage && <ErrorNote message={runMessage} />}
      {lastRun?.status === "error" && lastRun.errorMessage && !running && <ErrorNote message={lastRun.errorMessage} />}

      {loading ? (
        <Skeleton rows={4} />
      ) : error ? null : actions.length === 0 ? (
        <EmptyState
          title={lastRun ? "Nenhuma ação pendente" : "A Alien Max ainda não analisou suas contas"}
          text={
            lastRun
              ? "Tudo que ela sugeriu foi resolvido. A próxima análise automática roda todo dia às 6h — ou peça uma agora."
              : "Ela sincroniza Meta Ads, Google Ads e GA4 e devolve as próximas ações de cada cliente."
          }
          action={
            <SmallButton variant="primary" onClick={() => runSweep("manual")} disabled={!!running}>
              Analisar agora
            </SmallButton>
          }
        />
      ) : (
        <>
          {clients.length > 1 && (
            <div className="px-5 pb-3 flex gap-1.5 overflow-x-auto" role="tablist" aria-label="Filtrar por cliente">
              {[["todos", actions.length] as [string, number], ...clients].map(([name, count]) => (
                <button
                  key={name}
                  type="button"
                  role="tab"
                  aria-selected={client === name}
                  onClick={() => {
                    setClient(name);
                    setShowAll(false);
                  }}
                  className={`shrink-0 h-7 px-2.5 rounded-full text-xs border transition-colors ${
                    client === name ? "border-accent text-ink bg-accent/10" : "border-line text-muted hover:text-ink"
                  }`}
                >
                  {name === "todos" ? "Todos" : name} <span className="text-subtle">{count}</span>
                </button>
              ))}
            </div>
          )}

          <ul className="divide-y divide-line-soft border-t border-line-soft">
            {visible.map((a) => {
              const open = expanded === a.id;
              const style = PRIORITY_STYLE[a.priority];
              return (
                <li key={a.id} className="relative">
                  <span className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r ${style.bar}`} aria-hidden />
                  <div className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : a.id)}
                      aria-expanded={open}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center gap-2 text-[11px] text-muted">
                        <span className={`font-semibold ${style.label}`}>{a.priority}</span>
                        <span aria-hidden>·</span>
                        <span className="text-body">{a.clientName}</span>
                        <span aria-hidden>·</span>
                        <span>{PLATFORM_LABEL[a.platform]}</span>
                      </div>
                      <div className="mt-1 flex items-start justify-between gap-3">
                        <p className="text-[14px] font-medium text-ink leading-snug">{a.title}</p>
                        <ChevronRightIcon className={`w-4 h-4 mt-0.5 shrink-0 text-subtle group-hover:text-ink transition-transform ${open ? "rotate-90" : ""}`} />
                      </div>
                      {a.description && <p className="mt-1 text-[13px] text-muted leading-relaxed">{a.description}</p>}
                    </button>

                    {open && (
                      <div className="mt-3 space-y-2.5 text-[13px] leading-relaxed">
                        {a.recommendedAction && (
                          <div>
                            <div className="text-xs font-semibold text-body">Como fazer</div>
                            <p className="text-ink whitespace-pre-line">{a.recommendedAction}</p>
                          </div>
                        )}
                        {a.expectedResult && (
                          <div>
                            <div className="text-xs font-semibold text-body">Resultado esperado</div>
                            <p className="text-ink">{a.expectedResult}</p>
                          </div>
                        )}
                        {a.evidence && (
                          <p className="text-xs text-muted">
                            Base: {a.evidence} · confiança {a.confidence}%
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      <SmallButton variant="outline" onClick={() => act(a, "task")} disabled={busyId === a.id}>
                        Virar tarefa
                      </SmallButton>
                      <SmallButton onClick={() => act(a, "done")} disabled={busyId === a.id}>
                        Já fiz
                      </SmallButton>
                      <SmallButton onClick={() => act(a, "dismiss")} disabled={busyId === a.id}>
                        Dispensar
                      </SmallButton>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {filtered.length > VISIBLE && (
            <div className="px-5 py-3 border-t border-line-soft">
              <SmallButton onClick={() => setShowAll((v) => !v)}>
                {showAll ? "Mostrar menos" : `Ver todas (${filtered.length})`}
              </SmallButton>
            </div>
          )}
        </>
      )}
    </Panel>
  );
}
