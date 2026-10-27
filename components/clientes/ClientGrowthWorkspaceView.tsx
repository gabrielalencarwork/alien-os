"use client";

import React, { useState } from "react";
import { Cliente } from "@/types";
import {
  ClientWorkspaceHeader,
  WorkspaceTab,
} from "./ClientWorkspaceHeader";
import { ClientGoalsCard } from "./ClientGoalsCard";
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
          {/* Ficha do cliente (metas) + resultados reais da semana */}
          <ClientGoalsCard companyId={client.id} />

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
