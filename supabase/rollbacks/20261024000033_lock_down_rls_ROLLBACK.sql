-- ==============================================================================
-- ROLLBACK de 20261024000033_lock_down_rls.sql
-- Use SOMENTE se algo parar de funcionar depois do bloqueio.
-- Volta ao comportamento anterior (acesso aberto para anon e authenticated) em todas as
-- tabelas do schema public. Atenção: isso reabre a falha de segurança.
-- ==============================================================================

BEGIN;

DO $$
DECLARE
  tbl record;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Alien OS members full access" ON public.%I;', tbl.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Alien OS members read members" ON public.%I;', tbl.tablename);
    EXECUTE format('DROP POLICY IF EXISTS "Alien OS Full Access Policy" ON public.%I;', tbl.tablename);
    EXECUTE format(
      'CREATE POLICY "Alien OS Full Access Policy" ON public.%I
         FOR ALL TO anon, authenticated
         USING (true)
         WITH CHECK (true);',
      tbl.tablename
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon;', tbl.tablename);
  END LOOP;
END $$;

COMMIT;
