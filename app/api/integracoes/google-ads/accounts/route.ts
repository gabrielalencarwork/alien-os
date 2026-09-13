import { NextRequest, NextResponse } from "next/server";
import { googleAdsConnector } from "@/lib/connectors/google/googleAdsConnector";
import { googleAuthConnector } from "@/lib/connectors/google/googleAuthConnector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, developerToken, refreshToken } = await req.json();

    if (!accessToken && !refreshToken) {
      return NextResponse.json(
        { error: "Access Token ou Refresh Token não fornecido para autenticação no Google Ads." },
        { status: 400 }
      );
    }

    let tokenToUse = accessToken;
    let newAccessToken: string | undefined = undefined;

    // Se não tiver accessToken mas tiver refreshToken, renova antes de chamar
    if (!tokenToUse && refreshToken) {
      try {
        tokenToUse = await googleAuthConnector.refreshAccessToken(refreshToken);
        newAccessToken = tokenToUse;
      } catch (refErr: any) {
        return NextResponse.json(
          { error: `Falha ao renovar token OAuth: ${refErr.message}`, errorCode: "UNAUTHENTICATED" },
          { status: 401 }
        );
      }
    }

    let customers: any[] = [];
    try {
      customers = await googleAdsConnector.listCustomers(tokenToUse, developerToken);
    } catch (listErr: any) {
      const errStr = String(listErr?.message || "").toUpperCase();
      const isAuthErr =
        errStr.includes("UNAUTHENTICATED") ||
        errStr.includes("401") ||
        errStr.includes("INVALID AUTHENTICATION CREDENTIALS") ||
        errStr.includes("INVALID_CREDENTIALS") ||
        errStr.includes("OAUTH 2 ACCESS TOKEN");

      // Auto-refresh se o token atual expirou e temos o refreshToken permanente
      if (isAuthErr && refreshToken) {
        console.log("Token OAuth expirado em /accounts. Tentando renovação automática com refreshToken...");
        try {
          tokenToUse = await googleAuthConnector.refreshAccessToken(refreshToken);
          newAccessToken = tokenToUse;
          customers = await googleAdsConnector.listCustomers(tokenToUse, developerToken);
        } catch (retryErr: any) {
          throw listErr; // Se falhar a renovação, lança o erro original
        }
      } else {
        throw listErr;
      }
    }

    return NextResponse.json({
      success: true,
      customers,
      newAccessToken,
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
