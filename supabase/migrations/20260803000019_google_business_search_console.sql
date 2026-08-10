-- ==============================================================================
-- Migration: 20260803000019_google_business_search_console.sql
-- Sprint 24 — Google Business Profile & Google Search Console (SEO Local & Orgânico) — Alien OS
-- ==============================================================================

-- 1. GMB Locations (Fichas de Empresas no Google Meu Negócio / Maps)
CREATE TABLE IF NOT EXISTS public.gmb_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  location_id VARCHAR(100) NOT NULL UNIQUE, -- ID da localização no Google MyBusiness API
  location_name VARCHAR(255) NOT NULL,
  address TEXT,
  phone_number VARCHAR(50),
  rating NUMERIC(3, 2) DEFAULT 5.00,
  review_count INT DEFAULT 0,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. GMB Daily Metrics (Métricas de Interação Local)
CREATE TABLE IF NOT EXISTS public.gmb_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(100) NOT NULL REFERENCES public.gmb_locations(location_id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  queries_direct INT DEFAULT 0,
  queries_indirect INT DEFAULT 0,
  views_maps INT DEFAULT 0,
  views_search INT DEFAULT 0,
  actions_website INT DEFAULT 0,
  actions_phone INT DEFAULT 0,
  actions_driving_directions INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gmb_location_date UNIQUE(location_id, metric_date)
);

-- 3. GMB Reviews (Avaliações de Clientes & Respostas da IA)
CREATE TABLE IF NOT EXISTS public.gmb_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id VARCHAR(100) NOT NULL REFERENCES public.gmb_locations(location_id) ON DELETE CASCADE,
  review_id VARCHAR(100) NOT NULL UNIQUE,
  reviewer_name VARCHAR(150) NOT NULL,
  star_rating INT NOT NULL DEFAULT 5,
  comment TEXT,
  reply_text TEXT,
  review_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. GSC Sites (Domínios Verificados no Google Search Console)
CREATE TABLE IF NOT EXISTS public.gsc_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  site_url VARCHAR(255) NOT NULL UNIQUE, -- ex: sc-domain:alienmarketing.com.br
  permission_level VARCHAR(50) DEFAULT 'siteOwner',
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- 5. GSC Daily Metrics (Métricas de Desempenho Orgânico)
CREATE TABLE IF NOT EXISTS public.gsc_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url VARCHAR(255) NOT NULL REFERENCES public.gsc_sites(site_url) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  position NUMERIC(5, 2) DEFAULT 1.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gsc_site_date UNIQUE(site_url, metric_date)
);

-- 6. GSC Keyword Queries (Palavras-Chave de Maior Tráfego Orgânico)
CREATE TABLE IF NOT EXISTS public.gsc_keyword_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_url VARCHAR(255) NOT NULL REFERENCES public.gsc_sites(site_url) ON DELETE CASCADE,
  query_text VARCHAR(255) NOT NULL,
  clicks INT DEFAULT 0,
  impressions INT DEFAULT 0,
  ctr NUMERIC(5, 2) DEFAULT 0.00,
  position NUMERIC(5, 2) DEFAULT 1.00,
  metric_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT unique_gsc_query_date UNIQUE(site_url, query_text, metric_date)
);

-- Habilitar RLS
ALTER TABLE public.gmb_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmb_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gsc_keyword_queries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS de leitura
CREATE POLICY "Public GMB Locations Select Policy" ON public.gmb_locations FOR SELECT USING (true);
CREATE POLICY "Public GMB Metrics Select Policy" ON public.gmb_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public GMB Reviews Select Policy" ON public.gmb_reviews FOR SELECT USING (true);
CREATE POLICY "Public GSC Sites Select Policy" ON public.gsc_sites FOR SELECT USING (true);
CREATE POLICY "Public GSC Metrics Select Policy" ON public.gsc_daily_metrics FOR SELECT USING (true);
CREATE POLICY "Public GSC Keywords Select Policy" ON public.gsc_keyword_queries FOR SELECT USING (true);

COMMENT ON TABLE public.gmb_locations IS 'Fichas de Empresas no Google Business Profile / Maps';
COMMENT ON TABLE public.gsc_sites IS 'Sites e Domínios no Google Search Console';
