"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { BotIcon, SendIcon, SparklesIcon, UserIcon } from "@/components/icons";

export interface ChatMessage {
  id: string;
  sender: "USER" | "ALIEN_MAX";
  text: string;
  confidenceScore?: number;
  suggestedActions?: string[];
  time: string;
}

export function AlienMaxChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-01",
      sender: "ALIEN_MAX",
      text: "Olá! Sou o **Alien Max**, a Inteligência Artificial autônoma do Alien OS. Estou conectado em tempo real a todas as suas mídias pagas (Google Ads, Meta Ads, TikTok, LinkedIn), CRM, Financeiro MRR e Growth Lab.\n\nComo posso te ajudar no crescimento da agência hoje?",
      suggestedActions: [
        "Qual é o nosso ROAS consolidado?",
        "Verificar contas com risco de churn",
        "Analisar oportunidade de escala no Meta Ads",
      ],
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState("");
  const [sending, setSending] = useState(false);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim() || sending) return;

    const userMsg: ChatMessage = {
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

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ALIEN_MAX",
        text: data.response?.replyText || "Entendido! Analisei seu pedido no banco de dados.",
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

  return (
    <Card className="border-line bg-surface flex flex-col h-[580px] p-0 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-line bg-canvas flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-inverse text-white flex items-center justify-center border border-accent">
            <BotIcon className="w-4 h-4 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-ink">Alien Max · Copiloto Autônomo</h3>
              <Badge variant="alien" size="sm" showDot>
                Online 24h
              </Badge>
            </div>
            <span className="text-[10px] text-muted block">
              Conectado a 100% das tabelas do Supabase
            </span>
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-surface">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "ALIEN_MAX" && (
              <div className="w-7 h-7 rounded-lg bg-inverse text-accent flex items-center justify-center shrink-0 border border-accent mt-0.5">
                <BotIcon className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[82%] space-y-2 p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === "USER"
                  ? "bg-inverse text-white rounded-tr-none font-medium"
                  : "bg-canvas border border-line text-ink rounded-tl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1">
                <span className="text-[10px] font-mono text-muted">{msg.time}</span>
                {msg.confidenceScore && (
                  <span className="text-[9px] font-mono text-accent font-bold">
                    {msg.confidenceScore}% Confiança
                  </span>
                )}
              </div>

              <p className="whitespace-pre-line">{msg.text}</p>

              {/* Action Suggestions */}
              {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="pt-2 border-t border-line space-y-1.5">
                  <span className="text-[10px] font-bold text-muted block uppercase font-mono">
                    Perguntas Sugeridas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((act, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendMessage(act)}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-surface border border-line text-ink font-medium hover:border-accent hover:text-accent transition-colors"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === "USER" && (
              <div className="w-7 h-7 rounded-lg bg-canvas border border-line text-ink flex items-center justify-center shrink-0 mt-0.5">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-line bg-canvas flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Pergunte qualquer coisa ao Alien Max sobre campanhas, ROAS ou MRR..."
          className="flex-1 px-4 py-2.5 bg-surface border border-line rounded-xl text-xs outline-none text-ink"
        />

        <Button
          variant="primary"
          size="md"
          onClick={() => handleSendMessage()}
          disabled={sending || !inputPrompt.trim()}
          icon={<SendIcon className="w-3.5 h-3.5" />}
        >
          {sending ? "..." : "Enviar"}
        </Button>
      </div>
    </Card>
  );
}
