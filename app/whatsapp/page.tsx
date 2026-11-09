"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { whatsappRepository } from "@/lib/repositories/whatsappRepository";
import { CONTACT_MODES, formatPhone, insideServiceWindow, type ContactMode, type WaContact, type WaMessage } from "@/lib/whatsapp/types";
import { Panel, SmallButton, ErrorNote, Skeleton, EmptyState, fieldClass } from "@/components/central/ui";
import { timeAgo, clockTime } from "@/lib/format";

const MODE_STYLE: Record<ContactMode, string> = {
  Automático: "bg-accent/10 text-accent",
  "Com aprovação": "bg-amber-100 text-amber-800",
  Silencioso: "bg-raised text-muted",
};

function displayName(c: WaContact) {
  return c.name || c.profileName || formatPhone(c.waId);
}

/** Caixa de conversas do WhatsApp: o agente responde; a equipe acompanha, aprova e assume. */
export default function WhatsappPage() {
  const [contacts, setContacts] = useState<WaContact[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [setup, setSetup] = useState<{ configured: boolean; missing: string[] } | null>(null);
  const [filter, setFilter] = useState<"todos" | "atencao" | "clientes">("todos");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const endRef = useRef<HTMLDivElement>(null);

  const loadContacts = useCallback(async () => {
    const res = await whatsappRepository.listContacts();
    setContacts(res.contacts);
    setDrafts(res.drafts);
    setError(res.error);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    try {
      setMessages(await whatsappRepository.listMessages(id));
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  }, []);

  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c) setTimeout(() => setSelected(c), 0);
    loadContacts();
    whatsappRepository.getSettings().then((s) => setEnabled(s.enabled)).catch(() => setEnabled(null));
    fetch("/api/whatsapp/status").then((r) => r.json()).then(setSetup).catch(() => null);
    whatsappRepository.listClients().then(setClients).catch(() => null);
  }, [loadContacts]);

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      loadContacts();
      if (selected) loadMessages(selected);
    }, 5000);
    return () => clearInterval(t);
  }, [loadContacts, loadMessages, selected]);

  useEffect(() => {
    if (selected) loadMessages(selected);
  }, [selected, loadMessages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, selected]);

  const contact = useMemo(() => contacts?.find((c) => c.id === selected) || null, [contacts, selected]);
  const list = useMemo(() => {
    const all = contacts || [];
    if (filter === "atencao") return all.filter((c) => c.needsHuman || drafts[c.id]);
    if (filter === "clientes") return all.filter((c) => c.companyId);
    return all;
  }, [contacts, drafts, filter]);
  const attention = (contacts || []).filter((c) => c.needsHuman || drafts[c.id]).length;

  const toggleAgent = async () => {
    if (enabled === null) return;
    try {
      await whatsappRepository.saveSettings({ enabled: !enabled });
      setEnabled(!enabled);
      setNotice(!enabled ? "Agente ligado: ele responde os contatos em modo Automático." : "Agente desligado: nenhuma resposta automática sai.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const patchContact = async (patch: Parameters<typeof whatsappRepository.updateContact>[1]) => {
    if (!contact) return;
    try {
      await whatsappRepository.updateContact(contact.id, patch);
      await loadContacts();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    }
  };

  const post = async (url: string, body: unknown, key: string) => {
    setBusy(key);
    setNotice(null);
    try {
      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      if (selected) await loadMessages(selected);
      await loadContacts();
      return true;
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
      return false;
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    if (!contact || !text.trim()) return;
    if (await post("/api/whatsapp/enviar", { contactId: contact.id, text }, "send")) setText("");
  };

  const windowOpen = contact ? insideServiceWindow(contact.lastInboundAt) : false;

  return (
    <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink leading-tight">WhatsApp</h1>
          <p className="text-[13px] text-muted mt-0.5">
            O agente de vendas atende 24h. Você acompanha, aprova o que for &quot;Com aprovação&quot; e assume quando quiser.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/whatsapp/agente" className="inline-flex items-center h-8 px-3 rounded-md text-xs border border-line text-body hover:text-ink bg-surface">
            Base de conhecimento e teste
          </Link>
          <button
            type="button"
            onClick={toggleAgent}
            disabled={enabled === null}
            className={`inline-flex items-center gap-2 h-8 px-3 rounded-md text-xs font-semibold border ${
              enabled ? "bg-accent text-on-accent border-accent" : "bg-surface text-body border-line"
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${enabled ? "bg-on-accent alien-pulse" : "bg-subtle"}`} />
            {enabled === null ? "Agente…" : enabled ? "Agente ligado" : "Agente desligado"}
          </button>
        </div>
      </div>

      {setup && !setup.configured && (
        <ErrorNote message={`WhatsApp ainda não conectado. Falta no Vercel: ${setup.missing.join(", ")}. Enquanto isso, teste o agente em "Base de conhecimento e teste".`} />
      )}
      {error && <ErrorNote message={error} />}
      {notice && <ErrorNote message={notice} />}

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-[70vh]">
        <Panel
          title="Conversas"
          meta={attention ? `${attention} precisando de você` : contacts ? `${contacts.length} contatos` : ""}
          className={`${selected ? "hidden lg:block" : ""} overflow-hidden`}
        >
          <div className="px-5 pb-3 flex gap-1.5">
            {(["todos", "atencao", "clientes"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`h-7 px-2.5 rounded-md text-xs ${filter === f ? "bg-raised text-ink font-semibold" : "text-muted hover:text-ink"}`}
              >
                {f === "todos" ? "Todas" : f === "atencao" ? "Precisam de você" : "Clientes"}
              </button>
            ))}
          </div>
          {contacts === null && <Skeleton rows={5} />}
          {contacts && !error && list.length === 0 && (
            <EmptyState
              title={filter === "todos" ? "Nenhuma conversa ainda" : "Nada por aqui"}
              text={filter === "todos" ? "As conversas aparecem aqui assim que o número estiver conectado e alguém mandar mensagem." : "Nenhum contato neste filtro."}
            />
          )}
          <ul className="divide-y divide-line-soft border-t border-line-soft max-h-[70vh] overflow-y-auto">
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className={`w-full text-left px-5 py-3 hover:bg-raised/60 ${selected === c.id ? "bg-raised" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-medium text-ink truncate">{displayName(c)}</span>
                    <span className="text-[11px] text-subtle shrink-0">{c.lastMessageAt ? timeAgo(c.lastMessageAt) : ""}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${MODE_STYLE[c.mode]}`}>{c.mode}</span>
                    {(c.classification === "Cliente" || c.companyName) && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">Cliente</span>}
                    {c.needsHuman && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-800">Precisa de você</span>}
                    {!!drafts[c.id] && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">{drafts[c.id]} p/ aprovar</span>}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </Panel>

        <section className={`${selected ? "" : "hidden lg:flex"} bg-surface border border-line rounded-2xl flex flex-col min-h-[70vh]`}>
          {!contact ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState title="Selecione uma conversa" text="Aqui você vê o que o agente respondeu, aprova rascunhos e assume a conversa." />
            </div>
          ) : (
            <>
              <header className="px-5 py-3 border-b border-line-soft space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button type="button" onClick={() => setSelected(null)} className="lg:hidden text-xs text-muted mb-1">
                      ← Conversas
                    </button>
                    <div className="text-[15px] font-semibold text-ink truncate">{displayName(contact)}</div>
                    <div className="text-[12px] text-muted">
                      {formatPhone(contact.waId)}
                      {contact.companyName ? ` · Cliente: ${contact.companyName}` : contact.prospectId ? " · Lead no funil" : ""}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    <select
                      value={contact.classification}
                      onChange={(e) => patchContact({ classification: e.target.value as "Lead" | "Cliente" })}
                      className={`${fieldClass} h-8 w-auto text-xs`}
                      title="Cliente: a Aline fica em silêncio até você mudar o modo"
                    >
                      <option value="Lead">Lead</option>
                      <option value="Cliente">Cliente</option>
                    </select>
                    <select
                      value={contact.mode}
                      onChange={(e) => patchContact({ mode: e.target.value as ContactMode })}
                      className={`${fieldClass} h-8 w-auto text-xs`}
                      title="Como o agente trata este contato"
                    >
                      {CONTACT_MODES.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      value={contact.companyId || ""}
                      onChange={(e) => patchContact({ companyId: e.target.value || null })}
                      className={`${fieldClass} h-8 w-auto text-xs max-w-[180px]`}
                      title="Vincular a um cliente da Alien"
                    >
                      <option value="">Não é cliente</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {contact.needsHuman && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <span className="text-[12px] text-red-800">
                      <b>Precisa de você:</b> {contact.humanReason || "o agente pediu ajuda."} O agente está aguardando.
                    </span>
                    <SmallButton variant="outline" onClick={() => patchContact({ needsHuman: false })}>
                      Resolvido, agente pode seguir
                    </SmallButton>
                  </div>
                )}
                {contact.agentPausedUntil && new Date(contact.agentPausedUntil).getTime() > now && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-muted">
                    <span>Você respondeu: o agente volta às {clockTime(contact.agentPausedUntil)}.</span>
                    <SmallButton onClick={() => patchContact({ resumeAgent: true })}>Devolver ao agente agora</SmallButton>
                  </div>
                )}
                {contact.summary && <p className="text-[12px] text-body leading-relaxed">{contact.summary}</p>}
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2 max-h-[55vh]">
                {messages.length === 0 && <p className="text-[13px] text-muted">Sem mensagens.</p>}
                {messages.map((m) => {
                  const out = m.direction === "Saída";
                  const draft = m.status === "Rascunho";
                  return (
                    <div key={m.id} className={`flex ${out ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed whitespace-pre-wrap ${
                          draft
                            ? "border-2 border-dashed border-amber-400 bg-amber-50 text-ink"
                            : out
                              ? "bg-accent/15 text-ink"
                              : "bg-raised text-ink"
                        }`}
                      >
                        {draft ? (
                          <textarea
                            value={editing[m.id] ?? m.body}
                            onChange={(e) => setEditing({ ...editing, [m.id]: e.target.value })}
                            rows={Math.min(8, Math.max(2, Math.ceil((editing[m.id] ?? m.body).length / 50)))}
                            className="w-[min(60ch,70vw)] bg-transparent outline-none resize-none"
                          />
                        ) : (
                          m.body
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-subtle">
                          <span>
                            {m.author} · {clockTime(m.createdAt)}
                            {out && !draft ? ` · ${m.status}` : ""}
                          </span>
                          {m.error && <span className="text-danger">{m.error}</span>}
                        </div>
                        {draft && (
                          <div className="mt-1.5 flex gap-1.5">
                            <SmallButton
                              variant="primary"
                              disabled={!!busy}
                              onClick={() => post("/api/whatsapp/rascunho", { messageId: m.id, action: "aprovar", text: editing[m.id] }, m.id)}
                            >
                              {busy === m.id ? "Enviando…" : "Aprovar e enviar"}
                            </SmallButton>
                            <SmallButton disabled={!!busy} onClick={() => post("/api/whatsapp/rascunho", { messageId: m.id, action: "descartar" }, m.id)}>
                              Descartar
                            </SmallButton>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <footer className="border-t border-line-soft p-3 space-y-1.5">
                {!windowOpen && (
                  <p className="text-[11px] text-muted">
                    Mais de 24h desde a última mensagem do contato: pela regra da Meta, só modelos aprovados podem ser enviados agora.
                  </p>
                )}
                <div className="flex gap-2">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    rows={2}
                    placeholder="Responder como Gabriel (o agente pausa neste contato)…"
                    className={`${fieldClass} flex-1 resize-none`}
                    disabled={!windowOpen}
                  />
                  <SmallButton variant="primary" onClick={send} disabled={!windowOpen || !text.trim() || busy === "send"}>
                    {busy === "send" ? "Enviando…" : "Enviar"}
                  </SmallButton>
                </div>
              </footer>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
