-- ==============================================================================
-- Migration: 20260803000014_google_ads_integration.sql
-- Google Ads API (Primeira Integração Real de Mídia Paga) — Alien OS
-- Tabelas: google_ads_customers, google_ads_campaigns, google_ads_daily_metrics, google_ads_sync_history
-- ==============================================================================

-- 1. Tabela google_ads_customers (Contas MCC e Contas de Anúncios vinculadas)
CREATE TABLE IF NOT EXISTS public.google_ads_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id VARCHAR(50) NOT NULL UNIQUE, -- ID do cliente Google Ads (ex: 123-456-7890 sem traços: 1234567890)
  descriptive_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  manager BOOLEAN DEFAULT false, -- True para MCC (Manager Account), False para Customer Account
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED', -- 'ENABLED', 'PAUSED', 'CANCELLED'
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela google_ads_campaigns (Campanhas sincronizadas do Google Ads)
CREATE TABLE IF NOT EXISTS public.google_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL REFERENCES public.google_ads_customers(customer_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE, -- ID numérico da campanha no Google Ads
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED', -- 'ENABLED', 'PAUSED', 'REMOVED'
  objective VARCHAR(100) DEFAULT 'SEARCH', -- 'SEARCH', 'PERFORMANCE_MAX', 'DISPLAY', 'SHOPPING', 'VIDEO'
  bidding_strategy VARCHAR(100) DEFAULT 'MAXIMIZE_CONVERSIONS',
  budget NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela google_ads_daily_metrics (Métricas Diárias de Performance por Campanha)
CREATE TABLE IF NOT EXISTS public.google_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  average_cpc NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  conversions INT DEFAULT 0,
  conversion_value NUMERIC(12, 2) DEFAULT 0.00,
  cost_per_conversion NUMERIC(10, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

-- 4. Tabela google_ads_sync_history (Histórico Auditável de Sincronização da API)
CREATE TABLE IF NOT EXISTS public.google_ads_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL REFERENCES public.google_ads_customers(customer_id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  finished_at TIMESTAMPTZ,
  duration_ms INT DEFAULT 0,
  records_processed INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'SUCCESS', -- 'SUCCESS', 'ERROR', 'IN_PROGRESS'
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.google_ads_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_sync_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas para leitura
CREATE POLICY "Public Google Ads Customers Select Policy" ON public.google_ads_customers FOR SELECT USING (true);
CREATE POLICY "Public Google Ads Campaigns Select Policy" ON public.google_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Google Ads Daily Metrics Select Policy" ON public.google_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Google Ads Sync History Select Policy" ON public.google_ads_sync_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_google_ads_customers_cid ON public.google_ads_customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_campaigns_customer ON public.google_ads_campaigns(customer_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_daily_metrics_date ON public.google_ads_daily_metrics(metric_date);

COMMENT ON TABLE public.google_ads_customers IS 'Contas MCC e Contas de Anúncios ativas do Google Ads';
COMMENT ON TABLE public.google_ads_campaigns IS 'Campanhas de mídia paga sincronizadas da Google Ads API';
COMMENT ON TABLE public.google_ads_daily_metrics IS 'Métricas diárias de impressões, cliques, custo, conversões e ROAS do Google Ads';
COMMENT ON TABLE public.google_ads_sync_history IS 'Log auditável dos jobs de sincronização com a Google Ads API';
