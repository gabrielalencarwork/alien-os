/**
 * Connector Module: Meta Auth Connector (Alien OS)
 * Centraliza a comunicação de autenticação OAuth 2.0 e chamadas HTTP à Meta Graph API v19.0.
 * Utilizado por Meta Ads (Facebook Ads & Instagram Ads), CAPI e Meta Pixel.
 */

export const META_SCOPES = {
  ADS_READ: "ads_read",
  ADS_MANAGEMENT: "ads_management",
  BUSINESS_MANAGEMENT: "business_management",
};

export class MetaAuthConnector {
  /**
   * Helper para realizar requisições autenticadas para a Graph API do Facebook.
   */
  async metaFetch<T>(
    endpoint: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const separator = cleanEndpoint.includes("?") ? "&" : "?";
    const url = `https://graph.facebook.com/v19.0${cleanEndpoint}${separator}access_token=${accessToken}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meta Graph API Error [${response.status}]: ${errorText}`);
    }

    return response.json() as Promise<T>;
  }
}

export const metaAuthConnector = new MetaAuthConnector();
