# Arquitetura de Software - Alien OS

O **Alien OS** é o Sistema Operacional de Growth Marketing projetado como um **Centro de Decisão** de alta produtividade. Este documento descreve os princípios arquiteturais, a divisão em camadas e o plano de integração para o backend autônomo com **Supabase**.

---

## 🏗️ Visão Geral das Camadas

```
+-----------------------------------------------------------------------+
|                       Presentation Layer (UI)                         |
|   Next.js App Router (app/), Componentes Reutilizáveis (components/)  |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                         Domain & Data Types                           |
|      Tipos Rígidos TypeScript e Contratos de Negócio (types/)        |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      Repository Abstraction Layer                      |
|       IClientRepository, IAIInsightRepository (lib/repositories)      |
+-----------------------------------------------------------------------+
                                   |
             +---------------------+---------------------+
             |                                           |
             v                                           v
+-------------------------+                 +---------------------------+
|  Mock Data Repository   |                 | Supabase Repository Stub  |
|   (lib/clientsData.ts)  |                 | (Futura Integração SDK)   |
+-------------------------+                 +---------------------------+
```

---

## 🧩 Principais Diretrizes Arquiteturais

1. **Separação de Responsabilidade (Clean Architecture)**:
   - A camada de apresentação (`components/` e `app/`) consome dados exclusivamente por interfaces assíncronas de repositório.
   - Nenhuma lógica de banco de dados fica acoplada diretamente aos componentes de interface.

2. **IA Orientada à Recomendação**:
   - Os módulos do *Alien Intelligence* operam exclusivamente como recomendadores estratégicos.
   - A decisão de aprovar, pausar ou alterar orçamentos permanece 100% no controle do operador humano.

3. **Prontidão para o Supabase (Supabase-Ready)**:
   - Estrutura preparada para autenticação via `auth.users`, banco PostgreSQL e tabelas com Row Level Security (RLS).
   - IDs padronizados em formato UUID.
