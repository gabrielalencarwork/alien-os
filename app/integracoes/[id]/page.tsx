"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  integrationRepository,
  IntegrationProviderItem,
} from "@/lib/repositories/integrationRepository";
import { IntegrationConfigurationForm } from "@/components/integracoes/IntegrationConfigurationForm";
import { IntegrationAccountsTable } from "@/components/integracoes/IntegrationAccountsTable";
import { IntegrationLogsWidget } from "@/components/integracoes/IntegrationLogsWidget";
import { IntegrationStatusBadge } from "@/components/integracoes/IntegrationStatusBadge";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  FileTextIcon,
  BotIcon,
} from "@/components/icons";

export default function ProviderIntegrationWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const [provider, setProvider] = useState<IntegrationProviderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "configuracao" | "contas" | "logs" | "alien-max"
  >("dashboard");

  useEffect(() => {
    async function loadProvider() {
      try {
        const res = await integrationRepository.getProviderBySlug(params.id);
        setProvider(res);
      } finally {
        setLoading(false);
      }
    }
    loadProvider();
  }, [params.id]);

  if (loading || !provider) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
          <span>Carregando workspace da integração...</span>
        </div>
      </PageContainer>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "configuracao", label: "Configuração OAuth", icon: <SettingsIcon className="w-3.5 h-3.5" /> },
    { id: "contas", label: "Contas Vinculadas", icon: <UsersIcon className="w-3.5 h-3.5" />, badge: `${provider.connectedAccountsCount}` },
    { id: "logs", label: "Logs Auditáveis", icon: <FileTextIcon className="w-3.5 h-3.5" /> },
    { id: "alien-max", label: "Alien Max", icon: <BotIcon className="w-3.5 h-3.5" />, badge: "IA" },
  ];

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/integracoes"
            className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
          >
            <span className="rotate-180 inline-block">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
            <span>Voltar para Central de Integrações</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="dark" size="sm">
                {provider.category}
              </Badge>
              <IntegrationStatusBadge status={provider.status} />
              <span className="text-[10px] font-mono text-[#A1A1AA]">
                API {provider.apiVersion}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Workspace da Integração: {provider.name}
              </h1>
              <p className="text-sm text-[#52525B]">
                {provider.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a href={provider.docsUrl} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm">
                Documentação Oficial da API
              </Button>
            </a>
          </div>
        </div>

        {/* 5 Tabs Navigation */}
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
                  Status do Conector
                </span>
                <div className="text-xl font-bold font-mono text-white">
                  {provider.status}
                </div>
                <span className="text-[10px] text-zinc-300">Saúde da Conexão</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Contas Vinculadas
                </span>
                <div className="text-xl font-bold font-mono text-[#111111]">
                  {provider.connectedAccountsCount}
                </div>
                <span className="text-[10px] text-[#71717A]">CIDs / BMs</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Última Sincronização
                </span>
                <div className="text-sm font-bold font-mono text-[#4A8237]">
                  {provider.lastSyncedAt}
                </div>
                <span className="text-[10px] text-[#71717A]">Job de Sync</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Versão da API
                </span>
                <div className="text-xl font-bold font-mono text-[#111111]">
                  {provider.apiVersion}
                </div>
                <span className="text-[10px] text-[#71717A]">REST / GraphQL</span>
              </Card>
            </div>

            <IntegrationConfigurationForm
              tokens={provider.tokens}
              providerName={provider.name}
            />
          </div>
        )}

        {activeTab === "configuracao" && (
          <IntegrationConfigurationForm
            tokens={provider.tokens}
            providerName={provider.name}
          />
        )}

        {activeTab === "contas" && (
          <IntegrationAccountsTable accounts={provider.accounts} />
        )}

        {activeTab === "logs" && (
          <IntegrationLogsWidget logs={provider.logs} />
        )}

        {activeTab === "alien-max" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-[#111111]">
              Console Consultivo Alien Max · {provider.name}
            </h3>
            <p className="text-xs text-[#71717A]">
              Monitoramento autônomo de tokens de acesso, webhook receivers e eventos de conversão.
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
