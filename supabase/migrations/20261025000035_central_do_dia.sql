-- ==============================================================================
-- Migration: 20261025000035_central_do_dia.sql
-- Central do Dia + Alien Max 24h
--
-- Só ADICIONA estruturas (nenhum dado é apagado):
--   1. alien_max_runs ........ histórico de cada varredura automática da Alien Max
--   2. alien_max_insights .... próximas ações geradas pela Alien Max por cliente
--   3. prospects ............. pipeline de prospecção (leads comerciais)
--   4. contracts / invoices .. contratos (MRR) e cobranças, usados pelo Financeiro
--   5. tasks ................. colunas que o quadro de tarefas já usa
--   6. meetings / meeting_notes colunas que a agenda já usa + atas
--   7. RLS: as tabelas novas seguem a mesma regra das demais (só membros do Alien OS)
--
-- Valores canônicos (use as funções normalize* dos repositórios ao ler):
--   alien_max_insights.priority ... 'Crítica' | 'Alta' | 'Média' | 'Baixa'
--   alien_max_insights.status ..... 'PENDING' | 'APPLIED' | 'DISMISSED' | 'EXPIRED'
--   alien_max_insights.category ... 'PAID_MEDIA' | 'ANALYTICS' | 'OPERATIONS' | 'COMMERCIAL' | 'FINANCIAL'
--   alien_max_insights.platform ... 'meta-ads' | 'google-ads' | 'ga4' | 'geral'
--   alien_max_runs.trigger ........ 'cron' | 'manual' | 'auto'
--   alien_max_runs.status ......... 'running' | 'success' | 'partial' | 'error'
--   prospects.stage ............... 'Novo' | 'Contato feito' | 'Diagnóstico' | 'Proposta enviada'
--                                   | 'Negociação' | 'Fechado' | 'Perdido'
--   contracts.status .............. 'Ativo' | 'Em Renovação' | 'Cancelado' | 'Encerrado'
--   invoices.status ............... 'Pendente' | 'A Vencer' | 'Em Atraso' | 'Pago' | 'Cancelado'
--   tasks.status .................. 'Backlog' | 'A Fazer' | 'Em Andamento' | 'Em Revisão'
--                                   | 'Aguardando Cliente' | 'Concluído' | 'Cancelado'
--   tasks.priority ................ 'Baixa' | 'Média' | 'Alta' | 'Crítica'
--   meetings.status ............... 'Agendada' | 'Confirmada' | 'Em Andamento' | 'Concluída'
--                                   | 'Cancelada' | 'Reagendada'
--
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- ==============================================================================

BEGIN;

-- 1. Varreduras da Alien Max ----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alien_max_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger VARCHAR(20) NOT NULL DEFAULT 'manual',
  status VARCHAR(20) NOT NULL DEFAULT 'running',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  clients_analyzed INT NOT NULL DEFAULT 0,
  actions_created INT NOT NULL DEFAULT 0,
  error_message TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS alien_max_runs_started_idx ON public.alien_max_runs (started_at DESC);

-- 2. Próximas ações -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alien_max_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  run_id UUID REFERENCES public.alien_max_runs(id) ON DELETE SET NULL,
  category VARCHAR(30) NOT NULL DEFAULT 'PAID_MEDIA',
  platform VARCHAR(30) NOT NULL DEFAULT 'geral',
  priority VARCHAR(20) NOT NULL DEFAULT 'Média',
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  recommended_action TEXT,
  expected_result TEXT,
  confidence_score INT NOT NULL DEFAULT 80,
  impact_mrr_estimate NUMERIC(12, 2) NOT NULL DEFAULT 0,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);
-- Se a tabela já existia com o formato antigo, completa as colunas que faltam.
ALTER TABLE public.alien_max_insights ADD COLUMN IF NOT EXISTS run_id UUID REFERENCES public.alien_max_runs(id) ON DELETE SET NULL;
ALTER TABLE public.alien_max_insights ADD COLUMN IF NOT EXISTS platform VARCHAR(30) NOT NULL DEFAULT 'geral';
ALTER TABLE public.alien_max_insights ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'Média';
ALTER TABLE public.alien_max_insights ADD COLUMN IF NOT EXISTS expected_result TEXT;
ALTER TABLE public.alien_max_insights ADD COLUMN IF NOT EXISTS evidence JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS alien_max_insights_status_idx ON public.alien_max_insights (status, created_at DESC);

-- 3. Prospecção -----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  segment VARCHAR(120),
  source VARCHAR(60),
  stage VARCHAR(30) NOT NULL DEFAULT 'Novo',
  estimated_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  next_step TEXT,
  next_step_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS prospects_stage_idx ON public.prospects (stage, next_step_date);

-- 4. Contratos e cobranças ------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contract_number VARCHAR(50) UNIQUE,
  monthly_value NUMERIC(12, 2) NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_months INT NOT NULL DEFAULT 12,
  renewal_date DATE,
  status VARCHAR(30) NOT NULL DEFAULT 'Ativo',
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) UNIQUE,
  amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pendente',
  payment_method VARCHAR(50) DEFAULT 'PIX',
  services_summary TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tarefas: colunas usadas pelo quadro ----------------------------------------
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assignee_name VARCHAR(255);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(6, 2) DEFAULT 0;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS journey_stage VARCHAR(60);
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS insight_id UUID REFERENCES public.alien_max_insights(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN status SET DEFAULT 'A Fazer';
ALTER TABLE public.tasks ALTER COLUMN priority SET DEFAULT 'Média';

-- 6. Agenda: colunas usadas pela tela + atas ------------------------------------
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS type VARCHAR(60) DEFAULT 'Outro';
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS host_name VARCHAR(255);
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS location VARCHAR(255);
ALTER TABLE public.meetings ALTER COLUMN company_id DROP NOT NULL;
ALTER TABLE public.meetings ALTER COLUMN status SET DEFAULT 'Agendada';

CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  summary TEXT NOT NULL,
  decisions TEXT,
  pending_issues TEXT,
  next_steps TEXT,
  author_name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Remove CHECKs antigos de status/prioridade em tasks e meetings (valores em inglês),
-- para aceitar os valores canônicos acima. Nenhum dado é alterado.
DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT con.conname, rel.relname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND con.contype = 'c'
      AND rel.relname IN ('tasks', 'meetings')
      AND (pg_get_constraintdef(con.oid) ILIKE '%status%' OR pg_get_constraintdef(con.oid) ILIKE '%priority%')
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I;', c.relname, c.conname);
  END LOOP;
END $$;

-- 7. RLS nas tabelas novas (mesma regra do 20261024000033_lock_down_rls.sql) -----
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['alien_max_runs', 'alien_max_insights', 'prospects', 'contracts', 'invoices', 'meeting_notes']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    EXECUTE format('DROP POLICY IF EXISTS "Alien OS members full access" ON public.%I;', t);
    EXECUTE format(
      'CREATE POLICY "Alien OS members full access" ON public.%I
         FOR ALL TO authenticated
         USING (public.is_alien_os_member())
         WITH CHECK (public.is_alien_os_member());', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon;', t);
  END LOOP;
END $$;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- Resultado esperado: 6 linhas, todas com rls_ligado = true.
SELECT tablename, rowsecurity AS rls_ligado
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('alien_max_runs', 'alien_max_insights', 'prospects', 'contracts', 'invoices', 'meeting_notes')
ORDER BY tablename;
