"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  campaignRepository,
  CampaignStats,
  CampaignItem,
  AlienMaxCampaignInsight,
} from "@/lib/repositories/campaignRepository";
import { CampaignMetricsGrid } from "@/components/campanhas/CampaignMetricsGrid";
import { CampaignCardGridWidget } from "@/components/campanhas/CampaignCardGridWidget";
import { CampaignListWidget } from "@/components/campanhas/CampaignListWidget";
import { CampaignCreateModal } from "@/components/campanhas/CampaignCreateModal";
import { AlienMaxCampaignAdvisorWidget } from "@/components/campanhas/AlienMaxCampaignAdvisorWidget";
import {
  PlusIcon,
  LayoutDashboardIcon,
  BriefcaseIcon,
  RocketIcon,
} from "@/components/icons";

export default function CampanhasPage() {
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxCampaignInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode ('cards' | 'list')
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadCampaignData() {
      try {
        const [statRes, cmpRes, insightRes] = await Promise.all([
          campaignRepository.getStats(),
          campaignRepository.getCampaigns(),
          campaignRepository.getAlienMaxInsights(),
        ]);

        setStats(statRes);
        setCampaigns(cmpRes);
        setInsights(insightRes);
      } finally {
        setLoading(false);
      }
    }
    loadCampaignData();
  }, []);

  const handleCreateSuccess = (name: string) => {
    const newCmp: CampaignItem = {
      id: `cmp-${Date.now()}`,
      companyId: "aura-health",
      clientName: "Aura Health",
      companyName: "Aura Suplementos LTDA",
      name: name,
      platform: "Meta Ads",
      objective: "Conversões",
      type: "CBO Sales",
      description: "Nova campanha de mídia paga lançada no Campaign Hub",
      managerName: "Lucas Mendes",
      priority: "Alta",
      status: "Ativa",
      startDate: new Date().toISOString().split("T")[0],
      dailyBudget: 500,
      monthlyBudget: 15000,
      spentAmount: 500,
      revenueGenerated: 3200,
      roas: 6.4,
      roiPercentage: 420,
      cacAmount: 32.0,
      cplAmount: 11.5,
      cpaAmount: 32.0,
      ctrPercentage: 3.4,
      cpmAmount: 15.0,
      conversionsCount: 16,
      leadsCount: 42,
      alienScore: 95,
      healthStatus: "Excelente",
      dailyMetrics: [],
      creatives: [],
    };

    setCampaigns((prev) => [newCmp, ...prev]);
  };

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Banner & View Toggle */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 17 · Campaign Hub
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Central de Mídia Paga & Performance
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Central de Campanhas & Performance
              </h1>
              <p className="text-sm text-[#52525B]">
                Gestão consolidada de Meta Ads, Google Ads, TikTok e LinkedIn com atribuição de vendas e cálculo de ROAS
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* View Switcher Toggle */}
              <div className="p-1 rounded-xl bg-white border border-[#E4E4E7] flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "cards"
                      ? "bg-[#111111] text-white"
                      : "text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <LayoutDashboardIcon className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "list"
                      ? "bg-[#111111] text-white"
                      : "text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  <span>Lista</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Nova Campanha
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando dados de campanhas do Supabase...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <CampaignMetricsGrid stats={stats} />
            </section>

            {/* 3. Main 2-Column Layout (Campaign Feed + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary View (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {viewMode === "cards" && (
                  <CampaignCardGridWidget campaigns={campaigns} />
                )}

                {viewMode === "list" && (
                  <CampaignListWidget campaigns={campaigns} />
                )}
              </div>

              {/* Alien Max Campaign Advisor (1 Col) */}
              <div>
                <AlienMaxCampaignAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <CampaignCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />
    </PageContainer>
  );
}
