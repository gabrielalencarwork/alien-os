"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  googleAdsRepository,
  GoogleAdsCustomerRecord,
  GoogleAdsCampaignRecord,
  GoogleAdsAdGroupRecord,
  GoogleAdsAdRecord,
  GoogleAdsDashboardMetrics,
  AlienMaxGoogleAdsInsight,
} from "@/lib/repositories/googleAdsRepository";
import { GoogleAdsMetricsGrid } from "@/components/integracoes/google-ads/GoogleAdsMetricsGrid";
import { GoogleAdsCampaignsTable } from "@/components/integracoes/google-ads/GoogleAdsCampaignsTable";
import { AdGroupsTableWidget } from "@/components/integracoes/google-ads/AdGroupsTableWidget";
import { AdsTableWidget } from "@/components/integracoes/google-ads/AdsTableWidget";
import { GoogleAdsHierarchyBreadcrumb } from "@/components/integracoes/google-ads/GoogleAdsHierarchyBreadcrumb";
import { AlienMaxGoogleAdsAdvisorWidget } from "@/components/integracoes/google-ads/AlienMaxGoogleAdsAdvisorWidget";
import {
  ChevronRightIcon,
  ClockIcon,
  SparklesIcon,
  CheckCircle2Icon,
  LayoutDashboardIcon,
  BriefcaseIcon,
  UsersIcon,
  FileTextIcon,
  BotIcon,
} from "@/components/icons";

interface AvailableCustomer {
  customerId: string;
  descriptiveName: string;
  manager: boolean;
}

export default function GoogleAdsIntegrationPage() {
  const [metrics, setMetrics] = useState<GoogleAdsDashboardMetrics | null>(null);
  const [customers, setCustomers] = useState<GoogleAdsCustomerRecord[]>([]);
  const [campaigns, setCampaigns] = useState<GoogleAdsCampaignRecord[]>([]);
  const [adGroups, setAdGroups] = useState<GoogleAdsAdGroupRecord[]>([]);
  const [ads, setAds] = useState<GoogleAdsAdRecord[]>([]);
  const [insights, setInsights] = useState<AlienMaxGoogleAdsInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "campanhas" | "ad-groups" | "ads" | "metricas" | "alien-max"
  >("dashboard");

  // Autenticação e Seleção de Conta
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [fullSyncing, setFullSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createBrowserClient();

  const loadDatabaseData = async () => {
    try {
      const [metRes, custRes, cmpRes, agRes, adRes, insRes] = await Promise.all([
        googleAdsRepository.getDashboardMetrics(),
        googleAdsRepository.listCustomers(),
        googleAdsRepository.listCampaigns(),
        googleAdsRepository.listAdGroups(),
        googleAdsRepository.listAds(),
        googleAdsRepository.getAlienMaxInsights(),
      ]);

      setMetrics(metRes);
      setCustomers(custRes);
      setCampaigns(cmpRes);
      setAdGroups(agRes);
      setAds(adRes);
      setInsights(insRes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setUserEmail(session.user?.email || null);
          if (session.provider_token) {
            setProviderToken(session.provider_token);
            fetchAvailableCustomers(session.provider_token);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar sessão Supabase:", err);
      }
    }

    checkAuthSession();
    loadDatabaseData();
  }, []);

  // 1. Iniciar Login OAuth 2.0
  const handleGoogleOAuthLogin = async () => {
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/adwords",
          redirectTo: window.location.href,
        },
      });

      if (error) {
        setErrorMessage(`Erro ao iniciar OAuth: ${error.message}`);
      }
    } catch (err: any) {
      setErrorMessage(`Erro ao conectar com Google Auth: ${err?.message || err}`);
    }
  };

  // 2. Buscar Contas MCC e Customer IDs via API Route
  const fetchAvailableCustomers = async (token: string) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integracoes/google-ads/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao listar contas do Google Ads.");
      }

      setAvailableCustomers(data.customers || []);
      if (data.customers && data.customers.length > 0) {
        setSelectedCustomerId(data.customers[0].customerId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Não foi possível listar as contas de anúncios da conta Google.");
    }
  };

  // 3. Executar Sincronização Hierárquica via API Route /api/integracoes/google-ads/sync
  const handleSync = async (isFull: boolean = false) => {
    const targetCid = selectedCustomerId || (customers[0]?.customerId || "");
    if (!targetCid) {
      setErrorMessage("Selecione um Customer ID para realizar a sincronização.");
      return;
    }

    const tokenToUse = providerToken;
    if (!tokenToUse) {
      setErrorMessage("É necessário conectar com a conta Google para obter o token da API.");
      return;
    }

    if (isFull) setFullSyncing(true);
    else setSyncing(true);

    setErrorMessage(null);

    const matched = availableCustomers.find((c) => c.customerId === targetCid);
    const descName = matched ? matched.descriptiveName : `Conta ${targetCid}`;

    try {
      const res = await fetch("/api/integracoes/google-ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokenToUse,
          customerId: targetCid,
          descriptiveName: descName,
          isFullSync: isFull,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro durante a sincronização do Google Ads.");
      }

      await loadDatabaseData();
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao sincronizar hierarquia do Google Ads.");
    } finally {
      setSyncing(false);
      setFullSyncing(false);
    }
  };

  const activeCustomer = customers[0];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "campanhas", label: "Campanhas", icon: <BriefcaseIcon className="w-3.5 h-3.5" />, badge: `${campaigns.length}` },
    { id: "ad-groups", label: "Grupos de Anúncios", icon: <UsersIcon className="w-3.5 h-3.5" />, badge: `${adGroups.length}` },
    { id: "ads", label: "Anúncios", icon: <FileTextIcon className="w-3.5 h-3.5" />, badge: `${ads.length}` },
    { id: "metricas", label: "Métricas Avançadas", icon: <SparklesIcon className="w-3.5 h-3.5" /> },
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

        {/* 1. Header Banner */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 21.1 · Arquitetura Padronizada
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Hierarquia: Conta ➔ Campanha ➔ Grupo ➔ Anúncio
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Google Ads (Arquitetura Oficial)
              </h1>
              <p className="text-sm text-[#52525B]">
                Leitura em tempo real da hierarquia de contas, campanhas, grupos, anúncios e métricas avançadas via Google Ads API
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleGoogleOAuthLogin}
              >
                Conectar Conta Google Ads (OAuth 2.0)
              </Button>
            </div>
          </div>
        </section>

        {/* Breadcrumb da Hierarquia */}
        {activeCustomer && (
          <GoogleAdsHierarchyBreadcrumb
            customerName={activeCustomer.descriptiveName}
            campaignName={campaigns[0]?.campaignName}
            adGroupName={adGroups[0]?.adGroupName}
            adName={ads[0]?.headline}
          />
        )}

        {/* Mensagem de Erro */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="font-bold text-red-900 text-xs ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. Seleção de Customer ID se Autenticado */}
        {providerToken && availableCustomers.length > 0 && (
          <Card className="border-[#4A8237] bg-[rgba(74,130,55,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="w-5 h-5 text-[#4A8237]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Conta Google Autenticada ({userEmail || "Conectado"})
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Selecione qual conta de anúncios / MCC deseja vincular ao Alien OS
                  </p>
                </div>
              </div>

              <Badge variant="alien" size="sm">
                OAuth Ativo
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none"
              >
                {availableCustomers.map((c) => (
                  <option key={c.customerId} value={c.customerId}>
                    {c.descriptiveName} (Customer ID: {c.customerId})
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleSync(false)}
                disabled={syncing || !selectedCustomerId}
              >
                {syncing ? "Sincronizando no Supabase..." : "Selecionar & Sincronizar"}
              </Button>
            </div>
          </Card>
        )}

        {/* 3. Navegação por Abas */}
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

        {loading ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Consultando banco de dados Supabase...</span>
          </div>
        ) : campaigns.length === 0 ? (
          /* Estado Vazio */
          <Card className="p-12 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <SparklesIcon className="w-6 h-6 text-[#4A8237]" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#111111]">
                Nenhuma Conta do Google Ads Sincronizada
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Conecte sua conta Google via OAuth 2.0 e selecione o Customer ID para importar suas campanhas e métricas de mídia paga.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleGoogleOAuthLogin}
              >
                Conectar Conta Google Ads via OAuth 2.0
              </Button>
            </div>
          </Card>
        ) : (
          /* Abas Ativas */
          <>
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <Card className="border-[#E4E4E7] bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#111111]">
                        {activeCustomer?.descriptiveName || "Conta Google Ads"}
                      </span>
                      <Badge variant="alien" showDot size="sm">
                        {activeCustomer?.status || "ENABLED"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#71717A]">
                      Customer ID: <span className="font-mono">{activeCustomer?.customerId}</span> · Moeda:{" "}
                      <span className="font-mono">{activeCustomer?.currencyCode}</span> · Fuso:{" "}
                      <span className="font-mono">{activeCustomer?.timeZone}</span> · Última Sync:{" "}
                      <span className="font-mono font-bold text-[#4A8237]">{activeCustomer?.lastSyncedAt}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(false)}
                      disabled={syncing || fullSyncing}
                      icon={<ClockIcon className="w-3.5 h-3.5" />}
                    >
                      {syncing ? "Sincronizando..." : "Sincronizar Agora"}
                    </Button>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSync(true)}
                      disabled={syncing || fullSyncing}
                    >
                      {fullSyncing ? "Carga Completa..." : "Atualizar Tudo"}
                    </Button>
                  </div>
                </Card>

                <GoogleAdsMetricsGrid metrics={metrics!} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <GoogleAdsCampaignsTable campaigns={campaigns} />
                  </div>
                  <div>
                    <AlienMaxGoogleAdsAdvisorWidget insights={insights} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "campanhas" && (
              <GoogleAdsCampaignsTable campaigns={campaigns} />
            )}

            {activeTab === "ad-groups" && (
              <AdGroupsTableWidget adGroups={adGroups} />
            )}

            {activeTab === "ads" && (
              <AdsTableWidget ads={ads} />
            )}

            {activeTab === "metricas" && (
              <GoogleAdsMetricsGrid metrics={metrics!} />
            )}

            {activeTab === "alien-max" && (
              <div className="max-w-xl mx-auto">
                <AlienMaxGoogleAdsAdvisorWidget insights={insights} />
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
