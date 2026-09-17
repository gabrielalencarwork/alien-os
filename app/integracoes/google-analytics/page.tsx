"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  googleAnalyticsRepository,
  GA4Stats,
  GA4PropertyItem,
  AlienMaxAnalyticsInsight,
} from "@/lib/repositories/googleAnalyticsRepository";
import { GA4MetricsGrid } from "@/components/integracoes/ga4/GA4MetricsGrid";
import { GA4TrafficChart } from "@/components/integracoes/ga4/GA4TrafficChart";
import { GA4TopPagesWidget } from "@/components/integracoes/ga4/GA4TopPagesWidget";
import { GA4SourcesWidget } from "@/components/integracoes/ga4/GA4SourcesWidget";
import { GA4DevicesWidget } from "@/components/integracoes/ga4/GA4DevicesWidget";
import { GA4SyncStatusWidget } from "@/components/integracoes/ga4/GA4SyncStatusWidget";
import { AlienMaxAnalyticsAdvisorWidget } from "@/components/integracoes/ga4/AlienMaxAnalyticsAdvisorWidget";
import { ChevronRightIcon, SettingsIcon, SparklesIcon, CheckCircle2Icon } from "@/components/icons";

interface AvailableProperty {
  propertyId: string;
  displayName: string;
  parentAccountName: string;
}

export default function GoogleAnalyticsIntegrationPage() {
  const [stats, setStats] = useState<GA4Stats | null>(null);
  const [property, setProperty] = useState<GA4PropertyItem | null>(null);
  const [insights, setInsights] = useState<AlienMaxAnalyticsInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados do Fluxo OAuth e Seleção de Propriedades
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [availableProperties, setAvailableProperties] = useState<AvailableProperty[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createBrowserClient();
  const popupRef = useRef<Window | null>(null);

  const loadDatabaseData = async () => {
    try {
      const [statRes, propRes, insightRes] = await Promise.all([
        googleAnalyticsRepository.getStats(),
        googleAnalyticsRepository.getActiveProperty(),
        googleAnalyticsRepository.getAlienMaxInsights(),
      ]);

      setStats(statRes);
      setProperty(propRes);
      setInsights(insightRes);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Carregar dados do banco
    loadDatabaseData();

    // Escutar postMessage do popup OAuth
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "GA4_OAUTH_SUCCESS") {
        const { accessToken, email } = event.data;
        setProviderToken(accessToken);
        if (email) setUserEmail(email);
        fetchAvailableProperties(accessToken);
        popupRef.current?.close();
      }

      if (event.data?.type === "GA4_OAUTH_ERROR") {
        setErrorMessage(`Erro na autenticação Google: ${event.data.error}`);
        popupRef.current?.close();
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  // 1. Abrir Popup OAuth do Google (sem substituir sessão principal do Supabase)
  const openGoogleOAuthPopup = () => {
    setErrorMessage(null);

    const clientId =
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "67870048627-uatr93njf4cebkv77o726jau0m9fm8d7.apps.googleusercontent.com";

    const redirectUri = `${window.location.origin}/integracoes/google-analytics/oauth-callback`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/userinfo.email",
      ].join(" "),
      access_type: "offline",
      prompt: "select_account", // Força Google a mostrar o seletor de contas
    });

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    const width = 520;
    const height = 620;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      oauthUrl,
      "ga4_oauth_popup",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
    );

    if (!popup) {
      setErrorMessage(
        "O navegador bloqueou o popup. Permita popups para este site e tente novamente."
      );
      return;
    }

    popupRef.current = popup;
  };

  // 2. Buscar Lista de Propriedades via API /api/integracoes/google-analytics/properties
  const fetchAvailableProperties = async (token: string) => {
    setLoadingProperties(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/integracoes/google-analytics/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: token }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Falha ao listar propriedades GA4.");
      }

      setAvailableProperties(data.properties || []);
      if (data.properties && data.properties.length > 0) {
        setSelectedPropertyId(data.properties[0].propertyId);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || "Não foi possível listar as propriedades GA4 da conta Google.");
    } finally {
      setLoadingProperties(false);
    }
  };

  // 3. Salvar Propriedade Selecionada e Executar Sincronização via API /api/integracoes/google-analytics/sync
  const handleSaveAndSyncProperty = async (propIdToSync?: string) => {
    const targetPropId = propIdToSync || selectedPropertyId;
    if (!targetPropId) return;

    const tokenToUse = providerToken;
    if (!tokenToUse) {
      setErrorMessage("É necessário autenticar com a conta Google para obter o token de acesso.");
      return;
    }

    setSyncing(true);
    setErrorMessage(null);

    const matchedProp = availableProperties.find((p) => p.propertyId === targetPropId);
    const propName = matchedProp ? `${matchedProp.parentAccountName} - ${matchedProp.displayName}` : `Propriedade ${targetPropId}`;

    try {
      const res = await fetch("/api/integracoes/google-analytics/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: tokenToUse,
          propertyId: targetPropId,
          propertyName: propName,
          accountEmail: userEmail || "oauth@google.com",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro durante a sincronização real.");
      }

      await loadDatabaseData();
    } catch (err: any) {
      setErrorMessage(err?.message || "Ocorreu um erro ao sincronizar dados com o Supabase.");
    } finally {
      setSyncing(false);
    }
  };

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
                  Integração Real Supabase & Google Data API
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Google Analytics 4 (GA4)
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Google Analytics 4 (Conexão Oficial)
              </h1>
              <p className="text-sm text-[#52525B]">
                Métricas reais de tráfego, sessões, conversões e atribuição gravadas no Supabase via Google Analytics Data API
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={openGoogleOAuthPopup}
              >
                Conectar Conta Google (OAuth 2.0)
              </Button>
            </div>
          </div>
        </section>

        {/* Mensagem de Erro / Alerta */}
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

        {/* 2. Modal / Painel de Conexão e Seleção de Propriedade se autenticado */}
        {providerToken && availableProperties.length > 0 && (
          <Card className="border-[#4A8237] bg-[rgba(74,130,55,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E4E7] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="w-5 h-5 text-[#4A8237]" />
                <div>
                  <h3 className="text-base font-bold text-[#111111]">
                    Conta Google Autenticada ({userEmail || "Conectado"})
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Selecione qual propriedade GA4 deseja vincular ao Alien OS
                  </p>
                </div>
              </div>

              <Badge variant="alien" size="sm">
                OAuth Ativo
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-white border border-[#E4E4E7] rounded-xl text-xs font-medium text-[#111111] outline-none"
              >
                {availableProperties.map((p) => (
                  <option key={p.propertyId} value={p.propertyId}>
                    {p.parentAccountName} — {p.displayName} (ID: {p.propertyId})
                  </option>
                ))}
              </select>

              <Button
                variant="primary"
                size="md"
                onClick={() => handleSaveAndSyncProperty()}
                disabled={syncing || !selectedPropertyId}
              >
                {syncing ? "Sincronizando com Supabase..." : "Salvar & Sincronizar Propriedade"}
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Consultando banco de dados Supabase...</span>
          </div>
        ) : !property || property.dailyMetrics.length === 0 ? (
          /* Estado Vazio: Nenhuma Propriedade Conectada */
          <Card className="p-12 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <SparklesIcon className="w-6 h-6 text-[#4A8237]" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#111111]">
                Nenhuma Propriedade GA4 Sincronizada no Banco de Dados
              </h3>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Para visualizar relatórios reais, conecte sua conta Google via OAuth 2.0 e selecione qual propriedade GA4 deseja importar.
              </p>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={openGoogleOAuthPopup}
              >
                Conectar Conta Google via OAuth 2.0
              </Button>
            </div>
          </Card>
        ) : (
          /* Visualização de Métricas Reais */
          <>
            {/* 3. Sync Status Widget */}
            <section>
              <GA4SyncStatusWidget
                property={property}
                onSync={() => handleSaveAndSyncProperty(property.propertyId)}
              />
            </section>

            {/* 4. Top Metrics Grid */}
            <section>
              <GA4MetricsGrid stats={stats!} />
            </section>

            {/* 5. Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Traffic Charts & Widgets (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                <GA4TrafficChart metrics={property.dailyMetrics} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GA4SourcesWidget sources={property.trafficSources} />
                  <GA4DevicesWidget />
                </div>

                <GA4TopPagesWidget pages={property.topPages} />
              </div>

              {/* Alien Max Analytics Advisor (1 Col) */}
              <div>
                <AlienMaxAnalyticsAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}
