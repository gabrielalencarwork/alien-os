import React from "react";
import { PageContainer } from "@/components/PageContainer";
import { AlienMaxBriefingHeader } from "@/components/home/AlienMaxBriefingHeader";
import { CriticalAlertsWidget } from "@/components/home/CriticalAlertsWidget";
import { PrioritizedRecommendationsWidget } from "@/components/home/PrioritizedRecommendationsWidget";
import { FinancialSummaryWidget } from "@/components/home/FinancialSummaryWidget";
import { OperationalSummaryWidget } from "@/components/home/OperationalSummaryWidget";
import { AgencyTimeline } from "@/components/AgencyTimeline";

export default function Home() {
  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1 & 2. HERO CABEÇALHO & DAILY BRIEFING ALIEN MAX */}
        <section>
          <AlienMaxBriefingHeader />
        </section>

        {/* 3. ALERTAS CRÍTICOS (CLIENTES EM RISCO) */}
        <section>
          <CriticalAlertsWidget />
        </section>

        {/* 4, 5 & 6. RECOMENDAÇÕES PRIORIZADAS, OPORTUNIDADES & CASES ALIEN */}
        <section>
          <PrioritizedRecommendationsWidget />
        </section>

        {/* 7. RESUMO FINANCEIRO CONSOLIDADO */}
        <section>
          <FinancialSummaryWidget />
        </section>

        {/* 8. RESUMO OPERACIONAL (PROJETOS, TAREFAS & REUNIÕES) */}
        <section>
          <OperationalSummaryWidget />
        </section>

        {/* 9. TIMELINE INTELIGENTE DA OPERAÇÃO */}
        <section>
          <AgencyTimeline />
        </section>
      </div>
    </PageContainer>
  );
}
