"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  alienMaxEngine,
  ExecutiveDailyBriefing,
  RiskRadarAlert,
} from "@/lib/ai/alienMaxEngine";
import { AlienMaxExecutiveBriefingWidget } from "@/components/alien-max/AlienMaxExecutiveBriefingWidget";
import { AlienMaxRiskRadarWidget } from "@/components/alien-max/AlienMaxRiskRadarWidget";
import { AlienMaxChatInterface } from "@/components/alien-max/AlienMaxChatInterface";
import { BotIcon, SparklesIcon, RefreshCwIcon } from "@/components/icons";

export default function AlienMaxCentralPage() {
  const [briefing, setBriefing] = useState<ExecutiveDailyBriefing | null>(null);
  const [riskAlerts, setRiskAlerts] = useState<RiskRadarAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [brRes, rkRes] = await Promise.all([
        alienMaxEngine.generateExecutiveDailyBriefing(),
        alienMaxEngine.generateRiskRadar(),
      ]);

      setBriefing(brRes);
      setRiskAlerts(rkRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* Header Banner */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 25 · Alien Max AI Engine Core
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Central de Inteligência Autônoma
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Alien Max (IA Oficial do Alien OS)
              </h1>
              <p className="text-sm text-[#52525B]">
                Motor de inteligência autônomo conectado em tempo real a todas as mídias, CRM, MRR financeiro e Growth Lab
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={loadData}
                icon={<RefreshCwIcon className="w-3.5 h-3.5" />}
              >
                Atualizar Auditoria IA
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Alien Max auditando tabelas do Supabase...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Executive Daily Briefing */}
            {briefing && <AlienMaxExecutiveBriefingWidget briefing={briefing} />}

            {/* 2-Column Main Section: Interactive Chat + Risk Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Conversational Chat (2 Cols) */}
              <div className="lg:col-span-2">
                <AlienMaxChatInterface />
              </div>

              {/* Risk Radar & Autonomous Optimization (1 Col) */}
              <div>
                <AlienMaxRiskRadarWidget alerts={riskAlerts} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
