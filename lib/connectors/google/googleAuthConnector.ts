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
      }

      throw new Error(`Google API Error [${response.status}]: ${cleanedText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const googleAuthConnector = new GoogleAuthConnector();
