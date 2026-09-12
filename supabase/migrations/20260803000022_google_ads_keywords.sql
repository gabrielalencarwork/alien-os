-- ==============================================================================
-- Migration: 20260803000022_google_ads_keywords.sql
-- Tabela de Palavras-Chave e Palavras Negativas reais do Google Ads
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.google_ads_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(50) NOT NULL REFERENCES public.google_ads_customers(customer_id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.google_ads_campaigns(id) ON DELETE CASCADE,
  ad_group_id UUID REFERENCES public.google_ads_ad_groups(id) ON DELETE CASCADE,
  external_criterion_id VARCHAR(100) NOT NULL UNIQUE,
  keyword_text VARCHAR(255) NOT NULL,
  match_type VARCHAR(50) DEFAULT 'BROAD',
  status VARCHAR(50) DEFAULT 'ENABLED',
  negative BOOLEAN DEFAULT false,
  campaign_name VARCHAR(255),
  ad_group_name VARCHAR(255),
  quality_score INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE IF EXISTS public.google_ads_keywords DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.google_ads_keywords TO anon, authenticated, service_role;
