-- ==============================================================================
-- Migration: 20260803000006_document_center.sql
-- Central Inteligente de Documentos (Alien OS)
-- Tabelas: folders, documents, document_versions, storage_links
-- ==============================================================================

-- 1. Tabela folders (Pastas e Categorias no Repositório)
CREATE TABLE IF NOT EXISTS public.folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela documents (Registro Principal de Documentos e Arquivos)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'Outros', -- 'Contratos', 'Briefings', 'Branding', 'Identidade Visual', 'Logos', 'Sites', 'Landing Pages', 'Criativos', 'Social Media', 'Google Ads', 'Meta Ads', 'Vídeos', 'Fotografias', 'Relatórios', 'Apresentações', 'Outros'
  file_type VARCHAR(20) NOT NULL DEFAULT 'pdf', -- 'pdf', 'png', 'jpg', 'svg', 'ai', 'psd', 'docx', 'xlsx', 'pptx', 'zip', 'mp4'
  file_size BIGINT NOT NULL DEFAULT 0, -- Bytes
  current_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  storage_path TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL DEFAULT 'Equipe Alien OS',
  linked_type VARCHAR(50) DEFAULT 'Cliente', -- 'Cliente', 'Projeto', 'Serviço', 'Campanha', 'Reunião'
  linked_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela document_versions (Histórico de Versionamento)
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_label VARCHAR(20) NOT NULL DEFAULT 'v1.0',
  file_size BIGINT NOT NULL DEFAULT 0,
  storage_path TEXT NOT NULL,
  author_name VARCHAR(100) NOT NULL DEFAULT 'Equipe Alien OS',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela storage_links (Vínculos com Buckets do Supabase Storage)
CREATE TABLE IF NOT EXISTS public.storage_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  bucket_name VARCHAR(100) NOT NULL DEFAULT 'clientes',
  full_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_links ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso RLS para usuários autenticados
CREATE POLICY "Public Folders Select Policy" ON public.folders FOR SELECT USING (true);
CREATE POLICY "Public Documents Select Policy" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public Document Versions Select Policy" ON public.document_versions FOR SELECT USING (true);
CREATE POLICY "Public Storage Links Select Policy" ON public.storage_links FOR SELECT USING (true);

-- Índices de alta performance
CREATE INDEX IF NOT EXISTS idx_documents_company ON public.documents(company_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON public.documents(file_type);
CREATE INDEX IF NOT EXISTS idx_doc_versions_document ON public.document_versions(document_id);

COMMENT ON TABLE public.folders IS 'Pastas organizacionais do repositório da agência';
COMMENT ON TABLE public.documents IS 'Documentos, briefings, artes e mídias da agência Alien Marketing';
COMMENT ON TABLE public.document_versions IS 'Histórico completo de versionamento de arquivos (v1, v2, Final)';
COMMENT ON TABLE public.storage_links IS 'Endereçamento de objetos no Supabase Storage';
