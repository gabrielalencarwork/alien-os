-- ==============================================================================
-- Migration: 20260803000009_project_hub_center.sql
-- Project Hub (Central de Projetos) — Alien OS
-- Tabelas: projects, project_members, project_services, project_milestones, project_updates, project_history
-- ==============================================================================

-- 1. Tabela projects (Registro Principal do Projeto)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'Growth Marketing',
  description TEXT,
  objective TEXT,
  lead_name VARCHAR(100) NOT NULL DEFAULT 'Gabriel Alencar',
  priority VARCHAR(20) NOT NULL DEFAULT 'Média', -- 'Baixa', 'Média', 'Alta', 'Crítica'
  status VARCHAR(30) NOT NULL DEFAULT 'Em Andamento', -- 'Planejamento', 'Em Andamento', 'Aguardando Cliente', 'Em Revisão', 'Concluído', 'Cancelado'
  progress_percentage INT DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  estimated_budget NUMERIC(12, 2) DEFAULT 0.00,
  contracted_value NUMERIC(12, 2) DEFAULT 0.00,
  estimated_hours NUMERIC(6, 2) DEFAULT 0.0,
  executed_hours NUMERIC(6, 2) DEFAULT 0.0,
  journey_stage VARCHAR(50),
  tags TEXT[],
  alien_score_impact INT DEFAULT 0,
  health_status VARCHAR(20) DEFAULT 'Excelente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela project_members (Membros Alocados no Projeto)
CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  member_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'Especialista',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela project_milestones (Marcos Estratégicos do Projeto)
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela project_updates (Status Reports e Registros de Atualização)
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  update_text TEXT NOT NULL,
  health_status VARCHAR(20) DEFAULT 'Excelente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabela project_history (Trilha de Auditoria)
CREATE TABLE IF NOT EXISTS public.project_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  actor_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'CREATED', 'STATUS_CHANGE', 'MILESTONE_COMPLETED', 'DUE_DATE_CHANGED'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public Projects Select Policy" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public Project Members Select Policy" ON public.project_members FOR SELECT USING (true);
CREATE POLICY "Public Project Milestones Select Policy" ON public.project_milestones FOR SELECT USING (true);
CREATE POLICY "Public Project Updates Select Policy" ON public.project_updates FOR SELECT USING (true);
CREATE POLICY "Public Project History Select Policy" ON public.project_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON public.projects(priority);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON public.project_members(project_id);

COMMENT ON TABLE public.projects IS 'Central de Projetos (Project Hub) da agência Alien OS';
COMMENT ON TABLE public.project_members IS 'Equipe interna alocada para cada projeto';
COMMENT ON TABLE public.project_milestones IS 'Entregáveis e marcos estratégicos dos projetos';
COMMENT ON TABLE public.project_updates IS 'Relatórios periódicos de acompanhamento operacional';
COMMENT ON TABLE public.project_history IS 'Log de auditoria e alteração de prazos/status dos projetos';
