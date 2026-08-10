-- ==============================================================================
-- Migration: 20260803000011_growth_lab_center.sql
-- Growth Lab (Central de Experimentos & Otimização) — Alien OS
-- Tabelas: growth_experiments, growth_hypotheses, growth_results, growth_metrics, growth_history
-- ==============================================================================

-- 1. Tabela growth_experiments (Registro Principal de Testes e Experimentos)
CREATE TABLE IF NOT EXISTS public.growth_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Criativo', -- 'Criativo', 'Copy', 'Headline', 'Landing Page', 'Oferta', 'Funil', 'Google Ads', 'Meta Ads', 'TikTok', 'SEO', 'UX', 'Automação', 'CRM', 'E-mail', 'WhatsApp', 'Outro'
  hypothesis TEXT NOT NULL,
  problem_identified TEXT,
  objective TEXT,
  primary_metric VARCHAR(100) NOT NULL DEFAULT 'Conversões (CRO)',
  secondary_metric VARCHAR(100) DEFAULT 'ROAS / CPA',
  owner_name VARCHAR(100) NOT NULL DEFAULT 'Gabriel Alencar',
  priority VARCHAR(20) NOT NULL DEFAULT 'Alta',
  status VARCHAR(30) NOT NULL DEFAULT 'Rodando', -- 'Planejado', 'Em preparação', 'Rodando', 'Em análise', 'Validado', 'Descartado', 'Arquivado'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  estimated_revenue_impact NUMERIC(12, 2) DEFAULT 0.00,
  confirmed_revenue_impact NUMERIC(12, 2) DEFAULT 0.00,
  roas_gain NUMERIC(5, 2) DEFAULT 0.00,
  conversion_gain_percentage NUMERIC(5, 2) DEFAULT 0.00,
  statistical_confidence_percentage INT DEFAULT 95,
  alien_max_probability INT DEFAULT 90,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela growth_hypotheses (Formulação Técnica da Hipótese)
CREATE TABLE IF NOT EXISTS public.growth_hypotheses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.growth_experiments(id) ON DELETE CASCADE,
  control_description TEXT NOT NULL, -- Variante A (Controle)
  variant_description TEXT NOT NULL, -- Variante B (Tratamento)
  expected_outcome TEXT,
  risk_level VARCHAR(20) DEFAULT 'Baixo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela growth_results (Métricas Comparativas Antes vs Depois)
CREATE TABLE IF NOT EXISTS public.growth_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.growth_experiments(id) ON DELETE CASCADE,
  control_conversions INT DEFAULT 0,
  variant_conversions INT DEFAULT 0,
  control_conversion_rate NUMERIC(5, 2) DEFAULT 0.00,
  variant_conversion_rate NUMERIC(5, 2) DEFAULT 0.00,
  control_roas NUMERIC(5, 2) DEFAULT 0.00,
  variant_roas NUMERIC(5, 2) DEFAULT 0.00,
  winner_variant VARCHAR(50) DEFAULT 'Variante B (Tratamento)',
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela growth_history (Trilha de Auditoria do Teste)
CREATE TABLE IF NOT EXISTS public.growth_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES public.growth_experiments(id) ON DELETE CASCADE,
  actor_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'CREATED', 'STATUS_CHANGE', 'RESULT_VALIDATED', 'ALIEN_MAX_SCAN'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.growth_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.growth_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public Growth Experiments Select Policy" ON public.growth_experiments FOR SELECT USING (true);
CREATE POLICY "Public Growth Hypotheses Select Policy" ON public.growth_hypotheses FOR SELECT USING (true);
CREATE POLICY "Public Growth Results Select Policy" ON public.growth_results FOR SELECT USING (true);
CREATE POLICY "Public Growth History Select Policy" ON public.growth_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_growth_experiments_company ON public.growth_experiments(company_id);
CREATE INDEX IF NOT EXISTS idx_growth_experiments_status ON public.growth_experiments(status);
CREATE INDEX IF NOT EXISTS idx_growth_experiments_type ON public.growth_experiments(type);

COMMENT ON TABLE public.growth_experiments IS 'Central de Experimentos & Otimização (Growth Lab) do Alien OS';
COMMENT ON TABLE public.growth_hypotheses IS 'Detalhamento da Variante A (Controle) vs Variante B (Tratamento)';
COMMENT ON TABLE public.growth_results IS 'Resultados validados e relevância estatística de testes A/B';
COMMENT ON TABLE public.growth_history IS 'Trilha de auditoria das hipóteses e validações de crescimento';
