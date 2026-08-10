# Pasta de Tipos e Definições (`/types`)

Esta pasta contém o modelo de dados em TypeScript para o **Alien OS**.

## 📌 Convenções e Regras

1. **Separação por Domínio**: Cada arquivo neste diretório define um domínio de negócio claro (ex: `cliente.ts`, `campanha.ts`, `insightIA.ts`).
2. **Compatibilidade com Supabase**: Todos os IDs são tipados como `string` para suportar UUIDv4 do PostgreSQL.
3. **Consumo Centralizado**: Prefira importar tipos diretamente de `@/types` (ex: `import { Cliente, InsightIA } from '@/types';`).
4. **Imutabilidade**: Os contratos deste diretório servem de ponte entre a UI e a camada de repositório (`/lib/repositories`).
