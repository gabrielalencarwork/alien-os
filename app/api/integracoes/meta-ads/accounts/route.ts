import { NextRequest, NextResponse } from "next/server";
import { metaAdsConnector } from "@/lib/connectors/meta/metaAdsConnector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken, specificAccountId } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access Token não fornecido para autenticação na Meta Graph API." },
        { status: 400 }
      );
    }

    let accounts = await metaAdsConnector.listAdAccounts(accessToken);

    // Se o usuário passou um ID específico e ele não veio na lista automática
    if (specificAccountId) {
      const cleanSpecific = specificAccountId.startsWith("act_") ? specificAccountId : `act_${specificAccountId}`;
      const alreadyInList = accounts.some(a => a.accountId === cleanSpecific);
      if (!alreadyInList) {
        const specific = await metaAdsConnector.getAdAccount(accessToken, cleanSpecific);
        if (specific) {
          accounts = [specific, ...accounts];
        }
      }
    }

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
