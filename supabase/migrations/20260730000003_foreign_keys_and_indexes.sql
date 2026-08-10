-- ==============================================================================
-- Migration 03: Foreign Keys, Índices B-Tree & Triggers de Auditoria (Alien OS)
-- ==============================================================================

-- 1. ADICIONAR CONSTRAINTS DE CHAVE ESTRANGEIRA (FKs)

ALTER TABLE public.company_contacts 
    ADD CONSTRAINT fk_contacts_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.company_services 
    ADD CONSTRAINT fk_cs_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_cs_service FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_cs_assignee FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.projects 
    ADD CONSTRAINT fk_projects_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_projects_lead FOREIGN KEY (lead_assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.tasks 
    ADD CONSTRAINT fk_tasks_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_tasks_assignee FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.campaigns 
    ADD CONSTRAINT fk_campaigns_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_campaigns_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;

ALTER TABLE public.metrics 
    ADD CONSTRAINT fk_metrics_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_metrics_campaign FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;

ALTER TABLE public.meetings 
    ADD CONSTRAINT fk_meetings_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_meetings_host FOREIGN KEY (host_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.documents 
    ADD CONSTRAINT fk_documents_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.timeline 
    ADD CONSTRAINT fk_timeline_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.financial_records 
    ADD CONSTRAINT fk_financial_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.ai_insights 
    ADD CONSTRAINT fk_insights_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.alien_dna 
    ADD CONSTRAINT fk_dna_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.alien_scores 
    ADD CONSTRAINT fk_scores_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.health_scores 
    ADD CONSTRAINT fk_health_company FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


-- 2. CRIAR ÍNDICES B-TREE DE ALTA PERFORMANCE

-- Profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role) WHERE active = TRUE;

-- Companies
CREATE INDEX IF NOT EXISTS idx_companies_active ON public.companies(active);
CREATE INDEX IF NOT EXISTS idx_companies_trade_name ON public.companies(trade_name);
CREATE INDEX IF NOT EXISTS idx_companies_segment ON public.companies(segment);

-- Contacts
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.company_contacts(company_id);

-- Company Services
CREATE INDEX IF NOT EXISTS idx_company_services_company ON public.company_services(company_id);
CREATE INDEX IF NOT EXISTS idx_company_services_status ON public.company_services(status);

-- Projects
CREATE INDEX IF NOT EXISTS idx_projects_company ON public.projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_company ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_impact ON public.tasks(impact);

-- Campaigns
CREATE INDEX IF NOT EXISTS idx_campaigns_company ON public.campaigns(company_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_platform ON public.campaigns(platform);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);

-- Metrics
CREATE INDEX IF NOT EXISTS idx_metrics_company_date ON public.metrics(company_id, metric_date DESC);

-- Meetings
CREATE INDEX IF NOT EXISTS idx_meetings_company_date ON public.meetings(company_id, scheduled_at DESC);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_company ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);

-- Timeline
CREATE INDEX IF NOT EXISTS idx_timeline_company ON public.timeline(company_id, created_at DESC);

-- Financial Records
CREATE INDEX IF NOT EXISTS idx_financial_company ON public.financial_records(company_id);

-- AI Insights
CREATE INDEX IF NOT EXISTS idx_ai_insights_company ON public.ai_insights(company_id);

-- Alien Scores & Health
CREATE INDEX IF NOT EXISTS idx_alien_scores_company ON public.alien_scores(company_id, evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_scores_company ON public.health_scores(company_id, evaluation_date DESC);


-- 3. APLICAR TRIGGERS DE UPDATED_AT EM TODAS AS 17 TABELAS

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_contacts_updated_at BEFORE UPDATE ON public.company_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_services_updated_at BEFORE UPDATE ON public.company_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON public.metrics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON public.meetings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_timeline_updated_at BEFORE UPDATE ON public.timeline FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_financial_records_updated_at BEFORE UPDATE ON public.financial_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON public.ai_insights FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alien_dna_updated_at BEFORE UPDATE ON public.alien_dna FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_alien_scores_updated_at BEFORE UPDATE ON public.alien_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_scores_updated_at BEFORE UPDATE ON public.health_scores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
