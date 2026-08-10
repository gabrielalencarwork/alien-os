/**
 * Definições Financeiras e de Faturamento (Alien OS)
 * Tabela Supabase: financial_records / invoices
 */

export type BillingCycle = "Mensal" | "Trimestral" | "Anual" | "Pontual";

export type PaymentStatus = "Pago" | "Pendente" | "Atrasado" | "Cancelado";

export interface Financeiro {
  id: string; // UUID
  clientId: string;
  clientName: string;
  mrrContribution: number;
  totalLtv: number;
  estimatedCac: number;
  billingCycle: BillingCycle;
  nextInvoiceDate: string;
  lastPaymentStatus: PaymentStatus;
  contractValue: number;
  paymentMethod?: string;
  createdAt: string;
}

export interface MetricsFinancialConsolidated {
  mrrConsolidated: number;
  arrConsolidated: number;
  averageTicket: number;
  churnRate: number;
  activeSubscriptionsCount: number;
}
