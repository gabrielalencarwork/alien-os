-- ==============================================================================
-- Migration 04: Row Level Security (RLS) & Role Access Policies (Alien OS)
-- Target Roles: Administrador, Gestor de Tráfego, Social Media
-- ==============================================================================

-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EM TODAS AS 17 TABELAS

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alien_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;


-- 2. FUNÇÃO HELPER PARA RESOLVER O PAPEL (ROLE) DO USUÁRIO CONECTADO

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role
    FROM public.profiles
    WHERE user_id = auth.uid() AND active = TRUE
    LIMIT 1;

    RETURN COALESCE(user_role, 'Cliente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_auth_user_role() IS 'Retorna o papel do usuário autenticado a partir do perfil no Alien OS.';


-- 3. POLÍTICAS RLS PARA O PAPEL: ADMINISTRADOR (Acesso Total)

DO $$ 
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'profiles', 'companies', 'company_contacts', 'services', 'company_services', 
        'projects', 'tasks', 'campaigns', 'metrics', 'meetings', 'documents', 
        'timeline', 'financial_records', 'ai_insights', 'alien_dna', 'alien_scores', 'health_scores'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format('
            CREATE POLICY "Admin total access on %I" 
            ON public.%I FOR ALL 
            TO authenticated 
            USING (public.get_auth_user_role() = %L)
            WITH CHECK (public.get_auth_user_role() = %L);',
            tbl, tbl, 'Administrador', 'Administrador'
        );
    END LOOP;
END $$;


-- 4. POLÍTICAS RLS PARA O PAPEL: GESTOR DE TRÁFEGO
-- Acesso às tabelas de empresas, serviços, projetos, tarefas, campanhas, métricas, timeline, insights da IA e scores

DO $$ 
DECLARE
    tbl TEXT;
    traffic_tables TEXT[] := ARRAY[
        'companies', 'company_services', 'projects', 'tasks', 'campaigns', 
        'metrics', 'timeline', 'ai_insights', 'alien_scores', 'health_scores'
    ];
BEGIN
    FOREACH tbl IN ARRAY traffic_tables LOOP
        EXECUTE format('
            CREATE POLICY "Gestor de Tráfego access on %I" 
            ON public.%I FOR ALL 
            TO authenticated 
            USING (public.get_auth_user_role() = %L)
            WITH CHECK (public.get_auth_user_role() = %L);',
            tbl, tbl, 'Gestor de Tráfego', 'Gestor de Tráfego'
        );
    END LOOP;
END $$;


-- 5. POLÍTICAS RLS PARA O PAPEL: SOCIAL MEDIA
-- Acesso às tabelas de empresas, serviços, projetos, tarefas, documentos, timeline e alien_dna

DO $$ 
DECLARE
    tbl TEXT;
    social_tables TEXT[] := ARRAY[
        'companies', 'company_services', 'projects', 'tasks', 
        'documents', 'timeline', 'alien_dna'
    ];
BEGIN
    FOREACH tbl IN ARRAY social_tables LOOP
        EXECUTE format('
            CREATE POLICY "Social Media access on %I" 
            ON public.%I FOR ALL 
            TO authenticated 
            USING (public.get_auth_user_role() = %L)
            WITH CHECK (public.get_auth_user_role() = %L);',
            tbl, tbl, 'Social Media', 'Social Media'
        );
    END LOOP;
END $$;
