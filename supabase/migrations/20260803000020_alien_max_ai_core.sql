-- ==============================================================================
-- Migration: 20260803000020_alien_max_ai_core.sql
-- Sprint 25 — Alien Max AI Engine Full Intelligence Core — Alien OS
-- Tabelas: alien_max_conversations, alien_max_messages, alien_max_insights
-- ==============================================================================

-- 1. Conversas do Chat com a IA Alien Max
CREATE TABLE IF NOT EXISTS public.alien_max_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Nova Análise Alien Max',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Mensagens do Chat com a IA
CREATE TABLE IF NOT EXISTS public.alien_max_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.alien_max_conversations(id) ON DELETE CASCADE,
  sender VARCHAR(20) NOT NULL DEFAULT 'USER', -- 'USER' ou 'ALIEN_MAX'
  content TEXT NOT NULL,
  metadata_json JSONB DEFAULT '{}'::jsonb, -- Armazena gráficos, botões de ação e estatísticas da resposta
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Insights Autônomos & Diagnósticos de Risco/Escala do Alien Max
CREATE TABLE IF NOT EXISTS public.alien_max_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL DEFAULT 'PAID_MEDIA', -- 'PAID_MEDIA', 'FINANCIAL_MRR', 'GROWTH_CRO', 'SEO_LOCAL'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  confidence_score INT DEFAULT 95, -- Score de confiança de 0 a 100%
  impact_mrr_estimate NUMERIC(12, 2) DEFAULT 0.00, -- Estimativa de impacto financeiro em R$
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPLIED', 'DISMISSED'
  recommended_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.alien_max_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_max_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_max_insights ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de leitura
CREATE POLICY "Public Alien Max Conversations Select Policy" ON public.alien_max_conversations FOR SELECT USING (true);
CREATE POLICY "Public Alien Max Messages Select Policy" ON public.alien_max_messages FOR SELECT USING (true);
CREATE POLICY "Public Alien Max Insights Select Policy" ON public.alien_max_insights FOR SELECT USING (true);

COMMENT ON TABLE public.alien_max_conversations IS 'Histórico de conversas do usuário com a IA Alien Max';
COMMENT ON TABLE public.alien_max_messages IS 'Mensagens e contextos trocados no chat do Alien Max';
COMMENT ON TABLE public.alien_max_insights IS 'Diagnósticos autônomos de risco, escala e otimização gerados pela IA';
