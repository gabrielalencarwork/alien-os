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
          <Card className="border-line bg-surface relative overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inverse via-accent to-inverse" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-line-soft">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="alien" showDot>
                    Alien Max Intelligence Center · v2.0
                  </Badge>
                  <span className="text-xs font-mono text-subtle">
                    Consultoria Estratégica Autônoma
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
                  Centro de Inteligência Executiva
                </h1>

                <p className="text-sm sm:text-base text-body leading-relaxed max-w-3xl font-normal">
                  O Alien Max analisa o desempenho da carteira, calcula probabilidades e apresenta recomendações ordenadas por faturamento e nível de confiança. <strong className="text-ink">A decisão final é 100% humana.</strong>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-inverse text-white flex items-center gap-4 border border-accent shrink-0">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center border border-accent shrink-0">
                  <BotIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
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
              <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
                  Resumo Executivo do Dia
                </span>
                <p className="text-xs text-ink leading-relaxed">
                  Nenhuma campanha ativa no momento. Conecte contas de anúncios para acompanhar o ROAS consolidado da carteira.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-semibold block">
                  Recomendações Ativas
                </span>
                <p className="text-xs text-ink leading-relaxed">
                  Nenhuma ação pendente no momento. As recomendações serão geradas com base nos dados reais das contas conectadas.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink font-semibold block">
                  Status das Integrações
                </span>
                <p className="text-xs text-ink leading-relaxed">
                  Arquitetura de dados pronta para APIs de Meta Ads, Google Ads e GA4.
                </p>
              </div>
            </div>
          </Card>
        </section>

        {/* 2 & 3. RADAR DE CLIENTES EM RISCO & OPORTUNIDADES DE ESCALA (GRID 2 COLUNAS) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar de Risco */}
          <Card className="border-line bg-surface space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
                <h3 className="text-base font-bold text-ink">
                  Radar de Clientes em Risco
                </h3>
              </div>
              <Badge variant="dark" size="sm">
                2 Contas Monitoradas
              </Badge>
            </div>

            <div className="space-y-3">
              {riskClients.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted bg-canvas rounded-xl border border-dashed border-line">
                  Nenhum cliente em situação de risco detectado no momento.
                </div>
              ) : (
                riskClients.map((rk) => (
                  <div
                    key={rk.id}
                    className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-ink">
                          {rk.clientName}
                        </span>
                        <span className="text-[10px] text-muted">
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

                    <p className="text-xs text-ink leading-relaxed">
                      {rk.primaryIssue}
                    </p>

                    <div className="text-[11px] text-body pt-1">
                      <strong className="text-ink">Estratégia de Mitigação: </strong>
                      {rk.mitigationStrategy}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Oportunidades de Escala */}
          <Card className="border-line bg-surface space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="w-4 h-4 text-accent" />
                <h3 className="text-base font-bold text-ink">
                  Oportunidades de Escala
                </h3>
              </div>
              <Badge variant="alien" size="sm">
                Alto Retorno
              </Badge>
            </div>

            <div className="space-y-3">
              {scaleOpportunities.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted bg-canvas rounded-xl border border-dashed border-line">
                  Nenhuma oportunidade de escala identificada no momento.
                </div>
              ) : (
                scaleOpportunities.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-4 rounded-xl bg-accent/6 border border-accent/20 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink">
                        {sc.clientName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-accent font-bold">
                          Confiança: {sc.confidenceScore}%
                        </span>
                        <span className="text-xs font-mono font-bold text-accent bg-surface px-2 py-0.5 rounded border border-line">
                          ROAS {sc.currentRoas}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-body">
                      Aumento de receita estimado em{" "}
                      <strong className="text-accent">
                        {sc.projectedRevenueIncrease}
                      </strong>{" "}
                      com orçamento até {sc.maxProfitableBudget}.
                    </div>

                    <div className="text-[11px] text-ink pt-1">
                      <strong className="text-accent">Ação Recomendada: </strong>
                      {sc.recommendedAction}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </section>

        {/* 4. RECOMENDAÇÕES ESTRATÉGICAS COM NÍVEL DE CONFIANÇA */}
        <section>
          <Card className="border-line bg-surface space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-accent" />
                <h3 className="text-base font-bold text-ink">
                  Recomendações Estratégicas com Nível de Confiança
                </h3>
              </div>
              <Badge variant="alien" size="sm">
                Ordenadas por Impacto
              </Badge>
            </div>

            {recommendations.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted bg-canvas rounded-xl border border-dashed border-line">
                Nenhuma recomendação pendente. Conecte contas de mídia e cadastre clientes para gerar análises estratégicas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-canvas border border-line flex flex-col justify-between space-y-3 hover:border-line-strong transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-ink">
                          {rec.clientName}
                        </span>
                        <span className="text-[11px] font-mono text-accent font-bold bg-surface px-2 py-0.5 rounded border border-line">
                          {rec.confidenceScore}% de Confiança
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-ink">
                        {rec.title}
                      </h4>

                      <p className="text-xs text-muted leading-relaxed">
                        {rec.description}
                      </p>

                      <div className="text-xs font-mono font-bold text-accent pt-1">
                        Impacto: {rec.expectedRevenueImpact}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-line space-y-2">
                      <div className="text-[11px] text-body">
                        <strong className="text-ink">Ação: </strong>
                        {rec.suggestedAction}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between"
                        icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />}
                        iconPosition="right"
                      >
                        Aprovar Recomendação
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
