/**
 * Connector Module: GA4 Connector (Alien OS)
 * Conector especializado para consumo da Google Analytics Admin API (lista de propriedades)
 * e Google Analytics Data API (relatórios de métricas, sessões e eventos).
 */

import { googleAuthConnector } from "./googleAuthConnector";

export interface GA4PropertySummary {
  propertyId: string;
  displayName: string;
  parentAccountName: string;
}

export interface GA4ReportRow {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  engagedSessions: number;
  conversions: number;
  totalRevenue: number;
  bounceRate: number;
  averageSessionDuration: number;
  screenPageViews: number;
}

export class GA4Connector {
  /**
   * Lista todas as propriedades GA4 disponíveis na conta do usuário via Admin API.
   */
  async listProperties(accessToken: string): Promise<GA4PropertySummary[]> {
    try {
      const url = "https://analyticsadmin.googleapis.com/v1alpha/accountSummaries";
      const data = await googleAuthConnector.googleFetch<{
        accountSummaries?: Array<{
          name: string;
          displayName: string;
          propertySummaries?: Array<{
            property: string; // formato: properties/123456789
            displayName: string;
          }>;
        }>;
      }>(url, accessToken);

      const properties: GA4PropertySummary[] = [];

      if (data.accountSummaries) {
        for (const account of data.accountSummaries) {
          if (account.propertySummaries) {
            for (const prop of account.propertySummaries) {
              const rawId = prop.property.replace("properties/", "");
              properties.push({
                propertyId: rawId,
                displayName: prop.displayName,
                parentAccountName: account.displayName,
              });
            }
          }
        }
      }

      return properties;
    } catch (err) {
      console.error("Erro ao buscar propriedades na Admin API do GA4:", err);
      throw err;
    }
  }

  /**
   * Executa um relatório na Google Analytics Data API (runReport) para uma propriedade específica.
   */
  async fetchGA4ReportData(
    accessToken: string,
    propertyId: string,
    startDate: string = "30daysAgo",
    endDate: string = "today"
  ): Promise<GA4ReportRow[]> {
    const cleanPropertyId = propertyId.replace("properties/", "");
    const url = `https://analyticsdata.googleapis.com/v1beta/properties/${cleanPropertyId}:runReport`;

    const body = {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "engagedSessions" },
        { name: "conversions" },
        { name: "totalRevenue" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
        { name: "screenPageViews" },
      ],
    };

    try {
      const data = await googleAuthConnector.googleFetch<{
        rows?: Array<{
          dimensionValues: Array<{ value: string }>;
          metricValues: Array<{ value: string }>;
        }>;
      }>(url, accessToken, {
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!data.rows) return [];

      return data.rows.map((row) => {
        const rawDate = row.dimensionValues[0]?.value || "";
        // Converter formato AAAAMMDD para AAAA-MM-DD
        const formattedDate =
          rawDate.length === 8
            ? `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
            : rawDate;

        return {
          date: formattedDate,
          activeUsers: Number(row.metricValues[0]?.value) || 0,
          newUsers: Number(row.metricValues[1]?.value) || 0,
          sessions: Number(row.metricValues[2]?.value) || 0,
          engagedSessions: Number(row.metricValues[3]?.value) || 0,
          conversions: Number(row.metricValues[4]?.value) || 0,
          totalRevenue: Number(row.metricValues[5]?.value) || 0,
          bounceRate: Number(row.metricValues[6]?.value) || 0,
          averageSessionDuration: Number(row.metricValues[7]?.value) || 0,
          screenPageViews: Number(row.metricValues[8]?.value) || 0,
        };
      });
    } catch (err) {
      console.error("Erro ao executar runReport na Data API do GA4:", err);
      throw err;
    }
  }
}

export const ga4Connector = new GA4Connector();
