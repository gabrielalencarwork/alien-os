/**
 * Agente de vendas da Alien no WhatsApp (Claude). Só no servidor.
 *
 * Fluxo: mensagem do cliente chega → espera alguns segundos (a pessoa costuma mandar
 * várias mensagens seguidas) → lê o histórico + base de conhecimento → decide a resposta.
 * - Modo "Automático": envia pela API.
 * - Modo "Com aprovação": grava como Rascunho para a equipe aprovar no Alien OS.
 * - Modo "Silencioso", agente desligado ou equipe respondendo: não faz nada.
 * Quando precisa de uma pessoa (pedido de humano, reclamação, fechamento, assunto fora da base),
 * marca o contato e avisa a equipe por e-mail.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAnthropic, ALIEN_MAX_MODEL } from "@/lib/ai/anthropic";
import { notifyTeam } from "@/lib/reports/delivery";
import { APP_URL } from "@/lib/reports/messages";
import { sendText, markReadAndTyping, whatsappConfigured } from "./cloudApi";
import { formatPhone, insideServiceWindow, normalizeAuthor, normalizeMode, type AgentSettings } from "./types";

const TZ = "America/Sao_Paulo";

export const AGENT_TOOL = {
  name: "responder_whatsapp",
  description: "Registra a resposta do agente para o contato e o que ele aprendeu sobre o lead.",
  input_schema: {
    type: "object" as const,
    properties: {
      mensagens: {
        type: "array",
        minItems: 0,
        maxItems: 3,
        items: { type: "string" },
        description:
          "Mensagens a enviar agora, na ordem (1 a 3 balões curtos de WhatsApp). Lista vazia quando não há nada a responder (ex.: o cliente só mandou 'ok' e a conversa já terminou).",
      },
      precisa_humano: {
        type: "boolean",
        description:
          "true quando a conversa precisa do Gabriel: pediu para falar com uma pessoa, reclamação, cliente atual com assunto sensível, pronto para fechar/negociar preço, ou pergunta que a base de conhecimento não responde.",
      },
      motivo_humano: { type: "string", description: "Se precisa_humano, explique em 1 frase o que o Gabriel precisa fazer." },
      lead: {
        type: "object",
        description: "O que se sabe do contato até agora (preencha só o que foi dito na conversa; nada inventado).",
        properties: {
          nome: { type: "string" },
          empresa: { type: "string" },
          segmento: { type: "string" },
          cidade: { type: "string" },
          interesse: { type: "string", description: "Serviço(s) de interesse" },
          etapa: {
            type: "string",
            enum: ["Novo", "Contato feito", "Diagnóstico", "Proposta enviada", "Negociação", "Fechado", "Perdido"],
          },
          proximo_passo: { type: "string" },
        },
      },
      resumo: { type: "string", description: "Resumo atualizado do contato em até 3 frases, para a equipe e para as próximas conversas." },
    },
    required: ["mensagens", "precisa_humano", "resumo"],
  },
};

export type AgentDecision = {
  mensagens: string[];
  precisa_humano: boolean;
  motivo_humano?: string;
  lead?: { nome?: string; empresa?: string; segmento?: string; cidade?: string; interesse?: string; etapa?: string; proximo_passo?: string };
  resumo: string;
};

export type ChatLine = { author: "Cliente" | "Agente" | "Equipe"; text: string; at?: string };

function nowLabel() {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, dateStyle: "full", timeStyle: "short" }).format(new Date());
}

export function buildSystemPrompt(settings: Pick<AgentSettings, "knowledge" | "instructions">) {
  return `Você é a Aline, do time comercial da Alien Marketing Inteligente, agência de marketing digital de Belo Horizonte (MG) especializada em clínicas de saúde e estética, e conversa pelo WhatsApp da agência. Você responde em nome da equipe da Alien. Se perguntarem de onde a Alien é, a resposta é Belo Horizonte (o fundador, Gabriel, é de Montes Claros, e isso só entra na conversa se fizer sentido).

Seu objetivo: entender o negócio da pessoa, mostrar como a Alien pode ajudar e levar a conversa até uma reunião de diagnóstico com o Gabriel (fundador) ou até o fechamento — sem pressa e sem pressão.

Como conversar no WhatsApp:
- Português do Brasil, tom humano, próximo e profissional. Mensagens curtas (1 a 3 balões, até ~300 caracteres cada). Nada de textão, listas longas ou markdown (sem **, #). Emoji com moderação (no máximo 1 por mensagem, e só se combinar).
- Uma pergunta por vez. Escute antes de oferecer. Use o nome da pessoa quando souber.
- Qualifique naturalmente: tipo de negócio, cidade, o que já fazem de marketing, objetivo (mais clientes, vendas, reservas...), se já investem em anúncios e quanto, e urgência.
- Quando fizer sentido, convide para uma conversa rápida de diagnóstico com o Gabriel (gratuita). Não confirme horário você mesmo: peça os melhores dias/horários da pessoa e marque precisa_humano para o Gabriel confirmar.
- Se a pessoa já é cliente da Alien, seja prestativo, não tente vender de novo, e chame o Gabriel para qualquer coisa sobre campanhas, prazos, valores ou problemas.

Regras que você nunca quebra:
- Use SOMENTE as informações da base de conhecimento abaixo sobre serviços, preços, prazos, resultados e cases. Se a informação não estiver lá, diga que vai confirmar com o Gabriel e marque precisa_humano. Nunca invente preço, desconto, garantia de resultado ou prazo.
- Não prometa resultados específicos (ex.: "vai dobrar suas vendas").
- Não diga que você é uma IA a menos que perguntem diretamente; se perguntarem, seja honesto: você é o assistente virtual da Alien e o Gabriel acompanha as conversas.
- Se pedirem para falar com uma pessoa, reclamarem, ou o assunto for sensível, responda com empatia, diga que o Gabriel vai assumir em breve e marque precisa_humano.
- Se a pessoa pedir para não receber mais mensagens, respeite, peça desculpas pelo incômodo e marque etapa "Perdido".
- Não responda a mensagens que claramente não são para a agência (spam, golpes): mensagens vazias.
- Áudio, imagem ou arquivo que você não consegue ver: diga com naturalidade que não conseguiu abrir aqui e peça para resumir por texto.

Agora: ${nowLabel()} (horário de Brasília).

${settings.instructions?.trim() ? `Orientações extras do Gabriel:\n${settings.instructions.trim()}\n\n` : ""}Base de conhecimento da Alien:
${settings.knowledge?.trim() || "(vazia — não fale de preços, prazos nem detalhes de serviços; ofereça conversar com o Gabriel e marque precisa_humano)"}

Sempre responda chamando a ferramenta responder_whatsapp.`;
}

export function buildContextNote(c: { nome: string; telefone: string; cliente?: string | null; resumo?: string | null; etapa?: string | null }) {
  return [
    `Contato: ${c.nome} (${c.telefone})`,
    c.cliente ? `ESTE CONTATO É CLIENTE ATUAL DA ALIEN: ${c.cliente}.` : "Este contato não é cliente atual (lead).",
    c.etapa ? `Etapa no funil: ${c.etapa}` : "",
    c.resumo ? `O que já sabemos: ${c.resumo}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Monta as mensagens para o Claude: histórico como turnos user/assistant (Equipe conta como resposta da Alien). */
function toTurns(context: string, history: ChatLine[]) {
  const turns: { role: "user" | "assistant"; content: string }[] = [];
  const push = (role: "user" | "assistant", text: string) => {
    const last = turns[turns.length - 1];
    if (last && last.role === role) last.content += `\n${text}`;
    else turns.push({ role, content: text });
  };
  push("user", `[Contexto interno, não é mensagem do cliente]\n${context}\n\n[Início da conversa]`);
  for (const h of history) {
    if (h.author === "Cliente") push("user", h.text);
    else push("assistant", h.author === "Equipe" ? `(Gabriel escreveu) ${h.text}` : h.text);
  }
  if (turns[turns.length - 1].role === "assistant") push("user", "[Sem mensagem nova do cliente. Decida se há algo a responder; normalmente lista vazia.]");
  return turns;
}

export async function decide(settings: Pick<AgentSettings, "knowledge" | "instructions">, context: string, history: ChatLine[]): Promise<AgentDecision> {
  const res = await getAnthropic().messages.create({
    model: ALIEN_MAX_MODEL,
    max_tokens: 1200,
    system: buildSystemPrompt(settings),
    tools: [AGENT_TOOL],
    tool_choice: { type: "tool", name: AGENT_TOOL.name },
    messages: toTurns(context, history),
  });
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("O agente não devolveu uma resposta.");
  const d = block.input as AgentDecision;
  return {
    mensagens: (Array.isArray(d.mensagens) ? d.mensagens : []).map((m) => String(m).trim()).filter(Boolean).slice(0, 3),
    precisa_humano: !!d.precisa_humano,
    motivo_humano: d.motivo_humano,
    lead: d.lead,
    resumo: String(d.resumo || ""),
  };
}

export async function getSettings(supabase: SupabaseClient): Promise<AgentSettings> {
  const { data, error } = await supabase.from("agent_settings").select("*").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return {
    enabled: !!data?.enabled,
    knowledge: data?.knowledge || "",
    instructions: data?.instructions || "",
    pauseMinutes: Number(data?.pause_minutes ?? 120),
    updatedAt: data?.updated_at || null,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Grava o que o agente aprendeu: resumo no contato e lead no funil (prospects) para quem não é cliente. */
async function saveLead(supabase: SupabaseClient, contact: { id: string; wa_id: string; prospect_id: string | null; company_id: string | null; profile_name: string | null; name: string | null }, d: AgentDecision) {
  const update: Record<string, unknown> = { summary: d.resumo || null, updated_at: new Date().toISOString() };
  if (!contact.company_id) {
    const l = d.lead || {};
    const leadName = l.empresa || l.nome || contact.name || contact.profile_name || formatPhone(contact.wa_id);
    const row: Record<string, unknown> = {
      name: leadName,
      contact_name: l.nome || contact.profile_name || null,
      phone: contact.wa_id,
      segment: l.segmento || null,
      source: "WhatsApp",
      notes: [d.resumo, l.cidade ? `Cidade: ${l.cidade}` : "", l.interesse ? `Interesse: ${l.interesse}` : ""].filter(Boolean).join("\n"),
      next_step: l.proximo_passo || null,
      updated_at: new Date().toISOString(),
    };
    if (l.etapa) row.stage = l.etapa;
    if (contact.prospect_id) {
      await supabase.from("prospects").update(row).eq("id", contact.prospect_id);
    } else {
      const { data } = await supabase.from("prospects").insert({ stage: "Contato feito", ...row }).select("id").maybeSingle();
      if (data?.id) update.prospect_id = data.id;
    }
    if (!contact.name && l.nome) update.name = l.nome;
  }
  await supabase.from("wa_contacts").update(update).eq("id", contact.id);
}

/**
 * Roda o agente para um contato. triggerMessageId = mensagem que disparou; se chegar outra
 * mensagem do cliente durante a espera, esta execução desiste e a mais nova responde tudo junto.
 */
export async function runAgent(supabase: SupabaseClient, contactId: string, triggerMessageId: string, waitMs = 7000) {
  const settings = await getSettings(supabase);
  if (!settings.enabled) return { skipped: "agente desligado" };

  await sleep(waitMs);

  const { data: latest } = await supabase
    .from("wa_messages")
    .select("id")
    .eq("contact_id", contactId)
    .eq("direction", "Entrada")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest?.id !== triggerMessageId) return { skipped: "mensagem mais nova chegou" };

  const { data: contact, error: cErr } = await supabase
    .from("wa_contacts")
    .select("*, companies(name, trade_name), prospects(stage)")
    .eq("id", contactId)
    .maybeSingle();
  if (cErr || !contact) throw new Error(cErr?.message || "Contato não encontrado.");

  const mode = normalizeMode(contact.mode);
  if (mode === "Silencioso") return { skipped: "contato silencioso" };
  if (contact.agent_paused_until && new Date(contact.agent_paused_until).getTime() > Date.now()) return { skipped: "equipe respondendo" };
  if (contact.needs_human) return { skipped: "aguardando a equipe" };

  const { data: rows } = await supabase
    .from("wa_messages")
    .select("author, body, type, status, created_at")
    .eq("contact_id", contactId)
    .not("status", "in", "(Rascunho,Descartada,Falhou)")
    .order("created_at", { ascending: false })
    .limit(40);
  const history: ChatLine[] = (rows || [])
    .reverse()
    .map((r) => ({ author: normalizeAuthor(r.author), text: r.body || (r.type !== "text" ? `[${r.type}]` : ""), at: r.created_at }))
    .filter((h) => h.text);

  const company = contact.companies as { name?: string; trade_name?: string } | null;
  const context = buildContextNote({
    nome: contact.name || contact.profile_name || "sem nome",
    telefone: formatPhone(contact.wa_id),
    cliente: company ? company.trade_name || company.name : null,
    resumo: contact.summary,
    etapa: (contact.prospects as { stage?: string } | null)?.stage || null,
  });

  const d = await decide(settings, context, history);
  await saveLead(supabase, contact, d);

  const now = new Date().toISOString();
  const send = mode === "Automático" && whatsappConfigured() && insideServiceWindow(contact.last_inbound_at);

  for (const text of d.mensagens) {
    if (!send) {
      await supabase.from("wa_messages").insert({ contact_id: contactId, direction: "Saída", author: "Agente", type: "text", body: text, status: "Rascunho" });
      continue;
    }
    const { data: msg } = await supabase
      .from("wa_messages")
      .insert({ contact_id: contactId, direction: "Saída", author: "Agente", type: "text", body: text, status: "Enviando" })
      .select("id")
      .single();
    try {
      const waId = await sendText(contact.wa_id, text);
      await supabase.from("wa_messages").update({ wa_message_id: waId, status: "Enviada", sent_at: new Date().toISOString() }).eq("id", msg!.id);
    } catch (err) {
      await supabase.from("wa_messages").update({ status: "Falhou", error: err instanceof Error ? err.message : String(err) }).eq("id", msg!.id);
      break;
    }
    if (d.mensagens.length > 1) await sleep(1200);
  }
  if (d.mensagens.length) await supabase.from("wa_contacts").update({ last_message_at: now }).eq("id", contactId);

  const name = contact.name || contact.profile_name || formatPhone(contact.wa_id);
  if (d.precisa_humano) {
    await supabase.from("wa_contacts").update({ needs_human: true, human_reason: d.motivo_humano || "O agente pediu ajuda." }).eq("id", contactId);
    await notifyTeam(`WhatsApp: ${name} precisa de você`, `${d.motivo_humano || "O agente pediu ajuda nesta conversa."}\n\nResumo: ${d.resumo}`, `${APP_URL}/whatsapp?c=${contactId}`);
  } else if (!send && d.mensagens.length && mode === "Com aprovação") {
    await notifyTeam(`WhatsApp: resposta para ${name} aguardando aprovação`, d.mensagens.join("\n\n"), `${APP_URL}/whatsapp?c=${contactId}`);
  }
  return { sent: send ? d.mensagens.length : 0, drafts: send ? 0 : d.mensagens.length, needsHuman: d.precisa_humano };
}

export { markReadAndTyping };
