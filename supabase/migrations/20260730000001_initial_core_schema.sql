-- ==============================================================================
-- Migration 01: Core Extensions & Audit Functions (Alien OS)
-- Target: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Habilitar extensões necessárias para UUID e Criptografia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Função genérica de atualização automática da coluna updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column() IS 'Trigger automatizada para definir updated_at = NOW() em atualizações de registro.';
