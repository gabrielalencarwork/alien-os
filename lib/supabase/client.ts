import { createBrowserClient as createBrowserClientFromSupabase } from "@supabase/ssr";

/**
 * Cliente Supabase para Client Components (Navegador)
 * Utiliza o utilitário oficial @supabase/ssr
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

  return createBrowserClientFromSupabase(supabaseUrl, supabaseAnonKey);
}

export function createClient() {
  return createBrowserClient();
}
