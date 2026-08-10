"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  metaAdsRepository,
  MetaAdsAccountRecord,
  MetaAdsCampaignRecord,
  MetaAdsAdSetRecord,
  MetaAdsAdRecord,
  MetaAdsDashboardMetrics,
  AlienMaxMetaAdsInsight,
} from "@/lib/repositories/metaAdsRepository";
import { MetaAdsMetricsGrid } from "@/components/integracoes/meta-ads/MetaAdsMetricsGrid";
import { MetaAdsCampaignsTable } from "@/components/integracoes/meta-ads/MetaAdsCampaignsTable";
import { MetaAdsAdSetsTableWidget } from "@/components/integracoes/meta-ads/MetaAdsAdSetsTableWidget";
import { MetaAdsAdsTableWidget } from "@/components/integracoes/meta-ads/MetaAdsAdsTableWidget";
import { AlienMaxMetaAdsAdvisorWidget } from "@/components/integracoes/meta-ads/AlienMaxMetaAdsAdvisorWidget";
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

interface AvailableMetaAccount {
  accountId: string;
  accountName: string;
  businessId?: string;
}

export default function MetaAdsIntegrationPage() {
  const [metrics, setMetrics] = useState<MetaAdsDashboardMetrics | null>(null);
  const [accounts, setAccounts] = useState<MetaAdsAccountRecord[]>([]);
  const [campaigns, setCampaigns] = useState<MetaAdsCampaignRecord[]>([]);
  const [adSets, setAdSets] = useState<MetaAdsAdSetRecord[]>([]);
  const [ads, setAds] = useState<MetaAdsAdRecord[]>([]);
  const [insights, setInsights] = useState<AlienMaxMetaAdsInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "campanhas" | "ad-sets" | "ads" | "metricas" | "alien-max"
  >("dashboard");

  // Autenticação e Seleção de Conta Meta
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<AvailableMetaAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [fullSyncing, setFullSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createBrowserClient();

  const loadDatabaseData = async () => {
    try {
      const [metRes, accRes, cmpRes, asRes, adRes, insRes] = await Promise.all([
        metaAdsRepository.getDashboardMetrics(),
        metaAdsRepository.listAccounts(),
        metaAdsRepository.listCampaigns(),
        metaAdsRepository.listAdSets(),
        metaAdsRepository.listAds(),
        metaAdsRepository.getAlienMaxInsights(),
      ]);

      setMetrics(metRes);
      setAccounts(accRes);
      setCampaigns(cmpRes);
      setAdSets(asRes);
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
            fetchAvailableAccounts(session.provider_token);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar sessão Supabase Meta Auth:", err);
      }
    }

    checkAuthSession();
    loadDatabaseData();
  }, []);

  // 1. Login OAuth 2.0 do Facebook / Meta Ads
  const handleMetaOAuthLogin = async () => {
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          scopes: "ads_read,ads_management,business_management",
          redirectTo: window.location.href,
        },
      });

      if (error) {
        setErrorMessage(`Erro ao iniciar OAuth do Meta: ${error.message}`);
      }
    } catch (err: any) {
      setErrorMessage(`Erro ao conectar com Meta Auth: ${err?.message || err}`);
    }
  };

  // 2. Listar Contas de Anúncios (act_) via API Route
  const fetchAvailableAccounts = async (token: string) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integracoes/meta-ads/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao listar contas de anúncios do Meta Ads.");
      }

      setAvailableAccounts(data.accounts || []);
      if (data.accounts && data.accounts.length > 0) {
        setSelectedAccountId(data.accounts[0].accountId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Não foi possível listar as contas da conta Meta.");
    }
  };

  // 3. Sincronizar via API Route /api/integracoes/meta-ads/sync
  const handleSync = async (isFull: boolean = false) => {
    const targetAcc = selectedAccountId || (accounts[0]?.accountId || "");
    if (!targetAcc) {
      setErrorMessage("Selecione uma Conta de Anúncios (act_) para realizar a sincronização.");
      return;
    }

    const tokenToUse = providerToken;
    if (!tokenToUse) {
      setErrorMessage("É necessário conectar com a conta Meta para obter o token de acesso.");
      return;
    }

    if (isFull) setFullSyncing(true);
    else setSyncing(true);

    setErrorMessage(null);

    const matched = availableAccounts.find((a) => a.accountId === targetAcc);
    const accName = matched ? matched.accountName : `Conta Meta ${targetAcc}`;

    try {
      const res = await fetch("/api/integracoes/meta-ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokenToUse,
          adAccountId: targetAcc,
          accountName: accName,
          isFullSync: isFull,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro durante a sincronização do Meta Ads.");
      }

      await loadDatabaseData();
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao sincronizar hierarquia do Meta Ads.");
    } finally {
      setSyncing(false);
      setFullSyncing(false);
    }
  };

  const activeAccount = accounts[0];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "campanhas", label: "Campanhas", icon: <BriefcaseIcon className="w-3.5 h-3.5" />, badge: `${campaigns.length}` },
    { id: "ad-sets", label: "Conjuntos (Ad Sets)", icon: <UsersIcon className="w-3.5 h-3.5" />, badge: `${adSets.length}` },
    { id: "ads", label: "Anúncios & Criativos", icon: <FileTextIcon className="w-3.5 h-3.5" />, badge: `${ads.length}` },
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
                  Sprint 22 · Meta Marketing API
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Facebook & Instagram Ads (Graph API v19.0)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Meta Ads (Integração Oficial)
              </h1>
              <p className="text-sm text-[#52525B]">
                Sincronização de Business Managers, Contas (`act_`), Campanhas CBO, Ad Sets, Criativos de Vídeo e Conversões Pixel/CAPI
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleMetaOAuthLogin}
              >
                Conectar Conta Meta / Facebook (OAuth 2.0)
              </Button>
            </div>
          </div>
        </section>

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

        {/* 2. Seleção de Ad Account (act_) se Autenticado */}
        {providerToken && availableAccounts.length > 0 && (
          <Card className="border-[#4A8237] bg-[rgba(74,130,55,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="w-5 h-5 text-[#4A8237]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Conta Meta Autenticada ({userEmail || "Conectado"})
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Selecione qual Conta de Anúncios (`act_`) deseja vincular ao Alien OS
                  </p>
                </div>
              </div>

              <Badge variant="alien" size="sm">
                OAuth Meta Ativo
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none"
              >
                {availableAccounts.map((a) => (
                  <option key={a.accountId} value={a.accountId}>
                    {a.accountName} (ID: {a.accountId})
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleSync(false)}
                disabled={syncing || !selectedAccountId}
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
            <span>Consultando banco de dados Supabase do Meta Ads...</span>
          </div>
        ) : campaigns.length === 0 ? (
          /* Estado Vazio */
          <Card className="p-12 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <SparklesIcon className="w-6 h-6 text-[#4A8237]" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#111111]">
                Nenhuma Conta do Meta Ads Sincronizada
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Conecte sua conta Meta/Facebook via OAuth 2.0 e selecione o Ad Account ID (`act_`) para importar suas campanhas e métricas do Facebook & Instagram.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleMetaOAuthLogin}
              >
                Conectar Conta Meta / Facebook via OAuth 2.0
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
                        {activeAccount?.accountName || "Conta Meta Ads"}
                      </span>
                      <Badge variant="alien" showDot size="sm">
                        {activeAccount?.status || "ACTIVE"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#71717A]">
                      Ad Account ID: <span className="font-mono">{activeAccount?.accountId}</span> · Moeda:{" "}
                      <span className="font-mono">{activeAccount?.currencyCode}</span> · Fuso:{" "}
                      <span className="font-mono">{activeAccount?.timeZone}</span> · Última Sync:{" "}
                      <span className="font-mono font-bold text-[#4A8237]">{activeAccount?.lastSyncedAt}</span>
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

                <MetaAdsMetricsGrid metrics={metrics!} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <MetaAdsCampaignsTable campaigns={campaigns} />
                  </div>
                  <div>
                    <AlienMaxMetaAdsAdvisorWidget insights={insights} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "campanhas" && (
              <MetaAdsCampaignsTable campaigns={campaigns} />
            )}

            {activeTab === "ad-sets" && (
              <MetaAdsAdSetsTableWidget adSets={adSets} />
            )}

            {activeTab === "ads" && (
              <MetaAdsAdsTableWidget ads={ads} />
            )}

            {activeTab === "metricas" && (
              <MetaAdsMetricsGrid metrics={metrics!} />
            )}

            {activeTab === "alien-max" && (
              <div className="max-w-xl mx-auto">
                <AlienMaxMetaAdsAdvisorWidget insights={insights} />
              </div>
            )}
          </>
        )}
      </div>
    </PageContainer>
  );
}
