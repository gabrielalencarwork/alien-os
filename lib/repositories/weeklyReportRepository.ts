/**
 * Lista e atualiza os relatórios semanais (tabela weekly_reports) a partir das telas internas.
 * Status canônicos: 'Gerado' | 'Enviado' (20261031000036_relatorios_semanais.sql).
 */

import { getUniversalClient } from "@/lib/supabase/universal";
import { mapReport, type WeeklyReport } from "@/lib/reports/weeklyReport";

export class WeeklyReportRepository {
  async list(): Promise<{ reports: WeeklyReport[]; error: string | null }> {
    const { data, error } = await getUniversalClient()
      .from("weekly_reports")
      .select("*, companies(name, trade_name)")
      .order("week_start", { ascending: false })
      .limit(120);
    if (error) {
      const missing = /does not exist|schema cache|Could not find/i.test(error.message);
      return {
        reports: [],
        error: missing
          ? "A tabela de relatórios ainda não existe. Rode supabase/migrations/20261031000036_relatorios_semanais.sql no SQL Editor do Supabase."
          : error.message,
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { reports: (data || []).map((r) => mapReport(r as any)), error: null };
  }

  async markSent(id: string): Promise<void> {
    const { error } = await getUniversalClient()
      .from("weekly_reports")
      .update({ status: "Enviado", sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`Não foi possível marcar como enviado: ${error.message}`);
  }
}

export const weeklyReportRepository = new WeeklyReportRepository();
