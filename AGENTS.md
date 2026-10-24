<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:alien-os-data-rules -->
# REGRA MANDATÓRIA: PROIBIÇÃO ABSOLUTA DE DADOS FICTÍCIOS / MOCK DATA

1. **Exclusividade de Dados Reais**:
   - Todo o sistema Alien OS deve operar EXCLUSIVAMENTE com dados reais vindos do Supabase e das integrações de APIs conectadas (Google Ads, Meta Ads, Google Analytics, etc.).
   - É terminantemente PROIBIDO criar dados fictícios, hardcoded, arrays de mock, constantes de fallback ou gerar métricas sintéticas / fórmulas de escalonamento inventadas no frontend ou backend.

2. **Empty States Obrigatórios (Estados Vazios)**:
   - Quando uma tabela ou consulta ao banco estiver vazia, ou quando uma integração ainda não tiver sincronizado dados, o sistema DEVE SEMPRE exibir um Empty State (estado vazio) amigável e explicativo com botões de ação (ex: "Sincronizar Agora", "Novo Cliente", "Criar Campanha").
   - Métricas agregadas de contas vazias devem exibir `0` (ex: R$ 0,00, 0 impressões, 0 conversões, 0.0x ROAS).

3. **Transparência de Erros e Logs**:
   - Falhas de conexão, tokens expirados, erros de permissão ou falta de autorização de API devem ser reportados com suas mensagens reais de erro para permitir a correção pelo usuário, NUNCA mascarados por dados simulados.
<!-- END:alien-os-data-rules -->


<!-- BEGIN:alien-os-quality-rules -->
# VERIFICAÇÃO OBRIGATÓRIA ANTES DE ENTREGAR

1. `npx tsc --noEmit` deve terminar sem erros. O build (`next build`) também roda a checagem de tipos — **nunca** reative `typescript.ignoreBuildErrors`.
2. Valores de status, prioridade, tipo e etapa devem seguir os valores canônicos documentados nas migrations (`supabase/migrations`). Use as funções `normalize*` dos repositórios ao ler dados do banco.
3. Formulários de criação gravam no Supabase e exibem o erro real em caso de falha. Nunca simule sucesso com `setTimeout` nem adicione itens só no estado local.
<!-- END:alien-os-quality-rules -->
