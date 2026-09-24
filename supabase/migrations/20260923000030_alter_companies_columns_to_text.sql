-- ==============================================================================
-- Migration: 20260923000030_alter_companies_columns_to_text.sql
-- Altera colunas de URL e nomes para TEXT para evitar erro de character varying(255)
-- ao colar links longos (Google Maps, Instagram com tokens, Cardápios, etc.)
-- ==============================================================================

DO $$
BEGIN
  -- 1. Altera a coluna website para TEXT (evita estouro de 255 caracteres em URLs com query params)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'website'
  ) THEN
    ALTER TABLE public.companies ALTER COLUMN website TYPE TEXT;
  END IF;

  -- 2. Altera primary_objective para TEXT
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'primary_objective'
  ) THEN
    ALTER TABLE public.companies ALTER COLUMN primary_objective TYPE TEXT;
  END IF;

  -- 3. Assegura colunas estendidas caso ainda não existam
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS trade_name TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS legal_name TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS cnpj VARCHAR(20);
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS segment VARCHAR(100);
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS city VARCHAR(100);
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS state VARCHAR(50);
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS employee_count VARCHAR(50);
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS email TEXT;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS entry_date DATE DEFAULT CURRENT_DATE;

  -- 4. Altera colunas existentes para TEXT se ainda forem VARCHAR
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'trade_name'
  ) THEN
    ALTER TABLE public.companies ALTER COLUMN trade_name TYPE TEXT;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'legal_name'
  ) THEN
    ALTER TABLE public.companies ALTER COLUMN legal_name TYPE TEXT;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.companies ALTER COLUMN email TYPE TEXT;
  END IF;
END $$;
