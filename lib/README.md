# Camada de Dados e Lógica de Negócio (`/lib`)

A pasta `/lib` contém a infraestrutura de dados, repositórios e clientes de serviços externos do **Alien OS**.

## 📁 Estrutura do Diretório

- **`/lib/clientsData.ts`**: Fonte de dados fictícios rica para demonstrações e testes em memória.
- **`/lib/repositories`**: Abstração da Camada de Acesso a Dados (*Data Access Layer*).
  - Define interfaces assíncronas (`IClientRepository`).
  - Implementa a classe em memória (`MockClientRepository`).
  - Preparado para injeção da classe `SupabaseClientRepository` no futuro.

## 🚀 Padrão de Utilização Futura com Supabase

```typescript
// Exemplo de troca transparente quando o Supabase for ativado:
// export const clientRepository: IClientRepository = new SupabaseClientRepository();
```
