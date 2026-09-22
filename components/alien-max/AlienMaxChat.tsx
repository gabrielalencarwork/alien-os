"use client";

import React, { useEffect, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { Cliente } from "@/types";
import {
  BotIcon,
  SparklesIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  ChevronRightIcon,
} from "@/components/icons";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  toolsUsed?: string[];
}

const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "msg-welcome",
  role: "assistant",
  content: `### 🛸 Alien Max · Diretor de Inteligência & Growth
Olá! Sou o copiloto executivo do **Alien OS**, conectado em tempo real aos dados de tráfego, CRM e financeiro da agência.

Escolha uma conta acima ou faça uma pergunta direta. O que você quer analisar hoje?`,
  timestamp: "Agora",
};

export default function AlienMaxChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([DEFAULT_WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Cliente[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("all");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Carregar lista de clientes reais para o seletor de contexto
  useEffect(() => {
    async function loadClients() {
      try {
        const data = await clientRepository.getAll();
        setClients(data);
        // Se houver apenas 1 cliente ou se o usuário estiver focado nele, já seleciona
        if (data.length === 1) {
          setSelectedClientId(data[0].id);
        }
      } catch (err) {
        console.warn("Aviso ao carregar clientes para o Alien Max:", err);
      }
    }
    loadClients();
  }, []);

  // Auto scroll para o final da conversa
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  // Pílulas de prompts dinâmicas baseadas no contexto
  const quickPrompts = selectedClient
    ? [
        `📊 Relatório completo de desempenho da ${selectedClient.name} (últimos 30 dias)`,
        `🎯 Quais campanhas e palavras-chave trouxeram mais conversões para a ${selectedClient.name}?`,
        `💰 Análise de ROAS, CPA e custo por agendamento da ${selectedClient.name}`,
        `🚀 Quais são as 3 ações prioritárias para escalar a ${selectedClient.name} esta semana?`,
      ]
    : [
        "📊 Visão geral consolidada de todas as contas da carteira",
        "🚨 Identificar contas com queda de ROAS ou risco de churn",
        "📈 Quais clientes têm maior potencial de escala horizontal esta semana?",
        "💰 Como está a média de CPA e investimento geral em Meta Ads e Google Ads?",
      ];

  async function handleSendMessage(customText?: string) {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    if (!customText) setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const payloadMessages = nextMessages
        .filter((m) => m.id !== "msg-welcome")
        .map(({ role, content }) => ({ role, content }));

      // Envia também o primeiro se for a única mensagem
      const apiMessages =
        payloadMessages.length > 0
          ? payloadMessages
          : [{ role: "user" as const, content: textToSend }];

      const res = await fetch("/api/alien-max", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          context: selectedClient
            ? {
                clientId: selectedClient.id,
                clientName: selectedClient.name,
                segment: selectedClient.segment,
                primaryObjective: selectedClient.primaryObjective,
              }
            : {
                clientName: "Todas as Contas (Agência)",
              },
        }),
      });

      if (!res.ok) {
        throw new Error(`Erro ${res.status} ao consultar o Alien Max`);
      }

      const data: { reply: string; toolsUsed?: string[] } = await res.json();

      const assistantMessage: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Não foi possível obter uma resposta do Alien Max no momento.",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        toolsUsed: data.toolsUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível conectar ao Alien Max. Verifique a conexão com a API."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  function handleClearChat() {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setError(null);
  }

  return (
    <div className="flex h-[calc(100vh-4.25rem)] flex-col bg-[#0A0D10] text-[#E4E4E7] font-sans antialiased">
      {/* 1. Header do Copiloto */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1F2630] bg-[#0E1217]/90 px-6 py-3.5 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#111111] border border-[#4A8237] shadow-[0_0_15px_rgba(74,130,55,0.25)]">
            <BotIcon className="w-5 h-5 text-[#4A8237]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#22C55E]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white tracking-tight">Alien Max</h1>
              <span className="rounded-md bg-[#4A8237]/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#22C55E] border border-[#4A8237]/40">
                v2.5 Growth AI
              </span>
              <span className="text-[10px] text-[#71717A] hidden md:inline">
                · Claude 3.5 Sonnet
              </span>
            </div>
            <p className="text-[11px] text-[#8592A3]">
              Copiloto de Growth conectado ao Google Ads, Meta Ads, GA4 e CRM
            </p>
          </div>
        </div>

        {/* Controles de Contexto & Ações */}
        <div className="flex items-center gap-2.5">
          {/* Seletor de Cliente */}
          <div className="flex items-center gap-1.5 rounded-xl border border-[#242C37] bg-[#141920] px-2.5 py-1.5 shadow-inner">
            <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider">Conta:</span>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-[#141920] text-white">
                Todas as Contas (Agência)
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#141920] text-white">
                  {c.name} {c.segment ? `· ${c.segment}` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Botão Limpar Conversa */}
          <button
            onClick={handleClearChat}
            title="Iniciar Nova Análise"
            className="flex items-center gap-1 rounded-xl border border-[#242C37] bg-[#141920] px-2.5 py-1.5 text-xs text-[#A1A1AA] hover:border-[#3A4656] hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span className="hidden sm:inline">Limpar</span>
          </button>
        </div>
      </header>

      {/* 2. Feed de Mensagens */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        className="flex-1 space-y-6 overflow-y-auto px-4 sm:px-8 py-6 scroll-smooth"
      >
        {messages.map((message) => (
          <ChatMessageItem
            key={message.id}
            message={message}
            onCopy={() => copyToClipboard(message.content, message.id)}
            isCopied={copiedMessageId === message.id}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#242C37] bg-[#12161D] p-4 max-w-xl text-xs text-[#8592A3] animate-pulse">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4A8237]/20 text-[#22C55E] border border-[#4A8237]">
              <SparklesIcon className="w-4 h-4 animate-spin text-[#22C55E]" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="font-semibold text-white flex items-center gap-2">
                <span>Alien Max analisando dados em tempo real...</span>
              </div>
              <p className="text-[11px] text-[#71717A]">
                Consultando APIs conectadas, calculando ROAS e gerando plano de ação
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="rounded-xl border border-red-800/60 bg-red-950/40 p-4 text-xs text-red-200 flex items-start gap-3">
            <AlertTriangleIcon className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block text-red-300 font-semibold">Falha na consulta:</strong>
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3. Rodapé & Input Bar */}
      <div className="border-t border-[#1F2630] bg-[#0E1217] px-4 sm:px-8 py-4 space-y-3 shrink-0">
        {/* Pílulas de Ação Rápida */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[10px] font-mono uppercase text-[#71717A] shrink-0 font-semibold">
            Sugestões:
          </span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="rounded-lg border border-[#242C37] bg-[#141920] px-3 py-1.5 text-xs text-[#D4D4D8] hover:border-[#4A8237] hover:bg-[#1A222C] hover:text-white transition-all whitespace-nowrap disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-end gap-3">
          <div className="relative flex-1 rounded-2xl border border-[#242C37] bg-[#12161D] focus-within:border-[#4A8237] focus-within:ring-1 focus-within:ring-[#4A8237] transition-all shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedClient
                  ? `Pergunte ao Alien Max sobre o desempenho da ${selectedClient.name}...`
                  : "Pergunte ao Alien Max sobre ROAS, métricas, clientes ou financeiro..."
              }
              rows={1}
              className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder:text-[#525E6F] focus:outline-none min-h-[46px] max-h-36"
            />
          </div>

          <button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !input.trim()}
            className="flex h-[46px] items-center justify-center gap-2 rounded-2xl bg-[#4A8237] hover:bg-[#3D6E2D] px-5 text-sm font-bold text-white transition-all disabled:cursor-not-allowed disabled:bg-[#1B222B] disabled:text-[#525E6F] shadow-md shadow-[#4A8237]/20"
          >
            <span>Enviar</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
              <path d="m22 2-7 20-4-9-9-4Z" />
              <path d="M22 2 11 13" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#525E6F] px-1">
          <span>
            Pressione <kbd className="rounded border border-[#242C37] bg-[#141920] px-1.5 py-0.5 font-mono text-[10px] text-[#8592A3]">Enter ↵</kbd> para enviar · <kbd className="rounded border border-[#242C37] bg-[#141920] px-1.5 py-0.5 font-mono text-[10px] text-[#8592A3]">Shift + Enter</kbd> para quebrar linha
          </span>
          <span className="hidden sm:inline">
            Alien OS · Zero Mock Policy
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Item individual de mensagem com avatar, ações e renderizador de Markdown
 */
function ChatMessageItem({
  message,
  onCopy,
  isCopied,
}: {
  message: ChatMessage;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111111] border border-[#4A8237]/60 text-[#4A8237] shadow-sm">
          <BotIcon className="w-4 h-4 text-[#4A8237]" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div className={`flex flex-col space-y-2 max-w-[90%] md:max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl p-5 text-sm leading-relaxed shadow-md ${
            isUser
              ? "bg-[#1E2733] border border-[#2D3A4B] text-white"
              : "bg-[#12161D] border border-[#222A35] text-[#E4E4E7]"
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          ) : (
            <RichMarkdownContent content={message.content} />
          )}

          {/* Badges de Ferramentas Utilizadas */}
          {message.toolsUsed && message.toolsUsed.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#1F2633] flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase text-[#71717A]">
                ⚡ APIs Consultadas:
              </span>
              {message.toolsUsed.map((tool, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-[#4A8237]/15 border border-[#4A8237]/30 px-2 py-0.5 text-[10px] font-mono text-[#22C55E]"
                >
                  {tool}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Message Footer (Timestamp & Copy Action) */}
        <div className="flex items-center gap-3 px-2 text-[11px] text-[#525E6F]">
          <span>{message.timestamp}</span>
          {!isUser && (
            <button
              onClick={onCopy}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              {isCopied ? (
                <>
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-[#22C55E]" />
                  <span className="text-[#22C55E] font-medium">Copiado!</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copiar Análise</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Renderizador Moderno de Markdown nativo do Alien OS:
 * Suporta Cabeçalhos, Tabelas completas, Listas, Negritos e Callouts.
 */
function RichMarkdownContent({ content }: { content: string }) {
  // Dividir em blocos (parágrafos, cabeçalhos, tabelas)
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[] = [];

  function flushTable() {
    if (tableRows.length === 0) return;
    elements.push(
      <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-xl border border-[#222A35] bg-[#0A0D10]/60">
        <table className="w-full text-left text-xs border-collapse">
          {tableRows.map((row, rIdx) => {
            // Ignorar linha divisória |:---|:---|
            if (/^\|[\s-:]+\|/.test(row.trim())) return null;

            const cols = row
              .split("|")
              .map((c) => c.trim())
              .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

            if (rIdx === 0) {
              return (
                <thead key={rIdx} className="bg-[#161D26] border-b border-[#222A35]">
                  <tr>
                    {cols.map((col, cIdx) => (
                      <th key={cIdx} className="p-2.5 font-bold uppercase font-mono text-[10px] text-[#A1A1AA] tracking-wider">
                        {formatInline(col)}
                      </th>
                    ))}
                  </tr>
                </thead>
              );
            }

            return (
              <tbody key={rIdx} className="divide-y divide-[#1B222C]">
                <tr className="hover:bg-[#141A22] transition-colors">
                  {cols.map((col, cIdx) => (
                    <td key={cIdx} className="p-2.5 font-mono text-xs text-[#E4E4E7]">
                      {formatInline(col)}
                    </td>
                  ))}
                </tr>
              </tbody>
            );
          })}
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Linha de tabela Markdown (| Col | Col |)
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Cabeçalho H3 (###)
    if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-white tracking-tight mt-4 mb-2 flex items-center gap-2 border-b border-[#222A35] pb-1">
          {formatInline(line.replace("### ", ""))}
        </h3>
      );
      continue;
    }

    // Cabeçalho H2 (##)
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-base font-extrabold text-white tracking-tight mt-5 mb-2 border-b border-[#2D3748] pb-1.5">
          {formatInline(line.replace("## ", ""))}
        </h2>
      );
      continue;
    }

    // Item de Lista (- ou *)
    if (/^[\*\-]\s/.test(line.trim())) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-1 text-xs text-[#D4D4D8] pl-2">
          <span className="text-[#4A8237] font-bold text-sm leading-none">•</span>
          <div className="flex-1">{formatInline(line.trim().replace(/^[\*\-]\s/, ""))}</div>
        </div>
      );
      continue;
    }

    // Item de Lista Numerada (1., 2., etc.)
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2.5 my-1.5 text-xs text-[#E4E4E7] pl-1">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#4A8237]/20 font-mono text-[10px] font-bold text-[#22C55E] border border-[#4A8237]/40">
              {match[1]}
            </span>
            <div className="flex-1 leading-relaxed">{formatInline(match[2])}</div>
          </div>
        );
        continue;
      }
    }

    // Callout Quote (> texto)
    if (line.startsWith("> ")) {
      elements.push(
        <div key={i} className="my-2 border-l-2 border-[#4A8237] bg-[#4A8237]/10 px-3.5 py-2 text-xs text-[#D4D4D8] rounded-r-lg italic">
          {formatInline(line.replace("> ", ""))}
        </div>
      );
      continue;
    }

    // Linha divisória (---)
    if (line.trim() === "---") {
      elements.push(<hr key={i} className="my-3 border-[#222A35]" />);
      continue;
    }

    // Parágrafo comum
    if (line.trim()) {
      elements.push(
        <p key={i} className="my-1.5 text-xs text-[#D4D4D8] leading-relaxed">
          {formatInline(line)}
        </p>
      );
    }
  }

  if (inTable) {
    flushTable();
  }

  return <div className="space-y-1">{elements}</div>;
}

/**
 * Utilitário para formatar negritos (**texto**), código (`code`) e semáforos
 */
function formatInline(text: string): React.ReactNode {
  // Dividir por `código`
  const codeParts = text.split(/(`[^`]+`)/g);

  return codeParts.map((part, pIdx) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={pIdx} className="rounded bg-[#1C232E] px-1.5 py-0.5 font-mono text-[11px] text-[#22C55E] border border-[#2D3A4B]">
          {part.slice(1, -1)}
        </code>
      );
    }

    // Processar negritos (**texto**)
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    return boldParts.map((bPart, bIdx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return (
          <strong key={`${pIdx}-${bIdx}`} className="font-bold text-white">
            {bPart.slice(2, -2)}
          </strong>
        );
      }
      return bPart;
    });
  });
}
