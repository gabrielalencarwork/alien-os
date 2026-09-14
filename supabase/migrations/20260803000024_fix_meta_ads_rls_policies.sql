-- ==============================================================================
-- Migration: 20260803000024_fix_meta_ads_rls_policies.sql
-- Libera permissões totais de leitura e escrita para as tabelas do Meta Ads
-- ==============================================================================

-- 1. Desabilitar RLS nas tabelas de integração do Meta Ads para permitir sincronização de dados via API e leitura no painel
ALTER TABLE IF EXISTS public.meta_ads_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meta_ads_campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meta_ads_ad_sets DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meta_ads_ads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meta_ads_daily_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meta_ads_sync_history DISABLE ROW LEVEL SECURITY;

-- 2. Conceder permissões para os papéis anon, authenticated e service_role
GRANT ALL ON public.meta_ads_accounts TO anon, authenticated, service_role;
GRANT ALL ON public.meta_ads_campaigns TO anon, authenticated, service_role;
GRANT ALL ON public.meta_ads_ad_sets TO anon, authenticated, service_role;
GRANT ALL ON public.meta_ads_ads TO anon, authenticated, service_role;
GRANT ALL ON public.meta_ads_daily_metrics TO anon, authenticated, service_role;
GRANT ALL ON public.meta_ads_sync_history TO anon, authenticated, service_role;
