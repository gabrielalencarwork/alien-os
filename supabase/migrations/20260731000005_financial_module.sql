-- ==============================================================================
-- Migration: 20260731000005_financial_module.sql
-- Módulo Financeiro da Agência (Alien OS)
-- Tabelas: contracts, invoices, payments, adjustments
-- ==============================================================================

-- 1. Tabela contracts (Contratos)
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contract_number VARCHAR(50) NOT NULL UNIQUE,
  monthly_value NUMERIC(12, 2) NOT NULL,
  start_date DATE NOT NULL,
  duration_months INT NOT NULL DEFAULT 12,
  renewal_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Ativo', -- 'Ativo', 'Em Renovação', 'Cancelado', 'Encerrado'
  pdf_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 2. Tabela invoices (Faturas e Mensalidades)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  amount NUMERIC(12, 2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Pendente', -- 'Pago', 'Pendente', 'A Vencer', 'Em Atraso', 'Cancelado'
  payment_method VARCHAR(50) DEFAULT 'PIX / Boleto',
  services_summary TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Tabela payments (Pagamentos efetuados)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount_paid NUMERIC(12, 2) NOT NULL,
  paid_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  payment_method VARCHAR(50) NOT NULL DEFAULT 'PIX',
  transaction_id VARCHAR(100),
  gateway_name VARCHAR(50) DEFAULT 'Manual', -- 'Asaas', 'Stripe', 'Mercado Pago', 'InfinitePay', 'Manual'
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 4. Tabela adjustments (Histórico de Reajustes de Ticket)
CREATE TABLE IF NOT EXISTS public.adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(30) NOT NULL DEFAULT 'Anual (IGPM/IPCA)',
  percentage NUMERIC(5, 2) NOT NULL,
  old_value NUMERIC(12, 2) NOT NULL,
  new_value NUMERIC(12, 2) NOT NULL,
  effective_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by UUID,
  updated_by UUID,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Habilitar RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adjustments ENABLE ROW LEVEL SECURITY;

-- Políticas genéricas de acesso RLS para usuários autenticados
CREATE POLICY "Public Contracts Select Policy" ON public.contracts FOR SELECT USING (true);
CREATE POLICY "Public Invoices Select Policy" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Public Payments Select Policy" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public Adjustments Select Policy" ON public.adjustments FOR SELECT USING (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_contracts_company ON public.contracts(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON public.invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);

COMMENT ON TABLE public.contracts IS 'Contratos financeiros ativos e inativos de clientes da Alien OS';
COMMENT ON TABLE public.invoices IS 'Faturas e mensalidades de cobrança recorrente';
COMMENT ON TABLE public.payments IS 'Registros de pagamentos processados via gateway ou manual';
COMMENT ON TABLE public.adjustments IS 'Histórico de reajustes anuais de ticket';
