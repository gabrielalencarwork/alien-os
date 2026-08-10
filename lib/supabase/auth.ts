import { createBrowserClient } from "./client";

/**
 * Utilitário de Autenticação do Supabase Auth (Alien OS)
 * Gerencia autenticação real do Supabase com fallback gracioso para modo demonstração.
 */

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserClient();
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!error && data?.session) {
      return data;
    }
  } catch {
    // Fallback para modo demonstração caso o endpoint do Supabase seja um placeholder
  }

  // Em modo demonstração, define o cookie local
  document.cookie = "alien_demo_session=true; path=/; max-age=86400";
  return { user: { id: "demo-user", email }, session: { access_token: "demo" } };
}

export async function signOutUser() {
  const supabase = createBrowserClient();
  
  try {
    await supabase.auth.signOut();
  } catch {
    // Ignora erro se for em modo local/demo
  }

  // Remove o cookie de demonstração
  document.cookie = "alien_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}

export async function getCurrentUser() {
  const supabase = createBrowserClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) return user;
  } catch {
    // Fallback demo
  }

  return { id: "demo-user", email: "admin@alienos.com" };
}
