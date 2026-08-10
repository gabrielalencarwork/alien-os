"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  growthRepository,
  GrowthStats,
  GrowthExperimentItem,
  AlienMaxGrowthInsight,
} from "@/lib/repositories/growthRepository";
import { GrowthMetricsGrid } from "@/components/growth/GrowthMetricsGrid";
import { GrowthCardGridWidget } from "@/components/growth/GrowthCardGridWidget";
import { GrowthListWidget } from "@/components/growth/GrowthListWidget";
import { GrowthExperimentCreateModal } from "@/components/growth/GrowthExperimentCreateModal";
import { AlienMaxGrowthAdvisorWidget } from "@/components/growth/AlienMaxGrowthAdvisorWidget";
import {
  PlusIcon,
  LayoutDashboardIcon,
  BriefcaseIcon,
  SparklesIcon,
} from "@/components/icons";

export default function GrowthLabPage() {
  const [stats, setStats] = useState<GrowthStats | null>(null);
  const [experiments, setExperiments] = useState<GrowthExperimentItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxGrowthInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode ('cards' | 'list')
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadGrowthData() {
      try {
        const [statRes, expRes, insightRes] = await Promise.all([
          growthRepository.getStats(),
          growthRepository.getExperiments(),
          growthRepository.getAlienMaxInsights(),
        ]);

        setStats(statRes);
        setExperiments(expRes);
        setInsights(insightRes);
      } finally {
        setLoading(false);
      }
    }
    loadGrowthData();
  }, []);

  const handleCreateSuccess = (title: string) => {
    const newExp: GrowthExperimentItem = {
      id: `exp-${Date.now()}`,
      companyId: "aura-health",
      clientName: "Aura Health",
      companyName: "Aura Suplementos LTDA",
      title: title,
      type: "Criativo",
      hypothesis: "Substituir imagens por vídeos UGC aumentará a taxa de conversão.",
      problemIdentified: "Abandono de carrinho elevado.",
      objective: "Aumentar CRO no checkout",
      primaryMetric: "Taxa de Conversão",
      secondaryMetric: "ROAS",
      ownerName: "Gabriel Alencar",
      priority: "Alta",
      status: "Rodando",
      startDate: new Date().toISOString().split("T")[0],
      estimatedRevenueImpact: 30000,
      confirmedRevenueImpact: 0,
      roasGain: 1.2,
      conversionGainPercentage: 18,
      statisticalConfidencePercentage: 95,
      alienMaxProbability: 92,
    };

    setExperiments((prev) => [newExp, ...prev]);
  };

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Banner & View Switcher */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 18 · Growth Lab
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Central de Experimentos & CRO
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Growth Lab (Central de Experimentos)
              </h1>
              <p className="text-sm text-[#52525B]">
                Registro, acompanhamento e validação de testes A/B, CRO de Landing Page, headlines e otimização contínua
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* View Switcher Toggle */}
              <div className="p-1 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center gap-1 shadow-xs">
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
                Novo Experimento
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando experimentos do Growth Lab do Supabase...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <GrowthMetricsGrid stats={stats} />
            </section>

            {/* 3. Main 2-Column Layout (Growth Feed + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary View (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {viewMode === "cards" && (
                  <GrowthCardGridWidget experiments={experiments} />
                )}

                {viewMode === "list" && (
                  <GrowthListWidget experiments={experiments} />
                )}
              </div>

              {/* Alien Max Growth Advisor (1 Col) */}
              <div>
                <AlienMaxGrowthAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <GrowthExperimentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />
    </PageContainer>
  );
}
