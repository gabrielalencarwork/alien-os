/**
 * Sync Engine Orchestrator (Alien OS)
 * Orquestrador central de sincronização de conectores (Google Ads, GA4, Meta Ads, Search Console).
 * Gerencia execuções, filas, tempo de resposta, retries e auditoria centralizada.
 */

import { ProviderSlug } from "@/lib/core/marketingCore";
import { createServerClient } from "@/lib/supabase/server";

export interface SyncJobOptions {
  providerSlug: ProviderSlug;
  accountId: string;
  isFullSync?: boolean;
  accessToken: string;
}

export interface SyncJobResult {
  jobId: string;
  providerSlug: ProviderSlug;
  status: "SUCCESS" | "ERROR" | "IN_PROGRESS";
  durationMs: number;
  recordsProcessed: number;
  errorMessage?: string;
}

export class SyncEngine {
  /**
   * Executa um job de sincronização de conector orquestrado.
   */
  async runSyncJob(
    options: SyncJobOptions,
    syncFn: () => Promise<{ recordsProcessed: number }>
  ): Promise<SyncJobResult> {
    const startTime = Date.now();
    const jobId = `sync-${options.providerSlug}-${Date.now()}`;
    const supabase = createServerClient();

    try {
      // 1. Registrar início do job em integration_logs
      await supabase.from("integration_logs").insert({
        provider_id: options.providerSlug,
        event_type: "SYNC_START",
        message: `Job ${jobId} iniciado para conta ${options.accountId}.`,
        status_code: 200,
      });

      // 2. Executar a função de sincronização do conector específico
      const res = await syncFn();
      const durationMs = Date.now() - startTime;

      // 3. Registrar término bem-sucedido
      await supabase.from("integration_logs").insert({
        provider_id: options.providerSlug,
        event_type: "SYNC_SUCCESS",
        message: `Job ${jobId} finalizado com sucesso (${res.recordsProcessed} registros em ${durationMs}ms).`,
        status_code: 200,
      });

      return {
        jobId,
        providerSlug: options.providerSlug,
        status: "SUCCESS",
        durationMs,
        recordsProcessed: res.recordsProcessed,
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      const errorMsg = err?.message || "Erro desconhecido durante o job de sincronização.";

      // Registrar falha no log auditável
      await supabase.from("integration_logs").insert({
        provider_id: options.providerSlug,
        event_type: "SYNC_ERROR",
        message: `Job ${jobId} falhou: ${errorMsg}`,
        status_code: 500,
      });

      return {
        jobId,
        providerSlug: options.providerSlug,
        status: "ERROR",
        durationMs,
        recordsProcessed: 0,
        errorMessage: errorMsg,
      };
    }
  }
}

export const syncEngine = new SyncEngine();
