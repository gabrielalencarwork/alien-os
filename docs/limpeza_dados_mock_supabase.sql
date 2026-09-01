-- ==============================================================================
-- Alien OS: Script SQL para Limpeza de Registros de Teste / Dados Mockados
-- Execute este script no SQL Editor do Supabase se desejar limpar quaisquer
-- registros de teste antigos criados anteriormente nas tabelas de integração.
-- ==============================================================================

-- 1. Limpar registros de teste do Google Ads (prefixo cmp-sim- ou cust-sim-)
DELETE FROM public.google_ads_daily_metrics
WHERE campaign_id IN (
  SELECT id FROM public.google_ads_campaigns
  WHERE external_campaign_id LIKE 'cmp-sim%' OR customer_id = '9908617501'
);

DELETE FROM public.google_ads_ads
WHERE external_ad_id LIKE 'ad-sim%';

DELETE FROM public.google_ads_ad_groups
WHERE external_ad_group_id LIKE 'ag-sim%';

DELETE FROM public.google_ads_campaigns
WHERE external_campaign_id LIKE 'cmp-sim%' OR customer_id = '9908617501';

DELETE FROM public.google_ads_customers
WHERE customer_id = '9908617501' AND descriptive_name LIKE '%Sim Sa%de%';

-- 2. Limpar histórico de sync com erro simulado
DELETE FROM public.google_ads_sync_history
WHERE customer_id = '9908617501';

-- ==============================================================================
-- Fim do Script de Limpeza
-- ==============================================================================
