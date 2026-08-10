import { NextRequest, NextResponse } from "next/server";
import { metaAdsConnector } from "@/lib/connectors/meta/metaAdsConnector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access Token não fornecido para autenticação na Meta Graph API." },
        { status: 400 }
      );
    }

    const accounts = await metaAdsConnector.listAdAccounts(accessToken);

    return NextResponse.json({
      success: true,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar contas de anúncios do Meta Ads." },
      { status: 500 }
    );
  }
}
