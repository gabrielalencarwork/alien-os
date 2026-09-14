-- ==============================================================================
-- Migration: 20260803000026_create_anota_ai_orders.sql
-- Tabela de Pedidos e Vendas de Delivery (Anota AI / POS / Webhooks) — Alien OS
-- Permite receber pedidos via Webhook, armazenar dados completos (cliente, itens, valores)
-- e cruzar com as conversas e campanhas de anúncios para cálculo exato de ROAS.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.anota_ai_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  ad_account_id VARCHAR(100) NOT NULL DEFAULT 'act_1959897601392204', -- ID da conta Meta vinculada (ex: Henrique Food Service)
  external_order_id VARCHAR(100) NOT NULL, -- Código ou ID do pedido no Anota AI (ex: #1042)
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50), -- Telefone formatado (ex: 5511999998888)
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Itens do pedido: [{ name, quantity, price, observation }]
  subtotal NUMERIC(12, 2) DEFAULT 0.00,
  delivery_fee NUMERIC(12, 2) DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00, -- Valor total em R$
  payment_method VARCHAR(100) DEFAULT 'OUTRO', -- PIX, CARTAO, DINHEIRO, etc.
  status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED', -- 'CREATED', 'CONFIRMED', 'FINISHED', 'CANCELED'
  delivery_address JSONB, -- Dados de endereço e bairro
  order_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_anota_ai_order UNIQUE(external_order_id, ad_account_id)
);

-- Índices de busca rápida
CREATE INDEX IF NOT EXISTS idx_anota_ai_orders_account ON public.anota_ai_orders(ad_account_id);
CREATE INDEX IF NOT EXISTS idx_anota_ai_orders_phone ON public.anota_ai_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_anota_ai_orders_date ON public.anota_ai_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_anota_ai_orders_status ON public.anota_ai_orders(status);

-- Desabilitar RLS e liberar permissões para garantir escrita fluida via Webhook
ALTER TABLE IF EXISTS public.anota_ai_orders DISABLE ROW LEVEL SECURITY;
GRANT ALL ON public.anota_ai_orders TO anon, authenticated, service_role;
