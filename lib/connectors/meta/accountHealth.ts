/**
 * Saúde das contas do Meta Ads: status da conta e saldo disponível (contas pré-pagas).
 * Lido ao vivo da Graph API com o token de usuário de sistema (META_SYSTEM_USER_TOKEN).
 * Uso apenas no servidor.
 */

import type { ClientResult, ClientSignal } from "@/lib/central/clientResults";

const STATUS_LABEL: Record<number, string> = {
  1: "Ativa",
  2: "Desativada",
  3: "Pagamento pendente",
  7: "Em análise de risco",
  8: "Liquidação pendente",
  9: "Período de carência",
  100: "Encerramento pendente",
  101: "Encerrada",
};

export interface MetaAccountHealth {
  accountId: string;
  accountName: string;
  statusCode: number | null;
  statusLabel: string;
  isPrepay: boolean;
  /** Saldo disponível em R$ (contas pré-pagas). null quando a Meta não informa. */
  availableBalance: number | null;
  /** Limite de gasto da conta atingido (anúncios param de rodar). */
  spendCapReached: boolean;
  /** Dias de saldo no ritmo de gasto dos últimos 7 dias. null sem gasto ou sem saldo informado. */
  daysOfBalance: number | null;
  error: string | null;
}

interface GraphAccount {
  name?: string;
  account_status?: number;
  is_prepay_account?: boolean;
  amount_spent?: string;
  spend_cap?: string;
  funding_source_details?: { display_string?: string };
  error?: { message?: string };
}

function parseBrl(text: string | undefined): number | null {
  if (!text) return null;
  const m = text.match(/R\$\s*([\d.]+(?:,\d{1,2})?)/);
  if (!m) return null;
  const n = Number(m[1].replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function fetchMetaAccountHealth(
  accountId: string,
  accountName: string,
  dailySpend: number
): Promise<MetaAccountHealth> {
  const base: MetaAccountHealth = {
    accountId,
    accountName,
    statusCode: null,
    statusLabel: "Desconhecido",
    isPrepay: false,
    availableBalance: null,
    spendCapReached: false,
    daysOfBalance: null,
    error: null,
  };
  const token = process.env.META_SYSTEM_USER_TOKEN;
  if (!token) return { ...base, error: "META_SYSTEM_USER_TOKEN não está configurado no servidor" };

  try {
    const fields = "name,account_status,is_prepay_account,amount_spent,spend_cap,funding_source_details";
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${encodeURIComponent(accountId)}?fields=${fields}&access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    );
    const data = (await res.json()) as GraphAccount;
    if (!res.ok || data.error) return { ...base, error: data.error?.message || `Meta respondeu ${res.status}` };

    const spent = Number(data.amount_spent) || 0;
    const cap = Number(data.spend_cap) || 0;
    const fromFunding = parseBrl(data.funding_source_details?.display_string);
    const isPrepay = !!data.is_prepay_account;
    const availableBalance = isPrepay ? fromFunding ?? (cap > 0 ? Math.max(0, (cap - spent) / 100) : null) : null;

    return {
      ...base,
      accountName: data.name || accountName,
      statusCode: data.account_status ?? null,
      statusLabel: STATUS_LABEL[data.account_status ?? -1] ?? `Status ${data.account_status}`,
      isPrepay,
      availableBalance,
      spendCapReached: cap > 0 && spent >= cap,
      daysOfBalance:
        availableBalance !== null && dailySpend > 0 ? Math.round((availableBalance / dailySpend) * 10) / 10 : null,
    };
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : String(err) };
  }
}

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Acrescenta o saldo e o status das contas Meta a cada cliente, com alertas próprios. */
export async function attachMetaHealth(clients: ClientResult[]): Promise<void> {
  await Promise.all(
    clients.map(async (c) => {
      const metas = c.platforms.filter((p) => p.platform === "meta-ads");
      if (!metas.length) return;
      const dailySpend = (c.spendByPlatform["meta-ads"] || 0) / 7 / metas.length;
      const health = await Promise.all(metas.map((m) => fetchMetaAccountHealth(m.accountId, m.accountName, dailySpend)));
      c.metaHealth = health;

      const extra: ClientSignal[] = [];
      for (const h of health) {
        if (h.error) {
          extra.push({ level: "atencao", text: `Não foi possível ler o saldo do Meta: ${h.error}` });
          continue;
        }
        if (h.statusCode !== null && h.statusCode !== 1) {
          extra.push({ level: "critico", text: `Conta Meta com status "${h.statusLabel}"` });
        }
        if (h.isPrepay && h.availableBalance !== null && h.availableBalance <= 1) {
          extra.push({ level: "critico", text: `Conta Meta sem saldo (${brl(h.availableBalance)}): anúncios parados` });
        } else if (h.spendCapReached) {
          extra.push({ level: "critico", text: "Limite de gasto da conta Meta atingido: anúncios parados" });
        } else if (h.daysOfBalance !== null && h.daysOfBalance < 3) {
          extra.push({
            level: "atencao",
            text: `Saldo Meta baixo: ${brl(h.availableBalance ?? 0)} (cerca de ${h.daysOfBalance.toLocaleString("pt-BR")} dia(s) no ritmo atual)`,
          });
        }
      }
      if (extra.length) {
        c.signals = [...extra, ...c.signals.filter((s) => s.level !== "ok")];
      }
    })
  );
}
