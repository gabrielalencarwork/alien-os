import { anthropic, ALIEN_MAX_MODEL } from "@/lib/ai/anthropic";
import { alienMaxTools, runAlienMaxTool } from "@/lib/ai/tools";
import type Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const BASE_SYSTEM_PROMPT = `
Você é o Alien Max, o Diretor de Inteligência & Growth da Alien Marketing Inteligente, integrado diretamente ao núcleo operacional do Alien OS.

Sua missão é fornecer análises de alta performance, diagnósticos cirúrgicos e planos de ação precisos para a diretoria da agência e gestores de tráfego, sempre baseando-se em dados reais.

---

### REGRAS CRÍTICAS DE DADOS (ANTI-MOCK):
1. Use SEMPRE as ferramentas (tools) disponíveis para buscar dados reais de Google Ads, Meta Ads, GA4, CRM e financeiro.
2. É ESTRITAMENTE PROIBIDO inventar números, simular métricas fictícias ou estimar resultados não confirmados.
3. Se a conta solicitada não tiver dados, estiver vazia ou com integrações pendentes, informe com total transparência o estado real e oriente exatamente o que deve ser conectado.
4. Se o usuário fizer uma pergunta geral e nenhum cliente for especificado no contexto, liste os clientes disponíveis ou pergunte qual conta ele deseja analisar.

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

export async function POST(req: Request) {
  try {
    const { messages, context } = (await req.json()) as {
      messages: Anthropic.MessageParam[];
      context?: {
        clientId?: string;
        clientName?: string;
        segment?: string;
        primaryObjective?: string;
      };
    };

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Payload inválido. 'messages' é obrigatório." }, { status: 400 });
    }

    // Injetar contexto específico do cliente selecionado no prompt
    let dynamicSystemPrompt = BASE_SYSTEM_PROMPT;
    if (context?.clientName && context.clientName !== "Todas as Contas (Agência)") {
      dynamicSystemPrompt += `\n\n### CONTEXTO ATIVO DA CONTA SELECIONADA:
- **Cliente:** ${context.clientName}
- **ID da Empresa:** ${context.clientId || "N/A"}
- **Segmento:** ${context.segment || "Não informado"}
- **Objetivo Principal:** ${context.primaryObjective || "Crescimento e escala previsível"}
Foque a resposta e as consultas de ferramentas prioritariamente nesta conta.`;
    }

    let conversation: Anthropic.MessageParam[] = [...messages];
    const toolsCalled: string[] = [];

    let iterations = 0;
    const MAX_ITERATIONS = 5;

    while (iterations < MAX_ITERATIONS) {
      iterations++;

      const response = await anthropic.messages.create({
        model: ALIEN_MAX_MODEL,
        max_tokens: 2500,
        system: dynamicSystemPrompt,
        tools: alienMaxTools,
        messages: conversation,
      });

      if (response.stop_reason !== "tool_use") {
        const textBlock = response.content.find((b) => b.type === "text");
        const finalText = textBlock && textBlock.type === "text" ? textBlock.text : "";
        return Response.json({
          reply: finalText,
          toolsUsed: Array.from(new Set(toolsCalled)),
        });
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
            block.input as Record<string, unknown>
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

    return Response.json({
      reply: "Limite de processamento de ferramentas atingido. Por favor, reformule sua solicitação.",
      toolsUsed: Array.from(new Set(toolsCalled)),
    });
  } catch (err: any) {
    console.error("Erro no processamento do Alien Max:", err);
    return Response.json(
      { error: err?.message || "Erro interno ao comunicar com Alien Max." },
      { status: 500 }
    );
  }
}
