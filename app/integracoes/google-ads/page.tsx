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
  GoogleAdsKeywordRecord,
  GoogleAdsDashboardMetrics,
  AlienMaxGoogleAdsInsight,
} from "@/lib/repositories/googleAdsRepository";
import { GoogleAdsMetricsGrid } from "@/components/integracoes/google-ads/GoogleAdsMetricsGrid";
import { GoogleAdsCampaignsTable } from "@/components/integracoes/google-ads/GoogleAdsCampaignsTable";
import { AdGroupsTableWidget } from "@/components/integracoes/google-ads/AdGroupsTableWidget";
import { AdsTableWidget } from "@/components/integracoes/google-ads/AdsTableWidget";
import { GoogleAdsHierarchyBreadcrumb } from "@/components/integracoes/google-ads/GoogleAdsHierarchyBreadcrumb";
import { AlienMaxGoogleAdsAdvisorWidget } from "@/components/integracoes/google-ads/AlienMaxGoogleAdsAdvisorWidget";
import { GoogleAdsKeywordsTable } from "@/components/integracoes/google-ads/GoogleAdsKeywordsTable";
import { GoogleAdsNegativeKeywordsTable } from "@/components/integracoes/google-ads/GoogleAdsNegativeKeywordsTable";
import { GoogleAdsDateRangeSelector } from "@/components/integracoes/google-ads/GoogleAdsDateRangeSelector";
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
  SearchIcon,
  ShieldCheckIcon,
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
  const [keywords, setKeywords] = useState<GoogleAdsKeywordRecord[]>([]);
  const [negativeKeywords, setNegativeKeywords] = useState<GoogleAdsKeywordRecord[]>([]);
  const [insights, setInsights] = useState<AlienMaxGoogleAdsInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [providerToken, setProviderToken] = useState<string | null>(null);

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "campanhas" | "ad-groups" | "ads" | "keywords" | "negative-keywords" | "metricas" | "alien-max"
  >("dashboard");

  const [developerTokenInput, setDeveloperTokenInput] = useState<string>("lCp4Ljie_X-CaVW-O-CrWQ");
  const [clientNameInput, setClientNameInput] = useState<string>("Sim Saúde Centro Médico");
  const [loginCustomerIdInput, setLoginCustomerIdInput] = useState<string>("");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState<boolean>(false);
  const [availableCustomers, setAvailableCustomers] = useState<AvailableCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [fullSyncing, setFullSyncing] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    errorCode?: string;
    tip?: string;
    rawGoogleError?: string;
  } | null>(null);
  const [syncSuccess, setSyncSuccess] = useState<{
    customerName: string;
    campaignsSynced: number;
    adGroupsSynced: number;
    adsSynced: number;
    keywordsSynced: number;
    negativeKeywordsSynced: number;
    metricsSynced: number;
  } | null>(null);
  const [dateRange, setDateRange] = useState<string>("last30days");

  const supabase = createBrowserClient();

  const loadDatabaseData = async (
    preset: string = dateRange,
    customStart?: string,
    customEnd?: string
  ) => {
    try {
      const [metRes, custRes, cmpRes, agRes, adRes, kwRes, negRes, insRes] = await Promise.all([
        googleAdsRepository.getDashboardMetrics(preset, customStart, customEnd),
        googleAdsRepository.listCustomers(),
        googleAdsRepository.listCampaigns(undefined, preset, customStart, customEnd),
        googleAdsRepository.listAdGroups(),
        googleAdsRepository.listAds(),
        googleAdsRepository.listKeywords(undefined, false),
        googleAdsRepository.listKeywords(undefined, true),
        googleAdsRepository.getAlienMaxInsights(),
      ]);

      setMetrics(metRes);
      setCustomers(custRes);
      setCampaigns(cmpRes);
      setAdGroups(agRes);
      setAds(adRes);
      setKeywords(kwRes);
      setNegativeKeywords(negRes);
      setInsights(insRes);
      if (custRes.length > 0 && !selectedCustomerId) {
        setSelectedCustomerId(custRes[0].customerId);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = async (
    preset: string,
    customStart?: string,
    customEnd?: string
  ) => {
    setDateRange(preset);
    try {
      const [metRes, cmpRes] = await Promise.all([
        googleAdsRepository.getDashboardMetrics(preset, customStart, customEnd),
        googleAdsRepository.listCampaigns(selectedCustomerId, preset, customStart, customEnd),
      ]);
      setMetrics(metRes);
      setCampaigns(cmpRes);
    } catch (err) {
      console.error("Erro ao atualizar métricas pelo período:", err);
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
          const token = session.provider_token || localStorage.getItem("alien_google_ads_provider_token");
          if (session.provider_token) {
            localStorage.setItem("alien_google_ads_provider_token", session.provider_token);
          }
          if (token) {
            setProviderToken(token);
            fetchAvailableCustomers(token, developerTokenInput);
          }
        } else {
          const cachedToken = typeof window !== "undefined" ? localStorage.getItem("alien_google_ads_provider_token") : null;
          if (cachedToken) {
            setProviderToken(cachedToken);
            fetchAvailableCustomers(cachedToken, developerTokenInput);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar sessão Supabase:", err);
      }
    }

    checkAuthSession();
    loadDatabaseData();

    // Escutar mudanças de autenticação (ex: retorno de OAuth)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.provider_token) {
        setProviderToken(session.provider_token);
        localStorage.setItem("alien_google_ads_provider_token", session.provider_token);
        fetchAvailableCustomers(session.provider_token, developerTokenInput);
      }
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 1. Iniciar Login OAuth 2.0
  const handleGoogleOAuthLogin = async () => {
    setErrorDetails(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/adwords",
          redirectTo: `${window.location.origin}/integracoes/google-ads`,
          queryParams: {
            access_type: "offline",
            prompt: "select_account consent",
          },
        },
      });

      if (error) {
        setErrorDetails({ message: `Erro ao iniciar OAuth: ${error.message}` });
      }
    } catch (err: any) {
      setErrorDetails({ message: `Erro ao conectar com Google Auth: ${err?.message || err}` });
    }
  };

  // 2. Buscar Contas MCC e Customer IDs via API Route
  const fetchAvailableCustomers = async (token: string, devToken?: string) => {
    setErrorDetails(null);
    try {
      const res = await fetch("/api/integracoes/google-ads/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token, developerToken: devToken }),
      });

      const data = await res.json();
      if (res.ok && data.customers && data.customers.length > 0) {
        setAvailableCustomers(data.customers);
        const first = data.customers[0];
        setSelectedCustomerId(first.customerId);
        if (first.descriptiveName && !first.descriptiveName.startsWith("Conta Google Ads (") && !first.descriptiveName.startsWith("[MCC]")) {
          setClientNameInput(first.descriptiveName);
        }
      } else if (!res.ok) {
        const isAuthError =
          res.status === 401 ||
          data.errorCode === "UNAUTHENTICATED" ||
          data.error?.toUpperCase().includes("UNAUTHENTICATED") ||
          data.error?.toUpperCase().includes("CREDENTIALS") ||
          data.error?.toUpperCase().includes("EXPIRAD");

        if (isAuthError) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("alien_google_ads_provider_token");
          }
          setProviderToken(null);
          setErrorDetails({
            message: "Sessão Google Ads expirada: O token da sua conta Google tem validade de 1 hora por segurança da API e precisa ser renovado.",
            tip: "Clique no botão 'Reconectar Google Ads' abaixo para renovar sua conexão com 1 clique.",
            errorCode: "UNAUTHENTICATED",
          });
        } else {
          setErrorDetails({
            message: data.error || "Não foi possível consultar as contas na API do Google Ads.",
            tip: data.tip || "Verifique se a conta Google conectada possui permissão nas contas de anúncios.",
          });
        }
      }
    } catch (err: any) {
      setErrorDetails({ message: err?.message || "Erro de conexão com a API do Google Ads." });
    }
  };

  // 3. Executar Sincronização Hierárquica via API Route /api/integracoes/google-ads/sync
  const handleSync = async (isFull: boolean = false) => {
    const targetCid = selectedCustomerId || (customers[0]?.customerId || "");
    if (!targetCid) {
      setErrorDetails({ message: "Selecione uma conta de anúncios (Customer ID) para realizar a sincronização." });
      return;
    }

    const tokenToUse = providerToken || (typeof window !== "undefined" ? localStorage.getItem("alien_google_ads_provider_token") : null);
    if (!tokenToUse) {
      setErrorDetails({
        message: "É necessário conectar com a conta Google para obter o token da API.",
        tip: "Clique em 'Conectar Conta Google Ads (OAuth 2.0)' no canto superior direito para autenticar.",
      });
      return;
    }

    if (isFull) setFullSyncing(true);
    else setSyncing(true);

    setErrorDetails(null);

    const matched = availableCustomers.find((c) => c.customerId === targetCid);
    const descName = clientNameInput.trim() || (matched ? matched.descriptiveName : `Conta ${targetCid}`);

    try {
      const res = await fetch("/api/integracoes/google-ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokenToUse,
          customerId: targetCid,
          descriptiveName: descName,
          isFullSync: isFull,
          developerToken: developerTokenInput.trim(),
          loginCustomerId: loginCustomerIdInput.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errorCode === "UNAUTHENTICATED" || data.error?.includes("expirado")) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("alien_google_ads_provider_token");
          }
          setProviderToken(null);
        }
        setErrorDetails({
          message: data.error || "Erro durante a sincronização do Google Ads.",
          errorCode: data.errorCode,
          tip: data.tip,
          rawGoogleError: data.rawGoogleError,
        });
        return;
      }

      setSyncSuccess({
        customerName: data.customerName || descName,
        campaignsSynced: data.campaignsSynced ?? 0,
        adGroupsSynced: data.adGroupsSynced ?? 0,
        adsSynced: data.adsSynced ?? 0,
        keywordsSynced: data.keywordsSynced ?? 0,
        negativeKeywordsSynced: data.negativeKeywordsSynced ?? 0,
        metricsSynced: data.metricsSynced ?? 0,
      });

      await loadDatabaseData(dateRange);
    } catch (err: any) {
      setErrorDetails({
        message: err?.message || "Erro de rede ao sincronizar hierarquia do Google Ads.",
      });
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
    { id: "keywords", label: "Palavras-Chave", icon: <SearchIcon className="w-3.5 h-3.5" />, badge: `${keywords.length}` },
    { id: "negative-keywords", label: "Palavras Negativadas", icon: <ShieldCheckIcon className="w-3.5 h-3.5" />, badge: `${negativeKeywords.length}` },
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
                  Integração Oficial Google Ads API
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Hierarquia: Conta ➔ Campanha ➔ Grupo ➔ Anúncio
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Google Ads
              </h1>
              <p className="text-sm text-[#52525B]">
                Leitura em tempo real da hierarquia de contas, campanhas, grupos, anúncios e métricas reais via Google Ads API
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

        {/* Mensagem de Erro e Diagnóstico */}
        {errorDetails && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-2 leading-relaxed break-words">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 font-bold text-sm text-red-950">
                  <span>Falha na Conexão com Google Ads</span>
                  {errorDetails.errorCode && (
                    <span className="px-2 py-0.5 bg-red-200/80 rounded text-[10px] font-mono uppercase">
                      {errorDetails.errorCode}
                    </span>
                  )}
                </div>
                <p className="text-red-900 font-medium whitespace-pre-wrap">{errorDetails.message}</p>
                {errorDetails.tip && (
                  <p className="text-red-800 text-[11px] bg-red-100/60 p-2.5 rounded-lg border border-red-200/60">
                    💡 <strong className="font-semibold">Orientação:</strong> {errorDetails.tip}
                  </p>
                )}
                {errorDetails.rawGoogleError && errorDetails.rawGoogleError !== errorDetails.message && (
                  <details className="text-[11px] text-red-700 pt-1 cursor-pointer">
                    <summary className="font-semibold hover:underline">Ver resposta detalhada da Google Ads API</summary>
                    <pre className="mt-1.5 p-2 bg-red-100/50 rounded border border-red-200/50 font-mono text-[10px] whitespace-pre-wrap overflow-x-auto">
                      {errorDetails.rawGoogleError}
                    </pre>
                  </details>
                )}
                {(errorDetails.errorCode === "UNAUTHENTICATED" ||
                  errorDetails.message?.toUpperCase().includes("UNAUTHENTICATED") ||
                  errorDetails.message?.toUpperCase().includes("EXPIRAD") ||
                  errorDetails.message?.toUpperCase().includes("CREDENTIALS")) && (
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGoogleOAuthLogin}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <SparklesIcon className="w-3.5 h-3.5" />
                      Reconectar Conta Google Ads (OAuth 2.0)
                    </Button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setErrorDetails(null)}
                className="font-bold text-red-900 text-sm hover:text-red-700 shrink-0 p-1"
                title="Fechar mensagem de erro"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Banner de Sucesso da Sincronização */}
        {syncSuccess && (
          <div className="p-4 bg-[#F0FDF4] border border-[#BBF7D0] rounded-xl text-xs space-y-1.5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2Icon className="w-5 h-5 text-[#16A34A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#15803D]">
                    Sincronização com Google Ads Concluída!
                  </h4>
                  <p className="text-[#166534] font-medium">
                    Conta <strong>{syncSuccess.customerName}</strong> sincronizada com sucesso no banco de dados.
                  </p>
                  <p className="text-[#15803D] text-[11px] bg-[#DCFCE7] p-2 rounded-lg border border-[#BBF7D0]">
                    📊 <strong>Resultado:</strong>{" "}
                    {syncSuccess.campaignsSynced > 0 || syncSuccess.metricsSynced > 0
                      ? `${syncSuccess.campaignsSynced} campanha(s), ${syncSuccess.adGroupsSynced} grupo(s), ${syncSuccess.adsSynced} anúncio(s), ${syncSuccess.keywordsSynced} palavra(s)-chave, ${syncSuccess.negativeKeywordsSynced} negativa(s) e ${syncSuccess.metricsSynced} métricas diárias importadas.`
                      : "A conta foi vinculada com sucesso. (Não há campanhas ativas no momento no Google Ads para esta conta)."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSyncSuccess(null)}
                className="font-bold text-[#15803D] text-sm hover:text-[#14532D] shrink-0 p-1"
                title="Fechar mensagem"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 2. Seleção de Customer ID se Autenticado */}
        {providerToken && (
          <Card className="border-[#4A8237] bg-[rgba(74,130,55,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="w-5 h-5 text-[#4A8237]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Conta Google Autenticada ({userEmail || "Conectado"})
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Selecione qual conta de anúncios deseja vincular ao Alien OS e confirme a identificação da operação
                  </p>
                </div>
              </div>

              <Badge variant="alien" size="sm">
                OAuth Ativo
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
              {/* Seletor de Conta ou Entrada Manual */}
              <div className="md:col-span-5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#111111] block">
                    Conta de Anúncios Google Ads
                  </label>
                  {providerToken && (
                    <button
                      type="button"
                      onClick={() => fetchAvailableCustomers(providerToken, developerTokenInput)}
                      className="text-[10px] text-[#4A8237] hover:underline font-medium cursor-pointer"
                    >
                      ↻ Atualizar Contas
                    </button>
                  )}
                </div>

                {availableCustomers.length > 0 ? (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedCustomerId(newId);
                      const found = availableCustomers.find((c) => c.customerId === newId);
                      if (found && !found.descriptiveName.startsWith("Conta Google Ads (") && !found.descriptiveName.startsWith("[MCC]")) {
                        setClientNameInput(found.descriptiveName);
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none"
                  >
                    {availableCustomers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>
                        {c.descriptiveName} (ID: {c.customerId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Customer ID (ex: 2319591390)"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none font-mono"
                  />
                )}
              </div>

              {/* Identificação do Cliente / Operação */}
              <div className="md:col-span-4 space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Nome do Cliente / Operação
                </label>
                <input
                  type="text"
                  placeholder="ex: Sim Saúde Centro Médico"
                  value={clientNameInput}
                  onChange={(e) => setClientNameInput(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none placeholder:text-[#A1A1AA]"
                />
              </div>

              {/* Botão Selecionar & Sincronizar */}
              <div className="md:col-span-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSync(false)}
                  disabled={syncing || !selectedCustomerId}
                  className="w-full"
                >
                  {syncing ? "Sincronizando no Supabase..." : "Selecionar & Sincronizar"}
                </Button>
              </div>
            </div>

            {/* Toggle de Configurações Técnicas da API Google Ads */}
            <div className="pt-2 border-t border-[#E4E4E7]/60">
              <button
                type="button"
                onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
                className="text-[11px] font-semibold text-[#4A8237] hover:text-[#38642a] flex items-center gap-1.5 transition-colors"
              >
                <span>{showAdvancedConfig ? "▼ Ocultar Configurações Técnicas da API" : "▶ Configurações Técnicas da API Google Ads (Developer Token & MCC)"}</span>
              </button>

              {showAdvancedConfig && (
                <div className="mt-3 p-3.5 bg-white rounded-xl border border-[#E4E4E7] grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#52525B] block">
                      Developer Token (Google Ads API)
                    </label>
                    <input
                      type="text"
                      placeholder="Chave alfanumérica (ex: lCp4Ljie_X-CaVW-O-CrWQ)"
                      value={developerTokenInput}
                      onChange={(e) => setDeveloperTokenInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-xs font-mono text-[#111111] outline-none"
                    />
                    <p className="text-[10px] text-[#A1A1AA]">
                      Chave oficial gerada no Google Ads MCC (Centro de API). Não coloque o nome do cliente aqui.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#52525B] block">
                      MCC Administrador (login-customer-id)
                    </label>
                    <input
                      type="text"
                      placeholder="Opcional: ID da MCC (ex: 6573011805)"
                      value={loginCustomerIdInput}
                      onChange={(e) => setLoginCustomerIdInput(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-xs font-mono text-[#111111] outline-none"
                    />
                    <p className="text-[10px] text-[#A1A1AA]">
                      Deixe em branco se a conta for acessada diretamente pela conta Google conectada.
                    </p>
                  </div>
                </div>
              )}
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
                Conecte sua conta Google via OAuth 2.0 e selecione o Customer ID para importar suas campanhas e métricas reais de mídia paga.
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

                <GoogleAdsDateRangeSelector onRangeChange={handleDateRangeChange} />

                {metrics && <GoogleAdsMetricsGrid metrics={metrics} />}

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

            {activeTab === "keywords" && (
              <GoogleAdsKeywordsTable keywords={keywords} />
            )}

            {activeTab === "negative-keywords" && (
              <GoogleAdsNegativeKeywordsTable negativeKeywords={negativeKeywords} />
            )}

            {activeTab === "metricas" && (
              <div className="space-y-6">
                <GoogleAdsDateRangeSelector onRangeChange={handleDateRangeChange} />
                {metrics && <GoogleAdsMetricsGrid metrics={metrics} />}
              </div>
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
