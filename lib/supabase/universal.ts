import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient as createSsrBrowserClient } from "@supabase/ssr";

let serverClient: SupabaseClient | null = null;
let warnedMissingServiceKey = false;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

/**
 * Cliente Supabase usado pelos repositórios, que rodam tanto no navegador quanto no servidor.
 *
 * - Navegador: cliente com a SESSÃO do usuário logado (cookies). As políticas RLS do banco
 *   enxergam o usuário como `authenticated`, nunca como anônimo.
 * - Servidor (API routes, Server Components): cliente com a chave de serviço
 *   (SUPABASE_SERVICE_ROLE_KEY), que nunca chega ao navegador. Todas as rotas do servidor
 *   ficam atrás do login (ver proxy.ts), exceto os webhooks.
 */
export function getUniversalClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    // @supabase/ssr já reaproveita a mesma instância no navegador.
    return createSsrBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  if (serverClient) return serverClient;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey && !warnedMissingServiceKey) {
    warnedMissingServiceKey = true;
    console.warn(
      "[Alien OS] SUPABASE_SERVICE_ROLE_KEY não configurada: o servidor está usando a chave pública. " +
        "Configure a variável no Vercel e no .env.local."
    );
  }

  serverClient = createSupabaseClient(SUPABASE_URL, serviceKey || SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverClient;
}
