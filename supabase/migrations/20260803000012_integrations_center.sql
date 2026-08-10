-- ==============================================================================
-- Migration: 20260803000012_integrations_center.sql
-- Central de Integrações (Integration Hub) — Alien OS
-- Tabelas: integration_providers, integration_accounts, integration_tokens, integration_logs, integration_sync_history
-- ==============================================================================

-- 1. Tabela integration_providers (Registro de Provedores de API de Terceiros)
CREATE TABLE IF NOT EXISTS public.integration_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE, -- 'meta-ads', 'google-ads', 'ga4', 'search-console', 'google-business', 'tiktok-ads', 'linkedin-ads', 'gtm', 'meta-pixel', 'conversion-api', 'clarity', 'hotjar'
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Mídia Paga', -- 'Mídia Paga', 'Analytics', 'SEO & Local', 'Tracking & Tagging', 'UX & CRO'
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Pendente', -- 'Conectado', 'Pendente', 'Erro de Autenticação', 'Token Expirando', 'Desconectado'
  api_version VARCHAR(20) DEFAULT 'v19.0',
  docs_url TEXT,
  connected_accounts_count INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela integration_accounts (Contas de Anúncios e Propriedades Vinculadas)
CREATE TABLE IF NOT EXISTS public.integration_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  account_external_id VARCHAR(100) NOT NULL, -- CID, BM ID, Property ID, Pixel ID
  account_name VARCHAR(150) NOT NULL,
  manager_name VARCHAR(100) DEFAULT 'Lucas Mendes',
  status VARCHAR(30) NOT NULL DEFAULT 'Ativo',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela integration_tokens (Credenciais de Autenticação OAuth 2.0 e Pixels)
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  client_id TEXT,
  client_secret TEXT,
  access_token TEXT,
  refresh_token TEXT,
  pixel_id VARCHAR(100),
  business_id VARCHAR(100),
  manager_id VARCHAR(100),
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela integration_logs (Log Auditável de Chamadas de API)
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'SYNC_SUCCESS', 'SYNC_ERROR', 'TOKEN_REFRESH', 'AUTH_FAILURE'
  message TEXT NOT NULL,
  status_code INT DEFAULT 200,
  payload_snippet TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabela integration_sync_history (Histórico Temporal de Sincronizações)
CREATE TABLE IF NOT EXISTS public.integration_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.integration_providers(id) ON DELETE CASCADE,
  records_processed INT DEFAULT 0,
  duration_ms INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.integration_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_sync_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public Providers Select Policy" ON public.integration_providers FOR SELECT USING (true);
CREATE POLICY "Public Accounts Select Policy" ON public.integration_accounts FOR SELECT USING (true);
CREATE POLICY "Public Tokens Select Policy" ON public.integration_tokens FOR SELECT USING (true);
CREATE POLICY "Public Logs Select Policy" ON public.integration_logs FOR SELECT USING (true);
CREATE POLICY "Public Sync History Select Policy" ON public.integration_sync_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_integration_providers_slug ON public.integration_providers(slug);
CREATE INDEX IF NOT EXISTS idx_integration_accounts_provider ON public.integration_accounts(provider_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_provider ON public.integration_logs(provider_id);

COMMENT ON TABLE public.integration_providers IS 'Provedores oficiais de integração (Meta Ads, Google Ads, GA4, etc.)';
COMMENT ON TABLE public.integration_accounts IS 'Contas de anúncio e propriedades de clientes conectadas';
COMMENT ON TABLE public.integration_tokens IS 'Cofre de credenciais OAuth 2.0 e tokens de acesso de APIs';
COMMENT ON TABLE public.integration_logs IS 'Log auditável de chamadas, sincronizações e erros de autenticação';
