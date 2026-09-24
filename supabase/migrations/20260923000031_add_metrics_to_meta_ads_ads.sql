-- ==============================================================================
-- Migration: 20260923000031_add_metrics_to_meta_ads_ads.sql
-- Adiciona métricas de performance e conversas por mensagem na tabela meta_ads_ads
-- Permite que o Alien OS e o Alien Max avaliem o desempenho de cada criativo individualmente
-- ==============================================================================

ALTER TABLE IF EXISTS public.meta_ads_ads 
ADD COLUMN IF NOT EXISTS spend NUMERIC(12, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS impressions INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ctr NUMERIC(5, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cpc NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS cpm NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS conversions INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS messaging_conversations INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS cost_per_messaging_conversation NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Garantir permissões completas
GRANT ALL ON public.meta_ads_ads TO anon, authenticated, service_role;
