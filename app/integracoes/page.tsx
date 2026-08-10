"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  integrationRepository,
  IntegrationStats,
  IntegrationProviderItem,
  AlienMaxIntegrationInsight,
} from "@/lib/repositories/integrationRepository";
import { IntegrationMetricsGrid } from "@/components/integracoes/IntegrationMetricsGrid";
import { IntegrationProviderGrid } from "@/components/integracoes/IntegrationProviderGrid";
import { AlienMaxIntegrationAdvisorWidget } from "@/components/integracoes/AlienMaxIntegrationAdvisorWidget";
import { SettingsIcon, PlusIcon } from "@/components/icons";

export default function IntegracoesPage() {
  const [stats, setStats] = useState<IntegrationStats | null>(null);
  const [providers, setProviders] = useState<IntegrationProviderItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxIntegrationInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIntegrationData() {
      try {
        const [statRes, provRes, insightRes] = await Promise.all([
          integrationRepository.getStats(),
          integrationRepository.getProviders(),
          integrationRepository.getAlienMaxInsights(),
        ]);

        setStats(statRes);
        setProviders(provRes);
        setInsights(insightRes);
      } finally {
        setLoading(false);
      }
    }
    loadIntegrationData();
  }, []);

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Banner */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 19 · Infraestrutura de APIs
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Camada Preparada para Integrações Reais (Sprint 20)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Central de Integrações & Conectores
              </h1>
              <p className="text-sm text-[#52525B]">
                Cofre de credenciais OAuth 2.0, tokens de acesso, webhook receivers e contas vinculadas (Meta, Google, GA4 e Business)
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Novo Conector Customizado
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando status das integrações e cofres de chaves do Supabase...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <IntegrationMetricsGrid stats={stats} />
            </section>

            {/* 3. Main 2-Column Layout (12 Providers Grid + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Provider Grid (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-[#111111] tracking-tight">
                    Plataformas Conectadas & Disponíveis ({providers.length} Connectors)
                  </h2>
                  <span className="text-xs font-mono text-[#71717A]">
                    OAuth 2.0 & REST APIs
                  </span>
                </div>

                <IntegrationProviderGrid providers={providers} />
              </div>

              {/* Alien Max Integration Advisor (1 Col) */}
              <div>
                <AlienMaxIntegrationAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
