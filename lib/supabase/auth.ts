import { createBrowserClient } from "./client";

/**
 * Autenticação real do Supabase Auth (Alien OS).
 * Sem "modo demonstração": credencial errada ou falha de conexão mostram o erro real.
 */

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Este e-mail ainda não foi confirmado. Verifique sua caixa de entrada.",
};

export async function signInWithEmail(email: string, password: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(ERROR_MESSAGES[error.message] || `Não foi possível entrar: ${error.message}`);
  }
  if (!data?.session) {
    throw new Error("O Supabase não retornou uma sessão. Tente novamente.");
  }
  return data;
}

export async function signOutUser() {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
