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
      throw new Error(`Google API Error [${response.status}]: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const googleAuthConnector = new GoogleAuthConnector();
