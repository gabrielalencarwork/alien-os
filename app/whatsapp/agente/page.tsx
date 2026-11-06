"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { whatsappRepository } from "@/lib/repositories/whatsappRepository";
import type { AgentSettings } from "@/lib/whatsapp/types";
import { Panel, SmallButton, ErrorNote, Skeleton, Field, fieldClass } from "@/components/central/ui";

type Line = { author: "Cliente" | "Agente"; text: string };
type Decision = { mensagens: string[]; precisa_humano: boolean; motivo_humano?: string; resumo: string; lead?: Record<string, string> };

/** Base de conhecimento do agente + simulador para testar as respostas sem WhatsApp. */
export default function AgentePage() {
  const [settings, setSettings] = useState<AgentSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [chat, setChat] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [asClient, setAsClient] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [last, setLast] = useState<Decision | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    whatsappRepository
      .getSettings()
      .then(setSettings)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [chat.length, thinking]);

  const save = async () => {
    if (!settings) return;
    setSaving(true);
    setNotice(null);
    try {
      await whatsappRepository.saveSettings({ knowledge: settings.knowledge, instructions: settings.instructions, pauseMinutes: settings.pauseMinutes });
      setNotice("Salvo. O agente já usa a versão nova nas próximas respostas.");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const ask = async () => {
    const msg = input.trim();
    if (!msg || !settings) return;
    const history: Line[] = [...chat, { author: "Cliente", text: msg }];
    setChat(history);
    setInput("");
    setThinking(true);
    try {
      const res = await fetch("/api/whatsapp/simular", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, knowledge: settings.knowledge, instructions: settings.instructions, isClient: asClient ? "Cliente de teste" : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      setLast(data);
      setChat([...history, ...(data.mensagens as string[]).map((t) => ({ author: "Agente" as const, text: t }))]);
    } catch (err) {
      setNotice(`Teste falhou: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setThinking(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <Link href="/whatsapp" className="text-xs text-muted hover:text-ink">
            ← WhatsApp
          </Link>
          <h1 className="font-display text-[28px] font-bold text-ink leading-tight">Agente de vendas</h1>
          <p className="text-[13px] text-muted mt-0.5">
            Tudo que o agente sabe vem daqui. O que não estiver escrito, ele não inventa: chama você.
          </p>
        </div>
        <SmallButton variant="primary" onClick={save} disabled={!settings || saving}>
          {saving ? "Salvando…" : "Salvar"}
        </SmallButton>
      </div>

      {error && <ErrorNote message={error} />}
      {notice && <ErrorNote message={notice} />}
      {!settings && !error && <Skeleton rows={6} />}

      {settings && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_440px] gap-4">
          <div className="space-y-4">
            <Panel title="Base de conhecimento" meta="Serviços, preços ou faixas, prazos, como funciona, cases, perguntas frequentes, objeções e respostas.">
              <div className="px-5 pb-5">
                <textarea
                  value={settings.knowledge}
                  onChange={(e) => setSettings({ ...settings, knowledge: e.target.value })}
                  rows={22}
                  className={`${fieldClass} font-mono text-[12.5px] leading-relaxed`}
                  placeholder="Ex.: Gestão de tráfego (Meta e Google Ads): a partir de R$ ... por mês, sem contar a verba de anúncios..."
                />
              </div>
            </Panel>
            <Panel title="Jeito de falar e regras extras">
              <div className="px-5 pb-5 space-y-3">
                <textarea
                  value={settings.instructions}
                  onChange={(e) => setSettings({ ...settings, instructions: e.target.value })}
                  rows={6}
                  className={fieldClass}
                  placeholder="Ex.: Trate por 'você'. Sempre ofereça o diagnóstico gratuito. Nunca fale de concorrentes."
                />
                <Field label="Depois que você responde um contato, o agente espera (minutos)">
                  <input
                    type="number"
                    min={0}
                    value={settings.pauseMinutes}
                    onChange={(e) => setSettings({ ...settings, pauseMinutes: Number(e.target.value) })}
                    className={`${fieldClass} w-32`}
                  />
                </Field>
              </div>
            </Panel>
          </div>

          <Panel
            title="Testar o agente"
            meta="Converse como se fosse um cliente. Nada é enviado no WhatsApp. Usa o texto da base acima, mesmo antes de salvar."
            action={
              <SmallButton
                onClick={() => {
                  setChat([]);
                  setLast(null);
                }}
              >
                Limpar
              </SmallButton>
            }
            className="flex flex-col"
          >
            <div className="px-5 pb-2">
              <label className="flex items-center gap-2 text-[12px] text-muted">
                <input type="checkbox" checked={asClient} onChange={(e) => setAsClient(e.target.checked)} />
                Simular um cliente atual da Alien
              </label>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2 min-h-[320px] max-h-[55vh] border-t border-line-soft">
              {chat.length === 0 && <p className="text-[13px] text-muted">Escreva abaixo, por exemplo: &quot;Oi, vi o anúncio de vocês. Quanto custa o tráfego pago?&quot;</p>}
              {chat.map((l, i) => (
                <div key={i} className={`flex ${l.author === "Agente" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] whitespace-pre-wrap ${l.author === "Agente" ? "bg-accent/15" : "bg-raised"} text-ink`}>
                    {l.text}
                  </div>
                </div>
              ))}
              {thinking && <p className="text-[12px] text-muted">Agente digitando…</p>}
              <div ref={endRef} />
            </div>
            {last && (
              <div className="mx-5 mb-2 rounded-lg bg-raised px-3 py-2 text-[11.5px] text-body space-y-0.5">
                {last.precisa_humano && (
                  <div className="text-danger font-semibold">Chamaria você: {last.motivo_humano || "sem motivo informado"}</div>
                )}
                <div>
                  <b>Resumo do lead:</b> {last.resumo || "—"}
                </div>
                {last.lead && Object.keys(last.lead).length > 0 && (
                  <div className="text-muted">
                    {Object.entries(last.lead)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </div>
                )}
              </div>
            )}
            <div className="border-t border-line-soft p-3 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && ask()}
                placeholder="Mensagem do cliente…"
                className={`${fieldClass} flex-1`}
                disabled={thinking}
              />
              <SmallButton variant="primary" onClick={ask} disabled={thinking || !input.trim()}>
                Enviar
              </SmallButton>
            </div>
          </Panel>
        </div>
      )}
    </main>
  );
}
