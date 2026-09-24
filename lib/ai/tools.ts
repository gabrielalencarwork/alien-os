import type Anthropic from "@anthropic-ai/sdk";
import { marketingCoreRepository } from "@/lib/repositories/marketingCoreRepository";
import { metaAdsRepository } from "@/lib/repositories/metaAdsRepository";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { financialRepository } from "@/lib/repositories/financialRepository";
import { googleAnalyticsRepository } from "@/lib/repositories/googleAnalyticsRepository";
import { googleAdsRepository } from "@/lib/repositories/googleAdsRepository";

export const alienMaxTools: Anthropic.Tool[] = [
  // ---------- Marketing Core Universal (Meta + Google + TikTok normalizados) ----------
  {
    name: "get_marketing_dashboard",
    description:
      "Retorna o dashboard consolidado de mídia paga (todos os provedores conectados: Meta, Google, TikTok) com métricas agregadas de impressões, cliques, custo, conversões, receita e ROAS.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "list_marketing_campaigns_by_provider",
    description:
      "Lista campanhas de um provedor específico de mídia paga com métricas normalizadas.",
    input_schema: {
      type: "object",
      properties: {
        provider_slug: {
          type: "string",
          description: "Identificador do provedor: 'meta-ads', 'google-ads', 'tiktok-ads', etc.",
        },
      },
      required: ["provider_slug"],
    },
  },
  {
    name: "list_marketing_accounts",
    description:
      "Lista todas as contas de mídia paga conectadas no Alien OS, com nome, moeda e status.",
    input_schema: { type: "object", properties: {}, required: [] },
  },

  // ---------- Meta Ads específico (detalhe por conta e período) ----------
  {
    name: "list_meta_ads_accounts",
    description:
      "Lista todas as contas de anúncios do Meta Ads conectadas no Alien OS com account_id, nome da conta, moeda, status e data da última sincronização.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_meta_ads_dashboard",
    description:
      "Retorna métricas detalhadas de uma conta do Meta Ads para um período: impressões, cliques, CTR, CPC, CPM, custo, conversões, conversas por mensagem, ROAS, CPA e frequência.",
    input_schema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "ID opcional da conta do Meta Ads (ex: 'act_1617848796090095'). Se omitido, utiliza a conta ativa." },
        preset: {
          type: "string",
          enum: ["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth", "allTime", "custom"],
          description:
            "Período pré-definido: 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'allTime', 'custom'.",
        },
        custom_start: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
        custom_end: { type: "string", description: "Data final (YYYY-MM-DD)" },
      },
      required: [],
    },
  },
  {
    name: "list_meta_ads_campaigns",
    description:
      "Lista as campanhas de uma conta do Meta Ads com status, objetivo e orçamento diário, para um período.",
    input_schema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "ID opcional da conta do Meta Ads no Alien OS" },
        preset: {
          type: "string",
          enum: ["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth", "allTime", "custom"],
          description: "Período pré-definido: 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'allTime', 'custom'",
        },
        custom_start: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
        custom_end: { type: "string", description: "Data final (YYYY-MM-DD)" },
      },
      required: [],
    },
  },
  {
    name: "list_meta_ads_creatives",
    description:
      "Lista todos os anúncios e criativos individuais do Meta Ads com métricas detalhadas de cada criativo: nome do anúncio/criativo, status, investimento (spend), impressões, cliques, CTR, CPC e conversas por mensagem iniciadas (WhatsApp / Direct / Messenger). Permite filtrar por account_id e campaign_id.",
    input_schema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "ID opcional da conta do Meta Ads (ex: 'act_1617848796090095')" },
        campaign_id: { type: "string", description: "ID opcional da campanha no Alien OS para filtrar criativos específicos" },
      },
      required: [],
    },
  },
  {
    name: "get_top_meta_creatives_by_messaging",
    description:
      "Retorna o ranking dos melhores criativos e anúncios do Meta Ads ordenados pelo maior volume de conversas por mensagem iniciadas (WhatsApp, Instagram Direct, Messenger), acompanhado de custo por conversa, investimento (spend) e CTR. Use SEMPRE que o usuário perguntar quais criativos estão trazendo mais conversas, leads de WhatsApp, melhores anúncios da campanha ou pedir comparativo de criativos.",
    input_schema: {
      type: "object",
      properties: {
        account_id: { type: "string", description: "ID opcional da conta do Meta Ads" },
        campaign_id: { type: "string", description: "ID opcional da campanha para analisar criativos de uma campanha específica" },
        limit: { type: "number", description: "Quantidade máxima de criativos no ranking (padrão: 10)" },
      },
      required: [],
    },
  },

  // ---------- Google Ads específico (detalhe por conta, campanhas e métricas) ----------
  {
    name: "list_google_ads_customers",
    description:
      "Lista todas as contas de clientes do Google Ads conectadas no Alien OS, com customer_id, nome da conta, moeda e status.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_google_ads_dashboard",
    description:
      "Retorna as métricas consolidadas do Google Ads para um período: custo total, impressões, cliques, CTR médio, CPC médio, conversões, receita e ROAS. Permite analisar o desempenho do Google Ads da agência ou filtrar por período.",
    input_schema: {
      type: "object",
      properties: {
        preset: {
          type: "string",
          enum: ["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth", "allTime", "custom"],
          description: "Período pré-definido: 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'allTime', 'custom'",
        },
        custom_start: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
        custom_end: { type: "string", description: "Data final (YYYY-MM-DD)" },
      },
      required: [],
    },
  },
  {
    name: "list_google_ads_campaigns",
    description:
      "Lista campanhas do Google Ads com orçamento diário, custo, conversões, receita, ROAS e status. Pode filtrar por customer_id específico (ex: '990-861-7501' ou '9908617501') e período.",
    input_schema: {
      type: "object",
      properties: {
        customer_id: {
          type: "string",
          description: "ID do cliente no Google Ads (ex: '990-861-7501' ou '9908617501')",
        },
        preset: {
          type: "string",
          enum: ["today", "yesterday", "last7days", "last30days", "thisMonth", "lastMonth", "allTime", "custom"],
          description: "Período pré-definido: 'today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth', 'allTime', 'custom'",
        },
        custom_start: { type: "string", description: "Data inicial (YYYY-MM-DD)" },
        custom_end: { type: "string", description: "Data final (YYYY-MM-DD)" },
      },
      required: [],
    },
  },

  // ---------- CRM / Pipeline comercial ----------
  {
    name: "list_clients",
    description:
      "Lista todos os clientes/leads da agência com etapa no funil (journey_stage: Lead, Em Diagnóstico, Recepção, Setup, Em Execução, Em Escala, Case), MRR, segmento e health_status.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_client_by_id",
    description: "Retorna os dados completos de um cliente/lead específico pelo ID.",
    input_schema: {
      type: "object",
      properties: { id: { type: "string", description: "ID (UUID) do cliente no Alien OS" } },
      required: ["id"],
    },
  },
  {
    name: "search_clients",
    description: "Busca clientes/leads por nome ou filtra por etapa do funil.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Termo de busca (nome fantasia ou razão social)" },
        stage_filter: {
          type: "string",
          description:
            "Filtra por etapa: 'Lead', 'Em Diagnóstico', 'Recepção', 'Setup', 'Em Execução', 'Em Escala', 'Case'",
        },
      },
      required: [],
    },
  },

  // ---------- Financeiro ----------
  {
    name: "get_financial_kpis",
    description:
      "Retorna os principais indicadores financeiros da agência: MRR, ARR projetado, ticket médio, LTV e valores pendentes.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_contracts",
    description: "Lista os contratos vigentes com valor mensal, duração, data de renovação e status.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_invoices",
    description: "Lista as faturas emitidas com valor, vencimento, status de pagamento e serviços.",
    input_schema: { type: "object", properties: {}, required: [] },
  },

  // ---------- Google Analytics 4 ----------
  {
    name: "get_ga4_dashboard",
    description:
      "Retorna as métricas consolidadas do Google Analytics 4 dos últimos 30 dias: usuários ativos, novos usuários, sessões, sessões engajadas, conversões, receita atribuída, bounce rate e duração média da sessão. Use para responder perguntas sobre tráfego orgânico, performance do site e engajamento.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "get_ga4_traffic_sources",
    description:
      "Retorna os insights de tráfego GA4 gerados pelo Alien OS: canais que mais convertem, taxa de rejeição, oportunidades de CRO e recomendações de escala. Use para diagnosticar qualidade do tráfego e oportunidades de otimização de páginas.",
    input_schema: { type: "object", properties: {}, required: [] },
  },
];

/**
 * Normaliza variações de snake_case para o formato camelCase aceito pelo repository do Meta Ads
 */
function normalizePreset(rawPreset?: string): string {
  if (!rawPreset) return "allTime";
  const cleaned = rawPreset.toLowerCase().replace(/_/g, "");
  if (cleaned === "last7days" || cleaned === "7d") return "last7days";
  if (cleaned === "last30days" || cleaned === "30d") return "last30days";
  if (cleaned === "today") return "today";
  if (cleaned === "yesterday") return "yesterday";
  if (cleaned === "thismonth") return "thisMonth";
  if (cleaned === "lastmonth") return "lastMonth";
  if (cleaned === "custom") return "custom";
  return rawPreset;
}

export async function runAlienMaxTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  try {
    switch (toolName) {
      case "get_marketing_dashboard":
        return JSON.stringify(await marketingCoreRepository.getConsolidatedDashboard());

      case "list_marketing_campaigns_by_provider":
        return JSON.stringify(
          await marketingCoreRepository.listCampaigns(toolInput.provider_slug as string)
        );

      case "list_marketing_accounts":
        return JSON.stringify(await marketingCoreRepository.listAccounts());

      case "list_meta_ads_accounts":
        return JSON.stringify(await metaAdsRepository.listAccounts());

      case "get_meta_ads_dashboard": {
        let accountId = toolInput.account_id as string | undefined;
        if (!accountId) {
          const accounts = await metaAdsRepository.listAccounts();
          if (accounts.length > 0) accountId = accounts[0].accountId;
        }
        return JSON.stringify(
          await metaAdsRepository.getDashboardMetrics(
            accountId,
            normalizePreset(toolInput.preset as string) as any,
            toolInput.custom_start as string | undefined,
            toolInput.custom_end as string | undefined
          )
        );
      }

      case "list_meta_ads_campaigns": {
        let accountId = toolInput.account_id as string | undefined;
        if (!accountId) {
          const accounts = await metaAdsRepository.listAccounts();
          if (accounts.length > 0) accountId = accounts[0].accountId;
        }
        return JSON.stringify(
          await metaAdsRepository.listCampaigns(
            accountId,
            normalizePreset(toolInput.preset as string) as any,
            toolInput.custom_start as string | undefined,
            toolInput.custom_end as string | undefined
          )
        );
      }

      case "list_meta_ads_creatives":
        return JSON.stringify(
          await metaAdsRepository.listAds(
            toolInput.account_id as string | undefined,
            undefined,
            toolInput.campaign_id as string | undefined
          )
        );

      case "get_top_meta_creatives_by_messaging":
        return JSON.stringify(
          await metaAdsRepository.getTopAdsByMessagingConversations(
            toolInput.account_id as string | undefined,
            toolInput.campaign_id as string | undefined,
            Number(toolInput.limit) || 10
          )
        );

      case "list_google_ads_customers":
        return JSON.stringify(await googleAdsRepository.listCustomers());

      case "get_google_ads_dashboard":
        return JSON.stringify(
          await googleAdsRepository.getDashboardMetrics(
            normalizePreset(toolInput.preset as string) as any,
            toolInput.custom_start as string | undefined,
            toolInput.custom_end as string | undefined
          )
        );

      case "list_google_ads_campaigns":
        return JSON.stringify(
          await googleAdsRepository.listCampaigns(
            toolInput.customer_id as string | undefined,
            normalizePreset(toolInput.preset as string) as any,
            toolInput.custom_start as string | undefined,
            toolInput.custom_end as string | undefined
          )
        );

      case "list_clients":
        return JSON.stringify(await clientRepository.getAll());

      case "get_client_by_id":
        return JSON.stringify(await clientRepository.getById(toolInput.id as string));

      case "search_clients":
        return JSON.stringify(
          await clientRepository.search(
            (toolInput.query as string) || "",
            toolInput.stage_filter as string | undefined
          )
        );

      case "get_financial_kpis":
        return JSON.stringify(await financialRepository.getKpis());

      case "get_contracts":
        return JSON.stringify(await financialRepository.getContracts());

      case "get_invoices":
        return JSON.stringify(await financialRepository.getInvoices());

      case "get_ga4_dashboard":
        return JSON.stringify(await googleAnalyticsRepository.getStats());

      case "get_ga4_traffic_sources":
        return JSON.stringify(await googleAnalyticsRepository.getAlienMaxInsights());

      default:
        return JSON.stringify({ error: `Tool desconhecida: ${toolName}` });
    }
  } catch (err) {
    return JSON.stringify({
      error: `Erro ao executar ${toolName}: ${(err as Error).message}`,
    });
  }
}
