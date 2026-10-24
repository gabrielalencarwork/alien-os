"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  BotIcon,
  SendIcon,
  SparklesIcon,
  UserIcon,
  XIcon,
  Maximize2Icon,
  Minimize2Icon,
  MessageSquareIcon,
} from "@/components/icons";

export interface FloatingChatMessage {
  id: string;
  sender: "USER" | "ALIEN_MAX";
  text: string;
  confidenceScore?: number;
  suggestedActions?: string[];
  time: string;
}

export function AlienMaxFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<FloatingChatMessage[]>([
    {
      id: "msg-init",
      sender: "ALIEN_MAX",
      text: "Oi, Gabriel. Pergunte sobre qualquer cliente, campanha ou conta — eu consulto os dados reais do Meta Ads, Google Ads e GA4 antes de responder.",
      suggestedActions: [
        "Qual cliente precisa de atenção hoje?",
        "Como foram as campanhas nos últimos 7 dias?",
        "Onde vale aumentar o investimento?",
      ],
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Abre o chat a partir de qualquer tela (ex.: botão "Perguntar à Alien Max" no topo).
  const sendRef = useRef<(text?: string) => void>(() => {});
  useEffect(() => {
    const onOpen = (e: Event) => {
      setIsOpen(true);
      const prompt = (e as CustomEvent<{ prompt?: string }>).detail?.prompt;
      if (prompt) sendRef.current(prompt);
    };
    window.addEventListener("alien-max:open", onOpen);
    return () => window.removeEventListener("alien-max:open", onOpen);
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || sending) return;

    const userMsg: FloatingChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "USER",
      text: prompt,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputPrompt("");
    setSending(true);

    try {
      const res = await fetch("/api/alien-max/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao responder mensagem.");

      const aiMsg: FloatingChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ALIEN_MAX",
        text: data.response?.replyText || "Entendido! Analisei os registros no Alien OS.",
        suggestedActions: data.response?.suggestedActions || [],
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: "ALIEN_MAX",
          text: `Erro ao consultar o Alien Max: ${err instanceof Error ? err.message : String(err)}`,
          time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  sendRef.current = handleSendMessage;

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[520px] bg-surface border border-line rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-inverse text-white flex items-center justify-between border-b border-accent/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-inverse text-accent flex items-center justify-center border border-accent shadow-[0_0_10px_color-mix(in_oklab,var(--accent)_30%,transparent)]">
                <BotIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">Alien Max IA</span>
                  <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                </div>
                <span className="text-[10px] text-subtle font-mono block">
                  Copiloto Autônomo · Online 24h
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/alien-max"
                title="Expandir para tela cheia"
                className="p-1.5 rounded-lg hover:bg-white/10 text-subtle hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Maximize2Icon className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar aba"
                className="p-1.5 rounded-lg hover:bg-white/10 text-subtle hover:text-white transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-canvas">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ALIEN_MAX" && (
                  <div className="w-6 h-6 rounded-md bg-inverse text-accent flex items-center justify-center shrink-0 border border-accent mt-0.5">
                    <BotIcon className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] space-y-1.5 p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === "USER"
                      ? "bg-inverse text-white rounded-tr-none font-medium"
                      : "bg-surface border border-line text-ink rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1">
                    <span className="text-[9px] font-mono text-muted">{msg.time}</span>
                    {msg.confidenceScore && (
                      <span className="text-[9px] font-mono text-accent font-bold">
                        {msg.confidenceScore}% Confiança
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-line text-[11px]">{msg.text}</p>

                  {/* Action Suggestions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-line space-y-1.5">
                      <span className="text-[9px] font-bold text-muted block uppercase font-mono">
                        Perguntas Frequentes:
                      </span>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendMessage(act)}
                            className="text-[10px] text-left px-2 py-1 rounded-md bg-canvas border border-line text-ink font-medium hover:border-accent hover:text-accent transition-colors truncate"
                          >
                            • {act}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === "USER" && (
                  <div className="w-6 h-6 rounded-md bg-inverse text-white flex items-center justify-center shrink-0 border border-line mt-0.5">
                    <UserIcon className="w-3 h-3 text-accent" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-line bg-surface flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Fale com o Alien Max..."
              className="flex-1 px-3 py-2 bg-canvas border border-line rounded-xl text-xs outline-none text-ink focus:border-accent transition-colors"
            />

            <Button
              variant="primary"
              size="sm"
              onClick={() => handleSendMessage()}
              disabled={sending || !inputPrompt.trim()}
              icon={<SendIcon className="w-3 h-3" />}
            >
              {sending ? "..." : ""}
            </Button>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="ml-auto flex items-center justify-center w-12 h-12 rounded-full bg-inverse text-neon border border-accent/50 shadow-[0_6px_24px_color-mix(in_oklab,var(--accent)_30%,transparent)] hover:border-accent transition-colors"
        title={isOpen ? "Fechar Alien Max" : "Conversar com a Alien Max"}
        aria-label={isOpen ? "Fechar Alien Max" : "Conversar com a Alien Max"}
      >
        <BotIcon className="w-5 h-5" />
      </button>
    </div>
  );
}
