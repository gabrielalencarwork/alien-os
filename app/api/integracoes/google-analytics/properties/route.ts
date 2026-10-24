import { NextRequest, NextResponse } from "next/server";
import { ga4Connector } from "@/lib/connectors/google/ga4Connector";
import { getServerGoogleAccessToken, GA4_SCOPE } from "@/lib/connectors/google/googleConnectionStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    // Sem token do navegador, usa a conexão Google guardada no servidor.
    const accessToken = body.accessToken || (await getServerGoogleAccessToken(GA4_SCOPE))?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Nenhuma conta Google conectada ao Alien OS. Clique em 'Conectar conta Google' para autorizar." },
        { status: 400 }
      );
    }

    const properties = await ga4Connector.listProperties(accessToken);

    return NextResponse.json({
      success: true,
      properties,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao consultar propriedades do GA4." },
      { status: 500 }
    );
  }
}
