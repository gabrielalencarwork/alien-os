-- ==============================================================================
-- Migration: 20260923000032_link_meta_ads_to_client.sql
-- Vincula as contas de anúncios do Meta Ads e marketing_accounts à empresa ativa (Henrique Food Service)
-- ==============================================================================

-- 1. Associar a conta em meta_ads_accounts à empresa ativa caso company_id seja null
UPDATE public.meta_ads_accounts 
SET company_id = (SELECT id FROM public.companies WHERE active = true ORDER BY created_at ASC LIMIT 1)
WHERE company_id IS NULL;

-- 2. Associar a conta em marketing_accounts à empresa ativa
UPDATE public.marketing_accounts 
SET company_id = (SELECT id FROM public.companies WHERE active = true ORDER BY created_at ASC LIMIT 1)
WHERE company_id IS NULL OR company_id = 'alien-mkt';
