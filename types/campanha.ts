/**
 * Definições de Campanhas de Mídia & Aquisição (Alien OS)
 * Tabela Supabase: campaigns / ad_sets
 */

export type CampaignPlatform = "Meta Ads" | "Google Search" | "TikTok Ads" | "LinkedIn Ads" | "Outbrain";

export type CampaignObjective = "Conversão" | "Leads" | "Tráfego" | "Branding" | "Vendas Direct";

export interface Campanha {
  id: string; // UUID
  clientId: string;
  projectId?: string;
  name: string;
  platform: CampaignPlatform;
  objective: CampaignObjective;
  dailyBudget: number;
  totalSpent: number;
  status: "Ativa" | "Pausada" | "Encerrada" | "Em Otimização";
  roasTarget: number;
  currentRoas: number;
  conversionsCount: number;
  startDate: string;
  endDate?: string;
}
