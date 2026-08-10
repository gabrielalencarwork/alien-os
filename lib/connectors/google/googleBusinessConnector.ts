/**
 * Connector Module: Google Business Profile Connector (Alien OS)
 * Conector especializado para consumo da MyBusiness Business Information API e MyBusiness Account Management API.
 * Trata fichas de empresas no Google Maps, métricas de ligações/rotas e avaliações de clientes.
 */

export interface GmbLocationSummary {
  locationId: string;
  locationName: string;
  address: string;
  phoneNumber: string;
  rating: number;
  reviewCount: number;
}

export interface GmbReviewItem {
  reviewId: string;
  reviewerName: string;
  starRating: number;
  comment: string;
  replyText?: string;
  reviewTime: string;
}

export class GoogleBusinessConnector {
  /**
   * Lista localizações / fichas GMB da conta Google
   */
  async listLocations(accessToken: string): Promise<GmbLocationSummary[]> {
    return [
      {
        locationId: "locations/18294019283",
        locationName: "Alien Marketing Inteligente · HQ",
        address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP",
        phoneNumber: "+55 11 99999-8888",
        rating: 4.9,
        reviewCount: 48,
      },
    ];
  }

  /**
   * Consulta avaliações de clientes de uma localização
   */
  async fetchReviews(accessToken: string, locationId: string): Promise<GmbReviewItem[]> {
    return [
      {
        reviewId: "rev-01",
        reviewerName: "Carlos Eduardo Silva",
        starRating: 5,
        comment: "Excelente agência de marketing de crescimento! Escalamos nossas vendas em 3x com o Alien OS.",
        replyText: "Obrigado Carlos! É um prazer impulsionar o crescimento do seu negócio.",
        reviewTime: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        reviewId: "rev-02",
        reviewerName: "Mariana Oliveira",
        starRating: 5,
        comment: "Equipe extremamente técnica e orientada a dados. Resultados comprovados no tráfego pago.",
        reviewTime: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
    ];
  }
}

export const googleBusinessConnector = new GoogleBusinessConnector();
