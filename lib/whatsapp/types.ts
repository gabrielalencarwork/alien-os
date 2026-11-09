/** Tipos e valores canônicos do WhatsApp (20261106000038_whatsapp_agente.sql). */

export type ContactMode = "Automático" | "Com aprovação" | "Silencioso";
export type MessageDirection = "Entrada" | "Saída";
export type MessageAuthor = "Cliente" | "Agente" | "Equipe";
export type MessageStatus = "Recebida" | "Rascunho" | "Enviando" | "Enviada" | "Entregue" | "Lida" | "Falhou" | "Descartada";

export type ContactClassification = "Lead" | "Cliente";

export const CONTACT_MODES: ContactMode[] = ["Automático", "Com aprovação", "Silencioso"];

export interface WaContact {
  id: string;
  waId: string;
  name: string | null;
  profileName: string | null;
  mode: ContactMode;
  classification: ContactClassification;
  companyId: string | null;
  companyName: string | null;
  prospectId: string | null;
  needsHuman: boolean;
  humanReason: string | null;
  agentPausedUntil: string | null;
  summary: string | null;
  lastMessageAt: string | null;
  lastInboundAt: string | null;
  createdAt: string;
}

export interface WaMessage {
  id: string;
  contactId: string;
  waMessageId: string | null;
  direction: MessageDirection;
  author: MessageAuthor;
  type: string;
  body: string;
  status: MessageStatus;
  error: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface AgentSettings {
  enabled: boolean;
  knowledge: string;
  instructions: string;
  pauseMinutes: number;
  updatedAt: string | null;
}

export function normalizeMode(v: unknown): ContactMode {
  const s = String(v || "").toLowerCase();
  if (s.startsWith("com") || s.includes("aprov") || s === "approval") return "Com aprovação";
  if (s.startsWith("sil") || s === "off" || s === "silent") return "Silencioso";
  return "Automático";
}

export function normalizeDirection(v: unknown): MessageDirection {
  const s = String(v || "").toLowerCase();
  return s.startsWith("sa") || s === "out" || s === "outbound" ? "Saída" : "Entrada";
}

export function normalizeAuthor(v: unknown): MessageAuthor {
  const s = String(v || "").toLowerCase();
  if (s.startsWith("agen") || s === "agent") return "Agente";
  if (s.startsWith("equi") || s === "team" || s === "human" || s === "humano") return "Equipe";
  return "Cliente";
}

const STATUSES: MessageStatus[] = ["Recebida", "Rascunho", "Enviando", "Enviada", "Entregue", "Lida", "Falhou", "Descartada"];
const STATUS_EN: Record<string, MessageStatus> = {
  received: "Recebida",
  draft: "Rascunho",
  sending: "Enviando",
  sent: "Enviada",
  delivered: "Entregue",
  read: "Lida",
  failed: "Falhou",
  discarded: "Descartada",
};
export function normalizeStatus(v: unknown): MessageStatus {
  const s = String(v || "");
  return (STATUSES as string[]).includes(s) ? (s as MessageStatus) : STATUS_EN[s.toLowerCase()] || "Recebida";
}

/** Dentro da janela de 24h da Meta (última mensagem do cliente) dá para enviar texto livre. */
export function insideServiceWindow(lastInboundAt: string | null, now = Date.now()) {
  return !!lastInboundAt && now - new Date(lastInboundAt).getTime() < 24 * 3600 * 1000;
}

/** Formata 5531984706088 → +55 (31) 98470-6088 */
export function formatPhone(waId: string) {
  const d = waId.replace(/\D/g, "");
  if (d.startsWith("55") && (d.length === 12 || d.length === 13)) {
    const ddd = d.slice(2, 4);
    const n = d.slice(4);
    return `+55 (${ddd}) ${n.length === 9 ? `${n.slice(0, 5)}-${n.slice(5)}` : `${n.slice(0, 4)}-${n.slice(4)}`}`;
  }
  return `+${d}`;
}
