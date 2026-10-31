-- ==============================================================================
-- Migration: 20261031000036_relatorios_semanais.sql
-- Relatório semanal por cliente, gerado pela Alien Max toda segunda-feira.
--
-- Só ADICIONA uma tabela (nada é apagado).
--   weekly_reports.status ... 'Gerado' | 'Enviado'
--   share_token ............. código aleatório do link público /r/<token>, que o cliente abre sem login
--
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  highlights JSONB NOT NULL DEFAULT '[]'::jsonb,
  next_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  share_token TEXT NOT NULL UNIQUE DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  status VARCHAR(20) NOT NULL DEFAULT 'Gerado',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, week_start)
);
CREATE INDEX IF NOT EXISTS weekly_reports_week_idx ON public.weekly_reports (week_start DESC);

ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Alien OS members full access" ON public.weekly_reports;
CREATE POLICY "Alien OS members full access" ON public.weekly_reports
  FOR ALL TO authenticated
  USING (public.is_alien_os_member())
  WITH CHECK (public.is_alien_os_member());
REVOKE ALL ON public.weekly_reports FROM anon;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- Resultado esperado: 1 linha com rls_ligado = true.
SELECT tablename, rowsecurity AS rls_ligado FROM pg_tables WHERE schemaname = 'public' AND tablename = 'weekly_reports';
