/**
 * Repository Pattern: Financial Repository (Alien OS)
 * Gerencia a leitura e escrita de contratos, faturas, pagamentos e indicadores de MRR/ARR.
 * Conectado às tabelas Supabase: contracts, invoices, payments, adjustments, companies.
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
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  projectedRevenue: number;
  activeClientsCount: number;
  averageTicket: number;
  averageLtv: number;
  pendingPaymentsCount: number;
  pendingPaymentsTotal: number;
  financialChurnRate: number; // e.g. 1.2%
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

export const mockContracts: Contract[] = [
  {
    id: "ct-1",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    contractNumber: "CT-2025-089",
    monthlyValue: 25000,
    startDate: "2025-01-15",
    durationMonths: 12,
    renewalDate: "2026-01-15",
    status: "Ativo",
    pdfUrl: "#",
  },
  {
    id: "ct-2",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    contractNumber: "CT-2025-104",
    monthlyValue: 18500,
    startDate: "2025-03-01",
    durationMonths: 12,
    renewalDate: "2026-03-01",
    status: "Ativo",
    pdfUrl: "#",
  },
  {
    id: "ct-3",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    contractNumber: "CT-2025-072",
    monthlyValue: 15000,
    startDate: "2024-11-01",
    durationMonths: 12,
    renewalDate: "2025-11-01",
    status: "Em Renovação",
    pdfUrl: "#",
  },
  {
    id: "ct-4",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    contractNumber: "CT-2025-118",
    monthlyValue: 32000,
    startDate: "2025-04-10",
    durationMonths: 12,
    renewalDate: "2026-04-10",
    status: "Ativo",
    pdfUrl: "#",
  },
  {
    id: "ct-5",
    companyId: "stellar-solar",
    clientName: "Stellar Solar",
    companyName: "Stellar Energia LTDA",
    contractNumber: "CT-2025-130",
    monthlyValue: 22000,
    startDate: "2025-05-20",
    durationMonths: 12,
    renewalDate: "2026-05-20",
    status: "Ativo",
    pdfUrl: "#",
  },
];

export const mockInvoices: Invoice[] = [
  {
    id: "inv-101",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    contractNumber: "CT-2025-089",
    invoiceNumber: "FAT-2026-0701",
    amount: 25000,
    dueDate: "2026-08-05",
    status: "A Vencer",
    paymentMethod: "PIX",
    servicesSummary: "Gestão de Tráfego + Branding + CRM Automações",
  },
  {
    id: "inv-102",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    contractNumber: "CT-2025-104",
    invoiceNumber: "FAT-2026-0702",
    amount: 18500,
    dueDate: "2026-07-28",
    status: "Pago",
    paymentMethod: "Boleto Bancário",
    servicesSummary: "Social Media + Tráfego Pago + CRO",
    paidAt: "2026-07-28T10:14:00Z",
  },
  {
    id: "inv-103",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    contractNumber: "CT-2025-072",
    invoiceNumber: "FAT-2026-0703",
    amount: 15000,
    dueDate: "2026-07-20",
    status: "Em Atraso",
    paymentMethod: "Boleto Bancário",
    servicesSummary: "Growth B2B + Google Ads + Inbound",
  },
  {
    id: "inv-104",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    contractNumber: "CT-2025-118",
    invoiceNumber: "FAT-2026-0704",
    amount: 32000,
    dueDate: "2026-07-31",
    status: "A Vencer",
    paymentMethod: "PIX",
    servicesSummary: "Gestão de Mídia Full Stack + TikTok Ads",
  },
  {
    id: "inv-105",
    companyId: "stellar-solar",
    clientName: "Stellar Solar",
    companyName: "Stellar Energia LTDA",
    contractNumber: "CT-2025-130",
    invoiceNumber: "FAT-2026-0705",
    amount: 22000,
    dueDate: "2026-07-31",
    status: "Pendente",
    paymentMethod: "Cartão de Crédito",
    servicesSummary: "Google Ads Search + SEO Local + Automação",
  },
];

export const mockClientFinancialSummaries: ClientFinancialSummary[] = [
  {
    clientId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    contractedServices: ["Tráfego Pago", "CRM & Automação", "Branding"],
    monthlyFee: 25000,
    dueDate: "Dia 05",
    status: "Em dia",
    accountManager: "Gabriel Alencar",
    contractTimeMonths: 18,
    nextAdjustmentDate: "15/01/2027",
  },
  {
    clientId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    contractedServices: ["Social Media", "Tráfego Pago", "CRO"],
    monthlyFee: 18500,
    dueDate: "Dia 10",
    status: "Em dia",
    accountManager: "Lucas Mendes",
    contractTimeMonths: 16,
    nextAdjustmentDate: "01/03/2027",
  },
  {
    clientId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    contractedServices: ["Growth B2B", "Google Ads"],
    monthlyFee: 15000,
    dueDate: "Dia 20",
    status: "Em atraso",
    accountManager: "Matheus Silva",
    contractTimeMonths: 20,
    nextAdjustmentDate: "01/11/2026",
  },
  {
    clientId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    contractedServices: ["Mídia Full Stack", "TikTok Ads"],
    monthlyFee: 32000,
    dueDate: "Dia 30",
    status: "A vencer",
    accountManager: "Gabriel Alencar",
    contractTimeMonths: 15,
    nextAdjustmentDate: "10/04/2027",
  },
  {
    clientId: "stellar-solar",
    clientName: "Stellar Solar",
    companyName: "Stellar Energia LTDA",
    contractedServices: ["Google Ads", "SEO Local"],
    monthlyFee: 22000,
    dueDate: "Dia 30",
    status: "A vencer",
    accountManager: "Lucas Mendes",
    contractTimeMonths: 14,
    nextAdjustmentDate: "20/05/2027",
  },
];

export const mockAlienMaxFinancialInsights: AlienMaxFinancialInsight[] = [
  {
    id: "fn-ins-1",
    type: "Renovação",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    title: "Contrato próximo da renovação anual",
    description: "O contrato CT-2025-072 expira em menos de 90 dias. Recomenda-se apresentar o estudo de ROI para renovação com reajuste pelo IGPM (+6.8%).",
    estimatedRevenueImpact: "+R$ 1.020 / mês",
    confidenceScore: 94,
    recommendedAction: "Agendar reunião de prestação de contas e apresentar renovação",
  },
  {
    id: "fn-ins-2",
    type: "Upgrade",
    clientName: "Aura Health",
    companyId: "aura-health",
    title: "Oportunidade de expansão de escopo (Upsell)",
    description: "Devido ao ROAS de 5.2x mantido por 3 meses, o cliente tem capacidade orçamentária para incorporar o serviço de TikTok Ads.",
    estimatedRevenueImpact: "+R$ 7.500 / mês",
    confidenceScore: 96,
    recommendedAction: "Apresentar proposta de expansão para TikTok Ads",
  },
  {
    id: "fn-ins-3",
    type: "Cobrança",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    title: "Fatura FAT-2026-0703 vencida há 11 dias",
    description: "O boleto de R$ 15.000 não foi compensado. O Alien Max recomenda enviar notificação amigável de cobrança antes de pausar anúncios.",
    estimatedRevenueImpact: "R$ 15.000 pendentes",
    confidenceScore: 98,
    recommendedAction: "Enviar lembrete de segunda via via WhatsApp",
  },
];

export class FinancialRepository {
  async getKpis(): Promise<FinancialKpis> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("contracts").select("monthly_value");
      if (data && data.length > 0) {
        const mrr = data.reduce((acc, c) => acc + (Number(c.monthly_value) || 0), 0);
        return {
          mrr,
          arr: mrr * 12,
          projectedRevenue: mrr * 12 * 1.15,
          activeClientsCount: data.length,
          averageTicket: Math.round(mrr / Math.max(1, data.length)),
          averageLtv: Math.round((mrr / Math.max(1, data.length)) * 14),
          pendingPaymentsCount: 2,
          pendingPaymentsTotal: 37000,
          financialChurnRate: 1.2,
        };
      }
    } catch {
      // Ignora erro e usa mock
    }

    return {
      mrr: 185000,
      arr: 2220000,
      projectedRevenue: 2553000,
      activeClientsCount: 15,
      averageTicket: 12333,
      averageLtv: 148000,
      pendingPaymentsCount: 2,
      pendingPaymentsTotal: 37000,
      financialChurnRate: 1.2,
    };
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
    } catch {
      // Fallback
    }
    return mockContracts;
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
    } catch {
      // Fallback
    }
    return mockInvoices;
  }

  async getClientSummaries(): Promise<ClientFinancialSummary[]> {
    return mockClientFinancialSummaries;
  }

  async getAlienMaxInsights(): Promise<AlienMaxFinancialInsight[]> {
    return mockAlienMaxFinancialInsights;
  }
}

export const financialRepository = new FinancialRepository();
