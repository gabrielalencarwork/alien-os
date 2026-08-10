-- ==============================================================================
-- Migration: 20260803000015_google_ads_architecture_refinement.sql
-- Sprint 21.1 — Padronização da Arquitetura de Mídia Paga (Google Ads) — Alien OS
-- Hierarquia: Conta (Customer) -> Campanha -> Grupo de Anúncios -> Anúncio -> Métricas
-- ==============================================================================

-- 1. Expansão da Tabela google_ads_customers (Campos Organization ID e Workspace ID)
ALTER TABLE public.google_ads_customers 
  ADD COLUMN IF NOT EXISTS organization_id UUID,
  ADD COLUMN IF NOT EXISTS workspace_id UUID;

-- 2. Expansão da Tabela google_ads_campaigns (Tipos e Optimization Score)
ALTER TABLE public.google_ads_campaigns
  ADD COLUMN IF NOT EXISTS campaign_type VARCHAR(100) DEFAULT 'SEARCH',
  ADD COLUMN IF NOT EXISTS advertising_channel_type VARCHAR(100) DEFAULT 'SEARCH',
  ADD COLUMN IF NOT EXISTS advertising_channel_sub_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS serving_status VARCHAR(50) DEFAULT 'SERVING',
  ADD COLUMN IF NOT EXISTS optimization_score NUMERIC(5, 2) DEFAULT 85.00;

-- 3. Nova Tabela public.google_ads_ad_groups (Grupos de Anúncios)
CREATE TABLE IF NOT EXISTS public.google_ads_ad_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id VARCHAR(50) NOT NULL REFERENCES public.google_ads_customers(customer_id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  external_ad_group_id VARCHAR(100) NOT NULL UNIQUE,
  ad_group_name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED', -- 'ENABLED', 'PAUSED', 'REMOVED'
  type VARCHAR(50) DEFAULT 'SEARCH_STANDARD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Nova Tabela public.google_ads_ads (Anúncios Individuais)
CREATE TABLE IF NOT EXISTS public.google_ads_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  workspace_id UUID,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  ad_group_id UUID NOT NULL REFERENCES public.google_ads_ad_groups(id) ON DELETE CASCADE,
  external_ad_id VARCHAR(100) NOT NULL UNIQUE,
  headline TEXT,
  description TEXT,
  final_url TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'ENABLED', -- 'ENABLED', 'PAUSED', 'REMOVED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Expansão da Tabela public.google_ads_daily_metrics (Métricas Avançadas)
ALTER TABLE public.google_ads_daily_metrics
  ADD COLUMN IF NOT EXISTS cost_micros BIGINT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS all_conversions INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS impression_share NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS search_impression_share NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS search_top_impression_share NUMERIC(5, 2) DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS video_views INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_through_conversions INT DEFAULT 0;

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.google_ads_ad_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_ads ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de leitura
CREATE POLICY "Public Google Ads Ad Groups Select Policy" ON public.google_ads_ad_groups FOR SELECT USING (true);
CREATE POLICY "Public Google Ads Ads Select Policy" ON public.google_ads_ads FOR SELECT USING (true);

-- Índices de alta performance para a hierarquia
CREATE INDEX IF NOT EXISTS idx_google_ads_ad_groups_campaign ON public.google_ads_ad_groups(campaign_id);
CREATE INDEX IF NOT EXISTS idx_google_ads_ads_ad_group ON public.google_ads_ads(ad_group_id);

COMMENT ON TABLE public.google_ads_ad_groups IS 'Grupos de anúncios associados às campanhas do Google Ads';
COMMENT ON TABLE public.google_ads_ads IS 'Anúncios individuais com títulos, descrições e URLs finais';
