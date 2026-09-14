-- Migration: Adiciona coluna de conversas por mensagem iniciadas (WhatsApp, Direct e Messenger)
-- Execute este script no SQL Editor do painel do Supabase caso queira persistir a coluna específica

ALTER TABLE IF EXISTS public.meta_ads_daily_metrics 
ADD COLUMN IF NOT EXISTS messaging_conversations INT DEFAULT 0;

-- Garantir permissões de leitura e escrita
GRANT ALL ON public.meta_ads_daily_metrics TO anon, authenticated, service_role;
