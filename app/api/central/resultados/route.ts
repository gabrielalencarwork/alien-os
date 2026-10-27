import { NextResponse } from "next/server";
import { getClientResults } from "@/lib/central/clientResults";
import { attachMetaHealth } from "@/lib/connectors/meta/accountHealth";

export const dynamic = "force-dynamic";

/** Resultados dos últimos 7 dias de cada cliente (Meta Ads + Google Ads), vindos do Supabase,
 * mais o status e o saldo das contas Meta, lidos ao vivo. */
export async function GET() {
  try {
    const data = await getClientResults();
    await attachMetaHealth(data.clients);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: `Não foi possível calcular os resultados: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
