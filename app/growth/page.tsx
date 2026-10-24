"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  const loadGrowthData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadGrowthData();
  }, [loadGrowthData]);

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Banner & View Switcher */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 18 · Growth Lab
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  Central de Experimentos & CRO
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Growth Lab (Central de Experimentos)
              </h1>
              <p className="text-sm text-body">
                Registro, acompanhamento e validação de testes A/B, CRO de Landing Page, headlines e otimização contínua
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* View Switcher Toggle */}
              <div className="p-1 rounded-xl bg-canvas border border-line flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "cards"
                      ? "bg-inverse text-white"
                      : "text-body hover:text-ink"
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
                      ? "bg-inverse text-white"
                      : "text-body hover:text-ink"
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
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
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
        onCreateSuccess={loadGrowthData}
      />
    </PageContainer>
  );
}
