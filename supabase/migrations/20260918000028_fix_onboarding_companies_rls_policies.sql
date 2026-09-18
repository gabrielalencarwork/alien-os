-- ==============================================================================
-- Migration: 20260918000028_fix_onboarding_companies_rls_policies.sql
-- Garante colunas de cadastro e políticas RLS de escrita para Onboarding de Clientes
-- ==============================================================================

-- 1. Assegurar colunas estendidas na tabela public.companies
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trade_name VARCHAR(255);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS segment VARCHAR(100);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS website VARCHAR(255);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS primary_objective TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Políticas RLS para public.companies (Permitir Inserção e Leitura no Onboarding)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Companies Insert Policy'
  ) THEN
    CREATE POLICY "Companies Insert Policy" ON public.companies FOR INSERT WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Companies Update Policy'
  ) THEN
    CREATE POLICY "Companies Update Policy" ON public.companies FOR UPDATE USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'companies' AND policyname = 'Companies Select Policy'
  ) THEN
    CREATE POLICY "Companies Select Policy" ON public.companies FOR SELECT USING (true);
  END IF;
END $$;

-- 3. Políticas RLS para tabelas auxiliares criadas no Onboarding
-- alien_dna
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alien_dna') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alien_dna' AND policyname = 'Alien DNA All Policy') THEN
      CREATE POLICY "Alien DNA All Policy" ON public.alien_dna FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- alien_scores
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alien_scores') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'alien_scores' AND policyname = 'Alien Scores All Policy') THEN
      CREATE POLICY "Alien Scores All Policy" ON public.alien_scores FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- health_scores
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'health_scores') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'health_scores' AND policyname = 'Health Scores All Policy') THEN
      CREATE POLICY "Health Scores All Policy" ON public.health_scores FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- timeline
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'timeline') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline' AND policyname = 'Timeline All Policy') THEN
      CREATE POLICY "Timeline All Policy" ON public.timeline FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- company_services
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_services') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_services' AND policyname = 'Company Services All Policy') THEN
      CREATE POLICY "Company Services All Policy" ON public.company_services FOR ALL USING (true) WITH CHECK (true);
    END IF;
  END IF;
END $$;
