import { createServerClient as createSsrServerClient, type CookieOptions } from "@supabase/ssr";
import { getUniversalClient } from "./universal";
import { cookies } from "next/headers";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Cliente Supabase para Server Components e Server Actions (com suporte a Cookies)
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createSsrServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Chamado de Server Component
        }
      },
    },
  });
}

/**
 * Cliente Supabase para API Routes e Webhooks (chave de serviço, sem depender de cookies).
 * Mesmo cliente usado pelos repositórios quando rodam no servidor.
 */
export function createServerClient() {
  return getUniversalClient();
}
