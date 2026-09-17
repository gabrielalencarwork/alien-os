/**
 * Connector Module: Google Auth Connector (Alien OS)
 * Centraliza a comunicação de autenticação, escopos e requisições HTTP para a infraestrutura do Google APIs.
 * Utilizado por GA4, Google Ads, Search Console e Google Business Profile.
 */

export const GOOGLE_SCOPES = {
  GA4_READONLY: "https://www.googleapis.com/auth/analytics.readonly",
  GOOGLE_ADS: "https://www.googleapis.com/auth/adwords",
  SEARCH_CONSOLE: "https://www.googleapis.com/auth/webmasters.readonly",
  BUSINESS_PROFILE: "https://www.googleapis.com/auth/business.manage",
};

export class GoogleAuthConnector {
  /**
   * Helper para realizar requisições autenticadas com Bearer Token para as APIs do Google.
   */
  async googleFetch<T>(
    url: string,
    accessToken: string,
    options: RequestInit = {},
    developerToken?: string,
    loginCustomerId?: string
  ): Promise<T> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (developerToken) {
      headers["developer-token"] = developerToken;
    }
    if (loginCustomerId) {
      headers["login-customer-id"] = loginCustomerId.replace(/-/g, "");
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let cleanedText = errorText;

      if (
        errorText.includes("<!DOCTYPE") ||
        errorText.includes("<html") ||
        errorText.includes("<HTML") ||
        /<[a-z][\s\S]*>/i.test(errorText)
      ) {
        const codeMatch = errorText.match(/<code>(.*?)<\/code>/i);
        const pMatch = errorText.match(/<p>(.*?)<\/p>/i);
        const titleMatch = errorText.match(/<title>(.*?)<\/title>/i);

        if (codeMatch && pMatch) {
          const rawCode = codeMatch[1].replace(/<[^>]+>/g, "").trim();
          const rawP = pMatch[1].replace(/<[^>]+>/g, "").trim();
          cleanedText = `A URL (${rawCode}) não foi encontrada no servidor do Google. (${rawP})`;
        } else if (pMatch) {
          cleanedText = pMatch[1].replace(/<[^>]+>/g, "").trim();
        } else if (titleMatch) {
          cleanedText = titleMatch[1].replace(/<[^>]+>/g, "").trim();
        } else {
          cleanedText = errorText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        }
      } else {
        // Extrair mensagem detalhada e código de erro da resposta JSON do Google Ads API
        try {
          const jsonStart = errorText.indexOf("{");
          if (jsonStart !== -1) {
            const parsed = JSON.parse(errorText.slice(jsonStart));
            if (parsed.error) {
              const firstGoogleError = parsed.error.details?.[0]?.errors?.[0];
              const errorCode = firstGoogleError?.errorCode
                ? Object.values(firstGoogleError.errorCode)[0]
                : parsed.error.status || "";
              const specificMsg = firstGoogleError?.message || parsed.error.message;
              if (specificMsg) {
                cleanedText = `${errorCode ? `[${errorCode}] ` : ""}${specificMsg}`;
              }
            }
          }
        } catch {
          // Manter cleanedText original se não for JSON parseável
        }
      }

      throw new Error(`Google API Error [${response.status}]: ${cleanedText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Renova o Access Token do Google usando o Refresh Token permanente.
   * Permite que a conexão do Alien OS permaneça ativa indefinidamente.
   */
  async refreshAccessToken(refreshToken: string): Promise<string> {
    let clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

    if (clientId) {
      clientId = clientId.replace("ustr", "uatr").replace("jsu0", "jau0");
    }

    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error(
        "Variáveis GOOGLE_CLIENT_ID ou GOOGLE_CLIENT_SECRET não configuradas no ambiente. Configure-as nas variáveis de ambiente da Vercel."
      );
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Erro ao renovar token OAuth do Google:", errText);
      throw new Error(`Falha ao renovar token de acesso com o Google: ${errText}`);
    }

    const data = await response.json();
    if (!data.access_token) {
      throw new Error("Resposta da Google OAuth API não retornou access_token.");
    }

    return data.access_token;
  }
}

export const googleAuthConnector = new GoogleAuthConnector();

