/**
 * Envio pela WhatsApp Cloud API (API oficial da Meta). Só no servidor.
 * Variáveis no Vercel:
 *   WHATSAPP_PHONE_NUMBER_ID .. id do número na Meta (WhatsApp Manager → API Setup)
 *   WHATSAPP_ACCESS_TOKEN ..... token do usuário do sistema com whatsapp_business_messaging
 *                               (se faltar, usa META_SYSTEM_USER_TOKEN)
 */

const GRAPH = "https://graph.facebook.com/v21.0";

export function whatsappConfigured() {
  return !!process.env.WHATSAPP_PHONE_NUMBER_ID && !!(process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN);
}

async function call(body: Record<string, unknown>) {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_SYSTEM_USER_TOKEN;
  if (!phoneId || !token) throw new Error("WhatsApp não configurado: falta WHATSAPP_PHONE_NUMBER_ID ou o token no Vercel.");
  const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });
  const data = (await res.json().catch(() => ({}))) as {
    messages?: { id: string }[];
    error?: { message?: string; code?: number; error_data?: { details?: string } };
  };
  if (!res.ok || data.error) {
    const e = data.error;
    throw new Error(`WhatsApp ${res.status}${e?.code ? ` (código ${e.code})` : ""}: ${e?.error_data?.details || e?.message || "erro desconhecido"}`);
  }
  return data;
}

/** Envia texto livre (só funciona dentro da janela de 24h desde a última mensagem do cliente). */
export async function sendText(to: string, text: string): Promise<string | null> {
  const send = (dest: string) => call({ recipient_type: "individual", to: dest, type: "text", text: { preview_url: true, body: text } });
  try {
    const data = await send(to);
    return data.messages?.[0]?.id || null;
  } catch (err) {
    // A Meta entrega o wa_id de celulares brasileiros sem o 9º dígito (55 + DDD + 8 dígitos),
    // mas a lista de destinatários do número de teste guarda o número com o 9.
    // Se a Meta recusar por "fora da lista" (131030), tenta de novo com o 9.
    const alt = brazilWithNine(to);
    if (alt && err instanceof Error && err.message.includes("131030")) {
      const data = await send(alt);
      return data.messages?.[0]?.id || null;
    }
    throw err;
  }
}

/** 553884355315 → 5538984355315 (só celulares: o número local começa com 6–9). */
export function brazilWithNine(waId: string): string | null {
  const d = waId.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("55") && /[6-9]/.test(d[4])) return `${d.slice(0, 4)}9${d.slice(4)}`;
  return null;
}

/** Marca a mensagem recebida como lida e mostra "digitando..." para o cliente. Falha aqui não é crítica. */
export async function markReadAndTyping(messageId: string) {
  try {
    await call({ status: "read", message_id: messageId, typing_indicator: { type: "text" } });
  } catch {
    try {
      await call({ status: "read", message_id: messageId });
    } catch {
      // ignora
    }
  }
}
