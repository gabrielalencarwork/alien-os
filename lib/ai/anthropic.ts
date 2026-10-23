import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

/**
 * Cria o cliente da API do Claude sob demanda.
 * Antes o erro era lançado ao importar o arquivo, o que quebrava o build inteiro
 * quando a ANTHROPIC_API_KEY não estava configurada. Agora só a rota do Alien Max falha,
 * com a mensagem real.
 */
export function getAnthropic(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY não está definida nas variáveis de ambiente.");
  }
  client = new Anthropic({ apiKey });
  return client;
}

export const ALIEN_MAX_MODEL = process.env.ALIEN_MAX_MODEL || "claude-sonnet-4-6";
