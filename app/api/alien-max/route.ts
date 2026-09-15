import { anthropic, ALIEN_MAX_MODEL } from "@/lib/ai/anthropic";
import { alienMaxTools, runAlienMaxTool } from "@/lib/ai/tools";
import type Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const ALIEN_MAX_SYSTEM_PROMPT = `
Você é o Alien Max, o copiloto de inteligência artificial da Alien Marketing Inteligente,
integrado ao Alien OS.

Você tem acesso a dados reais de campanhas de mídia paga, CRM e financeiro através de tools.
Sempre que precisar de um dado específico, use a tool correspondente em vez de estimar
ou inventar números. Se não tiver certeza de qual cliente o usuário está se referindo,
pergunte antes de chamar uma tool.

Responda em português do Brasil, em tom direto e executivo, como um analista de growth
experiente. Seja objetivo: números primeiro, interpretação depois.
`;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: Anthropic.MessageParam[];
  };

  let conversation: Anthropic.MessageParam[] = [...messages];

  while (true) {
    const response = await anthropic.messages.create({
      model: ALIEN_MAX_MODEL,
      max_tokens: 2048,
      system: ALIEN_MAX_SYSTEM_PROMPT,
      tools: alienMaxTools,
      messages: conversation,
    });

    if (response.stop_reason !== "tool_use") {
      const textBlock = response.content.find((b) => b.type === "text");
      const finalText =
        textBlock && textBlock.type === "text" ? textBlock.text : "";
      return Response.json({ reply: finalText });
    }

    conversation = [
      ...conversation,
      { role: "assistant", content: response.content },
    ];

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
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
}
