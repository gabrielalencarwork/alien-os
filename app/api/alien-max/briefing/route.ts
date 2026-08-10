import { NextRequest, NextResponse } from "next/server";
import { alienMaxEngine } from "@/lib/ai/alienMaxEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const briefing = await alienMaxEngine.generateExecutiveDailyBriefing();

    return NextResponse.json({
      success: true,
      briefing,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao gerar briefing diário do Alien Max." },
      { status: 500 }
    );
  }
}
