"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  BotIcon,
  SparklesIcon,
  ZapIcon,
  LayersIcon,
} from "@/components/icons";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { taskRepository } from "@/lib/repositories/taskRepository";

export function AlienMaxBriefingHeader() {
  const [greeting, setGreeting] = useState("Bom dia");
  const [currentDate, setCurrentDate] = useState("");
  const [stats, setStats] = useState({ clientCount: 0, pendingTasksCount: 0, ready: false });

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 12) setGreeting("Bom dia");
    else if (hour < 18) setGreeting("Boa tarde");
    else setGreeting("Boa noite");

    const dateFormatted = now.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    setCurrentDate(dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1));

    async function loadStats() {
      try {
        const [clients, tasks] = await Promise.all([
          clientRepository.getAll(),
          taskRepository.getTasks(),
        ]);
        const pending = tasks.filter((t) => t.status !== "Concluída").length;
        setStats({ clientCount: clients.length, pendingTasksCount: pending, ready: true });
      } catch {
        setStats({ clientCount: 0, pendingTasksCount: 0, ready: true });
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting & Alien Max Protagonist Card */}
      <Card className="border-[#E4E4E7] bg-white relative overflow-hidden p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] via-[#4A8237] to-[#111111]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F4F4F5]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="alien" showDot>
                Alien Command Center · Operação Real
              </Badge>
              {currentDate && (
                <span className="text-xs font-mono text-[#A1A1AA]">
                  {currentDate}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              {greeting}, Gabriel.
            </h1>

            <p className="text-sm sm:text-base text-[#52525B] leading-relaxed max-w-2xl font-normal">
              {stats.clientCount > 0 ? (
                <>
                  A operação conta atualmente com <span className="font-semibold text-[#111111]">{stats.clientCount} cliente{stats.clientCount > 1 ? "s" : ""} ativo{stats.clientCount > 1 ? "s" : ""}</span> e <span className="font-semibold text-[#111111]">{stats.pendingTasksCount} tarefa{stats.pendingTasksCount !== 1 ? "s" : ""} pendente{stats.pendingTasksCount !== 1 ? "s" : ""}</span> para acompanhamento.
                </>
              ) : (
                <>
                  Bem-vindo ao Alien OS. Conecte suas contas de anúncios e cadastre seus clientes para iniciar o monitoramento em tempo real.
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/clientes">
              <Button variant="outline" size="sm" icon={<LayersIcon className="w-4 h-4" />}>
                Gerenciar Clientes
              </Button>
            </Link>
            <Link href="/integracoes">
              <Button
                variant="secondary"
                size="sm"
                icon={<ZapIcon className="w-4 h-4 text-[#4A8237]" />}
              >
                Conectar Integrações
              </Button>
            </Link>
          </div>
        </div>

        {/* Alien Max Daily Briefing Panel */}
        <div className="mt-6 p-5 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center border border-[#4A8237] shrink-0">
                <BotIcon className="w-5 h-5 text-[#4A8237]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#111111] tracking-tight">
                    Briefing Operacional Alien Max
                  </h2>
                  <Badge variant="alien" size="sm">
                    Inteligência Ativa
                  </Badge>
                </div>
                <p className="text-xs text-[#71717A]">
                  Pergunta da operação: <em>"O que devemos priorizar hoje para maximizar o ROI da carteira?"</em>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#A1A1AA] hidden sm:inline">
              Tempo Real · Supabase Conectado
            </span>
          </div>

          {/* Daily Briefing Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
                Foco Principal do Dia
              </span>
              <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                {stats.clientCount > 0
                  ? "Revisão dos ROAS de campanhas ativas e validação de entregas prioritárias da semana."
                  : "Cadastrar novos clientes ou sincronizar contas de anúncios para ativar diagnósticos automáticos."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                Metas do Dia
              </span>
              <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                {stats.pendingTasksCount > 0
                  ? `Concluir as ${stats.pendingTasksCount} tarefas prioritárias pendentes no quadro operacional.`
                  : "Nenhuma tarefa pendente com prazo para hoje no momento."}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#111111] font-semibold block">
                Status Operacional
              </span>
              <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                {stats.clientCount > 0
                  ? "Operação ativa com monitoramento de métricas em tempo real."
                  : "Pronto para receber novos cadastros e sincronizações de contas."}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
