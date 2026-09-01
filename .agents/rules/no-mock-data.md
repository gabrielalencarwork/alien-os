# Diretriz de Desenvolvimento: Proibição Estrita de Dados Mockados e Fictícios

## Princípio
O Alien OS é uma plataforma de gestão e automação de operações de marketing e tráfego pago baseada em dados reais. A inserção de dados fictícios cria falsas impressões de desempenho e impede o diagnóstico correto de integrações.

## Regras
1. **Dados Reais Apenas**: Qualquer leitura deve ser feita exclusivamente no Supabase ou diretamente nos conectores de API oficiais (Google Ads, Meta Ads, etc.).
2. **Zero Fallbacks Sintéticos**: Em caso de retorno vazio ou erro na API/Banco, não gere arrays fictícios, clientes simulados ou métricas calculadas com fórmulas aleatórias.
3. **Empty States Explicativos**: Sempre implemente componentes de Empty State informando o usuário sobre a necessidade de sincronizar ou cadastrar registros reais.
4. **Mensagens de Erro Transparentes**: Exiba a mensagem de erro original da API ou instrução clara sobre a causa do erro (ex: Token sem permissão, MCC incorreto).
