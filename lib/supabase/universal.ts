import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let universalClient: SupabaseClient | null = null;

/**
 * Cliente Supabase Universal: seguro para Server Components, Client Components,
 * rotas de API e builds sem depender de "next/headers" ou DOM "document.cookie".
 */
export function getUniversalClient(): SupabaseClient {
  if (universalClient) return universalClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey =
    (typeof window === "undefined" && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)) ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "placeholder-key";

  universalClient = createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return universalClient;
}
