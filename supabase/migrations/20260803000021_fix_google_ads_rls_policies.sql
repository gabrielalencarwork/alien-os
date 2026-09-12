-- ==============================================================================
-- Migration: 20260803000021_fix_google_ads_rls_policies.sql
-- Libera permissões totais de leitura e escrita para as tabelas do Google Ads
-- ==============================================================================

-- 1. Desabilitar RLS nas tabelas de integração do Google Ads para permitir sincronização de dados via API e leitura no painel
ALTER TABLE IF EXISTS public.google_ads_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_ads_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_ads_ad_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_ads_ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_ads_daily_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.google_ads_sync_history DISABLE ROW LEVEL SECURITY;

-- 2. Conceder permissões para os papéis anon, authenticated e service_role
GRANT ALL ON public.google_ads_customers TO anon, authenticated, service_role;
GRANT ALL ON public.google_ads_campaigns TO anon, authenticated, service_role;
GRANT ALL ON public.google_ads_ad_groups TO anon, authenticated, service_role;
GRANT ALL ON public.google_ads_ads TO anon, authenticated, service_role;
GRANT ALL ON public.google_ads_daily_metrics TO anon, authenticated, service_role;
GRANT ALL ON public.google_ads_sync_history TO anon, authenticated, service_role;
