import { NextRequest, NextResponse } from "next/server";
import { alienMaxEngine } from "@/lib/ai/alienMaxEngine";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationId } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "O prompt da mensagem é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 1. Processar resposta conversacional via Engine Core
    const aiResponse = await alienMaxEngine.processNaturalLanguageQuery(prompt);

    // 2. Salvar histórico no Supabase se existir conversationId
    if (conversationId) {
      await supabase.from("alien_max_messages").insert([
        {
          conversation_id: conversationId,
          sender: "USER",
          content: prompt,
        },
        {
          conversation_id: conversationId,
          sender: "ALIEN_MAX",
          content: aiResponse.replyText,
          metadata_json: {
            suggestedActions: aiResponse.suggestedActions,
            confidenceScore: aiResponse.confidenceScore,
          },
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro no processamento da mensagem do Alien Max." },
      { status: 500 }
    );
  }
}
