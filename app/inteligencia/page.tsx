"use client";

import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  getConfidenceRecommendations,
  getRiskRadarClients,
  getScaleOpportunities,
} from "@/lib/alienMaxIntelligence";
import { GrowthSimulatorWidget } from "@/components/inteligencia/GrowthSimulatorWidget";
import { AlienMaxChatConsole } from "@/components/inteligencia/AlienMaxChatConsole";
import { InsightsHistoryWidget } from "@/components/inteligencia/InsightsHistoryWidget";
import {
  BotIcon,
  SparklesIcon,
  AlertTriangleIcon,
  TrendingUpIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
} from "@/components/icons";

export default function IntelligenceCenterPage() {
  const recommendations = getConfidenceRecommendations();
  const riskClients = getRiskRadarClients();
  const scaleOpportunities = getScaleOpportunities();

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Hero & Briefing Diário Executivo */}
        <section>
          <Card className="border-[#E4E4E7] bg-white relative overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] via-[#4A8237] to-[#111111]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#F4F4F5]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="alien" showDot>
                    Alien Max Intelligence Center · v2.0
                  </Badge>
                  <span className="text-xs font-mono text-[#A1A1AA]">
                    Consultoria Estratégica Autônoma
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#111111]">
                  Centro de Inteligência Executiva
                </h1>

                <p className="text-sm sm:text-base text-[#52525B] leading-relaxed max-w-3xl font-normal">
                  O Alien Max analisa o desempenho da carteira, calcula probabilidades e apresenta recomendações ordenadas por faturamento e nível de confiança. <strong className="text-[#111111]">A decisão final é 100% humana.</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#111111] text-white flex items-center gap-4 border border-[#4A8237] shrink-0">
                <div className="w-10 h-10 rounded-xl bg-[#4A8237]/20 flex items-center justify-center border border-[#4A8237] shrink-0">
                  <BotIcon className="w-6 h-6 text-[#4A8237]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
                    Nível de Confiança Médio
                  </span>
                  <div className="text-2xl font-extrabold font-mono text-white">
                    93.4%
                  </div>
                </div>
              </div>
            </div>

            {/* Briefing Diário Executivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
                  Resumo Executivo do Dia
                </span>
                <p className="text-xs text-[#111111] leading-relaxed">
                  Carteira com ROAS médio de 4.25x. Foco diário na recuperação do CAC do Nexus SaaS e escala da Aura Health.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-semibold block">
                  Recomendações Ativas
                </span>
                <p className="text-xs text-[#111111] leading-relaxed">
                  3 ações de alto impacto mapeadas com potencial total de +R$ 205.000 / mês em faturamento incremental.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#111111] font-semibold block">
                  Status das Integrações
                </span>
                <p className="text-xs text-[#111111] leading-relaxed">
                  Arquitetura de dados pronta para APIs de Meta Ads, Google Ads e GA4.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* 2 & 3. RADAR DE CLIENTES EM RISCO & OPORTUNIDADES DE ESCALA (GRID 2 COLUNAS) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar de Risco */}
          <Card className="border-[#E4E4E7] bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-[#111111]">
                  Radar de Clientes em Risco
                </h3>
              </div>
              <Badge variant="dark" size="sm">
                2 Contas Monitoradas
              </Badge>
            </div>

            <div className="space-y-3">
              {riskClients.map((rk) => (
                <div
                  key={rk.id}
                  className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#111111]">
                        {rk.clientName}
                      </span>
                      <span className="text-[10px] text-[#71717A]">
                        ({rk.segment})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-800 font-bold">
                        Confiança: {rk.confidenceScore}%
                      </span>
                      <Badge
                        variant="dark"
                        size="sm"
                        className={
                          rk.riskLevel === "Crítico"
                            ? "bg-red-950 text-red-200 border-red-800"
                            : "bg-amber-100 text-amber-900 border-amber-300"
                        }
                      >
                        {rk.riskLevel}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-[#111111] leading-relaxed">
                    {rk.primaryIssue}
                  </p>

                  <div className="text-[11px] text-[#52525B] pt-1">
                    <strong className="text-[#111111]">Estratégia de Mitigação: </strong>
                    {rk.mitigationStrategy}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Oportunidades de Escala */}
          <Card className="border-[#E4E4E7] bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-[#4A8237]" />
                <h3 className="text-base font-bold text-[#111111]">
                  Oportunidades de Escala
                </h3>
              </div>
              <Badge variant="alien" size="sm">
                Alto Retorno
              </Badge>
            </div>

            <div className="space-y-3">
              {scaleOpportunities.map((sc) => (
                <div
                  key={sc.id}
                  className="p-4 rounded-xl bg-[rgba(74,130,55,0.06)] border border-[rgba(74,130,55,0.2)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#111111]">
                      {sc.clientName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#4A8237] font-bold">
                        Confiança: {sc.confidenceScore}%
                      </span>
                      <span className="text-xs font-mono font-bold text-[#4A8237] bg-white px-2 py-0.5 rounded border border-[#E4E4E7]">
                        ROAS {sc.currentRoas}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#52525B]">
                    Aumento de receita estimado em{" "}
                    <strong className="text-[#4A8237]">
                      {sc.projectedRevenueIncrease}
                    </strong>{" "}
                    com orçamento até {sc.maxProfitableBudget}.
                  </div>

                  <div className="text-[11px] text-[#111111] pt-1">
                    <strong className="text-[#4A8237]">Ação Recomendada: </strong>
                    {sc.recommendedAction}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 4. RECOMENDAÇÕES ESTRATÉGICAS COM NÍVEL DE CONFIANÇA */}
        <section>
          <Card className="border-[#E4E4E7] bg-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-[#4A8237]" />
                <h3 className="text-base font-bold text-[#111111]">
                  Recomendações Estratégicas com Nível de Confiança
                </h3>
              </div>
              <Badge variant="alien" size="sm">
                Ordenadas por Impacto
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between space-y-3 hover:border-[#D4D4D8] transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#111111]">
                        {rec.clientName}
                      </span>
                      <span className="text-[11px] font-mono text-[#4A8237] font-bold bg-white px-2 py-0.5 rounded border border-[#E4E4E7]">
                        {rec.confidenceScore}% de Confiança
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#111111]">
                      {rec.title}
                    </h4>

                    <p className="text-xs text-[#71717A] leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="text-xs font-mono font-bold text-[#4A8237] pt-1">
                      Impacto: {rec.expectedRevenueImpact}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E4E4E7] space-y-2">
                    <div className="text-[11px] text-[#52525B]">
                      <strong className="text-[#111111]">Ação: </strong>
                      {rec.suggestedAction}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between"
                      icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                      iconPosition="right"
                    >
                      Aprovar Recomendação
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* 5. SIMULADOR DE CRESCIMENTO (ROAS & BUDGET) */}
        <section>
          <GrowthSimulatorWidget />
        </section>

        {/* 6. CONSOLE DE CONVERSA EXECUTIVA (CHAT ALIEN MAX) */}
        <section>
          <AlienMaxChatConsole />
        </section>

        {/* 7. HISTÓRICO CONSOLIDADO DE INSIGHTS DA IA */}
        <section>
          <InsightsHistoryWidget />
        </section>
      </div>
    </PageContainer>
  );
}
