import { NextRequest, NextResponse } from "next/server";
import { ga4Connector } from "@/lib/connectors/google/ga4Connector";

export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access Token não fornecido para autenticação no GA4." },
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
