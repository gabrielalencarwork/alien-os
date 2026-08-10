"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  growthRepository,
  GrowthExperimentItem,
} from "@/lib/repositories/growthRepository";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  FileTextIcon,
  ClockIcon,
  BotIcon,
  CheckCircle2Icon,
} from "@/components/icons";

export default function ExperimentWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const [experiment, setExperiment] = useState<GrowthExperimentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "hipotese"
    | "resultados"
    | "evidencias"
    | "timeline"
    | "alien-max"
  >("dashboard");

  useEffect(() => {
    async function loadExperiment() {
      try {
        const res = await growthRepository.getExperimentById(params.id);
        setExperiment(res);
      } finally {
        setLoading(false);
      }
    }
    loadExperiment();
  }, [params.id]);

  if (loading || !experiment) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
          <span>Carregando workspace do experimento no Growth Lab...</span>
        </div>
      </PageContainer>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "hipotese", label: "Hipótese Formada", icon: <SparklesIcon className="w-3.5 h-3.5" /> },
    { id: "resultados", label: "Resultados A/B", icon: <CheckCircle2Icon className="w-3.5 h-3.5" />, badge: `${experiment.statisticalConfidencePercentage}% IC` },
    { id: "evidencias", label: "Evidências", icon: <FileTextIcon className="w-3.5 h-3.5" /> },
    { id: "timeline", label: "Timeline", icon: <ClockIcon className="w-3.5 h-3.5" /> },
    { id: "alien-max", label: "Alien Max", icon: <BotIcon className="w-3.5 h-3.5" />, badge: "IA" },
  ];

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/growth"
            className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
          >
            <span className="rotate-180 inline-block">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
            <span>Voltar para o Growth Lab</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="dark" size="sm">
                {experiment.type}
              </Badge>
              <Badge variant="alien" showDot>
                {experiment.status}
              </Badge>
              <span className="text-[10px] font-mono text-[#4A8237] font-bold">
                Prob. IA {experiment.alienMaxProbability}%
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                {experiment.title}
              </h1>
              <p className="text-sm text-[#52525B]">
                Cliente: <strong className="text-[#111111]">{experiment.clientName}</strong> · Responsável:{" "}
                <span className="font-semibold text-[#111111]">{experiment.ownerName}</span> · Métrica:{" "}
                <span className="font-medium text-[#4A8237]">{experiment.primaryMetric}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="sm">
              Validar Experimento
            </Button>
          </div>
        </div>

        {/* 6 Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-white p-2 rounded-xl border border-[#E4E4E7]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-[#FAFAFA] text-[#52525B] hover:text-[#111111] hover:bg-[#F4F4F5]"
                }`}
              >
                <span className={isActive ? "text-[#4A8237]" : "text-[#71717A]"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[rgba(74,130,55,0.1)] text-[#4A8237]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab View */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="space-y-1 bg-[#111111] text-white">
                <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
                  Confiança Estatística
                </span>
                <div className="text-2xl font-bold font-mono text-white">
                  {experiment.statisticalConfidencePercentage}%
                </div>
                <span className="text-[10px] text-zinc-300">Amostragem Relevante</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Impacto Confirmado
                </span>
                <div className="text-2xl font-bold font-mono text-[#4A8237]">
                  R$ {experiment.confirmedRevenueImpact.toLocaleString("pt-BR")}
                </div>
                <span className="text-[10px] text-[#71717A]">Ganho de receita</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Uplift de ROAS
                </span>
                <div className="text-2xl font-bold font-mono text-[#4A8237]">
                  +{experiment.roasGain}x
                </div>
                <span className="text-[10px] text-[#71717A]">Ganho marginal</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Ganho em Conversão
                </span>
                <div className="text-2xl font-bold font-mono text-[#111111]">
                  +{experiment.conversionGainPercentage}%
                </div>
                <span className="text-[10px] text-[#71717A]">CRO Lift</span>
              </Card>
            </div>

            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-[#111111] border-b border-[#F4F4F5] pb-2">
                Resumo da Hipótese Formulada
              </h3>
              <p className="text-xs text-[#52525B] leading-relaxed italic">
                "{experiment.hypothesis}"
              </p>
            </Card>
          </div>
        )}

        {activeTab === "resultados" && (
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-[#111111] border-b border-[#F4F4F5] pb-2">
              Resultados A/B: Variante A (Controle) vs Variante B (Testada)
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                <span className="text-[10px] text-[#71717A] uppercase font-bold block">Variante A (Controle)</span>
                <div className="text-base font-bold text-[#111111]">ROAS: 4.8x · Conv: 1.8%</div>
              </div>
              <div className="p-4 rounded-xl bg-[rgba(74,130,55,0.06)] border border-[#4A8237] space-y-2">
                <span className="text-[10px] text-[#4A8237] uppercase font-bold block">Variante B (Vencedora)</span>
                <div className="text-base font-bold text-[#4A8237]">ROAS: 6.4x · Conv: 2.38%</div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === "evidencias" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#111111]">
              Evidências & Mídias da Central de Documentos
            </h3>
            <p className="text-xs text-[#71717A]">
              Prints, gravações de Hotjar e vídeos da Variante B consumidos automaticamente.
            </p>
          </Card>
        )}

        {activeTab === "alien-max" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#111111]">
              Console Consultivo Alien Max · Experimento {experiment.title}
            </h3>
            <p className="text-xs text-[#71717A]">
              Probabilidade estatística de {experiment.alienMaxProbability}% de superação da controle.
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
