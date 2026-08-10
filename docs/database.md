# Arquitetura de Banco de Dados PostgreSQL (Supabase) - Alien OS

Este documento descreve a arquitetura relacional definitiva do banco de dados do **Alien OS**, projetada para alta escalabilidade SaaS, auditoria em todas as tabelas, índices de alta performance e segurança refinada via Row Level Security (RLS).

---

## 📂 Estrutura de Migrations SQL (`/supabase/migrations/`)

A evolução do banco de dados é versionada via scripts SQL em `/supabase/migrations/`:

1. **`20260730000001_initial_core_schema.sql`**: Extensões PostgreSQL (`uuid-ossp`, `pgcrypto`) e trigger genérica de auditoria `update_updated_at_column()`.
2. **`20260730000002_create_all_tables.sql`**: Criação das 17 tabelas normalizadas com comentários SQL em cada tabela.
3. **`20260730000003_foreign_keys_and_indexes.sql`**: Definição de todas as constraints de Chave Estrangeira (FKs), índices B-tree de performance e triggers de auditoria em todas as tabelas.
4. **`20260730000004_rls_and_role_policies.sql`**: Habilitação de RLS e criação de políticas de acesso para **Administrador**, **Gestor de Tráfego** e **Social Media**.

---

## 🗄️ As 17 Tabelas do Sistema

Toda tabela no sistema possui obrigatoriamente os seguintes campos padrão de auditoria:
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `updated_at`: `TIMESTAMPTZ DEFAULT NOW() NOT NULL`
- `created_by`: `UUID REFERENCES auth.users(id)`
- `updated_by`: `UUID REFERENCES auth.users(id)`
- `active`: `BOOLEAN DEFAULT TRUE NOT NULL`

### Resumo do Modelo Relacional

| Tabela | Domínio / Propósito |
| :--- | :--- |
| **`profiles`** | Extensão dos usuários do `auth.users` com papéis de acesso. |
| **`companies`** | Empresas e marcas atendidas pela agência de Growth. |
| **`company_contacts`** | Contatos chave e tomadores de decisão em cada empresa. |
| **`services`** | Catálogo master de serviços da agência. |
| **`company_services`** | Serviços contratados por cada cliente com responsável e status. |
| **`projects`** | Projetos e frentes operacionais por empresa. |
| **`tasks`** | Demandas e entregáveis prioritários com SLA e impacto. |
| **`campaigns`** | Campanhas de tráfego pago em Meta, Google e TikTok Ads. |
| **`metrics`** | Métricas diárias de investimento, receita, ROAS, CAC e conversão. |
| **`meetings`** | Agendamentos e reuniões com resumo e pauta. |
| **`documents`** | Arquivos, briefings e contratos vinculados ao Supabase Storage. |
| **`timeline`** | Log cronológico de eventos e marcos da Jornada de Abdução. |
| **`financial_records`** | Dados financeiros, faturamento MRR, LTV e ciclo de cobrança. |
| **`ai_insights`** | Diagnósticos e recomendações estratégicas gerados pela IA. |
| **`alien_dna`** | DNA de marca, tom de voz, personas e concorrentes da empresa. |
| **`alien_scores`** | Histórico de avaliação de maturidade operacional (Alien Score). |
| **`health_scores`** | Indicadores de saúde do projeto e planos de prevenção de churn. |

---

## 🛡️ Políticas de Acesso RLS (Row Level Security)

- **Administrador**: Possui acesso total (SELECT, INSERT, UPDATE, DELETE) a todas as 17 tabelas.
- **Gestor de Tráfego**: Acesso operacional às tabelas `companies`, `company_services`, `projects`, `tasks`, `campaigns`, `metrics`, `timeline`, `ai_insights`, `alien_scores` e `health_scores`.
- **Social Media**: Acesso operacional às tabelas `companies`, `company_services`, `projects`, `tasks`, `documents`, `timeline` e `alien_dna`.
