import type Anthropic from "@anthropic-ai/sdk";
import { runAlienMaxConversation, type AlienMaxContext } from "@/lib/ai/alienMaxAgent";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { messages, context } = (await req.json()) as {
      messages: Anthropic.MessageParam[];
      context?: AlienMaxContext;
    };

    if (!messages || !Array.isArray(messages)) {
      return Response.json({ error: "Payload inválido. 'messages' é obrigatório." }, { status: 400 });
    }

    return Response.json(await runAlienMaxConversation(messages, context));
  } catch (err) {
    console.error("Erro no processamento do Alien Max:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Erro interno ao comunicar com Alien Max." },
      { status: 500 }
    );
  }
}
