import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AIClientIntelligence } from "@/lib/clientsData";
import { BotIcon, SparklesIcon, ArrowUpRightIcon } from "@/components/icons";

export interface ClientIntelligencePanelProps {
  intelligence: AIClientIntelligence;
  clientName: string;
  clientId?: string;
}

export function ClientIntelligencePanel({
  intelligence,
  clientName,
  clientId,
}: ClientIntelligencePanelProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white relative overflow-hidden space-y-6">
      {/* Subtle top indicator bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] via-[#4A8237] to-[#111111]" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center shrink-0 border border-[#4A8237]">
            <BotIcon className="w-5 h-5 text-[#4A8237]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-[#111111] tracking-tight">
                Alien Intelligence
              </h3>
              <Badge variant="alien" size="sm" showDot>
                Diagnóstico de IA · Alien Max v1
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
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
                icon={<BotIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
              >
                Novo Escaneamento Digital
              </Button>
            </Link>
          )}

          <div className="p-2.5 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-[11px] text-[#71717A] hidden sm:flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#4A8237] shrink-0" />
            <span>
              <strong className="text-[#111111]">Nota:</strong> A IA apenas recomenda estratégias. A tomada de decisão é 100% humana.
            </span>
          </div>
        </div>
      </div>

      {/* Overview Grid (Resumo, Gargalo, Oportunidade, Prioridade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Resumo */}
        <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#71717A] font-medium">
            Resumo Operacional
          </span>
          <p className="text-xs text-[#111111] leading-relaxed font-normal">
            {intelligence.summary}
          </p>
        </div>

        {/* Maior Gargalo */}
        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-semibold">
            Maior Gargalo
          </span>
          <p className="text-xs text-[#111111] leading-relaxed">
            {intelligence.biggestBottleneck}
          </p>
        </div>

        {/* Maior Oportunidade */}
        <div className="p-3.5 rounded-xl bg-[rgba(74,130,55,0.06)] border border-[rgba(74,130,55,0.2)] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold">
            Maior Oportunidade
          </span>
          <p className="text-xs text-[#111111] leading-relaxed">
            {intelligence.biggestOpportunity}
          </p>
        </div>

        {/* Prioridade da Semana */}
        <div className="p-3.5 rounded-xl bg-[#111111] text-white border border-[#111111] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold">
            Prioridade da Semana
          </span>
          <p className="text-xs text-zinc-300 leading-relaxed font-medium">
            {intelligence.weeklyPriority}
          </p>
        </div>
      </div>

      {/* 3 Recomendações da IA */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
            3 Recomendações Estratégicas da IA
          </h4>
          <span className="text-xs text-[#A1A1AA]">Ações de Alto Impacto</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {intelligence.recommendations.map((rec, idx) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between hover:border-[#D4D4D8] transition-colors group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                    Recomendação #{idx + 1}
                  </span>
                  <Badge variant="alien" size="sm">
                    {rec.expectedImpact}
                  </Badge>
                </div>

                <h5 className="text-xs font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors">
                  {rec.title}
                </h5>

                <p className="text-xs text-[#71717A] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E4E4E7] space-y-2">
                <div className="text-[11px] text-[#52525B]">
                  <strong className="text-[#111111]">Ação: </strong>
                  {rec.action}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between"
                  icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
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
