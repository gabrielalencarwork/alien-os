/**
 * Conexão permanente com o Google guardada no servidor (tabela public.google_connections).
 * SOMENTE para uso no servidor: depende da chave de serviço do Supabase.
 */
import { getUniversalClient } from "@/lib/supabase/universal";
import { googleAuthConnector, GOOGLE_SCOPES } from "@/lib/connectors/google/googleAuthConnector";

export interface GoogleConnection {
  email: string;
  refreshToken: string;
  scopes: string;
  loginCustomerId: string | null;
  updatedAt: string;
}

function assertServer() {
  if (typeof window !== "undefined") {
    throw new Error("googleConnectionStore só pode ser usado no servidor.");
  }
}

export async function saveGoogleConnection(email: string, refreshToken: string, scopes: string): Promise<void> {
  assertServer();
  const supabase = getUniversalClient();
  const { error } = await supabase.from("google_connections").upsert(
    {
      email: email.toLowerCase(),
      refresh_token: refreshToken,
      scopes,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );
  if (error) throw new Error(`Não foi possível salvar a conexão com o Google: ${error.message}`);
}

export async function setLoginCustomerId(email: string, loginCustomerId: string): Promise<void> {
  assertServer();
  const supabase = getUniversalClient();
  await supabase
    .from("google_connections")
    .update({ login_customer_id: loginCustomerId.replace(/-/g, ""), updated_at: new Date().toISOString() })
    .eq("email", email.toLowerCase());
}

/**
 * Conexão a usar para um escopo. Prefere GOOGLE_PRIMARY_EMAIL (ex.: a conta da MCC);
 * senão, a conexão mais recente que tenha o escopo pedido.
 */
export async function getGoogleConnection(requiredScope?: string): Promise<GoogleConnection | null> {
  assertServer();
  const supabase = getUniversalClient();
  const { data, error } = await supabase
    .from("google_connections")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error || !data || data.length === 0) return null;

  const rows = requiredScope ? data.filter((r) => String(r.scopes || "").includes(requiredScope)) : data;
  if (rows.length === 0) return null;

  const preferred = process.env.GOOGLE_PRIMARY_EMAIL?.toLowerCase();
  const row = (preferred && rows.find((r) => r.email === preferred)) || rows[0];
  return {
    email: row.email,
    refreshToken: row.refresh_token,
    scopes: row.scopes || "",
    loginCustomerId: row.login_customer_id || null,
    updatedAt: row.updated_at,
  };
}

/** Gera um access token novo a partir da conexão salva. */
export async function getServerGoogleAccessToken(
  requiredScope: string
): Promise<{ accessToken: string; connection: GoogleConnection } | null> {
  const connection = await getGoogleConnection(requiredScope);
  if (!connection) return null;
  const accessToken = await googleAuthConnector.refreshAccessToken(connection.refreshToken);
  return { accessToken, connection };
}

export const GOOGLE_ADS_SCOPE = GOOGLE_SCOPES.GOOGLE_ADS;
export const GA4_SCOPE = GOOGLE_SCOPES.GA4_READONLY;
