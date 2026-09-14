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
  MetaAdsDateRangeSelector,
  MetaDateRangePreset,
} from "@/components/integracoes/meta-ads/MetaAdsDateRangeSelector";
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
  LogOutIcon,
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

  // Autenticação e Conexão de Token Meta Ads (Opção 2 - Token Permanente)
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState<string>("");
  const [manualAccountId, setManualAccountId] = useState<string>("");
  const [showToken, setShowToken] = useState<boolean>(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState<boolean>(false);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [availableAccounts, setAvailableAccounts] = useState<AvailableMetaAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [syncing, setSyncing] = useState(false);
  const [fullSyncing, setFullSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<MetaDateRangePreset>("allTime");

  const supabase = createBrowserClient();

  const loadDatabaseData = async (
    preset: MetaDateRangePreset = dateRange,
    customStart?: string,
    customEnd?: string
  ) => {
    try {
      const [metRes, accRes, cmpRes, asRes, adRes, insRes] = await Promise.all([
        metaAdsRepository.getDashboardMetrics(preset, customStart, customEnd),
        metaAdsRepository.listAccounts(),
        metaAdsRepository.listCampaigns(undefined, preset, customStart, customEnd),
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

  const handleDateRangeChange = async (
    preset: MetaDateRangePreset,
    customStart?: string,
    customEnd?: string
  ) => {
    setDateRange(preset);
    try {
      const targetAcc = selectedAccountId
        ? (selectedAccountId.startsWith("act_") ? selectedAccountId : `act_${selectedAccountId}`)
        : undefined;
      const [metRes, cmpRes] = await Promise.all([
        metaAdsRepository.getDashboardMetrics(preset, customStart, customEnd),
        metaAdsRepository.listCampaigns(targetAcc, preset, customStart, customEnd),
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
        // 1. Recuperar token permanente gravado no localStorage (Opção 2)
        const savedToken = typeof window !== "undefined" ? localStorage.getItem("alien_meta_ads_token") : null;
        if (savedToken) {
          setProviderToken(savedToken);
          setManualToken(savedToken);
          await fetchAvailableAccounts(savedToken);
        } else {
          // 2. Verificar se há token permanente já configurado no servidor
          try {
            const getRes = await fetch("/api/integracoes/meta-ads/accounts");
            const getData = await getRes.json();
            if (getData.configured && getData.accounts && getData.accounts.length > 0) {
              setProviderToken("SERVER_CONFIGURED");
              setAvailableAccounts(getData.accounts);
              setSelectedAccountId(getData.accounts[0].accountId);
            }
          } catch (e) {
            // Continua normalmente se endpoint falhar
          }
        }

        // 3. Verificar sessão Supabase OAuth se houver
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setUserEmail(session.user?.email || null);
          if (session.provider_token && !savedToken) {
            setProviderToken(session.provider_token);
            await fetchAvailableAccounts(session.provider_token);
          }
        }
      } catch (err) {
        console.error("Erro ao verificar credenciais Meta Ads:", err);
      }
    }

    checkAuthSession();
    loadDatabaseData();
  }, []);

  // 1. Conectar via Token Permanente do Meta Business Suite (Opção 2)
  const handleConnectManualToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = manualToken.trim();
    if (!token) {
      setErrorMessage("Por favor, informe o Token de Acesso do Meta Ads (System User Token).");
      return;
    }

    setIsVerifyingToken(true);
    setErrorMessage(null);
    setConnectionSuccess(null);

    try {
      const res = await fetch("/api/integracoes/meta-ads/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: token,
          specificAccountId: manualAccountId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao validar o token de acesso na Meta Marketing API.");
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("alien_meta_ads_token", token);
      }

      setProviderToken(token);
      const accs = data.accounts || [];
      setAvailableAccounts(accs);

      if (accs.length > 0) {
        setSelectedAccountId(accs[0].accountId);
        setConnectionSuccess(`Token validado com sucesso! ${accs.length} conta(s) de anúncios identificada(s).`);
      } else {
        setConnectionSuccess("Token validado com sucesso! Nenhuma conta listada automaticamente em /me/adaccounts. Informe o ID da Conta (ex: 1959897601392204) no campo abaixo para prosseguir.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Erro ao conectar com o token do Meta Ads.");
    } finally {
      setIsVerifyingToken(false);
    }
  };

  // 2. Desconectar Token
  const handleDisconnectToken = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("alien_meta_ads_token");
    }
    setProviderToken(null);
    setManualToken("");
    setAvailableAccounts([]);
    setSelectedAccountId("");
    setConnectionSuccess(null);
    setErrorMessage(null);
  };

  // 3. Login OAuth 2.0 Alternativo do Facebook / Meta Ads (Opção 1)
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

  // 4. Listar Contas de Anúncios (act_) via API Route
  const fetchAvailableAccounts = async (token: string, specificAccId?: string) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integracoes/meta-ads/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: token,
          specificAccountId: specificAccId || (manualAccountId.trim() || undefined),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao listar contas de anúncios do Meta Ads.");
      }

      const accs = data.accounts || [];
      setAvailableAccounts(accs);
      if (accs.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accs[0].accountId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Não foi possível listar as contas da conta Meta.");
    }
  };

  // 5. Sincronizar via API Route /api/integracoes/meta-ads/sync
  const handleSync = async (isFull: boolean = false) => {
    const targetAcc = selectedAccountId || manualAccountId.trim() || (accounts[0]?.accountId || "");
    if (!targetAcc) {
      setErrorMessage("Selecione ou digite uma Conta de Anúncios (act_) para realizar a sincronização.");
      return;
    }

    const tokenToUse = providerToken === "SERVER_CONFIGURED" ? undefined : providerToken;
    if (!tokenToUse && providerToken !== "SERVER_CONFIGURED") {
      setErrorMessage("É necessário conectar com a conta Meta para obter o token de acesso.");
      return;
    }

    if (isFull) setFullSyncing(true);
    else setSyncing(true);

    setErrorMessage(null);

    const cleanTarget = targetAcc.startsWith("act_") ? targetAcc : `act_${targetAcc}`;
    const matched = availableAccounts.find((a) => a.accountId === cleanTarget || a.accountId === targetAcc);
    const accName = matched ? matched.accountName : `Conta Meta ${cleanTarget}`;

    try {
      const res = await fetch("/api/integracoes/meta-ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokenToUse,
          adAccountId: cleanTarget,
          accountName: accName,
          isFullSync: isFull,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro durante a sincronização do Meta Ads.");
      }

      await loadDatabaseData();
      setConnectionSuccess(`Sincronização concluída com sucesso! (${data.campaignsSynced || 0} campanhas, ${data.adSetsSynced || 0} conjuntos, ${data.adsSynced || 0} criativos, ${data.metricsSynced || 0} métricas diárias).`);
      setActiveTab("dashboard");
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

            <div className="flex items-center gap-2.5 shrink-0">
              {providerToken ? (
                <div className="flex items-center gap-2">
                  <Badge variant="alien" showDot size="sm">
                    Token Permanente Conectado
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectToken}
                    icon={<LogOutIcon className="w-3.5 h-3.5 text-[#71717A]" />}
                  >
                    Trocar Token
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTutorial(!showTutorial)}
                >
                  {showTutorial ? "Ocultar Passo a Passo" : "Como Gerar o Token?"}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Mensagens de Feedback */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between">
            <span className="leading-relaxed">{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="font-bold text-red-900 text-xs ml-4 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        {connectionSuccess && (
          <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="w-4 h-4 text-[#4A8237] shrink-0" />
              <span className="leading-relaxed font-medium">{connectionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setConnectionSuccess(null)}
              className="font-bold text-green-900 text-xs ml-4 hover:opacity-75"
            >
              ✕
            </button>
          </div>
        )}

        {/* 2. CARD DE CONEXÃO: Opção 2 - Token Permanente do Meta Business Suite */}
        {!providerToken ? (
          <Card className="border-[#E4E4E7] bg-white p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4F4F5] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#111111]">
                    Conectar via Token Permanente (Meta Business Suite)
                  </h2>
                  <Badge variant="alien" size="sm">
                    Recomendado · Nunca Expira
                  </Badge>
                </div>
                <p className="text-xs text-[#71717A]">
                  Utilize um Token de Usuário do Sistema do Meta Business Manager. Esse método é estável, não exige aprovação de App Review e não expira a cada 60 dias.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTutorial(!showTutorial)}
                className="text-xs font-semibold text-[#4A8237] hover:underline shrink-0 text-left"
              >
                {showTutorial ? "Fechar Tutorial ▲" : "Ver Tutorial Passo a Passo ▼"}
              </button>
            </div>

            {/* Tutorial Expansível */}
            {showTutorial && (
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3 text-xs text-[#52525B]">
                <h4 className="font-bold text-[#111111] text-xs flex items-center gap-1.5">
                  <SparklesIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                  Passo a Passo: Gerando seu Token Permanente no Meta Business Suite
                </h4>
                <ol className="list-decimal list-inside space-y-2 leading-relaxed">
                  <li>
                    Acesse o{" "}
                    <a
                      href="https://business.facebook.com/settings/system-users"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#111111] underline hover:text-[#4A8237]"
                    >
                      Meta Business Suite (Configurações do Negócio → Usuários do Sistema)
                    </a>
                    .
                  </li>
                  <li>
                    Clique em <strong>Adicionar</strong> para criar um Usuário do Sistema (ex: nome <code className="bg-white px-1 py-0.5 rounded border border-[#E4E4E7]">Alien OS Connector</code>, função <strong>Administrador</strong>).
                  </li>
                  <li>
                    Selecione o usuário criado e clique no botão <strong>Atribuir Ativos</strong>.
                  </li>
                  <li>
                    Selecione <strong>Contas de Anúncios</strong>, marque sua conta de anúncios e ative a permissão de <strong>Controle Total (Gerenciar campanhas e relatórios)</strong>. Salve as alterações.
                  </li>
                  <li>
                    Clique no botão <strong>Gerar Novo Token</strong>, selecione seu aplicativo, defina a expiração como <strong>"Nunca" (Permanente)</strong> e marque as 3 permissões essenciais:
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E4E4E7] text-[11px] text-[#111111]">ads_read</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E4E4E7] text-[11px] text-[#111111]">ads_management</span>
                      <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#E4E4E7] text-[11px] text-[#111111]">read_insights</span>
                    </div>
                  </li>
                  <li>
                    Clique em <strong>Gerar Token</strong>, copie o código completo (<code className="bg-white px-1 py-0.5 rounded border border-[#E4E4E7]">EAAB...</code>) e cole no campo abaixo.
                  </li>
                </ol>
              </div>
            )}

            {/* Formulário de Inserção do Token */}
            <form onSubmit={handleConnectManualToken} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-[#111111]">
                    Token de Acesso do Meta (System User Token) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showToken ? "text" : "password"}
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Cole aqui seu token permanente (ex: EAAB...)"
                      className="w-full pl-3 pr-20 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-mono text-[#111111] placeholder:text-[#A1A1AA] focus:border-[#4A8237] focus:ring-1 focus:ring-[#4A8237] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#71717A] hover:text-[#111111] px-2 py-1 rounded bg-[#F4F4F5]"
                    >
                      {showToken ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#111111]">
                    ID da Conta <span className="text-[#71717A] font-normal">(Opcional / act_)</span>
                  </label>
                  <input
                    type="text"
                    value={manualAccountId}
                    onChange={(e) => setManualAccountId(e.target.value)}
                    placeholder="ex: 1959897601392204"
                    className="w-full px-3 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-mono text-[#111111] placeholder:text-[#A1A1AA] focus:border-[#4A8237] focus:ring-1 focus:ring-[#4A8237] outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isVerifyingToken || !manualToken.trim()}
                  className="w-full sm:w-auto"
                >
                  {isVerifyingToken ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Validando Token na Graph API...</span>
                    </span>
                  ) : (
                    "Conectar e Listar Contas de Anúncios"
                  )}
                </Button>

                <div className="text-[11px] text-[#71717A] text-center sm:text-right">
                  <span>Ou se preferir via login temporário: </span>
                  <button
                    type="button"
                    onClick={handleMetaOAuthLogin}
                    className="text-[#111111] font-semibold underline hover:text-[#4A8237]"
                  >
                    OAuth 2.0 do Facebook
                  </button>
                </div>
              </div>
            </form>
          </Card>
        ) : (
          /* CARD QUANDO O TOKEN ESTIVER CONECTADO */
          <Card className="border-[#4A8237] bg-[rgba(74,130,55,0.03)] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[rgba(74,130,55,0.15)] flex items-center justify-center shrink-0">
                  <CheckCircle2Icon className="w-4 h-4 text-[#4A8237]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
                    <span>Token Meta Ads Ativo</span>
                    <span className="font-mono text-xs text-[#71717A] font-normal">
                      {providerToken === "SERVER_CONFIGURED"
                        ? "(Configurado no Servidor)"
                        : `(${providerToken.slice(0, 10)}...${providerToken.slice(-6)})`}
                    </span>
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    {availableAccounts.length > 0
                      ? `${availableAccounts.length} conta(s) de anúncios identificada(s). Selecione abaixo para sincronizar:`
                      : "Token validado. Selecione ou informe o ID da sua Conta de Anúncios para sincronizar:"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="alien" size="sm">
                  Permanente
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnectToken}
                  icon={<LogOutIcon className="w-3.5 h-3.5 text-[#71717A]" />}
                >
                  Desconectar
                </Button>
              </div>
            </div>

            {/* Seletor de Conta ou Entrada Manual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="md:col-span-2 space-y-1">
                <label className="block text-xs font-bold text-[#111111]">
                  Conta de Anúncios Vinculada (`act_`)
                </label>
                {availableAccounts.length > 0 ? (
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none focus:border-[#4A8237]"
                  >
                    {availableAccounts.map((a) => (
                      <option key={a.accountId} value={a.accountId}>
                        {a.accountName} (ID: {a.accountId})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={manualAccountId}
                    onChange={(e) => setManualAccountId(e.target.value)}
                    placeholder="Digite o ID da Conta (ex: 1959897601392204 ou act_1959897601392204)"
                    className="w-full px-3 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-mono text-[#111111] outline-none focus:border-[#4A8237]"
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSync(false)}
                  disabled={syncing || fullSyncing || (!selectedAccountId && !manualAccountId)}
                  className="flex-1"
                >
                  {syncing ? "Sincronizando..." : "Sincronizar no Supabase"}
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleSync(true)}
                  disabled={syncing || fullSyncing || (!selectedAccountId && !manualAccountId)}
                  title="Executar sincronização completa de todo o histórico"
                >
                  {fullSyncing ? "Carga..." : "Atualizar Tudo"}
                </Button>
              </div>
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
          /* Estado Vazio Amigável */
          <Card className="p-10 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <SparklesIcon className="w-6 h-6 text-[#4A8237]" />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-[#111111]">
                Nenhuma Campanha do Meta Ads Sincronizada no Banco
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                {providerToken
                  ? "Seu token permanente está conectado! Clique no botão 'Sincronizar no Supabase' acima para importar suas campanhas, conjuntos de anúncios, criativos e métricas reais do Facebook & Instagram."
                  : "Cole seu Token de Acesso Permanente do Meta Business Suite no formulário acima para conectar e sincronizar sua conta de anúncios."}
              </p>
            </div>

            {providerToken && (
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleSync(false)}
                  disabled={syncing || (!selectedAccountId && !manualAccountId)}
                >
                  {syncing ? "Sincronizando no Supabase..." : "Sincronizar Agora"}
                </Button>
              </div>
            )}
          </Card>
        ) : (
          /* Abas Ativas com Dados Reais */
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

                <MetaAdsDateRangeSelector onRangeChange={handleDateRangeChange} defaultPreset={dateRange} />

                {metrics && <MetaAdsMetricsGrid metrics={metrics} />}

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
              <div className="space-y-6">
                <MetaAdsDateRangeSelector onRangeChange={handleDateRangeChange} defaultPreset={dateRange} />
                <MetaAdsCampaignsTable campaigns={campaigns} />
              </div>
            )}

            {activeTab === "ad-sets" && (
              <MetaAdsAdSetsTableWidget adSets={adSets} />
            )}

            {activeTab === "ads" && (
              <MetaAdsAdsTableWidget ads={ads} />
            )}

            {activeTab === "metricas" && (
              <div className="space-y-6">
                <MetaAdsDateRangeSelector onRangeChange={handleDateRangeChange} defaultPreset={dateRange} />
                {metrics && <MetaAdsMetricsGrid metrics={metrics} />}
              </div>
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
