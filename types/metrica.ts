/**
 * Definições de Métricas e KPIs (Alien OS)
 * Tabela Supabase: metrics_daily / kpis
 */

export interface MetricaKPI {
  id: string;
  title: string;
  value: string;
  numericValue?: number;
  trend?: string;
  trendPositive?: boolean;
  subtitle?: string;
  badgeText?: string;
  category?: "Geral" | "Cliente" | "Financeiro" | "Mídia";
  updatedAt?: string;
}

export interface MetricaDiaria {
  id: string;
  clientId: string;
  date: string;
  adSpend: number;
  revenue: number;
  roas: number;
  leads: number;
  conversions: number;
  cac: number;
  ctr: number;
  cpm: number;
}
