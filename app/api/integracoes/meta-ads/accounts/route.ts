import { NextRequest, NextResponse } from "next/server";
import { metaAdsConnector } from "@/lib/connectors/meta/metaAdsConnector";

export async function GET() {
  try {
    const envToken = process.env.META_SYSTEM_USER_TOKEN;
    if (!envToken) {
      return NextResponse.json({ configured: false, accounts: [] });
    }

    const accounts = await metaAdsConnector.listAdAccounts(envToken);
    return NextResponse.json({
      configured: true,
      tokenPreview: `${envToken.slice(0, 10)}...${envToken.slice(-6)}`,
      accounts,
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      error: error?.message || "Erro ao consultar contas com META_SYSTEM_USER_TOKEN",
      accounts: [],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const accessToken = body.accessToken || process.env.META_SYSTEM_USER_TOKEN;
    const { specificAccountId } = body;

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
