import { NextRequest, NextResponse } from "next/server";
import { alienMaxEngine } from "@/lib/ai/alienMaxEngine";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const riskRadar = await alienMaxEngine.generateRiskRadar();

    return NextResponse.json({
      success: true,
      riskRadar,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar radar de risco do Alien Max." },
      { status: 500 }
    );
  }
}
