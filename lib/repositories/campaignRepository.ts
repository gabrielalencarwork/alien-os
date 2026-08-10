/**
 * Repository Pattern: Campaign Repository (Alien OS)
 * Gerencia a leitura, gravação e cálculo de métricas de mídia paga no Campaign Hub.
 * Conectado às tabelas Supabase: campaigns, campaign_platforms, campaign_daily_metrics, campaign_creatives.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type CampaignPlatform =
  | "Meta Ads"
  | "Google Ads"
  | "TikTok Ads"
  | "LinkedIn Ads"
  | "Pinterest Ads"
  | "Microsoft Ads";

export type CampaignObjective =
  | "Reconhecimento"
  | "Tráfego"
  | "Engajamento"
  | "Leads"
  | "Conversões"
  | "Vendas"
  | "Remarketing"
  | "Mensagens"
  | "Catálogo";

export type CampaignStatus =
  | "Planejada"
  | "Em preparação"
  | "Ativa"
  | "Pausada"
  | "Em otimização"
  | "Finalizada"
  | "Arquivada";

export interface CampaignDailyMetric {
  date: string;
  spent: number;
  revenue: number;
  roas: number;
  clicks: number;
  impressions: number;
  conversions: number;
  leads: number;
  ctr: number;
  cpm: number;
  cpa: number;
  cpl: number;
}

export interface CampaignCreativeItem {
  id: string;
  campaignId: string;
  title: string;
  format: string;
  thumbnailUrl?: string;
  ctrPercentage: number;
  conversionsCount: number;
  status: string;
}

export interface CampaignItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  name: string;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  type: string;
  description: string;
  managerName: string;
  priority: string;
  status: CampaignStatus;
  startDate: string;
  endDate?: string;
  dailyBudget: number;
  monthlyBudget: number;
  spentAmount: number;
  revenueGenerated: number;
  roas: number;
  roiPercentage: number;
  cacAmount: number;
  cplAmount: number;
  cpaAmount: number;
  ctrPercentage: number;
  cpmAmount: number;
  conversionsCount: number;
  leadsCount: number;
  alienScore: number;
  healthStatus: "Excelente" | "Atenção" | "Crítico";
  dailyMetrics: CampaignDailyMetric[];
  creatives: CampaignCreativeItem[];
}

export interface CampaignStats {
  totalSpent: number;
  totalRevenue: number;
  averageRoas: number;
  averageRoiPercentage: number;
  averageCac: number;
  averageCpl: number;
  averageCtr: number;
  averageCpm: number;
  averageCpa: number;
  totalConversions: number;
  totalLeads: number;
  activeCampaignsCount: number;
  pausedCampaignsCount: number;
  completedCampaignsCount: number;
}

export interface AlienMaxCampaignInsight {
  id: string;
  type: "Queda ROAS" | "Frequência" | "Escala" | "Alerta CAC" | "Otimização";
  clientName: string;
  companyId: string;
  campaignName: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export const mockCampaignStats: CampaignStats = {
  totalSpent: 148500,
  totalRevenue: 801900,
  averageRoas: 5.4,
  averageRoiPercentage: 340,
  averageCac: 42.5,
  averageCpl: 14.2,
  averageCtr: 2.85,
  averageCpm: 18.4,
  averageCpa: 38.9,
  totalConversions: 1420,
  totalLeads: 2890,
  activeCampaignsCount: 14,
  pausedCampaignsCount: 4,
  completedCampaignsCount: 32,
};

export const mockCampaigns: CampaignItem[] = [
  {
    id: "cmp-101",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    projectName: "Escala Q3 Meta Ads",
    name: "Aura · CBO Advantage+ Retargeting topo & meio",
    platform: "Meta Ads",
    objective: "Conversões",
    type: "CBO Sales",
    description: "Campanha Advantage+ de Vendas direcionada aos produtos de Nutrição e Alta Performance.",
    managerName: "Lucas Mendes",
    priority: "Alta",
    status: "Ativa",
    startDate: "2026-07-01",
    dailyBudget: 800,
    monthlyBudget: 24000,
    spentAmount: 18400,
    revenueGenerated: 106720,
    roas: 5.8,
    roiPercentage: 380,
    cacAmount: 38.5,
    cplAmount: 12.4,
    cpaAmount: 36.2,
    ctrPercentage: 3.12,
    cpmAmount: 16.8,
    conversionsCount: 508,
    leadsCount: 840,
    alienScore: 94,
    healthStatus: "Excelente",
    dailyMetrics: [
      { date: "2026-07-28", spent: 800, revenue: 4800, roas: 6.0, clicks: 420, impressions: 14000, conversions: 22, leads: 35, ctr: 3.0, cpm: 16.0, cpa: 36.3, cpl: 12.0 },
      { date: "2026-07-29", spent: 800, revenue: 4640, roas: 5.8, clicks: 410, impressions: 13800, conversions: 21, leads: 34, ctr: 2.9, cpm: 16.2, cpa: 38.0, cpl: 12.2 },
      { date: "2026-07-30", spent: 800, revenue: 4960, roas: 6.2, clicks: 450, impressions: 14500, conversions: 24, leads: 40, ctr: 3.1, cpm: 15.8, cpa: 33.3, cpl: 11.5 },
      { date: "2026-07-31", spent: 800, revenue: 4720, roas: 5.9, clicks: 430, impressions: 14100, conversions: 22, leads: 36, ctr: 3.05, cpm: 16.1, cpa: 36.3, cpl: 12.1 },
      { date: "2026-08-01", spent: 800, revenue: 5120, roas: 6.4, clicks: 460, impressions: 14800, conversions: 25, leads: 42, ctr: 3.2, cpm: 15.5, cpa: 32.0, cpl: 11.2 },
      { date: "2026-08-02", spent: 800, revenue: 4480, roas: 5.6, clicks: 400, impressions: 13500, conversions: 20, leads: 31, ctr: 2.96, cpm: 16.5, cpa: 40.0, cpl: 12.9 },
      { date: "2026-08-03", spent: 800, revenue: 4880, roas: 6.1, clicks: 440, impressions: 14200, conversions: 23, leads: 38, ctr: 3.1, cpm: 15.9, cpa: 34.7, cpl: 11.8 },
    ],
    creatives: [
      { id: "cr-1", campaignId: "cmp-101", title: "Vídeo UGC Treino Funcional 9:16", format: "Vídeo MP4", ctrPercentage: 4.2, conversionsCount: 180, status: "Ativo" },
      { id: "cr-2", campaignId: "cmp-101", title: "Carrossel Benefícios Nutracêuticos", format: "Imagem PNG", ctrPercentage: 2.8, conversionsCount: 120, status: "Ativo" },
    ],
  },
  {
    id: "cmp-102",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    projectName: "Funil B2B Google Search",
    name: "Nexus · Google Search B2B Fundo de Funil",
    platform: "Google Ads",
    objective: "Leads",
    type: "Search B2B",
    description: "Captura de pesquisas ativas por software ERP e automação financeira B2B.",
    managerName: "Matheus Silva",
    priority: "Alta",
    status: "Ativa",
    startDate: "2026-07-10",
    dailyBudget: 500,
    monthlyBudget: 15000,
    spentAmount: 11500,
    revenueGenerated: 69000,
    roas: 6.0,
    roiPercentage: 400,
    cacAmount: 78.0,
    cplAmount: 24.5,
    cpaAmount: 78.0,
    ctrPercentage: 5.40,
    cpmAmount: 48.0,
    conversionsCount: 147,
    leadsCount: 469,
    alienScore: 89,
    healthStatus: "Excelente",
    dailyMetrics: [],
    creatives: [],
  },
  {
    id: "cmp-103",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    projectName: "Branding & UGC",
    name: "Lumina · TikTok Spark Ads Trend Skincare",
    platform: "TikTok Ads",
    objective: "Engajamento",
    type: "Spark Ads",
    description: "Campanha viral no TikTok com influenciadoras de beleza e estética.",
    managerName: "Fernanda Lima",
    priority: "Média",
    status: "Em otimização",
    startDate: "2026-07-20",
    dailyBudget: 350,
    monthlyBudget: 10500,
    spentAmount: 4900,
    revenueGenerated: 21060,
    roas: 4.3,
    roiPercentage: 230,
    cacAmount: 34.0,
    cplAmount: 9.8,
    cpaAmount: 34.0,
    ctrPercentage: 2.45,
    cpmAmount: 11.2,
    conversionsCount: 144,
    leadsCount: 500,
    alienScore: 85,
    healthStatus: "Excelente",
    dailyMetrics: [],
    creatives: [],
  },
  {
    id: "cmp-104",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    projectName: "Branding & Criativos",
    name: "Vortex · Meta Ads Tráfego Direto Checkout",
    platform: "Meta Ads",
    objective: "Tráfego",
    type: "Traffic",
    description: "Campanha de tráfego direto para a oferta de pré-treino sabor uva.",
    managerName: "Lucas Mendes",
    priority: "Crítica",
    status: "Pausada",
    startDate: "2026-07-15",
    dailyBudget: 250,
    monthlyBudget: 7500,
    spentAmount: 4200,
    revenueGenerated: 12600,
    roas: 3.0,
    roiPercentage: 100,
    cacAmount: 52.0,
    cplAmount: 18.0,
    cpaAmount: 52.0,
    ctrPercentage: 1.85,
    cpmAmount: 22.0,
    conversionsCount: 80,
    leadsCount: 230,
    alienScore: 72,
    healthStatus: "Atenção",
    dailyMetrics: [],
    creatives: [],
  },
];

export const mockAlienMaxCampaignInsights: AlienMaxCampaignInsight[] = [
  {
    id: "cmp-ins-1",
    type: "Queda ROAS",
    clientName: "Vortex Suplementos",
    companyId: "vortex-suplementos",
    campaignName: "Vortex · Meta Ads Tráfego Direto Checkout",
    title: "A campanha Meta Ads da Vortex apresentou queda de 18% no ROAS",
    description: "A taxa de conversão do checkout caiu de 2.1% para 1.4% nas últimas 48h. O Alien Max sugere trocar os criativos saturados.",
    confidenceScore: 96,
    recommendedAction: "Pausar o anúncio #2 e subir novo vídeo UGC no retargeting",
  },
  {
    id: "cmp-ins-2",
    type: "Frequência",
    clientName: "Lumina Skincare",
    companyId: "lumina-skincare",
    campaignName: "Lumina · TikTok Spark Ads Trend Skincare",
    title: "Frequência elevada de exibição (4.8x) identificada no TikTok Ads",
    description: "O mesmo público está vendo o anúncio quase 5 vezes por semana, gerando fadiga de anúncio.",
    confidenceScore: 94,
    recommendedAction: "Expandir a segmentação de interesse para público aberto 18-35",
  },
  {
    id: "cmp-ins-3",
    type: "Escala",
    clientName: "Aura Health",
    companyId: "aura-health",
    campaignName: "Aura · CBO Advantage+ Retargeting topo & meio",
    title: "Oportunidade de escala identificada na campanha CBO da Aura",
    description: "ROAS está sustentado em 5.8x há 14 dias seguidos com CPL de R$ 12,40. Existe margem para aporte incremental.",
    confidenceScore: 98,
    recommendedAction: "Sugestão: Aumentar orçamento diário em 20% (+R$ 160/dia)",
  },
  {
    id: "cmp-ins-4",
    type: "Alerta CAC",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    campaignName: "Nexus · Google Search B2B Fundo de Funil",
    title: "O CAC aumentou 12% nas últimas 48 horas no Google Search",
    description: "Termos amplos sem correspondência exata estão encarecendo o CPC. Negativar termos desnecessários.",
    confidenceScore: 95,
    recommendedAction: "Revisar relatório de termos de busca e aplicar correspondência exata",
  },
];

export class CampaignRepository {
  async getStats(): Promise<CampaignStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("campaigns").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockCampaignStats,
          activeCampaignsCount: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockCampaignStats;
  }

  async getCampaigns(): Promise<CampaignItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("campaigns").select("*");
      if (data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          companyId: c.company_id,
          clientName: c.company_id,
          companyName: c.company_id,
          name: c.name,
          platform: c.platform as any,
          objective: c.objective as any,
          type: c.type || "CBO",
          description: c.description || "",
          managerName: c.manager_name,
          priority: c.priority,
          status: c.status as any,
          startDate: c.start_date,
          endDate: c.end_date,
          dailyBudget: Number(c.daily_budget) || 0,
          monthlyBudget: Number(c.monthly_budget) || 0,
          spentAmount: Number(c.spent_amount) || 0,
          revenueGenerated: Number(c.revenue_generated) || 0,
          roas: Number(c.roas) || 0,
          roiPercentage: Number(c.roi_percentage) || 0,
          cacAmount: Number(c.cac_amount) || 0,
          cplAmount: Number(c.cpl_amount) || 0,
          cpaAmount: Number(c.cpa_amount) || 0,
          ctrPercentage: Number(c.ctr_percentage) || 0,
          cpmAmount: Number(c.cpm_amount) || 0,
          conversionsCount: c.conversions_count || 0,
          leadsCount: c.leads_count || 0,
          alienScore: c.alien_score_impact || 90,
          healthStatus: (c.health_status as any) || "Excelente",
          dailyMetrics: [],
          creatives: [],
        }));
      }
    } catch {
      // Fallback
    }
    return mockCampaigns;
  }

  async getCampaignById(id: string): Promise<CampaignItem | null> {
    const campaigns = await this.getCampaigns();
    return campaigns.find((c) => c.id === id) || campaigns[0];
  }

  async getAlienMaxInsights(): Promise<AlienMaxCampaignInsight[]> {
    return mockAlienMaxCampaignInsights;
  }
}

export const campaignRepository = new CampaignRepository();
