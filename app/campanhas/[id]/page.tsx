"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  campaignRepository,
  CampaignItem,
} from "@/lib/repositories/campaignRepository";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  RocketIcon,
  FileTextIcon,
  ClockIcon,
  WalletIcon,
  BotIcon,
  SparklesIcon,
} from "@/components/icons";

export default function CampaignWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const [campaign, setCampaign] = useState<CampaignItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "kpis"
    | "conjuntos"
    | "anuncios"
    | "criativos"
    | "metricas"
    | "timeline"
    | "alien-max"
  >("dashboard");

  useEffect(() => {
    async function loadCampaign() {
      try {
        const res = await campaignRepository.getCampaignById(params.id);
        setCampaign(res);
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [params.id]);

  if (loading || !campaign) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
          <span>Carregando workspace da campanha de mídia...</span>
        </div>
      </PageContainer>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "kpis", label: "KPIs", icon: <WalletIcon className="w-3.5 h-3.5" /> },
    { id: "conjuntos", label: "Conjuntos", icon: <RocketIcon className="w-3.5 h-3.5" />, badge: "AdSets" },
    { id: "anuncios", label: "Anúncios", icon: <RocketIcon className="w-3.5 h-3.5" />, badge: "Ads" },
    { id: "criativos", label: "Criativos", icon: <FileTextIcon className="w-3.5 h-3.5" /> },
    { id: "metricas", label: "Métricas & Gráficos", icon: <ClockIcon className="w-3.5 h-3.5" />, badge: "Live" },
    { id: "timeline", label: "Timeline", icon: <SparklesIcon className="w-3.5 h-3.5" /> },
    { id: "alien-max", label: "Alien Max", icon: <BotIcon className="w-3.5 h-3.5" />, badge: "IA" },
  ];

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/campanhas"
            className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
          >
            <span className="rotate-180 inline-block">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
            <span>Voltar para Central de Campanhas</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="dark" size="sm">
                {campaign.platform}
              </Badge>
              <Badge variant="alien" showDot>
                ROAS {campaign.roas}x
              </Badge>
              <Badge variant="outline" size="sm">
                {campaign.status}
              </Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                {campaign.name}
              </h1>
              <p className="text-sm text-[#52525B]">
                Cliente: <strong className="text-[#111111]">{campaign.clientName}</strong> · Gestor:{" "}
                <span className="font-semibold text-[#111111]">{campaign.managerName}</span> · Objetivo:{" "}
                <span className="font-medium text-[#4A8237]">{campaign.objective}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="sm">
              Otimizar Orçamento
            </Button>
          </div>
        </div>

        {/* 8 Tabs Navigation */}
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
            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="space-y-1 bg-[#111111] text-white">
                <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
                  ROAS Atual
                </span>
                <div className="text-2xl font-bold font-mono text-white">
                  {campaign.roas}x
                </div>
                <span className="text-[10px] text-zinc-300">Retorno s/ Mídia</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Investimento Realizado
                </span>
                <div className="text-2xl font-bold font-mono text-[#111111]">
                  R$ {campaign.spentAmount.toLocaleString("pt-BR")}
                </div>
                <span className="text-[10px] text-[#71717A]">Orç. Diário R$ {campaign.dailyBudget}</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Receita Gerada
                </span>
                <div className="text-2xl font-bold font-mono text-[#4A8237]">
                  R$ {campaign.revenueGenerated.toLocaleString("pt-BR")}
                </div>
                <span className="text-[10px] text-[#71717A]">Atribuição de Vendas</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Conversões / Leads
                </span>
                <div className="text-2xl font-bold font-mono text-[#111111]">
                  {campaign.conversionsCount} / {campaign.leadsCount}
                </div>
                <span className="text-[10px] text-[#71717A]">Ações validadas</span>
              </Card>
            </div>

            {/* Description & Details */}
            <Card className="space-y-3">
              <h3 className="text-sm font-bold text-[#111111] border-b border-[#F4F4F5] pb-2">
                Estratégia & Segmentação da Campanha
              </h3>
              <p className="text-xs text-[#52525B] leading-relaxed">
                {campaign.description}
              </p>
            </Card>
          </div>
        )}

        {activeTab === "kpis" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">CTR</span>
              <div className="text-xl font-bold font-mono text-[#111111]">{campaign.ctrPercentage}%</div>
            </Card>
            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">CPM</span>
              <div className="text-xl font-bold font-mono text-[#111111]">R$ {campaign.cpmAmount.toFixed(2)}</div>
            </Card>
            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">CPA</span>
              <div className="text-xl font-bold font-mono text-[#111111]">R$ {campaign.cpaAmount.toFixed(2)}</div>
            </Card>
            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">CPL</span>
              <div className="text-xl font-bold font-mono text-[#111111]">R$ {campaign.cplAmount.toFixed(2)}</div>
            </Card>
          </div>
        )}

        {activeTab === "metricas" && (
          <Card className="p-8 text-center space-y-4">
            <h3 className="text-sm font-bold text-[#111111]">
              Série Temporal Diária (Investimento vs Receita vs ROAS)
            </h3>
            <p className="text-xs text-[#71717A]">
              Estrutura de atribuição no estilo Triple Whale & Hyros pronta para consumir webhooks e APIs oficiais.
            </p>
            <div className="h-48 bg-[#FAFAFA] border border-dashed border-[#E4E4E7] rounded-xl flex items-center justify-center text-xs font-mono text-[#4A8237]">
              [ Gráfico Interativo de Performance Diária · ROAS {campaign.roas}x ]
            </div>
          </Card>
        )}

        {activeTab === "criativos" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#111111]">
              Criativos & Vídeos Vinculados da Central de Documentos
            </h3>
            <p className="text-xs text-[#71717A]">
              Consumo automático de mídias cadastradas na Central de Documentos sob <code className="font-mono text-[#4A8237]">clientes/{campaign.companyId}/criativos/</code>.
            </p>
          </Card>
        )}

        {activeTab === "alien-max" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#111111]">
              Console Consultivo Alien Max · Campanha {campaign.name}
            </h3>
            <p className="text-xs text-[#71717A]">
              Diagnóstico autônomo de oscilações de ROAS, frequência e estimativas de escala.
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
