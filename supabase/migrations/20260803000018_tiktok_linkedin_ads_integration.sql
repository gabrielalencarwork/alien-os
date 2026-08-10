-- ==============================================================================
-- Migration: 20260803000018_tiktok_linkedin_ads_integration.sql
-- Sprint 23 — TikTok Ads & LinkedIn Ads Integrations (Social Media & B2B Leads) — Alien OS
-- ==============================================================================

-- 1. TikTok Ads Accounts (Contas de Anúncios TikTok Business)
CREATE TABLE IF NOT EXISTS public.tiktok_ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL DEFAULT 'tiktok-ads',
  account_id VARCHAR(100) NOT NULL UNIQUE, -- Advertiser ID no TikTok
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. TikTok Ads Campaigns
CREATE TABLE IF NOT EXISTS public.tiktok_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.tiktok_ads_accounts(account_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  objective VARCHAR(100) DEFAULT 'CONVERSIONS', -- 'SPARK_ADS', 'TRAFFIC', 'LEAD_GENERATION'
  budget NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. TikTok Ads Daily Metrics
CREATE TABLE IF NOT EXISTS public.tiktok_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.tiktok_ads_campaigns(id) ON DELETE CASCADE,
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
  video_views_p100 INT DEFAULT 0, -- Retenção 100% de vídeo
  profile_visits INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_tiktok_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

-- 4. LinkedIn Ads Accounts (Contas de Anúncios Corporativas B2B)
CREATE TABLE IF NOT EXISTS public.linkedin_ads_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  provider_slug VARCHAR(50) NOT NULL DEFAULT 'linkedin-ads',
  account_id VARCHAR(100) NOT NULL UNIQUE, -- URN ID do LinkedIn
  account_name VARCHAR(150) NOT NULL,
  currency_code VARCHAR(10) DEFAULT 'BRL',
  time_zone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. LinkedIn Ads Campaigns
CREATE TABLE IF NOT EXISTS public.linkedin_ads_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id VARCHAR(100) NOT NULL REFERENCES public.linkedin_ads_accounts(account_id) ON DELETE CASCADE,
  external_campaign_id VARCHAR(100) NOT NULL UNIQUE,
  campaign_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  objective VARCHAR(100) DEFAULT 'LEAD_GENERATION', -- 'JOB_APPLICATIONS', 'WEBSITE_VISITS'
  budget NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 6. LinkedIn Ads Daily Metrics
CREATE TABLE IF NOT EXISTS public.linkedin_ads_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.linkedin_ads_campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpc NUMERIC(10, 2) DEFAULT 0.00,
  cpm NUMERIC(10, 2) DEFAULT 0.00,
  cost NUMERIC(12, 2) DEFAULT 0.00,
  leads INT DEFAULT 0,
  cpl NUMERIC(10, 2) DEFAULT 0.00, -- Custo por Lead B2B
  conversions INT DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(5, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_linkedin_campaign_metric_date UNIQUE(campaign_id, metric_date)
);

-- Habilitar RLS
ALTER TABLE public.tiktok_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tiktok_ads_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_ads_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_ads_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_ads_daily_metrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de leitura
CREATE POLICY "Public TikTok Accounts Select Policy" ON public.tiktok_ads_accounts FOR SELECT USING (true);
CREATE POLICY "Public TikTok Campaigns Select Policy" ON public.tiktok_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public TikTok Metrics Select Policy" ON public.tiktok_ads_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public LinkedIn Accounts Select Policy" ON public.linkedin_ads_accounts FOR SELECT USING (true);
CREATE POLICY "Public LinkedIn Campaigns Select Policy" ON public.linkedin_ads_campaigns FOR SELECT USING (true);
CREATE POLICY "Public LinkedIn Metrics Select Policy" ON public.linkedin_ads_daily_metrics FOR SELECT USING (true);

COMMENT ON TABLE public.tiktok_ads_accounts IS 'Contas de Anúncios do TikTok Business API';
COMMENT ON TABLE public.linkedin_ads_accounts IS 'Contas de Anúncios B2B do LinkedIn Marketing API';
