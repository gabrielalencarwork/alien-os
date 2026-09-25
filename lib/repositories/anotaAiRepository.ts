/**
 * Repository: Anota AI Delivery Orders Repository (Alien OS)
 * Gerencia a leitura e persistência de pedidos e faturamento real da Anota AI.
 *
 * REGRA MANDATÓRIA (AGENTS.md):
 * Exclusividade de Dados Reais persistidos no Supabase (tabela anota_ai_orders).
 * Proibição absoluta de dados fictícios / mock data.
 */

import { createBrowserClient } from "@/lib/supabase/client";
import { getDateRangeFilter } from "./metaAdsRepository";

export interface AnotaAiOrderItem {
  name: string;
  quantity: number;
  price: number;
  observation?: string;
  options?: string[];
}

export interface AnotaAiOrderRecord {
  id: string;
  companyId?: string | null;
  adAccountId: string;
  externalOrderId: string;
  customerName?: string | null;
  customerPhone?: string | null;
  items: AnotaAiOrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  deliveryAddress?: Record<string, any> | null;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnotaAiOrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  confirmedOrders: number;
  canceledOrders: number;
}

export class AnotaAiRepository {
  private getSupabase() {
    return createBrowserClient();
  }

  /**
   * Lista os pedidos recebidos via Webhook da Anota AI
   */
  async listOrders(
    accountId?: string,
    limit: number = 50,
    preset?: string,
    customStart?: string,
    customEnd?: string
  ): Promise<AnotaAiOrderRecord[]> {
    try {
      // 1. No navegador, consultar via API route server-side (garante acesso seguro independente de RLS)
      if (typeof window !== "undefined") {
        try {
          const params = new URLSearchParams();
          if (accountId) params.set("accountId", accountId);
          if (preset) params.set("preset", preset);
          if (customStart) params.set("customStart", customStart);
          if (customEnd) params.set("customEnd", customEnd);
          params.set("limit", String(limit));

          const res = await fetch(`/api/integracoes/anota-ai/orders?${params.toString()}`);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json.orders)) {
              return json.orders;
            }
          }
        } catch (fetchErr) {
          console.warn("Aviso ao buscar pedidos via API route, tentando Supabase direto:", fetchErr);
        }
      }

      // 2. Fallback direto no Supabase
      const supabase = this.getSupabase();
      let query = supabase
        .from("anota_ai_orders")
        .select("*")
        .order("order_date", { ascending: false })
        .limit(limit);

      if (accountId) {
        const cleanId = accountId.replace(/^act_/, "");
        query = query.or(`ad_account_id.eq.${accountId},ad_account_id.eq.act_${cleanId},ad_account_id.eq.${cleanId}`);
      }

      const { startDate, endDate } = getDateRangeFilter(preset, customStart, customEnd);
      if (startDate) {
        query = query.gte("order_date", `${startDate}T00:00:00`);
      }
      if (endDate) {
        query = query.lte("order_date", `${endDate}T23:59:59.999`);
      }

      const { data, error } = await query;

      if (error) {
        // Se a tabela ainda não tiver sido criada no Supabase pelo usuário, retorna array vazio
        console.warn("Aviso ao buscar pedidos da Anota AI no Supabase:", error.message);
        return [];
      }

      return (data || []).map((row) => ({
        id: row.id,
        companyId: row.company_id,
        adAccountId: row.ad_account_id,
        externalOrderId: row.external_order_id,
        customerName: row.customer_name,
        customerPhone: row.customer_phone,
        items: Array.isArray(row.items) ? row.items : [],
        subtotal: Number(row.subtotal || 0),
        deliveryFee: Number(row.delivery_fee || 0),
        totalAmount: Number(row.total_amount || 0),
        paymentMethod: row.payment_method || "OUTRO",
        status: row.status || "CONFIRMED",
        deliveryAddress: row.delivery_address,
        orderDate: row.order_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      console.error("Erro inesperado ao listar pedidos da Anota AI:", err);
      return [];
    }
  }

  /**
   * Calcula métricas agregadas de vendas reais da Anota AI
   */
  async getMetrics(
    accountId?: string,
    preset?: string,
    customStart?: string,
    customEnd?: string
  ): Promise<AnotaAiOrderMetrics> {
    try {
      const orders = await this.listOrders(accountId, 1000, preset, customStart, customEnd);

      if (orders.length === 0) {
        return {
          totalOrders: 0,
          totalRevenue: 0,
          averageTicket: 0,
          confirmedOrders: 0,
          canceledOrders: 0,
        };
      }

      const validOrders = orders.filter((o) => o.status !== "CANCELED");
      const totalRevenue = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const averageTicket = validOrders.length > 0 ? Number((totalRevenue / validOrders.length).toFixed(2)) : 0;
      const canceledOrders = orders.filter((o) => o.status === "CANCELED").length;

      return {
        totalOrders: orders.length,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageTicket,
        confirmedOrders: validOrders.length,
        canceledOrders,
      };
    } catch (err) {
      console.error("Erro ao calcular métricas da Anota AI:", err);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        averageTicket: 0,
        confirmedOrders: 0,
        canceledOrders: 0,
      };
    }
  }
}

export const anotaAiRepository = new AnotaAiRepository();
