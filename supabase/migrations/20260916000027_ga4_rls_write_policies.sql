-- ==============================================================================
-- Migration: 20260916000027_ga4_rls_write_policies.sql
-- Adiciona políticas de escrita (INSERT, UPDATE, DELETE) para as tabelas GA4
-- Necessário para que o fluxo de sync OAuth → Supabase funcione sem erros 403/RLS
-- ==============================================================================

-- ===== ga4_properties =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_properties' AND policyname = 'GA4 Properties Insert Policy'
  ) THEN
    CREATE POLICY "GA4 Properties Insert Policy"
      ON public.ga4_properties FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_properties' AND policyname = 'GA4 Properties Update Policy'
  ) THEN
    CREATE POLICY "GA4 Properties Update Policy"
      ON public.ga4_properties FOR UPDATE USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_properties' AND policyname = 'GA4 Properties Delete Policy'
  ) THEN
    CREATE POLICY "GA4 Properties Delete Policy"
      ON public.ga4_properties FOR DELETE USING (true);
  END IF;
END $$;

-- ===== ga4_daily_metrics =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_daily_metrics' AND policyname = 'GA4 Daily Metrics Insert Policy'
  ) THEN
    CREATE POLICY "GA4 Daily Metrics Insert Policy"
      ON public.ga4_daily_metrics FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_daily_metrics' AND policyname = 'GA4 Daily Metrics Update Policy'
  ) THEN
    CREATE POLICY "GA4 Daily Metrics Update Policy"
      ON public.ga4_daily_metrics FOR UPDATE USING (true);
  END IF;
END $$;

-- ===== ga4_events =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_events' AND policyname = 'GA4 Events Insert Policy'
  ) THEN
    CREATE POLICY "GA4 Events Insert Policy"
      ON public.ga4_events FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_events' AND policyname = 'GA4 Events Update Policy'
  ) THEN
    CREATE POLICY "GA4 Events Update Policy"
      ON public.ga4_events FOR UPDATE USING (true);
  END IF;
END $$;

-- ===== ga4_sync_history =====
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'ga4_sync_history' AND policyname = 'GA4 Sync History Insert Policy'
  ) THEN
    CREATE POLICY "GA4 Sync History Insert Policy"
      ON public.ga4_sync_history FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Índice de performance adicional para upsert por property_id + metric_date
CREATE UNIQUE INDEX IF NOT EXISTS idx_ga4_daily_metrics_unique
  ON public.ga4_daily_metrics(property_id, metric_date);

COMMENT ON POLICY "GA4 Properties Insert Policy" ON public.ga4_properties
  IS 'Permite inserção de propriedades GA4 via Supabase Anon Key (fluxo OAuth)';
COMMENT ON POLICY "GA4 Daily Metrics Insert Policy" ON public.ga4_daily_metrics
  IS 'Permite inserção de métricas diárias GA4 via sync do Alien OS';
