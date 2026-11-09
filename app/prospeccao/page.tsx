"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Panel, SmallButton, ErrorNote, Skeleton, EmptyState, fieldClass } from "@/components/central/ui";
import {
  prospeccaoRepository,
  OUTREACH_STATUSES,
  ACTIVE_OUTREACH,
  localDay,
  type OutreachStatus,
  type Target,
} from "@/lib/repositories/prospeccaoRepository";
import { addDays, shortDate, timeAgo, todayLocal } from "@/lib/format";
import { PhoneIcon, StarIcon } from "@/components/icons";

type Tab = "hoje" | "followup" | "conversas" | "todos";

const STATUS_STYLE: Record<OutreachStatus, string> = {
  "Não abordado": "bg-raised text-muted",
  "Mensagem enviada": "bg-sky-100 text-sky-800",
  Respondeu: "bg-amber-100 text-amber-800",
  "Aline qualificando": "bg-accent/10 text-accent",
  "Diagnóstico solicitado": "bg-accent/10 text-accent",
  "Passado ao Gabriel": "bg-violet-100 text-violet-800",
  Fechado: "bg-emerald-100 text-emerald-800",
  "Sem interesse": "bg-raised text-muted",
  "Não contatar": "bg-red-50 text-red-800",
};

const FOLLOWUP_AFTER_DAYS = 3;

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

function instagramHref(v: string) {
  const t = v.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://instagram.com/${t.replace(/^@/, "")}`;
}

function formatPhone(p: string) {
  const d = p.replace(/\D/g, "").replace(/^55/, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p;
}

/** CRM de prospecção ativa: a lista do dia, os follow-ups e as conversas em andamento. */
export default function ProspeccaoPage() {
  const [targets, setTargets] = useState<Target[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("hoje");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, { instagram: string; notes: string }>>({});

  const load = useCallback(async () => {
    const res = await prospeccaoRepository.list();
    setTargets(res.targets);
    setError(res.error);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const today = todayLocal();

  const groups = useMemo(() => {
    const all = targets || [];
    const hoje = all.filter((t) => t.status === "Não abordado" && t.scheduledDate && t.scheduledDate <= today);
    const followup = all.filter(
      (t) => t.status === "Mensagem enviada" && t.outreachAt && localDay(t.outreachAt) <= addDays(today, -FOLLOWUP_AFTER_DAYS)
    );
    const conversas = all.filter((t) => ACTIVE_OUTREACH.includes(t.status));
    const sentToday = all.filter((t) => t.outreachAt && localDay(t.outreachAt) === today).length;
    const plannedToday = all.filter((t) => t.scheduledDate === today).length;
    const counts = OUTREACH_STATUSES.map((s) => ({ status: s, n: all.filter((t) => t.status === s).length })).filter((c) => c.n);
    return { all, hoje, followup, conversas, sentToday, plannedToday, counts };
  }, [targets, today]);

  const shown = tab === "hoje" ? groups.hoje : tab === "followup" ? groups.followup : tab === "conversas" ? groups.conversas : groups.all;

  const changeStatus = async (t: Target, status: OutreachStatus) => {
    setBusy(t.id);
    setNotice(null);
    try {
      const at = await prospeccaoRepository.setStatus(t.id, status, !!t.outreachAt);
      setTargets((prev) =>
        (prev || []).map((x) => (x.id === t.id ? { ...x, status, outreachAt: status === "Não abordado" ? null : x.outreachAt || at } : x))
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const saveDetails = async (t: Target) => {
    const d = draft[t.id];
    if (!d) return;
    setBusy(t.id);
    setNotice(null);
    try {
      await prospeccaoRepository.saveDetails(t.id, d);
      setTargets((prev) => (prev || []).map((x) => (x.id === t.id ? { ...x, instagram: d.instagram.trim(), notes: d.notes.trim() } : x)));
      setOpen(null);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  };

  const tabs: { id: Tab; label: string; n: number }[] = [
    { id: "hoje", label: "Para enviar", n: groups.hoje.length },
    { id: "followup", label: "Follow-up", n: groups.followup.length },
    { id: "conversas", label: "Em conversa", n: groups.conversas.length },
    { id: "todos", label: "Todos", n: groups.all.length },
  ];

  const emptyText: Record<Tab, { title: string; text: string }> = {
    hoje: { title: "Nenhuma mensagem pendente para hoje.", text: "Os leads do dia aparecem aqui na data marcada. O que ficou para trás continua na lista até ser enviado." },
    followup: { title: "Nenhum follow-up por enquanto.", text: `Entram aqui os leads sem resposta há ${FOLLOWUP_AFTER_DAYS} dias ou mais. Mande no máximo uma retomada.` },
    conversas: { title: "Nenhuma conversa em andamento.", text: "Quando um lead responder, ele passa a aparecer aqui." },
    todos: { title: "A lista está vazia.", text: "Os 75 alvos entram quando a atualização do banco for aplicada." },
  };

  return (
    <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="font-display text-[28px] font-bold text-ink leading-tight">Prospecção</h1>
        <p className="text-[13px] text-muted mt-0.5 max-w-2xl leading-relaxed">
          Você manda a primeira mensagem pelo WhatsApp da agência; a Aline continua a conversa. Marque aqui o que foi enviado e como cada lead respondeu.
        </p>
      </div>

      <Panel
        title="Hoje"
        meta={
          groups.plannedToday
            ? `${groups.sentToday} de ${groups.plannedToday} mensagens enviadas`
            : `${groups.sentToday} mensagens enviadas hoje`
        }
      >
        <div className="px-5 pb-4">
          {groups.plannedToday > 0 && (
            <div className="h-2 rounded-full bg-raised overflow-hidden mb-3">
              <div className="h-full bg-accent" style={{ width: `${Math.min(100, (groups.sentToday / groups.plannedToday) * 100)}%` }} />
            </div>
          )}
          <p className="text-xs text-muted leading-relaxed">
            {groups.counts.length ? groups.counts.map((c) => `${c.status} ${c.n}`).join(" · ") : "Sem leads na lista ainda."}
          </p>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-1.5" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`h-8 px-3 rounded-lg text-[13px] transition-colors ${
              tab === t.id ? "bg-accent text-on-accent font-semibold" : "bg-surface border border-line text-body hover:text-ink"
            }`}
          >
            {t.label} <span className="opacity-70">{t.n}</span>
          </button>
        ))}
      </div>

      {error && <ErrorNote message={error} />}
      {notice && <ErrorNote message={notice} />}

      {targets === null && !error ? (
        <Skeleton rows={4} />
      ) : shown.length === 0 && !error ? (
        <div className="bg-surface border border-line rounded-2xl">
          <EmptyState title={emptyText[tab].title} text={emptyText[tab].text} />
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((t) => {
            const d = draft[t.id] ?? { instagram: t.instagram, notes: t.notes };
            const expanded = open === t.id;
            const ig = instagramHref(t.instagram);
            return (
              <li key={t.id} className="bg-surface border border-line rounded-2xl px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-[15px] font-bold text-ink leading-tight [overflow-wrap:anywhere]">{t.name}</h3>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                    </div>
                    <p className="text-xs text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{[t.specialty, t.city].filter(Boolean).join(" · ")}</span>
                      {t.rating != null && (
                        <span className="inline-flex items-center gap-1">
                          <StarIcon className="w-3 h-3" />
                          {t.rating.toFixed(1).replace(".", ",")}
                          {t.reviews != null ? ` (${t.reviews})` : ""}
                        </span>
                      )}
                      <span>{formatPhone(t.phone)}</span>
                      {t.scheduledDate && <span>Dia {shortDate(t.scheduledDate)}</span>}
                      {t.outreachAt && <span>Enviada {timeAgo(t.outreachAt)}</span>}
                    </p>
                    {!t.whatsappConfirmed && (
                      <p className="text-xs text-amber-800 mt-1">Telefone fixo: confirme se tem WhatsApp antes de enviar.</p>
                    )}
                    {t.angle && <p className="text-[13px] text-body mt-2 leading-relaxed">Ângulo: {t.angle}</p>}
                    {t.notes && !expanded && <p className="text-xs text-muted mt-1.5 whitespace-pre-line">{t.notes}</p>}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                    <a
                      href={waLink(t.phone)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-xs border border-line text-body hover:text-ink hover:border-line-strong bg-surface"
                    >
                      <PhoneIcon className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    {ig && (
                      <a
                        href={ig}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center h-7 px-2.5 rounded-md text-xs border border-line text-body hover:text-ink hover:border-line-strong bg-surface"
                      >
                        Instagram
                      </a>
                    )}
                    {t.status === "Não abordado" && (
                      <SmallButton variant="primary" disabled={busy === t.id} onClick={() => changeStatus(t, "Mensagem enviada")}>
                        Marcar como enviada
                      </SmallButton>
                    )}
                    {t.status === "Mensagem enviada" && tab === "followup" && (
                      <SmallButton variant="outline" disabled={busy === t.id} onClick={() => changeStatus(t, "Sem interesse")}>
                        Encerrar
                      </SmallButton>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Status de ${t.name}`}
                    value={t.status}
                    disabled={busy === t.id}
                    onChange={(e) => changeStatus(t, e.target.value as OutreachStatus)}
                    className={`${fieldClass} !h-8 !w-auto text-xs`}
                  >
                    {OUTREACH_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <SmallButton
                    onClick={() => {
                      setOpen(expanded ? null : t.id);
                      setDraft((p) => ({ ...p, [t.id]: p[t.id] ?? { instagram: t.instagram, notes: t.notes } }));
                    }}
                  >
                    {expanded ? "Fechar" : "Instagram e observações"}
                  </SmallButton>
                </div>

                {expanded && (
                  <div className="mt-3 grid gap-2">
                    <input
                      className={fieldClass}
                      placeholder="Instagram (@usuário ou link)"
                      value={d.instagram}
                      onChange={(e) => setDraft((p) => ({ ...p, [t.id]: { ...d, instagram: e.target.value } }))}
                    />
                    <textarea
                      className={`${fieldClass} min-h-20`}
                      placeholder="Observações sobre a conversa"
                      value={d.notes}
                      onChange={(e) => setDraft((p) => ({ ...p, [t.id]: { ...d, notes: e.target.value } }))}
                    />
                    <div>
                      <SmallButton variant="primary" disabled={busy === t.id} onClick={() => saveDetails(t)}>
                        Salvar
                      </SmallButton>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
