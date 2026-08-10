/**
 * Utilitário Centralizado de Conexão Supabase (Alien OS)
 * Exporta clientes apropriados para contexto do cliente e do servidor.
 */

export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";
export { updateSession } from "./middleware";
