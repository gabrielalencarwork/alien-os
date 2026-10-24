import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { AIClientIntelligence } from "@/types";
import { BotIcon, SparklesIcon, ArrowUpRightIcon } from "@/components/icons";

export interface ClientIntelligencePanelProps {
  intelligence?: AIClientIntelligence;
  clientName: string;
  clientId?: string;
}

export function ClientIntelligencePanel({
  intelligence,
  clientName,
  clientId,
}: ClientIntelligencePanelProps) {
  const safeIntelligence: AIClientIntelligence = intelligence || {
    summary: `Aguardando primeiras sincronizações de mídia e tráfego da conta ${clientName}. O Alien Max gerará diagnósticos autônomos assim que as integrações forem conectadas.`,
    biggestBottleneck: "Integrações iniciais em fase de sincronização.",
    biggestOpportunity: "Conectar Google Ads e GA4 para habilitar análise preditiva e otimização de conversão.",
    weeklyPriority: "Conectar e ativar as contas de mídia do cliente no menu de Integrações.",
    recommendations: [
      {
        id: "rec-init-1",
        title: "Conectar Google Ads",
        description: `Vincule a conta de anúncios da ${clientName} no menu de Integrações para monitorar campanhas e métricas.`,
        expectedImpact: "Alto Impacto",
        action: "Acessar Integrações > Google Ads",
      },
      {
        id: "rec-init-2",
        title: "Sincronizar Google Analytics 4 (GA4)",
        description: "Conecte o fluxo de dados do site para análise de eventos, conversões e tráfego qualificado.",
        expectedImpact: "Alto Impacto",
        action: "Acessar Integrações > Google Analytics",
      },
      {
        id: "rec-init-3",
        title: "Realizar Escaneamento Digital",
        description: "Inicie o primeiro diagnóstico de maturidade digital com a IA do Alien Max.",
        expectedImpact: "Médio Impacto",
        action: "Clicar em Novo Escaneamento Digital",
      },
    ],
  };
  return (
    <Card className="border-line bg-surface relative overflow-hidden space-y-6">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inverse via-accent to-inverse" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-line-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-inverse text-white flex items-center justify-center shrink-0 border border-accent">
            <BotIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-ink tracking-tight">
                Alien Intelligence
              </h3>
              <Badge variant="alien" size="sm" showDot>
                Diagnóstico de IA · Alien Max v1
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Análise autônoma para {clientName} baseada na performance de mídia e métricas de conversão
            </p>
          </div>
        </div>

        {/* Disclaimer & Action */}
        <div className="flex items-center gap-3">
          {clientId && (
            <Link href={`/clientes/${clientId}/escaneamento`}>
              <Button
                variant="primary"
                size="sm"
                icon={<BotIcon className="w-3.5 h-3.5 text-accent" />}
              >
                Novo Escaneamento Digital
              </Button>
            </Link>
          )}

          <div className="p-2.5 rounded-lg bg-canvas border border-line text-[11px] text-muted hidden sm:flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-accent shrink-0" />
            <span>
              <strong className="text-ink">Nota:</strong> A IA apenas recomenda estratégias. A tomada de decisão é 100% humana.
            </span>
          </div>
        </div>
      </div>

      {/* Overview Grid (Resumo, Gargalo, Oportunidade, Prioridade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resumo */}
        <div className="p-3.5 rounded-xl bg-canvas border border-line space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-medium">
            Resumo Operacional
          </span>
          <p className="text-xs text-ink leading-relaxed font-normal">
            {safeIntelligence.summary}
          </p>
        </div>

        {/* Maior Gargalo */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
            Maior Gargalo
          </span>
          <p className="text-xs text-ink leading-relaxed">
            {safeIntelligence.biggestBottleneck}
          </p>
        </div>

        {/* Maior Oportunidade */}
        <div className="p-3.5 rounded-xl bg-accent/6 border border-accent/20 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
            Maior Oportunidade
          </span>
          <p className="text-xs text-ink leading-relaxed">
            {safeIntelligence.biggestOpportunity}
          </p>
        </div>

        {/* Prioridade da Semana */}
        <div className="p-3.5 rounded-xl bg-inverse text-white border border-ink space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
            Prioridade da Semana
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {safeIntelligence.weeklyPriority}
          </p>
        </div>
      </div>

      {/* 3 Recomendações da IA */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-muted">
            3 Recomendações Estratégicas da IA
          </h4>
          <span className="text-xs text-subtle">Ações de Alto Impacto</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(safeIntelligence.recommendations || []).map((rec, idx) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-canvas border border-line flex flex-col justify-between hover:border-line-strong transition-colors group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-subtle">
                    Recomendação #{idx + 1}
                  </span>
                  <Badge variant="alien" size="sm">
                    {rec.expectedImpact}
                  </Badge>
                </div>

                <h5 className="text-xs font-bold text-ink group-hover:text-accent transition-colors">
                  {rec.title}
                </h5>

                <p className="text-xs text-muted leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-line space-y-2">
                <div className="text-[11px] text-body">
                  <strong className="text-ink">Ação: </strong>
                  {rec.action}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />}
                  iconPosition="right"
                >
                  Executar Recomendação
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
