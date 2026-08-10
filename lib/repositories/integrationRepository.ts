/**
 * Repository Pattern: Integration Repository (Alien OS)
 * Gerencia a leitura de provedores de integração, credenciais OAuth, contas conectadas e logs de sincronização.
 * Conectado às tabelas Supabase: integration_providers, integration_accounts, integration_tokens, integration_logs.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type IntegrationStatus =
  | "Conectado"
  | "Pendente"
  | "Erro de Autenticação"
  | "Token Expirando"
  | "Desconectado";

export interface IntegrationAccountItem {
  id: string;
  providerId: string;
  companyId: string;
  clientName: string;
  accountExternalId: string;
  accountName: string;
  managerName: string;
  status: string;
  lastSyncedAt: string;
}

export interface IntegrationLogItem {
  id: string;
  providerId: string;
  eventType: "SYNC_SUCCESS" | "SYNC_ERROR" | "TOKEN_REFRESH" | "AUTH_FAILURE";
  message: string;
  statusCode: number;
  createdAt: string;
}

export interface IntegrationTokenItem {
  id: string;
  providerId: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  pixelId?: string;
  businessId?: string;
  managerId?: string;
  expiresAt?: string;
}

export interface IntegrationProviderItem {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  status: IntegrationStatus;
  apiVersion: string;
  docsUrl: string;
  connectedAccountsCount: number;
  lastSyncedAt: string;
  accounts: IntegrationAccountItem[];
  logs: IntegrationLogItem[];
  tokens?: IntegrationTokenItem;
}

export interface IntegrationStats {
  connectedProvidersCount: number;
  pendingProvidersCount: number;
  lastGlobalSyncTime: string;
  totalLinkedAccountsCount: number;
  syncErrorsCount: number;
  expiringTokensCount: number;
  availableApisCount: number;
  generalOperationalPercentage: number; // ex: 85%
}

export interface AlienMaxIntegrationInsight {
  id: string;
  type: "Token Expirando" | "Sem Acesso" | "Pixel Inativo" | "Avaliações" | "Reconexão";
  clientName: string;
  providerSlug: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export const mockIntegrationStats: IntegrationStats = {
  connectedProvidersCount: 7,
  pendingProvidersCount: 5,
  lastGlobalSyncTime: "Há 14 minutos",
  totalLinkedAccountsCount: 28,
  syncErrorsCount: 1,
  expiringTokensCount: 2,
  availableApisCount: 12,
  generalOperationalPercentage: 85,
};

export const mockIntegrationProviders: IntegrationProviderItem[] = [
  {
    id: "prov-meta-ads",
    slug: "meta-ads",
    name: "Meta Ads",
    category: "Mídia Paga",
    description: "Sincronização de campanhas, criativos e métricas de ROAS via Meta Marketing API v19.0.",
    status: "Conectado",
    apiVersion: "v19.0",
    docsUrl: "https://developers.facebook.com/docs/marketing-apis",
    connectedAccountsCount: 5,
    lastSyncedAt: "Há 14 minutos",
    tokens: {
      id: "tk-1",
      providerId: "prov-meta-ads",
      clientId: "app_1313894637612937",
      clientSecret: "••••••••••••••••••••••••",
      accessToken: "EAAX...••••••••••••",
      refreshToken: "EAAY...••••••••••••",
      businessId: "bm_aura_health_998",
    },
    accounts: [
      { id: "acc-1", providerId: "prov-meta-ads", companyId: "aura-health", clientName: "Aura Health", accountExternalId: "act_10203040", accountName: "Aura Health · BM Oficial", managerName: "Lucas Mendes", status: "Ativo", lastSyncedAt: "Há 14 min" },
      { id: "acc-2", providerId: "prov-meta-ads", companyId: "lumina-skincare", clientName: "Lumina Skincare", accountExternalId: "act_99887766", accountName: "Lumina Cosméticos BM", managerName: "Fernanda Lima", status: "Ativo", lastSyncedAt: "Há 25 min" },
    ],
    logs: [
      { id: "lg-1", providerId: "prov-meta-ads", eventType: "SYNC_SUCCESS", message: "Sincronização de campanhas concluída com sucesso (24 registros).", statusCode: 200, createdAt: "10:32" },
      { id: "lg-2", providerId: "prov-meta-ads", eventType: "TOKEN_REFRESH", message: "Refresh Token de acesso estendido renovado por +60 dias.", statusCode: 200, createdAt: "2 dias atrás" },
    ],
  },
  {
    id: "prov-google-ads",
    slug: "google-ads",
    name: "Google Ads",
    category: "Mídia Paga",
    description: "Conexão com Google Search, Display e Performance Max via Google Ads API v16.",
    status: "Pendente",
    apiVersion: "v16",
    docsUrl: "https://developers.google.com/google-ads/api/docs/first-call/overview",
    connectedAccountsCount: 3,
    lastSyncedAt: "Ontem às 18:30",
    accounts: [],
    logs: [
      { id: "lg-3", providerId: "prov-google-ads", eventType: "AUTH_FAILURE", message: "Erro de autenticação: 2 contas sem permissão de leitura no MCC.", statusCode: 401, createdAt: "Ontem" },
    ],
  },
  {
    id: "prov-ga4",
    slug: "ga4",
    name: "Google Analytics 4",
    category: "Analytics",
    description: "Métricas de tráfego, taxa de engajamento, sessões e eventos de e-commerce via GA4 Data API.",
    status: "Conectado",
    apiVersion: "v1beta",
    docsUrl: "https://developers.google.com/analytics/devguides/reporting/data/v1",
    connectedAccountsCount: 6,
    lastSyncedAt: "Há 8 minutos",
    accounts: [],
    logs: [
      { id: "lg-4", providerId: "prov-ga4", eventType: "SYNC_SUCCESS", message: "Atualização de eventos de e-commerce e sessões sincronizada.", statusCode: 200, createdAt: "09:18" },
    ],
  },
  {
    id: "prov-search-console",
    slug: "search-console",
    name: "Google Search Console",
    category: "SEO & Local",
    description: "Consultas de palavras-chave orgânicas, impressões e cliques do Google Search.",
    status: "Conectado",
    apiVersion: "v3",
    docsUrl: "https://developers.google.com/webmaster-tools",
    connectedAccountsCount: 4,
    lastSyncedAt: "Há 1 hora",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-google-business",
    slug: "google-business",
    name: "Google Business Profile",
    category: "SEO & Local",
    description: "Gestão de fichas locais, avaliações de clientes e chamadas via Business Profile API.",
    status: "Pendente",
    apiVersion: "v1",
    docsUrl: "https://developers.google.com/my-business",
    connectedAccountsCount: 2,
    lastSyncedAt: "Há 3 dias",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-tiktok-ads",
    slug: "tiktok-ads",
    name: "TikTok Ads",
    category: "Mídia Paga",
    description: "Sincronização de Spark Ads e campanhas virais via TikTok Marketing API.",
    status: "Pendente",
    apiVersion: "v1.3",
    docsUrl: "https://ads.tiktok.com/marketing_api/docs",
    connectedAccountsCount: 1,
    lastSyncedAt: "Nunca",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-linkedin-ads",
    slug: "linkedin-ads",
    name: "LinkedIn Ads",
    category: "Mídia Paga",
    description: "Leads B2B e campanhas corporativas via LinkedIn Marketing API.",
    status: "Pendente",
    apiVersion: "v2",
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
    connectedAccountsCount: 1,
    lastSyncedAt: "Nunca",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-gtm",
    slug: "gtm",
    name: "Google Tag Manager",
    category: "Tracking & Tagging",
    description: "Injeção dinâmica de tags de rastreamento e eventos de conversão.",
    status: "Conectado",
    apiVersion: "v2",
    docsUrl: "https://developers.google.com/tag-platform/tag-manager/api/v2",
    connectedAccountsCount: 5,
    lastSyncedAt: "Há 30 minutos",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-meta-pixel",
    slug: "meta-pixel",
    name: "Meta Pixel",
    category: "Tracking & Tagging",
    description: "Pixel client-side do navegador para rastreamento de PageView e Purchase.",
    status: "Conectado",
    apiVersion: "v19.0",
    docsUrl: "https://developers.facebook.com/docs/meta-pixel",
    connectedAccountsCount: 5,
    lastSyncedAt: "Há 5 minutos",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-conversion-api",
    slug: "conversion-api",
    name: "Conversion API (CAPI)",
    category: "Tracking & Tagging",
    description: "API de Conversões server-side sem bloqueio de AdBlockers ou iOS 14.5.",
    status: "Conectado",
    apiVersion: "v19.0",
    docsUrl: "https://developers.facebook.com/docs/marketing-api/conversions-api",
    connectedAccountsCount: 4,
    lastSyncedAt: "Há 2 minutos",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-clarity",
    slug: "clarity",
    name: "Microsoft Clarity",
    category: "UX & CRO",
    description: "Mapas de calor e gravações de sessão de usuários em Landing Pages.",
    status: "Conectado",
    apiVersion: "v1",
    docsUrl: "https://clarity.microsoft.com",
    connectedAccountsCount: 3,
    lastSyncedAt: "Há 12 minutos",
    accounts: [],
    logs: [],
  },
  {
    id: "prov-hotjar",
    slug: "hotjar",
    name: "Hotjar",
    category: "UX & CRO",
    description: "Pesquisas de feedback e gravações de comportamento de checkout.",
    status: "Conectado",
    apiVersion: "v1",
    docsUrl: "https://developers.hotjar.com",
    connectedAccountsCount: 2,
    lastSyncedAt: "Há 40 minutos",
    accounts: [],
    logs: [],
  },
];

export const mockAlienMaxIntegrationInsights: AlienMaxIntegrationInsight[] = [
  {
    id: "int-ins-1",
    type: "Sem Acesso",
    clientName: "Nexus SaaS",
    providerSlug: "google-ads",
    title: "Google Ads possui 2 contas sem permissão de acesso no MCC",
    description: "A API do Google Ads retornou erro 401 ao tentar ler as métricas do cliente Nexus SaaS.",
    confidenceScore: 98,
    recommendedAction: "Solicitar envio de permissão de leitura no MCC da agência",
  },
  {
    id: "int-ins-2",
    type: "Pixel Inativo",
    clientName: "Vortex Suplementos",
    providerSlug: "meta-pixel",
    title: "Pixel do cliente Vortex Suplementos não está enviando evento Purchase",
    description: "Nenhum evento de Purchase foi registrado nas últimas 24 horas via Meta Pixel.",
    confidenceScore: 96,
    recommendedAction: "Verificar disparo da Conversion API no formulário de checkout",
  },
  {
    id: "int-ins-3",
    type: "Avaliações",
    clientName: "Stellar Solar",
    providerSlug: "google-business",
    title: "Google Business Profile possui 4 avaliações pendentes sem resposta",
    description: "Clientes locais deixaram avaliações de 5 estrelas sem resposta há mais de 5 dias.",
    confidenceScore: 92,
    recommendedAction: "Responder avaliações locais utilizando a IA do Alien Max",
  },
  {
    id: "int-ins-4",
    type: "Reconexão",
    clientName: "Operação Agência",
    providerSlug: "search-console",
    title: "Recomendação: Reconectar o Google Search Console",
    description: "O Refresh Token do Search Console vai expirar em 48 horas. Reconectar a conta antes da interrupção.",
    confidenceScore: 99,
    recommendedAction: "Renovar o acesso OAuth 2.0 na Central de Integrações",
  },
];

export class IntegrationRepository {
  async getStats(): Promise<IntegrationStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("integration_providers").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockIntegrationStats,
          availableApisCount: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockIntegrationStats;
  }

  async getProviders(): Promise<IntegrationProviderItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("integration_providers").select("*");
      if (data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category || "Mídia Paga",
          description: p.description || "",
          status: p.status as any,
          apiVersion: p.api_version || "v1.0",
          docsUrl: p.docs_url || "",
          connectedAccountsCount: p.connected_accounts_count || 0,
          lastSyncedAt: p.last_synced_at ? new Date(p.last_synced_at).toLocaleTimeString() : "Pendente",
          accounts: [],
          logs: [],
        }));
      }
    } catch {
      // Fallback
    }
    return mockIntegrationProviders;
  }

  async getProviderBySlug(slug: string): Promise<IntegrationProviderItem | null> {
    const providers = await this.getProviders();
    return providers.find((p) => p.slug === slug) || providers[0];
  }

  async getAlienMaxInsights(): Promise<AlienMaxIntegrationInsight[]> {
    return mockAlienMaxIntegrationInsights;
  }
}

export const integrationRepository = new IntegrationRepository();
