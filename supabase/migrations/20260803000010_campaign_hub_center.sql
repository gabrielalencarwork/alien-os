-- ==============================================================================
-- Migration: 20260803000010_campaign_hub_center.sql
-- Campaign Hub (Central de Campanhas & Performance) — Alien OS
-- Tabelas: campaigns, campaign_platforms, campaign_metrics, campaign_daily_metrics, campaign_goals, campaign_creatives, campaign_history
-- ==============================================================================

-- 1. Tabela campaigns (Registro Principal de Campanhas de Mídia Paga)
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL DEFAULT 'Meta Ads', -- 'Meta Ads', 'Google Ads', 'TikTok Ads', 'LinkedIn Ads', 'Pinterest Ads', 'Microsoft Ads'
  objective VARCHAR(50) NOT NULL DEFAULT 'Conversões', -- 'Reconhecimento', 'Tráfego', 'Engajamento', 'Leads', 'Conversões', 'Vendas', 'Remarketing', 'Mensagens', 'Catálogo'
  type VARCHAR(50) DEFAULT 'CBO Retargeting',
  description TEXT,
  manager_name VARCHAR(100) NOT NULL DEFAULT 'Lucas Mendes',
  priority VARCHAR(20) NOT NULL DEFAULT 'Alta',
  status VARCHAR(30) NOT NULL DEFAULT 'Ativa', -- 'Planejada', 'Em preparação', 'Ativa', 'Pausada', 'Em otimização', 'Finalizada', 'Arquivada'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  daily_budget NUMERIC(12, 2) DEFAULT 0.00,
  monthly_budget NUMERIC(12, 2) DEFAULT 0.00,
  spent_amount NUMERIC(12, 2) DEFAULT 0.00,
  revenue_generated NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(6, 2) DEFAULT 0.00,
  roi_percentage NUMERIC(6, 2) DEFAULT 0.00,
  cac_amount NUMERIC(8, 2) DEFAULT 0.00,
  cpl_amount NUMERIC(8, 2) DEFAULT 0.00,
  cpa_amount NUMERIC(8, 2) DEFAULT 0.00,
  ctr_percentage NUMERIC(5, 2) DEFAULT 0.00,
  cpm_amount NUMERIC(8, 2) DEFAULT 0.00,
  conversions_count INT DEFAULT 0,
  leads_count INT DEFAULT 0,
  alien_score_impact INT DEFAULT 90,
  health_status VARCHAR(20) DEFAULT 'Excelente',
  external_campaign_id VARCHAR(100), -- ID retornado da API da plataforma
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela campaign_platforms (Credenciais e Conexões com Contas de Anúncio)
CREATE TABLE IF NOT EXISTS public.campaign_platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  platform_name VARCHAR(50) NOT NULL,
  account_id VARCHAR(100) NOT NULL,
  account_name VARCHAR(150),
  access_token TEXT,
  refresh_token TEXT,
  status VARCHAR(30) DEFAULT 'Conectado',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela campaign_daily_metrics (Métricas Diárias para Gráficos de Tendência)
CREATE TABLE IF NOT EXISTS public.campaign_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  spent NUMERIC(12, 2) DEFAULT 0.00,
  revenue NUMERIC(12, 2) DEFAULT 0.00,
  roas NUMERIC(6, 2) DEFAULT 0.00,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  conversions INT DEFAULT 0,
  leads INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  cpm NUMERIC(8, 2) DEFAULT 0.00,
  cpa NUMERIC(8, 2) DEFAULT 0.00,
  cpl NUMERIC(8, 2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela campaign_creatives (Anúncios & Criativos Vinculados)
CREATE TABLE IF NOT EXISTS public.campaign_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  format VARCHAR(20) DEFAULT 'Vídeo UGC',
  thumbnail_url TEXT,
  ctr_percentage NUMERIC(5, 2) DEFAULT 0.00,
  conversions_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'Ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabela campaign_history (Log de Alterações e Auditoria de Mídia)
CREATE TABLE IF NOT EXISTS public.campaign_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  actor_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'BUDGET_INCREASE', 'STATUS_CHANGE', 'TARGET_REACHED', 'API_SYNC'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public Campaigns Select Policy" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Public Campaign Platforms Select Policy" ON public.campaign_platforms FOR SELECT USING (true);
CREATE POLICY "Public Campaign Daily Metrics Select Policy" ON public.campaign_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public Campaign Creatives Select Policy" ON public.campaign_creatives FOR SELECT USING (true);
CREATE POLICY "Public Campaign History Select Policy" ON public.campaign_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_campaigns_company ON public.campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON public.campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_daily_metrics_campaign ON public.campaign_daily_metrics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_daily_metrics_date ON public.campaign_daily_metrics(metric_date);

COMMENT ON TABLE public.campaigns IS 'Central de Campanhas & Performance (Campaign Hub) da agência Alien OS';
COMMENT ON TABLE public.campaign_platforms IS 'Contas de anúncio conectadas (Meta Ads API, Google Ads API)';
COMMENT ON TABLE public.campaign_daily_metrics IS 'Dados diários de performance para séries temporais e atribuição';
COMMENT ON TABLE public.campaign_creatives IS 'Anúncios e criativos vinculados da Central de Documentos';
COMMENT ON TABLE public.campaign_history IS 'Trilha de auditoria das alterações de orçamento e mídia';
