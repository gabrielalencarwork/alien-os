-- ==============================================================================
-- Migration: 20260803000013_ga4_integration.sql
-- Google Analytics 4 (Primeira Integração Real) — Alien OS
-- Tabelas: ga4_properties, ga4_daily_metrics, ga4_events, ga4_sync_history
-- ==============================================================================

-- 1. Tabela ga4_properties (Propriedades GA4 Conectadas)
CREATE TABLE IF NOT EXISTS public.ga4_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  property_id VARCHAR(100) NOT NULL UNIQUE, -- ID numérico da propriedade GA4 (ex: 314159265)
  property_name VARCHAR(150) NOT NULL,
  data_stream_id VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  currency VARCHAR(10) DEFAULT 'BRL',
  account_email VARCHAR(150),
  status VARCHAR(30) NOT NULL DEFAULT 'Conectado', -- 'Conectado', 'Pendente', 'Erro OAuth', 'Desconectado'
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela ga4_daily_metrics (Métricas Diárias de Tráfego do GA4 - Últimos 30 Dias)
CREATE TABLE IF NOT EXISTS public.ga4_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id VARCHAR(100) NOT NULL REFERENCES public.ga4_properties(property_id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  users_count INT DEFAULT 0,
  new_users_count INT DEFAULT 0,
  sessions_count INT DEFAULT 0,
  engaged_sessions_count INT DEFAULT 0,
  conversions_count INT DEFAULT 0,
  revenue_amount NUMERIC(12, 2) DEFAULT 0.00,
  bounce_rate_percentage NUMERIC(5, 2) DEFAULT 0.00,
  average_session_duration_seconds NUMERIC(8, 2) DEFAULT 0.00,
  page_views_count INT DEFAULT 0,
  active_users_count INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela ga4_events (Eventos Principais do GA4)
CREATE TABLE IF NOT EXISTS public.ga4_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id VARCHAR(100) NOT NULL REFERENCES public.ga4_properties(property_id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL, -- 'purchase', 'generate_lead', 'page_view', 'first_visit', 'click'
  event_count INT DEFAULT 0,
  event_value NUMERIC(12, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela ga4_sync_history (Histórico Auditável de Chamadas à Google Analytics Data API)
CREATE TABLE IF NOT EXISTS public.ga4_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id VARCHAR(100) NOT NULL REFERENCES public.ga4_properties(property_id) ON DELETE CASCADE,
  records_synced INT DEFAULT 0,
  duration_ms INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'SUCCESS',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.ga4_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_sync_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public GA4 Properties Select Policy" ON public.ga4_properties FOR SELECT USING (true);
CREATE POLICY "Public GA4 Daily Metrics Select Policy" ON public.ga4_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public GA4 Events Select Policy" ON public.ga4_events FOR SELECT USING (true);
CREATE POLICY "Public GA4 Sync History Select Policy" ON public.ga4_sync_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_ga4_properties_property_id ON public.ga4_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_ga4_daily_metrics_date ON public.ga4_daily_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_ga4_events_name ON public.ga4_events(event_name);

COMMENT ON TABLE public.ga4_properties IS 'Propriedades ativas do Google Analytics 4 (GA4)';
COMMENT ON TABLE public.ga4_daily_metrics IS 'Métricas diárias de tráfego, usuários e e-commerce sincronizados do GA4 Data API';
COMMENT ON TABLE public.ga4_events IS 'Eventos principais disparados na propriedade GA4';
COMMENT ON TABLE public.ga4_sync_history IS 'Log de auditoria das sincronizações com o Google Analytics';
