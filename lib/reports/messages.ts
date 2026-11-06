/**
 * Textos de envio dos relatórios (sem dependências de servidor: usado também na tela Relatórios).
 */

import type { MetaAccountHealth } from "@/lib/connectors/meta/accountHealth";

export type ReportKind = "relatorio" | "lembrete";

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://os.alienmkt.com.br").replace(/\/$/, "");

function dm(date: string) {
  return `${date.slice(8, 10)}/${date.slice(5, 7)}`;
}

export function rangeLabel(start: string, end: string) {
  return `${dm(start)} a ${dm(end)}`;
}

/** Motivo dos anúncios parados, só quando a Meta informa (nada de suposição). */
export function inactiveReason(health: MetaAccountHealth[] | undefined): "sem_saldo" | "limite_gasto" | null {
  const ok = (health || []).filter((h) => !h.error);
  if (ok.some((h) => h.spendCapReached)) return "limite_gasto";
  if (ok.some((h) => h.isPrepay && h.availableBalance !== null && h.availableBalance <= 5)) return "sem_saldo";
  return null;
}

/** Texto do lembrete para cliente sem investimento na semana (mesmo texto no e-mail e no WhatsApp). */
export function reminderText(clientName: string, weekStart: string, weekEnd: string, reason: ReturnType<typeof inactiveReason>) {
  const why =
    reason === "sem_saldo"
      ? " porque a conta de anúncios ficou sem saldo. Assim que a recarga for feita, reativamos tudo e os anúncios voltam a trazer contatos."
      : reason === "limite_gasto"
        ? " porque a conta de anúncios atingiu o limite de gastos. Com o limite ajustado, reativamos tudo e os anúncios voltam a trazer contatos."
        : ". Quando quiser retomar, é só responder esta mensagem que cuidamos de tudo para os anúncios voltarem a trazer contatos.";
  return `Olá, ${clientName}! Tudo bem? Aqui é da Alien Marketing Inteligente. Passando para avisar que na semana de ${rangeLabel(weekStart, weekEnd)} seus anúncios ficaram parados${why} Qualquer dúvida, estamos à disposição!`;
}

/** Texto do WhatsApp (relatório com link, ou o próprio lembrete). */
export function whatsappMessage(r: { kind: ReportKind; clientName: string; weekStart: string; weekEnd: string; summary: string; shareToken: string }, origin = APP_URL) {
  if (r.kind === "lembrete") return r.summary;
  return `Olá, ${r.clientName}! Segue o relatório dos seus anúncios na semana de ${rangeLabel(r.weekStart, r.weekEnd)}:\n${origin}/r/${r.shareToken}\n\n${r.summary}`;
}

/** Link "clique para conversar" do WhatsApp. Sem telefone válido, abre o WhatsApp para escolher o contato. */
export function whatsappLink(phone: string | null | undefined, text: string) {
  let digits = (phone || "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits && !digits.startsWith("55") && (digits.length === 10 || digits.length === 11)) digits = `55${digits}`;
  const valid = digits.length >= 12 && digits.length <= 13;
  return `https://wa.me/${valid ? digits : ""}?text=${encodeURIComponent(text)}`;
}

