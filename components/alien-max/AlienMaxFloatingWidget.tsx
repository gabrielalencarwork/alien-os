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
      text: "Olá! Sou o **Alien Max**, copiloto IA autônomo do Alien OS. Estou conectado ao seu banco de dados, mídias pagas, CRM e métricas de Growth em tempo real.\n\nEm que posso ajudar no crescimento da sua agência agora?",
      confidenceScore: 99,
      suggestedActions: [
        "Qual é o nosso ROAS consolidado?",
        "Verificar clientes com risco de churn",
        "Analisar oportunidades de escala",
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
        confidenceScore: data.response?.confidenceScore || 96,
        suggestedActions: data.response?.suggestedActions || [],
        time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans select-none">
      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="mb-4 w-[360px] sm:w-[420px] h-[520px] bg-white border border-[#E4E4E7] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-[#111111] text-white flex items-center justify-between border-b border-[#4A8237]/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#111111] text-[#4A8237] flex items-center justify-center border border-[#4A8237] shadow-[0_0_10px_rgba(74,130,55,0.3)]">
                <BotIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white tracking-wide">Alien Max IA</span>
                  <span className="w-2 h-2 rounded-full bg-[#4A8237] animate-pulse" />
                </div>
                <span className="text-[10px] text-[#A1A1AA] font-mono block">
                  Copiloto Autônomo · Online 24h
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                href="/alien-max"
                title="Expandir para tela cheia"
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Maximize2Icon className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Fechar aba"
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#A1A1AA] hover:text-white transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 bg-[#FAFAFA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ALIEN_MAX" && (
                  <div className="w-6 h-6 rounded-md bg-[#111111] text-[#4A8237] flex items-center justify-center shrink-0 border border-[#4A8237] mt-0.5">
                    <BotIcon className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] space-y-1.5 p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                    msg.sender === "USER"
                      ? "bg-[#111111] text-white rounded-tr-none font-medium"
                      : "bg-white border border-[#E4E4E7] text-[#111111] rounded-tl-none"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 border-b border-black/5 pb-1">
                    <span className="text-[9px] font-mono text-[#71717A]">{msg.time}</span>
                    {msg.confidenceScore && (
                      <span className="text-[9px] font-mono text-[#4A8237] font-bold">
                        {msg.confidenceScore}% Confiança
                      </span>
                    )}
                  </div>

                  <p className="whitespace-pre-line text-[11px]">{msg.text}</p>

                  {/* Action Suggestions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="pt-2 border-t border-[#E4E4E7] space-y-1.5">
                      <span className="text-[9px] font-bold text-[#71717A] block uppercase font-mono">
                        Perguntas Frequentes:
                      </span>
                      <div className="flex flex-col gap-1">
                        {msg.suggestedActions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleSendMessage(act)}
                            className="text-[10px] text-left px-2 py-1 rounded-md bg-[#FAFAFA] border border-[#E4E4E7] text-[#111111] font-medium hover:border-[#4A8237] hover:text-[#4A8237] transition-colors truncate"
                          >
                            • {act}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === "USER" && (
                  <div className="w-6 h-6 rounded-md bg-[#111111] text-white flex items-center justify-center shrink-0 border border-[#E4E4E7] mt-0.5">
                    <UserIcon className="w-3 h-3 text-[#4A8237]" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-[#E4E4E7] bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Fale com o Alien Max..."
              className="flex-1 px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs outline-none text-[#111111] focus:border-[#4A8237] transition-colors"
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

      {/* Floating Trigger Button (Aba Flutuante) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2.5 p-3 rounded-full bg-[#111111] text-white border-2 border-[#4A8237] shadow-[0_4px_20px_rgba(74,130,55,0.35)] hover:scale-105 hover:shadow-[0_6px_25px_rgba(74,130,55,0.5)] transition-all duration-200 relative cursor-pointer"
        title="Conversar com Alien Max IA"
      >
        <div className="relative flex items-center justify-center">
          <BotIcon className="w-5 h-5 text-[#4A8237]" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#4A8237] border-2 border-[#111111] animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#4A8237] border-2 border-[#111111]" />
        </div>

        <span className="text-xs font-bold text-white tracking-wide pr-1 hidden sm:inline-block">
          Alien Max IA
        </span>

        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#4A8237]/20 text-[#4A8237] border border-[#4A8237]/30 hidden sm:inline-block font-semibold">
          LIVE
        </span>
      </button>
    </div>
  );
}
