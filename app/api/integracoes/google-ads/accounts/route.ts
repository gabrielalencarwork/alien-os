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
    const rawMsg = error?.message || "Erro ao consultar contas do Google Ads.";
    const upper = rawMsg.toUpperCase();

    if (
      upper.includes("UNAUTHENTICATED") ||
      upper.includes("401") ||
      upper.includes("INVALID AUTHENTICATION CREDENTIALS") ||
      upper.includes("INVALID_CREDENTIALS") ||
      upper.includes("OAUTH 2 ACCESS TOKEN")
    ) {
      return NextResponse.json(
        {
          error: "Sessão Google Ads expirada. O token OAuth de acesso possui validade temporária de 1 hora e precisa ser renovado.",
          errorCode: "UNAUTHENTICATED",
          tip: "Clique no botão 'Conectar Conta Google Ads (OAuth 2.0)' para renovar a autenticação com 1 clique.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: rawMsg },
      { status: 500 }
    );
  }
}
