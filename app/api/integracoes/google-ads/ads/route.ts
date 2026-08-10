import { NextRequest, NextResponse } from "next/server";
import { googleAdsConnector } from "@/lib/connectors/google/googleAdsConnector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, customerId, developerToken } = await req.json();

    if (!accessToken || !customerId) {
      return NextResponse.json(
        { error: "Access Token e Customer ID são obrigatórios." },
        { status: 400 }
      );
    }

    const ads = await googleAdsConnector.listAds(accessToken, customerId, developerToken);

    return NextResponse.json({
      success: true,
      ads,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar anúncios do Google Ads." },
      { status: 500 }
    );
  }
}
