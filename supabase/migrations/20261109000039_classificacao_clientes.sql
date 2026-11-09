-- ==============================================================================
-- Migration: 20261109000039_classificacao_clientes.sql
-- Classificação dos contatos do WhatsApp (Lead | Cliente) + pausa do agente de 10 min.
--
-- Regras:
--   * Contato 'Cliente' => a Aline NÃO responde (modo vira 'Silencioso').
--     Para ela voltar a responder, troque o modo do contato manualmente.
--   * Vincular o contato a uma empresa cliente => vira 'Cliente'.
--   * Lead do funil que chega à etapa 'Fechado' => o contato vira 'Cliente'.
--   * Pausa depois que a equipe responde: 10 minutos (antes 120).
--
-- Só ADICIONA coluna/gatilhos. Rode no Supabase: SQL Editor → cole → Run.
-- ==============================================================================

BEGIN;

ALTER TABLE public.wa_contacts ADD COLUMN IF NOT EXISTS classification VARCHAR(10) NOT NULL DEFAULT 'Lead';
ALTER TABLE public.wa_contacts DROP CONSTRAINT IF EXISTS wa_contacts_classification_check;
ALTER TABLE public.wa_contacts ADD CONSTRAINT wa_contacts_classification_check CHECK (classification IN ('Lead', 'Cliente'));

-- Ao virar cliente (empresa vinculada ou classificação manual), o agente fica em silêncio.
CREATE OR REPLACE FUNCTION public.wa_contacts_apply_client_rule() RETURNS trigger AS $$
BEGIN
  IF NEW.company_id IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.company_id IS DISTINCT FROM NEW.company_id) THEN
    NEW.classification := 'Cliente';
  END IF;
  IF NEW.classification = 'Cliente' AND (TG_OP = 'INSERT' OR OLD.classification IS DISTINCT FROM 'Cliente') THEN
    NEW.mode := 'Silencioso';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS wa_contacts_client_rule ON public.wa_contacts;
CREATE TRIGGER wa_contacts_client_rule
  BEFORE INSERT OR UPDATE ON public.wa_contacts
  FOR EACH ROW EXECUTE FUNCTION public.wa_contacts_apply_client_rule();

-- Lead 'Fechado' no funil => o contato do WhatsApp vira 'Cliente'.
CREATE OR REPLACE FUNCTION public.prospects_closed_to_client() RETURNS trigger AS $$
BEGIN
  IF NEW.stage = 'Fechado' AND OLD.stage IS DISTINCT FROM 'Fechado' THEN
    UPDATE public.wa_contacts SET classification = 'Cliente', updated_at = now()
     WHERE prospect_id = NEW.id AND classification <> 'Cliente';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prospects_closed_client ON public.prospects;
CREATE TRIGGER prospects_closed_client
  AFTER UPDATE OF stage ON public.prospects
  FOR EACH ROW EXECUTE FUNCTION public.prospects_closed_to_client();

-- Contatos que já existem: vinculados a empresa ou com lead 'Fechado' viram 'Cliente'.
UPDATE public.wa_contacts SET classification = 'Cliente'
 WHERE classification <> 'Cliente'
   AND (company_id IS NOT NULL OR prospect_id IN (SELECT id FROM public.prospects WHERE stage = 'Fechado'));

-- Pausa de 10 minutos.
ALTER TABLE public.agent_settings ALTER COLUMN pause_minutes SET DEFAULT 10;
UPDATE public.agent_settings SET pause_minutes = 10 WHERE id = 1 AND pause_minutes = 120;

COMMIT;
