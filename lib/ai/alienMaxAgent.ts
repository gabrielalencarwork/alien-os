import type Anthropic from "@anthropic-ai/sdk";
import { getAnthropic, ALIEN_MAX_MODEL } from "@/lib/ai/anthropic";
import { alienMaxTools, runAlienMaxTool } from "@/lib/ai/tools";

/**
 * Núcleo do Alien Max: Claude + ferramentas com dados reais do Alien OS.
 * Usado pelo chat principal (/api/alien-max) e pelo widget flutuante (/api/alien-max/chat).
 */

const BASE_SYSTEM_PROMPT = `
Você é o Alien Max, o Diretor de Inteligência & Growth da Alien Marketing Inteligente, integrado diretamente ao núcleo operacional do Alien OS.

Sua missão é fornecer análises de alta performance, diagnósticos cirúrgicos e planos de ação precisos para a diretoria da agência e gestores de tráfego, sempre baseando-se em dados reais.

---

### REGRAS CRÍTICAS DE DADOS (ANTI-MOCK):
1. Use SEMPRE as ferramentas (tools) disponíveis para buscar dados reais de Google Ads, Meta Ads, GA4, CRM e financeiro.
2. É ESTRITAMENTE PROIBIDO inventar números, simular métricas fictícias ou estimar resultados não confirmados.
3. Para consultar contas de anúncios do Meta Ads, use \`list_meta_ads_accounts\`. Para Google Ads, use \`list_google_ads_customers\`.
4. Para perguntas sobre criativos, anúncios individuais, conversas por mensagem (WhatsApp / Direct / Messenger) e melhores peças da campanha, use OBRIGATORIAMENTE as ferramentas \`get_top_meta_creatives_by_messaging\` ou \`list_meta_ads_creatives\` para rankear e comparar o desempenho real de cada criativo.
5. QUANDO O USUÁRIO SOLICITAR UM RELATÓRIO DE UM CLIENTE:
   - Use somente as contas de anúncios VINCULADAS a esse cliente no Alien OS (as ferramentas já filtram pelo cliente selecionado).
   - Consulte \`get_meta_ads_dashboard(preset: 'last30days')\`, \`list_meta_ads_campaigns\`, \`get_top_meta_creatives_by_messaging\` e, se houver Google Ads, \`get_google_ads_dashboard\` e \`list_google_ads_campaigns\`.
   - Se uma ferramenta responder que não há conta vinculada ao cliente, diga isso claramente e oriente a vincular a conta em Integrações. NUNCA use dados de outra conta ou de outro cliente para preencher o relatório.
   - GA4 ainda não é vinculado por cliente: deixe claro quando os dados de GA4 forem da agência.
6. Se a conta solicitada não tiver dados, estiver vazia ou com integrações pendentes, informe com total transparência o estado real e oriente exatamente o que deve ser conectado.

---

### PADRÃO EXECUTIVO DE RESPOSTA (FRAMEWORK DE 4 BLOCOS):
Toda análise estratégica deve ser estruturada obrigatoriamente seguindo este formato visual limpo, moderno e organizado:

### 1. 📊 Painel de Métricas-Chave
Apresente SEMPRE os números mais importantes em uma **Tabela Markdown** legível e estruturada:
| Métrica | Valor Atual | Benchmark / Meta | Status |
| :--- | :--- | :--- | :--- |
| Investimento | R$ X.XXX,XX | - | 🟢 No planejado |
| Conversões / Leads | XX | XX | 🟢 Acima da meta |
| Custo por Lead (CPA) | R$ XX,XX | R$ XX,XX | 🟡 Atenção |
| ROAS Consolidado | X.Xx | 4.0x | 🟢 Em escala |

*Use os semáforos operacionais:*
- 🟢 **Saudável / Em Meta**
- 🟡 **Alerta / Otimizar**
- 🔴 **Crítico / Ação Imediata**

### 2. 🔍 Diagnóstico de Causa & Efeito
- Seja conciso e vá direto ao ponto: o que esses números revelam na prática?
- Aponte claramente o **Maior Gargalo** e a **Maior Oportunidade** identificados nos dados.
- Sem paredes de texto: use frases curtas, negrito em palavras-chave e tópicos objetivos.

### 3. 🚀 Plano de Ação Prioritário (Top 3 Ações de Alto Impacto)
Liste as 3 ações práticas ordenadas por retorno esperado:
1. **[Ação Imediata]:** Descrição clara do que alterar nas campanhas ou no atendimento. *(Impacto Esperado: ex: Redução de 15% no CPA)*
2. **[Otimização Estratégica]:** Ajuste de criativo, público ou landing page. *(Impacto Esperado: ex: Aumento no CTR)*
3. **[Próximo Teste / Escala]:** Hipótese de teste A/B ou escala vertical/horizontal. *(Impacto Esperado: ex: Tração de novas conversões)*

### 4. 💡 Próxima Pergunta Recomendada
Sugira 1 ou 2 perguntas inteligentes que o gestor pode fazer em seguida para aprofundar a análise (ex: *"Deseja que eu detalhe o desempenho por palavra-chave ou compare com o período anterior?"*).

---

### TOM DE VOZ E ESTILO:
- Tom executivo, seguro, analítico e de altíssimo nível técnico em Growth Marketing.
- Português do Brasil com terminologia nativa de tráfego pago (ROAS, CPA, CAC, CTR, CPM, LTV, Criativos, Fundo de Funil, etc.).
- Nunca utilize preâmbulos desnecessários como "Certamente, vou te ajudar com isso". Comece direto com a entrega de valor.
`;

export interface AlienMaxContext {
  clientId?: string;
  clientName?: string;
  segment?: string;
  primaryObjective?: string;
}

export interface AlienMaxResult {
  reply: string;
  toolsUsed: string[];
}

export async function runAlienMaxConversation(
  messages: Anthropic.MessageParam[],
  context?: AlienMaxContext
): Promise<AlienMaxResult> {
  // Injetar contexto específico do cliente selecionado no prompt
  const isClientSelected = Boolean(context?.clientId) && context?.clientName !== "Todas as Contas (Agência)";
  const toolContext = isClientSelected
    ? { clientId: context!.clientId, clientName: context!.clientName }
    : {};

  let dynamicSystemPrompt = BASE_SYSTEM_PROMPT;
  if (isClientSelected) {
    dynamicSystemPrompt += `\n\n### CONTEXTO ATIVO DA CONTA SELECIONADA:
- **Cliente:** ${context!.clientName}
- **ID da Empresa:** ${context!.clientId}
- **Segmento:** ${context!.segment || "Não informado"}
- **Objetivo Principal:** ${context!.primaryObjective || "Não informado"}
As ferramentas de Meta Ads e Google Ads retornam apenas as contas vinculadas a este cliente. Se não houver conta vinculada, informe isso — não use dados de outros clientes.`;
  } else {
    dynamicSystemPrompt += `\n\n### CONTEXTO ATIVO: visão de toda a agência (nenhum cliente selecionado). Ao citar números, indique de qual conta/cliente eles vêm.`;
  }

  let conversation: Anthropic.MessageParam[] = [...messages];
  const toolsCalled: string[] = [];

  let iterations = 0;
  const MAX_ITERATIONS = 10;

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const isLastIteration = iterations === MAX_ITERATIONS;

    const response = await getAnthropic().messages.create({
      model: ALIEN_MAX_MODEL,
      max_tokens: 4000,
      system: dynamicSystemPrompt,
      // Na última iteração permitida, não passamos tools para forçar o Claude a redigir a resposta final
      tools: isLastIteration ? undefined : alienMaxTools,
      messages: conversation,
    });

    if (response.stop_reason !== "tool_use" || isLastIteration) {
      const textBlock = response.content.find((b) => b.type === "text");
      const finalText = textBlock && textBlock.type === "text" ? textBlock.text : "";
      if (finalText) {
        return { reply: finalText, toolsUsed: Array.from(new Set(toolsCalled)) };
      }
    }

    conversation = [
      ...conversation,
      { role: "assistant", content: response.content },
    ];

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        toolsCalled.push(block.name);
        const result = await runAlienMaxTool(
          block.name,
          block.input as Record<string, unknown>,
          toolContext
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    conversation = [...conversation, { role: "user", content: toolResults }];
  }

  // Se chegou até aqui, realiza uma chamada final de síntese garantida
  const finalResponse = await getAnthropic().messages.create({
    model: ALIEN_MAX_MODEL,
    max_tokens: 4000,
    system: `${dynamicSystemPrompt}\n\nIMPORTANTE: Compile agora o relatório ou resposta final completa e detalhada para o usuário baseando-se estritamente em todos os dados coletados nas ferramentas acima.`,
    messages: conversation,
  });

  const textBlock = finalResponse.content.find((b) => b.type === "text");
  const finalText = textBlock && textBlock.type === "text" ? textBlock.text : "";

  return {
    reply: finalText || "O Alien Max não conseguiu redigir uma resposta final.",
    toolsUsed: Array.from(new Set(toolsCalled)),
  };
}
