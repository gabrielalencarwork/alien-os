import type { SupabaseClient } from "@supabase/supabase-js";
import { getUniversalClient } from "./universal";

/**
 * Cliente Supabase dos repositórios.
 * No navegador usa a sessão do usuário logado; no servidor usa a chave de serviço.
 * (Antes, quando um repositório era chamado no servidor — ex.: ferramentas do Alien Max —
 * este cliente rodava sem sessão e sem chave de serviço.)
 */
export function createBrowserClient(): SupabaseClient {
  return getUniversalClient();
}

export function createClient(): SupabaseClient {
  return getUniversalClient();
}
