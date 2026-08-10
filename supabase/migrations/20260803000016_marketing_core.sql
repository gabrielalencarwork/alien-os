-- ==============================================================================
-- Migration: 20260803000016_marketing_core.sql
-- Marketing Core Universal & Engine de Mídia Paga — Alien OS
-- Tabelas Universais: marketing_accounts, marketing_campaigns, marketing_daily_metrics
-- ==============================================================================

-- 1. Expansão com IDs Universais nas tabelas existentes do Google Ads
ALTER TABLE public.google_ads_customers
  ADD COLUMN IF NOT EXISTS integration_provider_id VARCHAR(50) DEFAULT 'google-ads',
  ADD COLUMN IF NOT EXISTS integration_account_id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);

ALTER TABLE public.google_ads_campaigns
  ADD COLUMN IF NOT EXISTS integration_provider_id VARCHAR(50) DEFAULT 'google-ads',
  ADD COLUMN IF NOT EXISTS integration_account_id UUID,
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);

-- Atualiza os valores dos IDs universais para compatibilidade retroativa
UPDATE public.google_ads_customers SET external_id = customer_id WHERE external_id IS NULL;
UPDATE public.google_ads_campaigns SET external_id = external_campaign_id WHERE external_id IS NULL;

-- 2. Tabela Universal public.marketing_accounts (Contas de Anúncios Unificadas)
CREATE TABLE IF NOT EXISTS public.marketing_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL, -- 'google-ads', 'meta-ads', 'tiktok-ads', 'linkedin-ads'
  external_account_id VARCHAR(100) NOT NULL,
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) DEFAULT 'ENABLED',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_provider_account UNIQUE(provider_slug, external_account_id)
);

-- 3. Tabela Universal public.marketing_campaigns (Campanhas Unificadas de Mídia Paga)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.marketing_accounts(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL,
  external_campaign_id VARCHAR(100) NOT NULL,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED',
  objective VARCHAR(100) DEFAULT 'CONVERSIONS',
  daily_budget NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_provider_campaign UNIQUE(provider_slug, external_campaign_id)
);

-- 4. Tabela Universal public.marketing_daily_metrics (Métricas Comuns Agregadas)
CREATE TABLE IF NOT EXISTS public.marketing_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpc NUMERIC(10, 2) DEFAULT 0.00,
  cpm NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  conversions INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  cpa NUMERIC(10, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_marketing_campaign_date UNIQUE(campaign_id, metric_date)
);

-- Habilitar RLS
ALTER TABLE public.marketing_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de leitura
CREATE POLICY "Public Marketing Accounts Select Policy" ON public.marketing_accounts FOR SELECT USING (true);
CREATE POLICY "Public Marketing Campaigns Select Policy" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Marketing Daily Metrics Select Policy" ON public.marketing_daily_metrics FOR SELECT USING (true);

-- Índices de performance universais
CREATE INDEX IF NOT EXISTS idx_marketing_accounts_provider ON public.marketing_accounts(provider_slug);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_account ON public.marketing_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_marketing_daily_metrics_date ON public.marketing_daily_metrics(metric_date);

COMMENT ON TABLE public.marketing_accounts IS 'Contas universais de anúncios de todas as mídias pagas (Google, Meta, TikTok, LinkedIn)';
COMMENT ON TABLE public.marketing_campaigns IS 'Campanhas universais unificadas de tráfego pago';
COMMENT ON TABLE public.marketing_daily_metrics IS 'Métricas diárias comuns (Impressões, Cliques, CTR, CPC, CPM, Conversões, Receita, ROAS, CPA)';
