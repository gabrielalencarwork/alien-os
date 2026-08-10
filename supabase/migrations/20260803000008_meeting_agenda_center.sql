-- ==============================================================================
-- Migration: 20260803000008_meeting_agenda_center.sql
-- Agenda Inteligente & Central de Reuniões (Alien OS)
-- Tabelas: meetings, meeting_participants, meeting_notes, meeting_attachments, meeting_history
-- ==============================================================================

-- 1. Tabela meetings (Registro Principal de Reuniões e Compromissos)
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Reunião Estratégica', -- 'Onboarding', 'Diagnóstico', 'Reunião Estratégica', 'Follow-up', 'Aprovação', 'Planejamento', 'Apresentação', 'Entrega', 'Reunião Interna', 'Outro'
  description TEXT,
  host_name VARCHAR(100) NOT NULL DEFAULT 'Gabriel Alencar',
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  location VARCHAR(100) DEFAULT 'Online (Google Meet)',
  meeting_link TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Agendada', -- 'Agendada', 'Em Andamento', 'Concluída', 'Cancelada', 'Reagendada'
  journey_stage VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela meeting_participants (Participantes e Convidados)
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150),
  role VARCHAR(50) DEFAULT 'Convidado', -- 'Organizador', 'Participante Interno', 'Cliente'
  confirmed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela meeting_notes (Ata da Reunião e Registros)
CREATE TABLE IF NOT EXISTS public.meeting_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  decisions TEXT,
  pending_issues TEXT,
  next_steps TEXT,
  author_name VARCHAR(100) NOT NULL DEFAULT 'Gabriel Alencar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela meeting_attachments (Anexos e Documentos)
CREATE TABLE IF NOT EXISTS public.meeting_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabela meeting_history (Trilha de Auditoria)
CREATE TABLE IF NOT EXISTS public.meeting_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  actor_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'CREATED', 'RESCHEDULED', 'COMPLETED', 'NOTES_ADDED'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public Meetings Select Policy" ON public.meetings FOR SELECT USING (true);
CREATE POLICY "Public Meeting Participants Select Policy" ON public.meeting_participants FOR SELECT USING (true);
CREATE POLICY "Public Meeting Notes Select Policy" ON public.meeting_notes FOR SELECT USING (true);
CREATE POLICY "Public Meeting Attachments Select Policy" ON public.meeting_attachments FOR SELECT USING (true);
CREATE POLICY "Public Meeting History Select Policy" ON public.meeting_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_meetings_company ON public.meetings(company_id);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON public.meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON public.meetings(status);
CREATE INDEX IF NOT EXISTS idx_meeting_notes_meeting ON public.meeting_notes(meeting_id);

COMMENT ON TABLE public.meetings IS 'Agenda Inteligente & Reuniões da agência Alien OS';
COMMENT ON TABLE public.meeting_participants IS 'Participantes internos e clientes convidados para reuniões';
COMMENT ON TABLE public.meeting_notes IS 'Atas oficiais de reuniões com histórico de decisões e próximos passos';
COMMENT ON TABLE public.meeting_attachments IS 'Documentos e apresentações vinculadas às reuniões';
COMMENT ON TABLE public.meeting_history IS 'Log auditável de reagendamentos e confirmações';
