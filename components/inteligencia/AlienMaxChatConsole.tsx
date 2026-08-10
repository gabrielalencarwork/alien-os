"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { sendAlienMaxChatMessage } from "@/lib/alienMaxIntelligence";
import { BotIcon, SparklesIcon, ArrowUpRightIcon } from "@/components/icons";

export interface ChatMessage {
  id: string;
  sender: "user" | "alien-max";
  text: string;
  timestamp: string;
  confidenceScore?: number;
}

export function AlienMaxChatConsole() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "alien-max",
      text: "Olá, Gabriel. Sou o Alien Max, seu consultor executivo de Growth. Como posso orientar as decisões estratégicas da agência hoje?",
      timestamp: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [sending, setSending] = useState(false);

  const quickPrompts = [
    "Quais contas têm maior potencial de escala esta semana?",
    "Qual é o maior risco de churn da carteira atualmente?",
    "Como está o ROAS médio das campanhas de tráfego pago?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery("");
    setSending(true);

    try {
      const replyText = await sendAlienMaxChatMessage(query);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "alien-max",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        confidenceScore: 92,
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center shrink-0 border border-[#4A8237]">
            <BotIcon className="w-5 h-5 text-[#4A8237]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Console de Conversa Executiva · Alien Max
              </h3>
              <Badge variant="alien" size="sm">
                Modo Consultor
              </Badge>
            </div>
            <p className="text-xs text-[#71717A]">
              Faça perguntas sobre a operação, riscos, oportunidades e métricas em linguagem natural
            </p>
          </div>
        </div>

        <Badge variant="dark" size="sm">
          Respostas Baseadas em Dados
        </Badge>
      </div>

      {/* Messages Feed Container */}
      <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] h-72 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xl p-3.5 rounded-2xl text-xs space-y-1 ${
                msg.sender === "user"
                  ? "bg-[#111111] text-white rounded-br-none"
                  : "bg-white border border-[#E4E4E7] text-[#111111] shadow-xs rounded-bl-none"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-[11px] font-mono text-[#4A8237]">
                  {msg.sender === "user" ? "Gabriel (Você)" : "Alien Max"}
                </span>
                <span className="text-[10px] text-[#A1A1AA]">{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="p-3.5 rounded-2xl bg-white border border-[#E4E4E7] text-xs text-[#71717A] flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
              <span>Alien Max consultando dados da carteira...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] font-mono text-[#A1A1AA] shrink-0">Sugestões:</span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(p)}
            className="text-[11px] px-3 py-1 rounded-lg bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#52525B] font-medium transition-colors shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-[#F4F4F5]"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Pergunte algo ao Alien Max (ex: 'Qual a prioridade da semana na Aura Health?')..."
          className="flex-1 px-4 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={sending || !inputQuery.trim()}
          icon={<ArrowUpRightIcon className="w-4 h-4" />}
          iconPosition="right"
        >
          Consultar
        </Button>
      </form>
    </Card>
  );
}
