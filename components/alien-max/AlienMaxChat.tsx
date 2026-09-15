"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  role: ChatRole;
  content: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  role: "assistant",
  content:
    "Oi, sou o Alien Max. Posso consultar mídia paga, CRM e financeiro em tempo real. O que você quer saber?",
};

export default function AlienMaxChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/alien-max", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao consultar o Alien Max`);
      }

      const data: { reply: string } = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "Sem resposta." },
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível falar com o Alien Max agora."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#0D0F14] text-slate-100">
      <header className="flex items-center gap-3 border-b border-slate-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C6FF4]/15 text-[#A79AFF]">
          🛸
        </div>
        <div>
          <h1 className="text-sm font-semibold text-slate-100">Alien Max</h1>
          <p className="text-xs text-slate-500">
            Copiloto de mídia paga, CRM e financeiro
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-4 overflow-y-auto px-6 py-6"
      >
        {messages.map((message, index) => (
          <MessageBubble key={index} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center gap-1 pl-1 text-slate-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500 [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-500 [animation-delay:300ms]" />
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-900/60 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 px-6 py-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre campanhas, clientes ou financeiro..."
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#7C6FF4] focus:outline-none focus:ring-1 focus:ring-[#7C6FF4]"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="rounded-lg bg-[#7C6FF4] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6C5FE0] disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            Enviar
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          Enter envia · Shift+Enter quebra linha
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#7C6FF4] text-white"
            : "border border-slate-800 bg-slate-900 text-slate-200"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
