import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Integração ainda não implementada: responde com erro real em vez de gravar dados de exemplo. */
export async function POST() {
  return NextResponse.json(
    { error: "A integração Google Meu Negócio ainda não está implementada no Alien OS." },
    { status: 501 }
  );
}
