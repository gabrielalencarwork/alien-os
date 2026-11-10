-- ==============================================================================
-- Migration: 20261109000040_prospeccao_ativa.sql
-- CRM de prospecção ativa: lista dos 75 primeiros alvos (clínicas de saúde e estética),
-- lembrete diário e status do funil. Reaproveita a tabela prospects (Central do Dia).
--
-- Só ADICIONA colunas, índice e os 75 leads (nada é apagado; pode rodar de novo sem duplicar).
--
-- Valores canônicos (use as funções normalize* do prospectRepository ao ler):
--   prospects.outreach_status .. 'Não abordado' | 'Mensagem enviada' | 'Respondeu' | 'Aline qualificando'
--                                | 'Diagnóstico solicitado' | 'Passado ao Gabriel' | 'Fechado'
--                                | 'Sem interesse' | 'Não contatar'
--
-- Rode no Supabase: SQL Editor → cole este arquivo → Run.
-- ==============================================================================

BEGIN;

ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS batch VARCHAR(60);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS batch_day INT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS scheduled_date DATE;      -- dia em que a primeira mensagem deve ser enviada
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS city VARCHAR(80);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS specialty VARCHAR(80);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS rating NUMERIC(2, 1);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS reviews_count INT;
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS angle TEXT;               -- ângulo sugerido para a primeira mensagem
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS instagram VARCHAR(255);
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS whatsapp_confirmed BOOLEAN NOT NULL DEFAULT true; -- false = telefone fixo, confirmar o WhatsApp antes
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS outreach_status VARCHAR(30) NOT NULL DEFAULT 'Não abordado';
ALTER TABLE public.prospects ADD COLUMN IF NOT EXISTS outreach_at TIMESTAMPTZ;  -- quando a primeira mensagem foi enviada

CREATE UNIQUE INDEX IF NOT EXISTS prospects_batch_name_uidx ON public.prospects (batch, name) WHERE batch IS NOT NULL;
CREATE INDEX IF NOT EXISTS prospects_schedule_idx ON public.prospects (scheduled_date, outreach_status) WHERE batch IS NOT NULL;

-- Os 75 primeiros alvos (busca no Google Maps em 08/11/2026: nota 4,3+, 8 a 1.500 avaliações, telefone público).
INSERT INTO public.prospects
  (name, phone, segment, source, stage, batch, city, specialty, scheduled_date, batch_day, rating, reviews_count, angle, whatsapp_confirmed)
SELECT t.name, t.phone, t.specialty, 'Prospecção ativa', 'Novo', 'nov-2026-clinicas', t.city, t.specialty, t.d::date, t.day, t.rating, t.reviews, t.angle, t.wa
FROM (VALUES
  ('Clínica Psicológica Saúde Emocional', '5531988784335', 'Psicologia', 'Belo Horizonte', '2026-11-09', 1, 4.5, 39, 'Presença ética + agenda; sem promessa de resultado', true),
  ('Dra. Cássia Reis Odontologia & Estética Avançada', '5531992246001', 'Odontologia', 'Belo Horizonte', '2026-11-09', 1, 5, 54, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Inspire Saúde - Fisioterapia, Pilates e Saúde Integrada', '5531973276116', 'Fisioterapia / pilates', 'Belo Horizonte', '2026-11-09', 1, 5, 40, 'Google local + recorrência', true),
  ('Clínica Estética em BH', '5531989435282', 'Estética / harmonização', 'Belo Horizonte', '2026-11-09', 1, 5, 186, 'Instagram profissional + Google local', true),
  ('Ser - Núcleo de Psicologia', '5531971331030', 'Psicologia', 'Belo Horizonte', '2026-11-09', 1, 4.8, 302, 'Presença ética + agenda; sem promessa de resultado', true),
  ('Instituto Americano de Emagrecimento e Performance', '5531984117288', 'Nutrição / emagrecimento', 'Belo Horizonte', '2026-11-09', 1, 4.9, 157, 'Google local + conteúdo ético', true),
  ('Sano Fisioterapia e Pilates Floresta', '5531993850991', 'Fisioterapia / pilates', 'Belo Horizonte', '2026-11-09', 1, 5, 70, 'Google local + recorrência', true),
  ('Clínica de Estética Dra. Juliana Ramos - Harmonização Facial em BH', '5531992154950', 'Estética / harmonização', 'Belo Horizonte', '2026-11-09', 1, 5, 10, 'Prova social no Google (poucas avaliações); Instagram profissional + Google local', true),
  ('Clínica de Depilação a Laser e Estética BH | Depille | Por Studio Tamine Aziz', '5531982886022', 'Depilação a laser / estética', 'Belo Horizonte', '2026-11-09', 1, 5, 643, 'Google local + recorrência de pacotes', true),
  ('Dra. Andréia Alves | Dermatologia', '5538984041356', 'Dermatologia', 'Montes Claros', '2026-11-09', 1, 5, 26, 'Prova social no Google (poucas avaliações); Google local por procedimento', true),
  ('Dra. Ana Luísa Figueredo (vasinhos)', '5538999914795', 'Clínica médica / outras', 'Montes Claros', '2026-11-09', 1, 4.8, 16, 'Prova social no Google (poucas avaliações); Google por especialidade', true),
  ('Dra. Débora Gueddes Harmonização Facial', '5538998771192', 'Estética / harmonização', 'Montes Claros', '2026-11-09', 1, 5, 42, 'Instagram profissional + Google local', true),
  ('CONSULTÓRIO ODONTOLÓGICO ORTHOLIFE', '5538991576308', 'Odontologia', 'Montes Claros', '2026-11-09', 1, 5, 85, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Dane Maia Psicóloga', '5538998567134', 'Psicologia', 'Montes Claros', '2026-11-09', 1, 5, 65, 'Presença ética + agenda; sem promessa de resultado', true),
  ('Dra. Jéssica Gaudêncio Harmonização Facial', '5538998723061', 'Estética / harmonização', 'Montes Claros', '2026-11-09', 1, 5, 12, 'Prova social no Google (poucas avaliações); Instagram profissional + Google local', true),
  ('Clínica Psicológica Exameseg', '5531987151274', 'Psicologia', 'Belo Horizonte', '2026-11-10', 2, 5, 23, 'Prova social no Google (poucas avaliações); Presença ética + agenda; sem promessa de resultado', true),
  ('Hilla - Odontologia & Estetica', '5531985401987', 'Odontologia', 'Belo Horizonte', '2026-11-10', 2, 5, 38, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Clinica de estética - Andreia Carla', '5531995951229', 'Estética / harmonização', 'Belo Horizonte', '2026-11-10', 2, 5, 24, 'Prova social no Google (poucas avaliações); Instagram profissional + Google local', true),
  ('Clinica Estetica BH', '5531993866785', 'Estética / harmonização', 'Belo Horizonte', '2026-11-10', 2, 5, 72, 'Instagram profissional + Google local', true),
  ('Dra. Luiza Lisboa | Harmonização Facial em Belo Horizonte', '5531994930441', 'Estética / harmonização', 'Belo Horizonte', '2026-11-10', 2, 5, 60, 'Instagram profissional + Google local', true),
  ('Nutricionista Fábio Magalhães / Especializado em emagrecimento feminino e tratamento da obesidade', '5531990800036', 'Nutrição / emagrecimento', 'Belo Horizonte', '2026-11-10', 2, 5, 141, 'Google local + conteúdo ético', true),
  ('Estetica BH Marcella Fernandes - Limpeza de Pele - Drenagem Linfática - Massagem Relaxante - Pampulha', '5531983818989', 'Estética / harmonização', 'Belo Horizonte', '2026-11-10', 2, 4.9, 119, 'Instagram profissional + Google local', true),
  ('Dra. Carolina Ledsham - Dermatologista em Belo Horizonte', '5531988741138', 'Dermatologia', 'Belo Horizonte', '2026-11-10', 2, 4.8, 13, 'Prova social no Google (poucas avaliações); Google local por procedimento', true),
  ('NUTRISHAPE', '553130190606', 'Nutrição / emagrecimento', 'Belo Horizonte', '2026-11-10', 2, 4.9, 44, 'Google local + conteúdo ético', false),
  ('Dra. Amanda Rocha', '5538988612021', 'Clínica médica / outras', 'Montes Claros', '2026-11-10', 2, 5, 42, 'Google por especialidade', true),
  ('Clinic - Saúde e Estética', '5538991931000', 'Estética / harmonização', 'Montes Claros', '2026-11-10', 2, 4.7, 45, 'Instagram profissional + Google local', true),
  ('Dra. Maria Clara de Paula - Dermatologia', '5538991202930', 'Dermatologia', 'Montes Claros', '2026-11-10', 2, 5, 99, 'Google local por procedimento', true),
  ('Dr Laser Montes Claros - Depilação a laser | Estética | Skincare', '5538999590553', 'Depilação a laser / estética', 'Montes Claros', '2026-11-10', 2, 4.5, 137, 'Google local + recorrência de pacotes', true),
  ('Dra. Thamara Cordeiro Harmonização Facial', '5538998561797', 'Estética / harmonização', 'Montes Claros', '2026-11-10', 2, 5, 83, 'Instagram profissional + Google local', true),
  ('Dra Tatiane Meira', '5538999999859', 'Estética / harmonização', 'Montes Claros', '2026-11-10', 2, 5, 508, 'Instagram profissional + Google local', true),
  ('Dra. Nara Lília Porto | Harmonização Facial', '5531996945949', 'Estética / harmonização', 'Belo Horizonte', '2026-11-11', 3, 5, 23, 'Prova social no Google (poucas avaliações); Instagram profissional + Google local', true),
  ('Dra Marcelle Lacerda - Nutrologia e Emagrecimento, BH e Online', '5531997808287', 'Nutrição / emagrecimento', 'Belo Horizonte', '2026-11-11', 3, 5, 59, 'Google local + conteúdo ético', true),
  ('Clínica de Estética Avançada | Dra. Janaína Inácio | Belo Horizonte', '5531985660448', 'Estética / harmonização', 'Belo Horizonte', '2026-11-11', 3, 5, 16, 'Prova social no Google (poucas avaliações); Instagram profissional + Google local', true),
  ('Vibe Clinic - Clínica de Estética - Savassi', '5531997645936', 'Estética / harmonização', 'Belo Horizonte', '2026-11-11', 3, 5, 189, 'Instagram profissional + Google local', true),
  ('Dra. Natália Andrade - Odontologia estética', '5531992437650', 'Odontologia', 'Belo Horizonte', '2026-11-11', 3, 5, 103, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Dra. Tatiana Rage - Emagrecimento em Belo Horizonte', '5531996776451', 'Nutrição / emagrecimento', 'Belo Horizonte', '2026-11-11', 3, 5, 93, 'Google local + conteúdo ético', true),
  ('Clínica de Estética Essence Vitá Buritis', '5531981142636', 'Estética / harmonização', 'Belo Horizonte', '2026-11-11', 3, 5, 67, 'Instagram profissional + Google local', true),
  ('Clínica de Fisioterapia Pilates & Cia Joana Nascentes', '5531984129500', 'Fisioterapia / pilates', 'Belo Horizonte', '2026-11-11', 3, 5, 12, 'Prova social no Google (poucas avaliações); Google local + recorrência', true),
  ('Dra. Lorena Layla Estética Avançada', '553130236558', 'Estética / harmonização', 'Belo Horizonte', '2026-11-11', 3, 4.8, 160, 'Instagram profissional + Google local', false),
  ('Dra. Andressa Manzur', '5538992246644', 'Clínica médica / outras', 'Montes Claros', '2026-11-11', 3, 5, 55, 'Google por especialidade', true),
  ('Odontologia Maykon Cardoso', '5538999216650', 'Odontologia', 'Montes Claros', '2026-11-11', 3, 4.8, 53, 'Google por serviço (implante, ortodontia, estética)', true),
  ('CLÍNICA DE FISIOTERAPIA - SINGULAR', '5538988607558', 'Fisioterapia / pilates', 'Montes Claros', '2026-11-11', 3, 5, 294, 'Google local + recorrência', true),
  ('Clínica Clara Ferraz Depilação a Led | Estética Avançada - Montes Claros', '5538988467446', 'Depilação a laser / estética', 'Montes Claros', '2026-11-11', 3, 5, 84, 'Google local + recorrência de pacotes', true),
  ('Instituto Dr. Victor Santos Harmonização e Cirurgia Facial', '5538997265621', 'Estética / harmonização', 'Montes Claros', '2026-11-11', 3, 5, 192, 'Instagram profissional + Google local', true),
  ('ACIFISIO', '553830143336', 'Fisioterapia / pilates', 'Montes Claros', '2026-11-11', 3, 4.7, 20, 'Prova social no Google (poucas avaliações); Google local + recorrência', false),
  ('Dra. Maíra Morais', '5531984566620', 'Clínica médica / outras', 'Belo Horizonte', '2026-11-12', 4, 5, 55, 'Google por especialidade', true),
  ('ÁS Odonto - Ortodontia e Reabilitação Oral | Floresta BH', '5531971951739', 'Odontologia', 'Belo Horizonte', '2026-11-12', 4, 5, 28, 'Prova social no Google (poucas avaliações); Google por serviço (implante, ortodontia, estética)', true),
  ('CLÍNICA PERFORMANCE - BURITIS', '5531984083017', 'Clínica médica / outras', 'Belo Horizonte', '2026-11-12', 4, 4.9, 46, 'Google por especialidade', true),
  ('Clínica de Estética BH | Dra Tati Panato | Especialista Endolaser | Endolift | Preenchimento Facial | Botox | Fios de PDO |', '5531993345014', 'Depilação a laser / estética', 'Belo Horizonte', '2026-11-12', 4, 4.9, 103, 'Google local + recorrência de pacotes', true),
  ('DEPILAÇAO A LASER e limpeza de pele', '5531991390203', 'Depilação a laser / estética', 'Belo Horizonte', '2026-11-12', 4, 4.9, 90, 'Google local + recorrência de pacotes', true),
  ('Daniel Figueiredo - Ortodontia Crianças e Adultos', '5531971323831', 'Odontologia', 'Belo Horizonte', '2026-11-12', 4, 5, 180, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Clinica Estetíca Virtuosa - Buritis', '5531973493427', 'Estética / harmonização', 'Belo Horizonte', '2026-11-12', 4, 4.9, 350, 'Instagram profissional + Google local', true),
  ('CLÍNICA VIDA ATIVA PILATES E FISIOTERAPIA', '5531988739093', 'Fisioterapia / pilates', 'Belo Horizonte', '2026-11-12', 4, 5, 13, 'Prova social no Google (poucas avaliações); Google local + recorrência', true),
  ('Dra. Lívia Figueiredo', '553136568151', 'Clínica médica / outras', 'Belo Horizonte', '2026-11-12', 4, 5, 111, 'Google por especialidade', false),
  ('Simone Garcia Laser', '5538991343282', 'Depilação a laser / estética', 'Montes Claros', '2026-11-12', 4, 5, 53, 'Google local + recorrência de pacotes', true),
  ('Anna Karinna Dias Psicologia e Neuropsicologia', '5538999541018', 'Psicologia', 'Montes Claros', '2026-11-12', 4, 5, 32, 'Presença ética + agenda; sem promessa de resultado', true),
  ('Lady Borges Nutricionista Emagrecimento -Saúde da Mulher', '5538991622010', 'Nutrição / emagrecimento', 'Montes Claros', '2026-11-12', 4, 5, 144, 'Google local + conteúdo ético', true),
  ('Liz Bella Estética Avançada', '5538999485100', 'Estética / harmonização', 'Montes Claros', '2026-11-12', 4, 5, 71, 'Instagram profissional + Google local', true),
  ('Clínica Izabella Cordeiro', '5538998060003', 'Clínica médica / outras', 'Montes Claros', '2026-11-12', 4, 5, 14, 'Prova social no Google (poucas avaliações); Google por especialidade', true),
  ('Clínica Consciência Corporal - Fisioterapia em Montes Claros', '553830154670', 'Fisioterapia / pilates', 'Montes Claros', '2026-11-12', 4, 5, 57, 'Google local + recorrência', false),
  ('Dra. Deyse Jardim - Clínica de Estética e Odontologia na Savassi em BH', '5531971803979', 'Odontologia', 'Belo Horizonte', '2026-11-13', 5, 5, 36, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Saúde e Movimento (Fisioterapia e Pilates)', '5531971551007', 'Fisioterapia / pilates', 'Belo Horizonte', '2026-11-13', 5, 4.9, 39, 'Google local + recorrência', true),
  ('Clínica Sant Estética Avançada - Procedimentos Estéticos', '5531984719010', 'Estética / harmonização', 'Belo Horizonte', '2026-11-13', 5, 5, 33, 'Instagram profissional + Google local', true),
  ('Clinica Mineira de Psicologia LTDA', '5531984178260', 'Psicologia', 'Belo Horizonte', '2026-11-13', 5, 4.9, 69, 'Presença ética + agenda; sem promessa de resultado', true),
  ('My Beleza Centro - Depilação a Laser, Emgracimento, Botox e Ultraformer', '5531971543406', 'Depilação a laser / estética', 'Belo Horizonte', '2026-11-13', 5, 4.7, 228, 'Google local + recorrência de pacotes', true),
  ('Dra. Shasta Viana', '5531991701618', 'Clínica médica / outras', 'Belo Horizonte', '2026-11-13', 5, 5, 198, 'Google por especialidade', true),
  ('Clínica de Estética Face & Body Estética Avançada', '5531971112220', 'Estética / harmonização', 'Belo Horizonte', '2026-11-13', 5, 5, 185, 'Instagram profissional + Google local', true),
  ('Instituto Oral Premium - Dentista 24 Horas', '5531997367514', 'Odontologia', 'Belo Horizonte', '2026-11-13', 5, 4.8, 970, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Instituto Mineiro de Dermatologia', '553132730506', 'Dermatologia', 'Belo Horizonte', '2026-11-13', 5, 4.6, 158, 'Google local por procedimento', false),
  ('Go Laser: Depilação a Laser, Estética em Montes Claros', '5538999260167', 'Depilação a laser / estética', 'Montes Claros', '2026-11-13', 5, 4.8, 58, 'Google local + recorrência de pacotes', true),
  ('Clínica de Saúde Mente e Corpo', '5538991529555', 'Psicologia', 'Montes Claros', '2026-11-13', 5, 4.9, 47, 'Presença ética + agenda; sem promessa de resultado', true),
  ('Dental Clinic Montes Claros - Clínica Odontológica', '5538999956361', 'Odontologia', 'Montes Claros', '2026-11-13', 5, 4.9, 392, 'Google por serviço (implante, ortodontia, estética)', true),
  ('Clínica Genuína', '5538984217731', 'Clínica médica / outras', 'Montes Claros', '2026-11-13', 5, 5, 88, 'Google por especialidade', true),
  ('Clínica Odontológica Santa Maria', '5538984054646', 'Odontologia', 'Montes Claros', '2026-11-13', 5, 5, 12, 'Prova social no Google (poucas avaliações); Google por serviço (implante, ortodontia, estética)', true),
  ('MedVitta Centro Médico', '5538998830148', 'Clínica médica / outras', 'Montes Claros', '2026-11-13', 5, 4.9, 903, 'Google por especialidade', true)
) AS t(name, phone, specialty, city, d, day, rating, reviews, angle, wa)
ON CONFLICT DO NOTHING;

COMMIT;
