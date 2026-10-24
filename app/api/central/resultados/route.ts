import { NextResponse } from "next/server";
import { getClientResults } from "@/lib/central/clientResults";

export const dynamic = "force-dynamic";

/** Resultados dos últimos 7 dias de cada cliente (Meta Ads + Google Ads), vindos do Supabase. */
export async function GET() {
  try {
    const data = await getClientResults();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: `Não foi possível calcular os resultados: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
