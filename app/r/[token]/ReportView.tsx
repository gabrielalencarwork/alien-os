import type { WeeklyReport } from "@/lib/reports/weeklyReport";
import { AlienLogoIcon } from "@/components/icons";
import { Delta } from "@/components/central/ui";
import { PrintButton } from "./PrintButton";


function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Comparação com a semana anterior. Variações enormes (base quase zero) mostram só o valor anterior. */
function Compare({ change, before, inverse, neutral, extra }: { change: number | null; before: string; inverse?: boolean; neutral?: boolean; extra?: string }) {
  const showPct = change !== null && Math.abs(change) <= 300;
  return (
    <div className="text-xs mt-1 flex flex-wrap gap-x-2">
      {showPct && <Delta value={change} inverse={inverse} neutral={neutral} />}
      <span className="text-subtle">semana anterior: {before}</span>
      {extra && <span className="text-subtle">· {extra}</span>}
    </div>
  );
}

function dayLabel(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  return d.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "UTC" }).replace(".", "");
}

function rangeLabel(start: string, end: string) {
  const s = new Date(`${start}T12:00:00Z`);
  const e = new Date(`${end}T12:00:00Z`);
  const sameMonth = s.getUTCMonth() === e.getUTCMonth();
  const fmt = (d: Date, withMonth: boolean) =>
    d.toLocaleDateString("pt-BR", { day: "numeric", ...(withMonth ? { month: "long" } : {}), timeZone: "UTC" });
  return `${fmt(s, !sameMonth)} a ${fmt(e, true)} de ${e.getUTCFullYear()}`;
}

/** Corpo do relatório semanal (usado pela página pública /r/<token>). */
export function ReportView({ report }: { report: WeeklyReport }) {
  const m = report.metrics;
  const resultLabel = m.goals?.resultLabel || "Resultados";
  const target = m.goals?.targetCostPerResult ?? null;
  const maxDay = Math.max(1, ...m.daily.map((d) => d.results));

  return (
    <main className="max-w-[760px] mx-auto px-5 sm:px-8 py-8 sm:py-12 space-y-10 print:py-4 print:space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <AlienLogoIcon className="w-8 h-8" />
          <div className="leading-tight">
            <div className="font-display text-[17px] font-bold text-ink">Alien</div>
            <div className="text-[11px] text-muted">Marketing Inteligente</div>
          </div>
        </div>
        <PrintButton />
      </header>

      <section className="space-y-3">
        <p className="text-[13px] text-muted">Relatório semanal · {rangeLabel(report.weekStart, report.weekEnd)}</p>
        <h1 className="font-display text-[34px] sm:text-[40px] font-bold text-ink leading-[1.05]">{report.clientName}</h1>
        <p className="text-[17px] text-body leading-relaxed max-w-[62ch]">{report.summary}</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-line bg-line">
        <div className="bg-surface p-5">
          <div className="text-xs text-muted">Investimento</div>
          <div className="font-mono text-[26px] font-semibold text-ink mt-1">{brl(m.current.spend)}</div>
          <Compare change={m.spendChange} before={brl(m.previous.spend)} neutral />
        </div>
        <div className="bg-surface p-5">
          <div className="text-xs text-muted">{resultLabel}</div>
          <div className="font-mono text-[26px] font-semibold text-ink mt-1">{m.current.results.toLocaleString("pt-BR")}</div>
          <Compare change={m.resultsChange} before={m.previous.results.toLocaleString("pt-BR")} />
        </div>
        <div className="bg-surface p-5">
          <div className="text-xs text-muted">Custo por resultado</div>
          <div className="font-mono text-[26px] font-semibold text-ink mt-1">
            {m.current.results ? brl(m.current.costPerResult) : "—"}
          </div>
          <Compare
            change={m.costPerResultChange}
            before={m.previous.results ? brl(m.previous.costPerResult) : "—"}
            inverse
            extra={target ? `meta ${brl(target)}` : undefined}
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[19px] font-bold text-ink">Dia a dia</h2>
        <div className="flex items-end gap-2 h-36 border-b border-line pb-px">
          {m.daily.map((d) => (
            <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
              <span className="text-[11px] font-mono text-body">{d.results}</span>
              <div
                className="w-full max-w-[44px] rounded-t-md bg-accent"
                style={{ height: `${Math.max(3, (d.results / maxDay) * 100)}%`, opacity: d.results ? 1 : 0.25 }}
                title={`${d.results} resultados · ${brl(d.spend)}`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {m.daily.map((d) => (
            <div key={d.date} className="flex-1 text-center">
              <div className="text-[11px] text-muted capitalize">{dayLabel(d.date)}</div>
              <div className="text-[10.5px] text-subtle font-mono">{brl(d.spend)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div className="space-y-3">
          <h2 className="font-display text-[19px] font-bold text-ink">Destaques da semana</h2>
          <ul className="space-y-2.5">
            {report.highlights.map((h, i) => (
              <li key={i} className="text-[14px] text-body leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-[9px] w-1.5 h-1.5 rounded-full bg-accent" aria-hidden />
                {h}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-[19px] font-bold text-ink">Próximos passos</h2>
          <ol className="space-y-2.5">
            {report.nextSteps.map((s, i) => (
              <li key={i} className="text-[14px] text-body leading-relaxed flex gap-3">
                <span className="font-mono text-xs text-accent mt-[3px]">{i + 1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {m.topCampaigns.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-[19px] font-bold text-ink">Campanhas</h2>
          <ul className="sm:hidden rounded-xl border border-line divide-y divide-line-soft">
            {m.topCampaigns.map((c) => (
              <li key={c.name} className="px-4 py-3 text-[13px]">
                <div className="text-ink break-words">{c.name}</div>
                <div className="text-[12px] text-muted mt-0.5">
                  {c.platform === "meta-ads" ? "Meta Ads" : "Google Ads"} · {brl(c.spend)} · {c.results} resultados
                  {c.results ? ` · ${brl(c.costPerResult)} cada` : ""}
                </div>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-line">
                  <th className="font-medium px-4 py-2.5">Campanha</th>
                  <th className="font-medium px-4 py-2.5 text-right">Investimento</th>
                  <th className="font-medium px-4 py-2.5 text-right">Resultados</th>
                  <th className="font-medium px-4 py-2.5 text-right">Custo por resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {m.topCampaigns.map((c) => (
                  <tr key={c.name}>
                    <td className="px-4 py-2.5 text-ink">
                      {c.name}
                      <div className="text-[11px] text-subtle">{c.platform === "meta-ads" ? "Meta Ads" : "Google Ads"}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink">{brl(c.spend)}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink">{c.results}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink">{c.results ? brl(c.costPerResult) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="pt-6 border-t border-line text-xs text-muted space-y-1">
        <p>
          Dados de {m.platforms.join(" e ")} de {rangeLabel(report.weekStart, report.weekEnd)}, comparados com a semana anterior.
        </p>
        <p>Alien Marketing Inteligente · alienmkt.com.br</p>
      </footer>
    </main>
  );
}
