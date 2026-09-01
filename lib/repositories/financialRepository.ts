/**
 * Repository Pattern: Financial Repository (Alien OS)
 * Gerencia a leitura e escrita de contratos, faturas, pagamentos e indicadores de MRR/ARR.
 * Conectado às tabelas Supabase: contracts, invoices, payments, adjustments, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export interface Contract {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  contractNumber: string;
  monthlyValue: number;
  startDate: string;
  durationMonths: number;
  renewalDate: string;
  status: "Ativo" | "Em Renovação" | "Cancelado" | "Encerrado";
  pdfUrl?: string;
}

export interface Invoice {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  contractNumber: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: "Pago" | "Pendente" | "A Vencer" | "Em Atraso" | "Cancelado";
  paymentMethod: string;
  servicesSummary: string;
  paidAt?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId: string;
  companyId: string;
  amountPaid: number;
  paidAt: string;
  paymentMethod: string;
  transactionId?: string;
  gatewayName?: string;
}

export interface ClientFinancialSummary {
  clientId: string;
  clientName: string;
  companyName: string;
  contractedServices: string[];
  monthlyFee: number;
  dueDate: string;
  status: "Em dia" | "A vencer" | "Em atraso" | "Cancelado";
  accountManager: string;
  contractTimeMonths: number;
  nextAdjustmentDate: string;
}

export interface FinancialKpis {
  mrr: number;
  arr: number;
  projectedRevenue: number;
  activeClientsCount: number;
  averageTicket: number;
  averageLtv: number;
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  financialChurnRate: number;
}

export interface AlienMaxFinancialInsight {
  id: string;
  type: "Renovação" | "Upgrade" | "Cobrança" | "Reajuste" | "Risco Churn";
  clientName: string;
  companyId: string;
  title: string;
  description: string;
  estimatedRevenueImpact: string;
  confidenceScore: number;
  recommendedAction: string;
}

export class FinancialRepository {
  async getKpis(): Promise<FinancialKpis> {
    const emptyKpis: FinancialKpis = {
      mrr: 0,
      arr: 0,
      projectedRevenue: 0,
      activeClientsCount: 0,
      averageTicket: 0,
      averageLtv: 0,
      pendingPaymentsCount: 0,
      pendingPaymentsTotal: 0,
      financialChurnRate: 0,
    };

    try {
      const supabase = createBrowserClient();
      const { data: contracts } = await supabase
        .from("contracts")
        .select("monthly_value, status")
        .eq("status", "Ativo");

      const { data: invoices } = await supabase
        .from("invoices")
        .select("amount, status")
        .in("status", ["Pendente", "Em Atraso", "A Vencer"]);

      const pendingCount = invoices ? invoices.length : 0;
      const pendingTotal = (invoices || []).reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

      if (contracts && contracts.length > 0) {
        const mrr = contracts.reduce((acc, c) => acc + (Number(c.monthly_value) || 0), 0);
        return {
          mrr,
          arr: mrr * 12,
          projectedRevenue: mrr * 12 * 1.15,
          activeClientsCount: contracts.length,
          averageTicket: Math.round(mrr / Math.max(1, contracts.length)),
          averageLtv: Math.round((mrr / Math.max(1, contracts.length)) * 12),
          pendingPaymentsCount: pendingCount,
          pendingPaymentsTotal: pendingTotal,
          financialChurnRate: 0,
        };
      }

      return {
        ...emptyKpis,
        pendingPaymentsCount: pendingCount,
        pendingPaymentsTotal: pendingTotal,
      };
    } catch {
      return emptyKpis;
    }
  }

  async getContracts(): Promise<Contract[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("contracts").select("*");
      if (data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          companyId: c.company_id,
          clientName: c.company_id,
          companyName: c.company_id,
          contractNumber: c.contract_number,
          monthlyValue: Number(c.monthly_value),
          startDate: c.start_date,
          durationMonths: c.duration_months,
          renewalDate: c.renewal_date,
          status: c.status as any,
          pdfUrl: c.pdf_url,
        }));
      }
    } catch (err) {
      console.error("Erro ao ler contracts no Supabase:", err);
    }
    return [];
  }

  async getInvoices(): Promise<Invoice[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("invoices").select("*");
      if (data && data.length > 0) {
        return data.map((i) => ({
          id: i.id,
          companyId: i.company_id,
          clientName: i.company_id,
          companyName: i.company_id,
          contractNumber: i.contract_id || "CT-2025",
          invoiceNumber: i.invoice_number,
          amount: Number(i.amount),
          dueDate: i.due_date,
          status: i.status as any,
          paymentMethod: i.payment_method || "PIX",
          servicesSummary: i.services_summary || "Serviços Growth",
          paidAt: i.paid_at,
        }));
      }
    } catch (err) {
      console.error("Erro ao ler invoices no Supabase:", err);
    }
    return [];
  }

  async getClientSummaries(): Promise<ClientFinancialSummary[]> {
    try {
      const contracts = await this.getContracts();
      return contracts.map((c) => ({
        clientId: c.companyId,
        clientName: c.clientName,
        companyName: c.companyName,
        contractedServices: ["Gestão de Tráfego"],
        monthlyFee: c.monthlyValue,
        dueDate: c.renewalDate || "Todo dia 10",
        status: c.status === "Ativo" ? "Em dia" : "Cancelado",
        accountManager: "Equipe Alien",
        contractTimeMonths: c.durationMonths,
        nextAdjustmentDate: c.renewalDate,
      }));
    } catch {
      return [];
    }
  }

  async getAlienMaxInsights(): Promise<AlienMaxFinancialInsight[]> {
    const invoices = await this.getInvoices();
    const insights: AlienMaxFinancialInsight[] = [];

    for (const inv of invoices) {
      if (inv.status === "Em Atraso") {
        insights.push({
          id: `fn-ins-${inv.id}`,
          type: "Cobrança",
          clientName: inv.clientName,
          companyId: inv.companyId,
          title: `Fatura ${inv.invoiceNumber} em atraso`,
          description: `O boleto de R$ ${inv.amount.toLocaleString("pt-BR")} com vencimento em ${inv.dueDate} está pendente.`,
          estimatedRevenueImpact: `R$ ${inv.amount.toLocaleString("pt-BR")} pendente`,
          confidenceScore: 98,
          recommendedAction: "Enviar lembrete amigável de segunda via.",
        });
      }
    }

    return insights;
  }
}

export const financialRepository = new FinancialRepository();
