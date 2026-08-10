-- ==============================================================================
-- Migration: 20260803000017_meta_ads_integration.sql
-- Sprint 22 — Meta Marketing API (Facebook Ads & Instagram Ads) — Alien OS
-- Tabelas: meta_ads_accounts, meta_ads_campaigns, meta_ads_ad_sets, meta_ads_ads, meta_ads_daily_metrics, meta_ads_sync_history
-- ==============================================================================

-- 1. Tabela meta_ads_accounts (Contas de Anúncios e BMs do Meta Ads)
CREATE TABLE IF NOT EXISTS public.meta_ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL DEFAULT 'meta-ads',
  account_id VARCHAR(100) NOT NULL UNIQUE, -- ID da conta no Meta (ex: act_123456789)
  business_id VARCHAR(100), -- Business Manager ID
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DISABLED', 'UNSETTLED'
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela meta_ads_campaigns (Campanhas do Meta Ads)
CREATE TABLE IF NOT EXISTS public.meta_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.meta_ads_accounts(account_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE, -- ID da campanha na Graph API
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'ARCHIVED'
  objective VARCHAR(100) DEFAULT 'OUTCOME_SALES', -- 'OUTCOME_LEADS', 'OUTCOME_SALES', 'OUTCOME_TRAFFIC'
  daily_budget NUMERIC(12, 2) DEFAULT 0.00,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela meta_ads_ad_sets (Conjuntos de Anúncios / Ad Sets)
CREATE TABLE IF NOT EXISTS public.meta_ads_ad_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.meta_ads_accounts(account_id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.meta_ads_campaigns(id) ON DELETE CASCADE,
  external_ad_set_id VARCHAR(100) NOT NULL UNIQUE,
  ad_set_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'ARCHIVED'
  billing_event VARCHAR(50) DEFAULT 'IMPRESSIONS',
  bid_strategy VARCHAR(50) DEFAULT 'LOWEST_COST_WITHOUT_CAP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela meta_ads_ads (Anúncios Individuais do Meta)
CREATE TABLE IF NOT EXISTS public.meta_ads_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.meta_ads_campaigns(id) ON DELETE CASCADE,
  ad_set_id UUID NOT NULL REFERENCES public.meta_ads_ad_sets(id) ON DELETE CASCADE,
  external_ad_id VARCHAR(100) NOT NULL UNIQUE,
  ad_name VARCHAR(255) NOT NULL,
  creative_id VARCHAR(100),
  thumbnail_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'ARCHIVED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabela meta_ads_daily_metrics (Métricas Diárias de Performance por Campanha)
CREATE TABLE IF NOT EXISTS public.meta_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.meta_ads_campaigns(id) ON DELETE CASCADE,
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
  frequency NUMERIC(5, 2) DEFAULT 1.00,
  quality_ranking VARCHAR(50) DEFAULT 'AVERAGE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_meta_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

-- 6. Tabela meta_ads_sync_history (Histórico Auditável da Meta Marketing API)
CREATE TABLE IF NOT EXISTS public.meta_ads_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.meta_ads_accounts(account_id) ON DELETE CASCADE,
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
ALTER TABLE public.meta_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_ad_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_sync_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de leitura
CREATE POLICY "Public Meta Ads Accounts Select Policy" ON public.meta_ads_accounts FOR SELECT USING (true);
CREATE POLICY "Public Meta Ads Campaigns Select Policy" ON public.meta_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public Meta Ads Ad Sets Select Policy" ON public.meta_ads_ad_sets FOR SELECT USING (true);
CREATE POLICY "Public Meta Ads Ads Select Policy" ON public.meta_ads_ads FOR SELECT USING (true);
CREATE POLICY "Public Meta Ads Daily Metrics Select Policy" ON public.meta_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Meta Ads Sync History Select Policy" ON public.meta_ads_sync_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_meta_ads_accounts_acc_id ON public.meta_ads_accounts(account_id);
CREATE INDEX IF NOT EXISTS idx_meta_ads_campaigns_account ON public.meta_ads_campaigns(account_id);
CREATE INDEX IF NOT EXISTS idx_meta_ads_ad_sets_campaign ON public.meta_ads_ad_sets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_meta_ads_daily_metrics_date ON public.meta_ads_daily_metrics(metric_date);

COMMENT ON TABLE public.meta_ads_accounts IS 'Contas de anúncios e Business Managers do Facebook Ads / Meta';
COMMENT ON TABLE public.meta_ads_campaigns IS 'Campanhas de anúncios do Meta Marketing API';
COMMENT ON TABLE public.meta_ads_ad_sets IS 'Conjuntos de Anúncios (Ad Sets) do Meta Marketing API';
COMMENT ON TABLE public.meta_ads_ads IS 'Anúncios individuais e criativos do Meta Ads';
COMMENT ON TABLE public.meta_ads_daily_metrics IS 'Métricas diárias de impressões, cliques, custo, frequência, conversões e ROAS do Meta Ads';
