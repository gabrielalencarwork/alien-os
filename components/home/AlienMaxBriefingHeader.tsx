import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  BotIcon,
  SparklesIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
  ZapIcon,
  LayersIcon,
} from "@/components/icons";

export function AlienMaxBriefingHeader() {
  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting & Alien Max Protagonist Card */}
      <Card className="border-[#E4E4E7] bg-white relative overflow-hidden p-6 sm:p-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] via-[#4A8237] to-[#111111]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F4F4F5]">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Badge variant="alien" showDot>
                Alien Command Center · v2.0
              </Badge>
              <span className="text-xs font-mono text-[#A1A1AA]">
                Quarta-feira, 29 de Julho
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
              Bom dia, Gabriel.
            </h1>

            <p className="text-sm sm:text-base text-[#52525B] leading-relaxed max-w-2xl font-normal">
              Hoje a operação conta com <span className="font-semibold text-[#111111]">5 oportunidades de alto impacto</span> e 2 alertas de atenção para otimizar os resultados da carteira.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" icon={<LayersIcon className="w-4 h-4" />}>
              Relatório Executivo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<ZapIcon className="w-4 h-4 text-[#4A8237]" />}
            >
              Executar Ações Prioritárias
            </Button>
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
                    Resumo Gerado pelo Alien Max
                  </h2>
                  <Badge variant="alien" size="sm">
                    Inteligência Ativa
                  </Badge>
                </div>
                <p className="text-xs text-[#71717A]">
                  Pergunta do dia: <em>"O que devemos fazer hoje para gerar mais resultado aos nossos clientes?"</em>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-mono text-[#A1A1AA] hidden sm:inline">
              Atualizado há 15 min
            </span>
          </div>

          {/* 2. Daily Briefing Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
                Foco Principal do Dia
              </span>
              <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                Escala de orçamento na Aura Health (+R$ 25k) e reestruturação de Meta Ads no Nexus SaaS.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                Metas do Dia
              </span>
              <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                Aprovar 6 novos criativos UGC e revisar o checkout em 1-etapa na Lumina Skincare.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#111111] font-semibold block">
                Velocidade Operacional
              </span>
              <p className="text-xs font-semibold text-[#111111] leading-relaxed">
                85% das tarefas da semana dentro do SLA com taxa de retenção de 97.6%.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
