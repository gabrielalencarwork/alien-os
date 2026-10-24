-- ==============================================================================
-- Migration: 20261024000033_lock_down_rls.sql
-- Fecha o acesso anônimo ao banco do Alien OS.
--
-- ANTES: várias tabelas tinham políticas "USING (true)" para anon. Qualquer pessoa com a
--        chave pública (que vai no código do site) podia ler, alterar e apagar dados.
-- DEPOIS:
--   * anon (visitante sem login): nenhum acesso.
--   * authenticated: acesso somente se o e-mail estiver na tabela public.alien_os_members.
--     (O cadastro público no Supabase Auth está aberto, então "estar logado" não basta.)
--   * service_role (rotas do servidor, webhooks, sincronizações): ignora RLS, continua igual.
--
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- Para desfazer, use supabase/rollbacks/20261024000033_lock_down_rls_ROLLBACK.sql.
-- ==============================================================================

BEGIN;

-- 1. Lista de membros autorizados
CREATE TABLE IF NOT EXISTS public.alien_os_members (
  email TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- E-mails com acesso ao Alien OS (minúsculas).
INSERT INTO public.alien_os_members (email, name) VALUES
  ('alientrafego@gmail.com', 'Gabriel Alencar'),
  ('gabrielalencarwork@gmail.com', 'Gabriel Alencar')
ON CONFLICT (email) DO NOTHING;

-- 2. Função usada pelas políticas
CREATE OR REPLACE FUNCTION public.is_alien_os_member()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.alien_os_members m
    WHERE m.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

REVOKE ALL ON FUNCTION public.is_alien_os_member() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_alien_os_member() TO authenticated;

-- 3. Em TODAS as tabelas do schema public: liga RLS, remove as políticas antigas
--    e cria uma única política para membros autenticados.
--    Cada tabela é tratada separadamente: se uma falhar (ex.: tabela de extensão que
--    não pertence ao seu usuário), ela é pulada e listada no aviso, sem cancelar o resto.
DO $$
DECLARE
  tbl  record;
  pol  record;
  skipped text := '';
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);

      FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = tbl.tablename
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, tbl.tablename);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY "Alien OS members full access" ON public.%I
           FOR ALL TO authenticated
           USING (public.is_alien_os_member())
           WITH CHECK (public.is_alien_os_member());',
        tbl.tablename
      );

      -- Garante que anon não tenha privilégios de tabela, além do bloqueio por RLS.
      EXECUTE format('REVOKE ALL ON public.%I FROM anon;', tbl.tablename);
    EXCEPTION WHEN OTHERS THEN
      skipped := skipped || tbl.tablename || ' (' || SQLERRM || '); ';
    END;
  END LOOP;

  IF skipped <> '' THEN
    RAISE NOTICE 'Tabelas puladas: %', skipped;
  END IF;
END $$;

-- 4. A própria lista de membros só pode ser lida (não alterada) pelos membros.
DROP POLICY IF EXISTS "Alien OS members full access" ON public.alien_os_members;
CREATE POLICY "Alien OS members read members" ON public.alien_os_members
  FOR SELECT TO authenticated
  USING (public.is_alien_os_member());

COMMIT;

-- Atualiza o cache da API do Supabase para reconhecer a nova tabela.
NOTIFY pgrst, 'reload schema';

-- Resultado: cada tabela deve aparecer com rls_ligado = true e 1 política.
SELECT t.tablename,
       t.rowsecurity AS rls_ligado,
       count(p.policyname) AS politicas
FROM pg_tables t
LEFT JOIN pg_policies p ON p.schemaname = t.schemaname AND p.tablename = t.tablename
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY rls_ligado, t.tablename;
