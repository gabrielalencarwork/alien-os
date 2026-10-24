-- ==============================================================================
-- Migration: 20261024000034_google_connections.sql
-- Guarda a conexão permanente com o Google (refresh token) NO SERVIDOR.
--
-- Antes, o acesso ao Google Ads ficava salvo só no navegador (localStorage) e o GA4
-- recebia um acesso de 1 hora a cada popup. Com esta tabela, as rotas do servidor renovam
-- o acesso sozinhas, de qualquer computador.
--
-- Segurança: RLS ligado e NENHUMA política. Só a chave de serviço (servidor) lê e grava;
-- nem usuários logados conseguem ler o token pelo navegador.
-- ==============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.google_connections (
  email TEXT PRIMARY KEY,
  refresh_token TEXT NOT NULL,
  scopes TEXT,
  -- ID da conta de administrador (MCC) usada como login-customer-id no Google Ads
  login_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.google_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.google_connections FROM anon, authenticated;

COMMIT;

NOTIFY pgrst, 'reload schema';

SELECT 'google_connections criada' AS resultado,
       (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'google_connections') AS rls_ligado,
       (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'google_connections') AS politicas;
