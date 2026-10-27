"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { ClientResult, ClientResultsResponse } from "@/lib/central/clientResults";
import { brl, int, shortDate, timeAgo } from "@/lib/format";
import { Panel, EmptyState, ErrorNote, Skeleton, Delta } from "./ui";

const PLATFORM_SHORT: Record<string, string> = { "meta-ads": "Meta", "google-ads": "Google" };

function Spark({ data }: { data: ClientResult["dailyResults"] }) {
  const max = Math.max(1, ...data.map((d) => d.results));
  return (
    <div className="flex items-end gap-[2px] h-6" aria-hidden>
      {data.map((d, i) => (
        <span
          key={d.date}
          title={`${shortDate(d.date)}: ${d.results} resultados · ${brl(d.spend)}`}
          className={`w-[5px] rounded-[1px] ${i >= data.length - 7 ? "bg-accent" : "bg-line-strong"}`}
          style={{ height: `${Math.max(8, (d.results / max) * 100)}%`, opacity: d.results === 0 ? 0.35 : 1 }}
        />
      ))}
    </div>
  );
}

/** Saldo disponível das contas Meta pré-pagas, quando a Meta informa. */
function MetaBalance({ client }: { client: ClientResult }) {
  const known = (client.metaHealth || []).filter((h) => !h.error && h.isPrepay && h.availableBalance !== null);
  if (!known.length) return null;
  const total = known.reduce((a, h) => a + (h.availableBalance || 0), 0);
  const low = known.some((h) => (h.availableBalance || 0) <= 1 || (h.daysOfBalance !== null && h.daysOfBalance < 3));
  return <span className={low ? "text-danger" : ""}>Saldo Meta {brl(total)}</span>;
}

function SignalText({ client }: { client: ClientResult }) {
  const top = client.signals.find((s) => s.level === "critico") ?? client.signals.find((s) => s.level === "atencao") ?? client.signals[0];
  if (!top) return null;
  const color = top.level === "critico" ? "text-danger" : top.level === "atencao" ? "text-warning" : "text-muted";
  const more = client.signals.filter((s) => s.level !== "ok").length - 1;
  return (
    <span className={`text-xs ${color}`} title={client.signals.map((s) => s.text).join("\n")}>
      {top.text}
      {more > 0 && <span className="text-subtle"> +{more}</span>}
    </span>
  );
}

export function ClientResultsPanel() {
  const [data, setData] = useState<ClientResultsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/central/resultados")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Erro ${res.status}`);
        if (!cancelled) setData(body);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : String(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const withMedia = data?.clients.filter((c) => c.platforms.length > 0) ?? [];
  const withoutMedia = data?.clients.filter((c) => c.platforms.length === 0) ?? [];
  const totals = withMedia.reduce(
    (acc, c) => ({ spend: acc.spend + c.current.spend, results: acc.results + c.current.results }),
    { spend: 0, results: 0 }
  );

  return (
    <Panel
      title="Resultados dos clientes"
      meta={data ? `${shortDate(data.period.start)} – ${shortDate(data.period.end)} · comparado aos 7 dias anteriores` : "últimos 7 dias"}
      action={
        <Link href="/clientes" className="text-xs text-muted hover:text-ink">
          Todos os clientes
        </Link>
      }
    >
      {error && <ErrorNote message={error} />}
      {!data && !error && <Skeleton rows={4} />}

      {data && withMedia.length === 0 && (
        <EmptyState
          title="Nenhum cliente com conta de anúncios vinculada"
          text="Vincule as contas do Meta Ads e do Google Ads aos clientes para ver os resultados aqui."
          action={
            <Link
              href="/integracoes"
              className="inline-flex items-center h-7 px-2.5 rounded-md text-xs bg-accent text-on-accent hover:bg-accent-hover font-semibold"
            >
              Abrir integrações
            </Link>
          }
        />
      )}

      {data && withMedia.length > 0 && (
        <>
          <div className="px-5 pb-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px]">
            <span className="text-muted">
              Investido <span className="font-mono font-semibold text-ink">{brl(totals.spend)}</span>
            </span>
            <span className="text-muted">
              Resultados <span className="font-mono font-semibold text-ink">{int(totals.results)}</span>
            </span>
            <span className="text-muted">
              Custo médio{" "}
              <span className="font-mono font-semibold text-ink">{totals.results ? brl(totals.spend / totals.results) : "—"}</span>
            </span>
          </div>

          {/* Tabela (telas médias e grandes) */}
          <div className="hidden md:block overflow-x-auto border-t border-line-soft">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-xs text-muted">
                  <th className="font-medium px-5 py-2.5">Cliente</th>
                  <th className="font-medium px-3 py-2.5 text-right">Investimento</th>
                  <th className="font-medium px-3 py-2.5 text-right">Resultados</th>
                  <th className="font-medium px-3 py-2.5 text-right">Custo/resultado</th>
                  <th className="font-medium px-3 py-2.5">14 dias</th>
                  <th className="font-medium px-5 py-2.5">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {withMedia.map((c) => (
                  <tr key={c.companyId} className="hover:bg-raised/50">
                    <td className="px-5 py-3 min-w-[210px]">
                      <Link href={`/clientes/${c.companyId}`} className="font-medium text-ink hover:text-accent">
                        {c.name}
                      </Link>
                      <div className="text-[11px] text-subtle mt-0.5 whitespace-nowrap">
                        {c.platforms.map((p) => PLATFORM_SHORT[p.platform]).join(" + ")} · atualizado {timeAgo(c.lastSyncedAt)}
                      </div>
                      <div className="text-[11px] text-subtle">
                        <MetaBalance client={c} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="font-mono text-ink">{brl(c.current.spend)}</div>
                      <div className="text-[11px]">
                        <Delta value={c.spendChange} neutral />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="font-mono text-ink">{int(c.current.results)}</div>
                      <div className="text-[11px]">
                        <Delta value={c.resultsChange} />
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="font-mono text-ink">{c.current.results ? brl(c.current.costPerResult) : "—"}</div>
                      <div className="text-[11px]">
                        <Delta value={c.costPerResultChange} inverse />
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Spark data={c.dailyResults} />
                    </td>
                    <td className="px-5 py-3 max-w-[220px]">
                      <SignalText client={c} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lista (celular) */}
          <ul className="md:hidden divide-y divide-line-soft border-t border-line-soft">
            {withMedia.map((c) => (
              <li key={c.companyId} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/clientes/${c.companyId}`} className="font-medium text-ink">
                    {c.name}
                  </Link>
                  <Spark data={c.dailyResults} />
                </div>
                <div className="text-[11px] text-subtle">
                  <MetaBalance client={c} />
                </div>
                <div className="mt-1.5 grid grid-cols-3 gap-2 text-[12px]">
                  <div>
                    <div className="text-subtle">Investido</div>
                    <div className="font-mono text-ink">{brl(c.current.spend)}</div>
                  </div>
                  <div>
                    <div className="text-subtle">Resultados</div>
                    <div className="font-mono text-ink">
                      {int(c.current.results)} <Delta value={c.resultsChange} />
                    </div>
                  </div>
                  <div>
                    <div className="text-subtle">Custo/res.</div>
                    <div className="font-mono text-ink">{c.current.results ? brl(c.current.costPerResult) : "—"}</div>
                  </div>
                </div>
                <div className="mt-1.5">
                  <SignalText client={c} />
                </div>
              </li>
            ))}
          </ul>

          {withoutMedia.length > 0 && (
            <p className="px-5 py-3 border-t border-line-soft text-xs text-muted">
              Sem conta de anúncios vinculada: {withoutMedia.map((c) => c.name).join(", ")}.{" "}
              <Link href="/integracoes" className="text-accent hover:underline">
                Vincular
              </Link>
            </p>
          )}
        </>
      )}
    </Panel>
  );
}
