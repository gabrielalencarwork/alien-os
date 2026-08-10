-- ==============================================================================
-- Migration: 20260803000007_task_operation_center.sql
-- Central de Tarefas & Operação (Alien OS)
-- Tabelas: tasks, task_comments, task_checklists, task_attachments, task_history
-- ==============================================================================

-- 1. Tabela tasks (Registro Principal de Tarefas Operacionais)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee_name VARCHAR(100) NOT NULL DEFAULT 'Não Atribuído',
  priority VARCHAR(20) NOT NULL DEFAULT 'Média', -- 'Baixa', 'Média', 'Alta', 'Crítica'
  status VARCHAR(30) NOT NULL DEFAULT 'A Fazer', -- 'Backlog', 'A Fazer', 'Em Andamento', 'Em Revisão', 'Concluído'
  start_date DATE,
  due_date DATE NOT NULL,
  estimated_hours NUMERIC(5, 2) DEFAULT 0.0,
  journey_stage VARCHAR(50), -- 'Assinatura & Onboarding', 'Diagnóstico & Setup', 'Estruturação de Mídia & Tech', 'Execução & Otimização', 'Escala & Growth', 'Case Alien'
  tags TEXT[],
  sla_percentage INT DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela task_comments (Comentários e Discussão da Equipe)
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela task_checklists (Sub-entregáveis de Checklist)
CREATE TABLE IF NOT EXISTS public.task_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  assignee_name VARCHAR(100),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela task_attachments (Referências a Documentos)
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. Tabela task_history (Trilha de Auditoria)
CREATE TABLE IF NOT EXISTS public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  actor_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'STATUS_CHANGE', 'PRIORITY_CHANGE', 'ASSIGNED', 'DUE_DATE_CHANGE'
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS genéricas
CREATE POLICY "Public Tasks Select Policy" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Public Task Comments Select Policy" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Public Task Checklists Select Policy" ON public.task_checklists FOR SELECT USING (true);
CREATE POLICY "Public Task Attachments Select Policy" ON public.task_attachments FOR SELECT USING (true);
CREATE POLICY "Public Task History Select Policy" ON public.task_history FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_tasks_company ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON public.task_checklists(task_id);

COMMENT ON TABLE public.tasks IS 'Central de Tarefas & Operação da agência Alien Marketing';
COMMENT ON TABLE public.task_comments IS 'Comentários e discussões colaborativas da equipe em tarefas';
COMMENT ON TABLE public.task_checklists IS 'Itens fracionados de entregáveis da tarefa';
COMMENT ON TABLE public.task_attachments IS 'Vínculos com documentos e artes da Central de Documentos';
COMMENT ON TABLE public.task_history IS 'Log auditável de alterações de tarefas';
