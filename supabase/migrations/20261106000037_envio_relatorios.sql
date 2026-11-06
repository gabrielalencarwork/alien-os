-- ==============================================================================
-- Migration: 20261106000037_envio_relatorios.sql
-- Envio automático dos relatórios semanais por e-mail.
--
-- Só ADICIONA colunas (nada é apagado, RLS não muda).
--   email_to ........ e-mail para onde o relatório/lembrete foi enviado
--   email_sent_at ... quando o e-mail saiu (NULL = ainda não enviado)
--   email_error ..... mensagem real do erro do último envio, se falhou
-- O tipo do envio fica em metrics->>'kind': 'relatorio' (teve anúncios na semana) | 'lembrete' (anúncios parados).
--
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- ==============================================================================

BEGIN;

ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS email_to TEXT;
ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ;
ALTER TABLE public.weekly_reports ADD COLUMN IF NOT EXISTS email_error TEXT;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- Resultado esperado: 3 linhas (email_error, email_sent_at, email_to).
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'weekly_reports' AND column_name LIKE 'email_%'
ORDER BY column_name;
