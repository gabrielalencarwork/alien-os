-- ==============================================================================
-- Migration 02: Schema de Criação das 17 Tabelas Normalizadas (Alien OS)
-- Cada tabela contém: id, created_at, updated_at, created_by, updated_by, active
-- ==============================================================================

-- 1. PROFILES (Extensão de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Administrador', 'Gestor de Tráfego', 'Social Media', 'CS', 'Cliente')),
    phone VARCHAR(50),
    department VARCHAR(100),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.profiles IS 'Perfil estendido de usuários vinculados à autenticação do Supabase.';

-- 2. COMPANIES (Empresas/Clientes da agência)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    cnpj VARCHAR(20) UNIQUE,
    segment VARCHAR(100) NOT NULL,
    website VARCHAR(255),
    entry_date DATE DEFAULT CURRENT_DATE NOT NULL,
    primary_objective TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.companies IS 'Empresas e clientes atendidos pela operação de Growth Marketing.';

-- 3. COMPANY_CONTACTS (Pessoas de contato das empresas)
CREATE TABLE IF NOT EXISTS public.company_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role_position VARCHAR(100),
    is_decision_maker BOOLEAN DEFAULT FALSE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.company_contacts IS 'Contatos chave e tomadores de decisão em cada empresa cliente.';

-- 4. SERVICES (Catálogo master de serviços)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN ('Gestão de Tráfego', 'Social Media', 'Branding', 'Sites', 'Google Meu Negócio', 'Fotografia e Vídeo', 'Automações')),
    description TEXT,
    base_price NUMERIC(12,2),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.services IS 'Catálogo principal de serviços oferecidos pela agência.';

-- 5. COMPANY_SERVICES (Serviços contratados pelas empresas)
CREATE TABLE IF NOT EXISTS public.company_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    service_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'Ativo' NOT NULL CHECK (status IN ('Ativo', 'Em Produção', 'Pausado', 'Otimizando')),
    assignee_id UUID,
    monthly_fee NUMERIC(12,2),
    last_results TEXT,
    next_action TEXT,
    ai_recommendation TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.company_services IS 'Serviços ativos e contratados por cada cliente com responsáveis e SLAs.';

-- 6. PROJECTS (Projetos e frentes de execução)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Em Execução' NOT NULL CHECK (status IN ('Em Planejamento', 'Em Execução', 'Concluído', 'Em Pausa')),
    start_date DATE DEFAULT CURRENT_DATE NOT NULL,
    target_end_date DATE,
    lead_assignee_id UUID,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.projects IS 'Projetos e frentes operacionais atrelados às empresas.';

-- 7. TASKS (Tarefas com prioridade e SLA)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID,
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    impact VARCHAR(50) DEFAULT 'Alto Impacto' NOT NULL CHECK (impact IN ('Crítico', 'Alto Impacto', 'Médio Impacto', 'Baixo Impacto')),
    sla_deadline TIMESTAMPTZ,
    assignee_id UUID,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    completed_at TIMESTAMPTZ,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.tasks IS 'Tarefas prioritárias com gestão de SLA e classificação de impacto.';

-- 8. CAMPAIGNS (Campanhas de tráfego pago)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    project_id UUID,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('Meta Ads', 'Google Search', 'TikTok Ads', 'LinkedIn Ads', 'Outbrain')),
    objective VARCHAR(100),
    daily_budget NUMERIC(12,2) DEFAULT 0 NOT NULL,
    total_spent NUMERIC(12,2) DEFAULT 0 NOT NULL,
    status VARCHAR(50) DEFAULT 'Ativa' NOT NULL CHECK (status IN ('Ativa', 'Pausada', 'Encerrada', 'Em Otimização')),
    roas_target NUMERIC(5,2) DEFAULT 4.0 NOT NULL,
    current_roas NUMERIC(5,2) DEFAULT 0.0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.campaigns IS 'Campanhas de tráfego pago em Meta Ads, Google Ads e TikTok Ads.';

-- 9. METRICS (Métricas históricas e diárias de mídia e conversão)
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    campaign_id UUID,
    metric_date DATE DEFAULT CURRENT_DATE NOT NULL,
    ad_spend NUMERIC(12,2) DEFAULT 0 NOT NULL,
    revenue NUMERIC(12,2) DEFAULT 0 NOT NULL,
    roas NUMERIC(5,2) DEFAULT 0 NOT NULL,
    conversions_count INT DEFAULT 0 NOT NULL,
    cac NUMERIC(10,2) DEFAULT 0 NOT NULL,
    ctr NUMERIC(5,2) DEFAULT 0 NOT NULL,
    cpm NUMERIC(10,2) DEFAULT 0 NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.metrics IS 'Métricas históricas diárias de anúncios, receita, CAC e conversão.';

-- 10. MEETINGS (Agenda e atas de reuniões)
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    meeting_type VARCHAR(50) DEFAULT 'Alinhamento Quinzanal' NOT NULL,
    status VARCHAR(50) DEFAULT 'Agendada' NOT NULL CHECK (status IN ('Agendada', 'Concluída', 'Cancelada', 'Reagendada')),
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INT DEFAULT 30 NOT NULL,
    host_id UUID,
    notes_summary TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.meetings IS 'Agendamentos e notas de reuniões de acompanhamento dos clientes.';

-- 11. DOCUMENTS (Arquivos, contratos e briefings)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Briefings', 'Contratos', 'Arquivos', 'Apresentações')),
    file_format VARCHAR(20) NOT NULL,
    file_size VARCHAR(20) NOT NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.documents IS 'Repositório de arquivos, briefings, contratos e artes vinculados ao Supabase Storage.';

-- 12. TIMELINE (Histórico de eventos e etapas da Jornada)
CREATE TABLE IF NOT EXISTS public.timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT,
    author_name VARCHAR(255) NOT NULL,
    journey_stage VARCHAR(50),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.timeline IS 'Log cronológico de eventos e marcos da Jornada de Abdução.';

-- 13. FINANCIAL_RECORDS (Registros financeiros, MRR e faturamento)
CREATE TABLE IF NOT EXISTS public.financial_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    mrr_contribution NUMERIC(12,2) DEFAULT 0 NOT NULL,
    contract_value NUMERIC(12,2) DEFAULT 0 NOT NULL,
    billing_cycle VARCHAR(50) DEFAULT 'Mensal' NOT NULL,
    next_invoice_date DATE,
    last_payment_status VARCHAR(50) DEFAULT 'Pago' NOT NULL,
    estimated_cac NUMERIC(10,2) DEFAULT 0,
    total_ltv NUMERIC(12,2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.financial_records IS 'Histórico financeiro, faturamento de MRR, LTV e status de cobrança.';

-- 14. AI_INSIGHTS (Diagnósticos e recomendações da IA Alien)
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID,
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    biggest_bottleneck TEXT NOT NULL,
    biggest_opportunity TEXT NOT NULL,
    weekly_priority TEXT NOT NULL,
    recommendations_json JSONB,
    impact_score INT DEFAULT 85 CHECK (impact_score BETWEEN 0 AND 100),
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.ai_insights IS 'Diagnósticos e recomendações da IA Alien (A IA Recomenda, o Humano Decide).';

-- 15. ALIEN_DNA (DNA operacional e inteligência de marca)
CREATE TABLE IF NOT EXISTS public.alien_dna (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE NOT NULL,
    brand_voice TEXT,
    target_personas JSONB,
    value_proposition TEXT,
    competitors_json JSONB,
    brand_guidelines_url TEXT,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.alien_dna IS 'DNA da marca, posicionamento, tom de voz e inteligência de mercado do cliente.';

-- 16. ALIEN_SCORES (Pontuações de maturidade operacional)
CREATE TABLE IF NOT EXISTS public.alien_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    media_score INT CHECK (media_score BETWEEN 0 AND 100),
    tech_score INT CHECK (tech_score BETWEEN 0 AND 100),
    sales_score INT CHECK (sales_score BETWEEN 0 AND 100),
    evaluation_notes TEXT,
    evaluation_date DATE DEFAULT CURRENT_DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.alien_scores IS 'Histórico de avaliação de maturidade operacional e Alien Score das contas.';

-- 17. HEALTH_SCORES (Indicadores de saúde da conta e risco de churn)
CREATE TABLE IF NOT EXISTS public.health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    status VARCHAR(50) DEFAULT 'Excelente' NOT NULL CHECK (status IN ('Excelente', 'Atenção', 'Crítico')),
    risk_level VARCHAR(50) DEFAULT 'Baixo' NOT NULL CHECK (risk_level IN ('Baixo', 'Médio', 'Alto')),
    risk_factors TEXT,
    mitigation_plan TEXT,
    evaluation_date DATE DEFAULT CURRENT_DATE NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
COMMENT ON TABLE public.health_scores IS 'Métricas de saúde de projeto, fatores de risco e planos de mitigação de churn.';
