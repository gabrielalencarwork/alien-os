-- ==============================================================================
-- Migration: 20261106000038_whatsapp_agente.sql
-- WhatsApp (API oficial da Meta) + agente de vendas da Alien.
--
-- Só ADICIONA tabelas (nada é apagado). RLS igual às demais: só membros do Alien OS.
--
-- Valores canônicos (use as funções normalize* do whatsappRepository ao ler):
--   wa_contacts.mode ....... 'Automático' | 'Com aprovação' | 'Silencioso'
--   wa_messages.direction .. 'Entrada' | 'Saída'
--   wa_messages.author ..... 'Cliente' | 'Agente' | 'Equipe'
--   wa_messages.status ..... 'Recebida' | 'Rascunho' | 'Enviando' | 'Enviada' | 'Entregue'
--                            | 'Lida' | 'Falhou' | 'Descartada'
--
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- ==============================================================================

BEGIN;

-- 1. Contatos do WhatsApp ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wa_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_id VARCHAR(32) NOT NULL UNIQUE,              -- número no formato internacional, só dígitos (5531984706088)
  name VARCHAR(255),                              -- nome que a equipe definiu
  profile_name VARCHAR(255),                      -- nome do perfil do WhatsApp
  mode VARCHAR(20) NOT NULL DEFAULT 'Automático',
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  prospect_id UUID REFERENCES public.prospects(id) ON DELETE SET NULL,
  needs_human BOOLEAN NOT NULL DEFAULT false,
  human_reason TEXT,
  agent_paused_until TIMESTAMPTZ,                 -- a equipe respondeu: o agente espera até aqui
  summary TEXT,                                   -- resumo do que o agente já sabe do contato
  last_message_at TIMESTAMPTZ,
  last_inbound_at TIMESTAMPTZ,                    -- janela de 24h da Meta para mensagens livres
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS wa_contacts_last_message_idx ON public.wa_contacts (last_message_at DESC NULLS LAST);

-- 2. Mensagens ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wa_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.wa_contacts(id) ON DELETE CASCADE,
  wa_message_id VARCHAR(128) UNIQUE,              -- id da Meta (wamid...)
  direction VARCHAR(10) NOT NULL,
  author VARCHAR(10) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'text',
  body TEXT NOT NULL DEFAULT '',
  status VARCHAR(20) NOT NULL,
  error TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS wa_messages_contact_idx ON public.wa_messages (contact_id, created_at);
CREATE INDEX IF NOT EXISTS wa_messages_drafts_idx ON public.wa_messages (status) WHERE status = 'Rascunho';

-- 3. Configuração do agente (uma linha só, id = 1) ----------------------------------
CREATE TABLE IF NOT EXISTS public.agent_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  enabled BOOLEAN NOT NULL DEFAULT false,          -- começa DESLIGADO até a equipe ligar
  knowledge TEXT NOT NULL DEFAULT '',             -- base de conhecimento (serviços, preços, FAQ)
  instructions TEXT NOT NULL DEFAULT '',          -- jeito de falar e regras extras
  pause_minutes INT NOT NULL DEFAULT 120,         -- quanto tempo o agente espera depois que a equipe responde
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.agent_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 4. RLS -----------------------------------------------------------------------------
ALTER TABLE public.wa_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Alien OS members full access" ON public.wa_contacts;
CREATE POLICY "Alien OS members full access" ON public.wa_contacts
  FOR ALL TO authenticated USING (public.is_alien_os_member()) WITH CHECK (public.is_alien_os_member());
DROP POLICY IF EXISTS "Alien OS members full access" ON public.wa_messages;
CREATE POLICY "Alien OS members full access" ON public.wa_messages
  FOR ALL TO authenticated USING (public.is_alien_os_member()) WITH CHECK (public.is_alien_os_member());
DROP POLICY IF EXISTS "Alien OS members full access" ON public.agent_settings;
CREATE POLICY "Alien OS members full access" ON public.agent_settings
  FOR ALL TO authenticated USING (public.is_alien_os_member()) WITH CHECK (public.is_alien_os_member());

REVOKE ALL ON public.wa_contacts FROM anon;
REVOKE ALL ON public.wa_messages FROM anon;
REVOKE ALL ON public.agent_settings FROM anon;

COMMIT;

NOTIFY pgrst, 'reload schema';

-- Resultado esperado: 3 linhas com rls_ligado = true.
SELECT tablename, rowsecurity AS rls_ligado FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('wa_contacts', 'wa_messages', 'agent_settings');
