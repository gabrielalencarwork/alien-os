import { NextRequest, NextResponse } from "next/server";
import { googleAdsConnector } from "@/lib/connectors/google/googleAdsConnector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, developerToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access Token não fornecido para autenticação no Google Ads." },
        { status: 400 }
      );
    }

    const customers = await googleAdsConnector.listCustomers(accessToken, developerToken);

    return NextResponse.json({
      success: true,
      customers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar contas do Google Ads." },
      { status: 500 }
    );
  }
}
