import { NextRequest, NextResponse } from "next/server";
import { runAlienMaxConversation } from "@/lib/ai/alienMaxAgent";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Chat rápido do widget flutuante. Usa o mesmo Alien Max real (Claude + ferramentas)
 * do chat principal. Antes, este endpoint devolvia relatórios montados por palavras-chave,
 * que rotulavam todos os dados do Meta Ads como se fossem do Henrique Food Service.
 */
export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "O prompt da mensagem é obrigatório." }, { status: 400 });
    }

    const result = await runAlienMaxConversation([{ role: "user", content: String(prompt) }]);

    if (conversationId) {
      const supabase = createServerClient();
      await supabase.from("alien_max_messages").insert([
        { conversation_id: conversationId, sender: "USER", content: prompt },
        {
          conversation_id: conversationId,
          sender: "ALIEN_MAX",
          content: result.reply,
          metadata_json: { toolsUsed: result.toolsUsed },
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      response: { replyText: result.reply, suggestedActions: [], toolsUsed: result.toolsUsed },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no processamento da mensagem do Alien Max." },
      { status: 500 }
    );
  }
}
