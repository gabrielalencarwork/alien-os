import { NextRequest, NextResponse } from "next/server";
import { metaAdsConnector } from "@/lib/connectors/meta/metaAdsConnector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, adAccountId } = await req.json();

    if (!accessToken || !adAccountId) {
      return NextResponse.json(
        { error: "Access Token e Ad Account ID são obrigatórios." },
        { status: 400 }
      );
    }

    const adSets = await metaAdsConnector.fetchAdSets(accessToken, adAccountId);

    return NextResponse.json({
      success: true,
      adSets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar conjuntos de anúncios do Meta Ads." },
      { status: 500 }
    );
  }
}
