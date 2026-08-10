"use client";

import React, { useState } from "react";
import { Cliente } from "@/types";
import {
  ClientWorkspaceHeader,
  WorkspaceTab,
} from "./ClientWorkspaceHeader";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ClientIntelligencePanel } from "./ClientIntelligencePanel";
import { AbductionJourneyTimeline } from "./AbductionJourneyTimeline";
import { InteractiveAbductionJourney } from "./InteractiveAbductionJourney";
import { ContractedServiceCard } from "./ContractedServiceCard";
import { ActivityTimeline } from "./ActivityTimeline";
import { ClientDocumentsCard } from "./ClientDocumentsCard";
import { ClientCampaignsTab } from "./ClientCampaignsTab";
import { ClientGrowthTab } from "./ClientGrowthTab";
import { ClientFinancialTab } from "./ClientFinancialTab";

export interface ClientGrowthWorkspaceViewProps {
  client: Cliente;
}

export function ClientGrowthWorkspaceView({ client }: ClientGrowthWorkspaceViewProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("dashboard");

  return (
    <div className="space-y-6">
      {/* Workspace Header with 8-Tab Navigation */}
      <ClientWorkspaceHeader
        client={client}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* TAB 1: DASHBOARD EXECUTIVO */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Main KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                ROAS Atual
              </span>
              <div className="text-xl font-bold font-mono text-[#4A8237]">
                {client.currentRoas}
              </div>
              <span className="text-[10px] text-[#71717A]">Meta: 4.0x+</span>
            </Card>

            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                ROI Consolidado
              </span>
              <div className="text-xl font-bold font-mono text-[#111111]">
                {client.currentRoi}
              </div>
              <span className="text-[10px] text-[#71717A]">Mídia & Operação</span>
            </Card>

            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                Receita Gerada
              </span>
              <div className="text-lg font-bold font-mono text-[#111111] truncate">
                {client.generatedRevenue}
              </div>
              <span className="text-[10px] text-[#71717A]">Acumulado</span>
            </Card>

            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                Data de Entrada
              </span>
              <div className="text-sm font-semibold text-[#111111]">
                {client.entryDate}
              </div>
              <span className="text-[10px] text-[#71717A]">Cliente Ativo</span>
            </Card>

            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                Próxima Reunião
              </span>
              <div className="text-xs font-semibold text-[#111111]">
                {client.nextMeeting}
              </div>
              <span className="text-[10px] text-[#71717A]">Alinhamento</span>
            </Card>

            <Card padding="sm" className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                Última Atualização
              </span>
              <div className="text-xs font-semibold text-[#111111]">
                {client.lastUpdate}
              </div>
              <span className="text-[10px] text-[#71717A]">Sync automático</span>
            </Card>
          </div>

          {/* Primary Objective Banner */}
          <div className="p-4 rounded-xl bg-[#111111] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold">
                Objetivo Principal da Conta
              </span>
              <p className="text-sm font-medium text-white">
                {client.primaryObjective}
              </p>
            </div>
            <Badge variant="alien" size="sm">
              Foco Q3-2026
            </Badge>
          </div>

          {/* Alien Intelligence Panel */}
          <ClientIntelligencePanel
            intelligence={client.aiIntelligence}
            clientName={client.name}
            clientId={client.id}
          />

          {/* Abduction Journey Timeline Overview */}
          <AbductionJourneyTimeline
            currentStage={client.journeyStage}
            clientId={client.id}
          />

          {/* Contracted Services */}
          <ContractedServiceCard services={client.contractedServices} />

          {/* Activity Timeline & Client Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityTimeline activities={client.activities} />
            <ClientDocumentsCard documents={client.documents} />
          </div>
        </div>
      )}

      {/* TAB 2: JORNADA DE ABDUÇÃO */}
      {activeTab === "jornada" && (
        <InteractiveAbductionJourney clientId={client.id} clientName={client.name} />
      )}

      {/* TAB 3: CAMPANHAS */}
      {activeTab === "campanhas" && <ClientCampaignsTab client={client} />}

      {/* TAB 4: GROWTH */}
      {activeTab === "growth" && <ClientGrowthTab client={client} />}

      {/* TAB 5: FINANCEIRO */}
      {activeTab === "financeiro" && <ClientFinancialTab client={client} />}

      {/* TAB 6: TIMELINE */}
      {activeTab === "timeline" && <ActivityTimeline activities={client.activities} />}

      {/* TAB 7: DOCUMENTOS */}
      {activeTab === "documentos" && <ClientDocumentsCard documents={client.documents} />}

      {/* TAB 8: ALIEN MAX */}
      {activeTab === "alien-max" && (
        <ClientIntelligencePanel
          intelligence={client.aiIntelligence}
          clientName={client.name}
          clientId={client.id}
        />
      )}
    </div>
  );
}
