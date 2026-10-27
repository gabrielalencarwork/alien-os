"use client";

import React, { useEffect, useState } from "react";
import type { ClientGoals, ClientResult } from "@/lib/central/clientResults";
import { clientGoalsRepository, RESULT_LABELS } from "@/lib/repositories/clientGoalsRepository";
import { brl, int, timeAgo } from "@/lib/format";
import { Panel, SmallButton, ErrorNote, Field, fieldClass, Skeleton, Delta } from "@/components/central/ui";

function parseMoney(v: string): number | null {
  const n = Number(v.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function moneyInput(n: number | null) {
  return n ? n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";
}

/** Ficha do cliente (metas) + resultados reais dos últimos 7 dias comparados às metas. */
export function ClientGoalsCard({ companyId }: { companyId: string }) {
  const [goals, setGoals] = useState<ClientGoals | null>(null);
  const [form, setForm] = useState({ objective: "", resultLabel: "", monthlyBudget: "", targetCostPerResult: "", averageTicket: "" });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [result, setResult] = useState<ClientResult | null | undefined>(undefined);
  const [resultError, setResultError] = useState<string | null>(null);

  useEffect(() => {
    clientGoalsRepository.get(companyId).then(({ goals: g, error }) => {
      setLoadError(error);
      if (g) {
        setGoals(g);
        setForm({
          objective: g.objective ?? "",
          resultLabel: g.resultLabel ?? "",
          monthlyBudget: moneyInput(g.monthlyBudget),
          targetCostPerResult: moneyInput(g.targetCostPerResult),
          averageTicket: moneyInput(g.averageTicket),
        });
      }
    });
    fetch("/api/central/resultados")
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Erro ${res.status}`);
        setResult((body.clients as ClientResult[]).find((c) => c.companyId === companyId) ?? null);
      })
      .catch((err) => setResultError(err instanceof Error ? err.message : String(err)));
  }, [companyId]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    const next: ClientGoals = {
      objective: form.objective,
      resultLabel: form.resultLabel || null,
      monthlyBudget: parseMoney(form.monthlyBudget),
      targetCostPerResult: parseMoney(form.targetCostPerResult),
      averageTicket: parseMoney(form.averageTicket),
    };
    try {
      await clientGoalsRepository.save(companyId, next);
      setGoals(next);
      setSavedAt(new Date().toISOString());
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const target = goals?.targetCostPerResult ?? null;
  const projected = result ? (result.current.spend / 7) * 30 : 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      <Panel
        title="Ficha do cliente"
        meta="A Alien Max compara os resultados com estas metas"
      >
        {loadError && <ErrorNote message={loadError} />}
        <form onSubmit={save} className="px-5 pb-5 space-y-3">
          <Field label="Objetivo principal">
            <textarea
              value={form.objective}
              onChange={set("objective")}
              rows={2}
              placeholder="Ex.: encher a pousada na baixa temporada com reservas diretas"
              className={`${fieldClass} h-auto py-2`}
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Resultado que importa">
              <select value={form.resultLabel} onChange={set("resultLabel")} className={fieldClass}>
                <option value="">—</option>
                {RESULT_LABELS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Verba mensal de anúncios (R$)">
              <input inputMode="decimal" value={form.monthlyBudget} onChange={set("monthlyBudget")} placeholder="1.500,00" className={fieldClass} />
            </Field>
            <Field label="Custo por resultado aceitável (R$)">
              <input inputMode="decimal" value={form.targetCostPerResult} onChange={set("targetCostPerResult")} placeholder="15,00" className={fieldClass} />
            </Field>
            <Field label="Ticket médio do cliente (R$)">
              <input inputMode="decimal" value={form.averageTicket} onChange={set("averageTicket")} placeholder="350,00" className={fieldClass} />
            </Field>
          </div>
          {saveError && <p className="text-xs text-danger [overflow-wrap:anywhere]">{saveError}</p>}
          <div className="flex items-center gap-3 pt-1">
            <SmallButton type="submit" variant="primary" disabled={saving || !!loadError}>
              {saving ? "Salvando…" : "Salvar ficha"}
            </SmallButton>
            {savedAt && <span className="text-xs text-muted">Salva {timeAgo(savedAt)}</span>}
          </div>
        </form>
      </Panel>

      <Panel title="Últimos 7 dias" meta="Meta Ads + Google Ads, comparado aos 7 dias anteriores">
        {resultError && <ErrorNote message={resultError} />}
        {result === undefined && !resultError ? (
          <Skeleton rows={2} />
        ) : !result || result.platforms.length === 0 ? (
          <p className="px-5 pb-5 text-[13px] text-muted">
            Nenhuma conta de anúncios vinculada a este cliente. Vincule em Integrações para ver os resultados aqui.
          </p>
        ) : (
          <div className="px-5 pb-5 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[11px] text-subtle">Investido</div>
                <div className="font-mono text-[17px] font-semibold text-ink">{brl(result.current.spend)}</div>
                <div className="text-[11px]">
                  <Delta value={result.spendChange} neutral />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">Resultados</div>
                <div className="font-mono text-[17px] font-semibold text-ink">{int(result.current.results)}</div>
                <div className="text-[11px]">
                  <Delta value={result.resultsChange} />
                </div>
              </div>
              <div>
                <div className="text-[11px] text-subtle">Custo/resultado</div>
                <div className="font-mono text-[17px] font-semibold text-ink">
                  {result.current.results ? brl(result.current.costPerResult) : "—"}
                </div>
                <div className="text-[11px]">
                  <Delta value={result.costPerResultChange} inverse />
                </div>
              </div>
            </div>
            <ul className="text-[13px] space-y-1.5">
              <li className="flex justify-between gap-3">
                <span className="text-muted">Meta de custo por resultado</span>
                <span className={`font-mono ${target && result.current.results && result.current.costPerResult > target * 1.2 ? "text-danger" : "text-ink"}`}>
                  {target ? brl(target) : "defina na ficha"}
                </span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-muted">Gasto projetado no mês (ritmo atual)</span>
                <span className="font-mono text-ink">
                  {brl(projected)}
                  {goals?.monthlyBudget ? <span className="text-subtle"> / {brl(goals.monthlyBudget)}</span> : null}
                </span>
              </li>
              {(result.metaHealth || []).map((h) => (
                <li key={h.accountId} className="flex justify-between gap-3">
                  <span className="text-muted">Saldo Meta · {h.accountName}</span>
                  <span className={`font-mono ${!h.error && h.isPrepay && (h.availableBalance ?? 1) <= 1 ? "text-danger" : "text-ink"}`}>
                    {h.error
                      ? "indisponível"
                      : h.isPrepay
                        ? `${h.availableBalance !== null ? brl(h.availableBalance) : "—"}${h.daysOfBalance !== null ? ` · ~${h.daysOfBalance.toLocaleString("pt-BR")} dias` : ""}`
                        : `pós-paga · ${h.statusLabel}`}
                  </span>
                </li>
              ))}
              <li className="flex justify-between gap-3">
                <span className="text-muted">Contas</span>
                <span className="text-ink text-right">
                  {result.platforms.map((p) => p.accountName).join(", ")}
                </span>
              </li>
            </ul>
            <p className="text-xs text-muted">
              {result.signals.filter((s) => s.level !== "ok").map((s) => s.text).join(" · ") || "Sem alertas nesta semana."}
            </p>
          </div>
        )}
      </Panel>
    </div>
  );
}
