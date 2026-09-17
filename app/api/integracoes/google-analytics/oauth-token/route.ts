/**
 * API Route: Troca de Code OAuth → Access Token (Google Analytics 4)
 * Executado server-side para não expor client_secret no navegador.
 * Usa GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET do ambiente.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { code, redirectUri: customRedirectUri } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Código de autorização OAuth não fornecido." },
        { status: 400 }
      );
    }

    let clientId =
      process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    // Auto-correção dinâmica caso a Vercel ainda possua o Client ID salvo com as letras trocadas ('s' em vez de 'a')
    if (clientId) {
      clientId = clientId.replace("ustr", "uatr").replace("jsu0", "jau0");
    }

    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        {
          error:
            "GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configurados nas variáveis de ambiente.",
        },
        { status: 500 }
      );
    }

    // Redirect URI deve ser exatamente o mesmo usado ao gerar a URL de autorização
    const redirectUri =
      customRedirectUri ||
      `${process.env.NEXT_PUBLIC_APP_URL || "https://os.alienmkt.com.br"}/integracoes/google-analytics/oauth-callback`;

    // Trocar code por access_token + refresh_token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      console.error("Erro no token exchange do Google OAuth:", errText);
      return NextResponse.json(
        { error: `Falha ao trocar código por token: ${errText}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Google OAuth não retornou access_token." },
        { status: 400 }
      );
    }

    // Buscar email da conta autenticada via Google userinfo
    let email = "";
    try {
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        email = userData.email || "";
      }
    } catch {
      // Email é opcional
    }

    return NextResponse.json({
      success: true,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token || null,
      expiresIn: tokenData.expires_in || 3600,
      email,
    });
  } catch (error: any) {
    console.error("Erro no oauth-token exchange GA4:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao processar autenticação OAuth." },
      { status: 500 }
    );
  }
}
