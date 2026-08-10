# Roadmap Técnico de Desenvolvimento - Alien OS

Este documento mapeia o plano de evolução técnica e as próximas sprints do **Alien OS**.

---

## 🚩 Fases do Projeto

### Sprint 01-04 (Concluídas)
- [x] Design System & Identidade Visual (Verde `#4A8237`, Preto `#111111`, Branco `#FFFFFF`)
- [x] Dashboard Inicial & Centro de Decisão de Growth
- [x] Central de Clientes 360° (Jornada de Abdução, Alien Intelligence, Serviços e Documentos)
- [x] Modelagem de Tipos TypeScript & Arquitetura Supabase-Ready

### Sprint 05 (Próxima)
- [ ] Ativação do SDK `@supabase/supabase-js`
- [ ] Conexão com Supabase Auth (Login/Signup e Perfil de Usuário)
- [ ] Migração da classe `MockClientRepository` para `SupabaseClientRepository`
- [ ] Integração com Storage Buckets para upload real de documentos de clientes

### Sprint 06 (Automação & Realtime)
- [ ] Webhooks para captura de métricas do Meta Ads, Google Ads e Shopify
- [ ] Notificações em Tempo Real via Supabase Realtime (WebSockets)
- [ ] Motor Autônomo de Sugestões da IA via Edge Functions
