"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getUniversalClient } from "@/lib/supabase/universal";
import { timeAgo } from "@/lib/format";
import { Panel, ErrorNote, Skeleton } from "@/components/central/ui";

interface AccountRow {
  id: string;
  name: string;
  clientName: string | null;
  lastSyncedAt: string | null;
}

interface IntegrationStatus {
  key: string;
  name: string;
  href: string;
  what: string;
  accounts: AccountRow[];
  emptyText: string;
}

const NOT_AVAILABLE = [
  { name: "Google Meu Negócio", href: "/integracoes/google-business" },
  { name: "Google Search Console", href: "/integracoes/search-console" },
  { name: "TikTok Ads", href: "/integracoes/tiktok-ads" },
  { name: "LinkedIn Ads", href: "/integracoes/linkedin-ads" },
];

/** Integrações: o que está conectado de verdade, conta por conta, e quando sincronizou. */
export default function IntegracoesPage() {
  const [items, setItems] = useState<IntegrationStatus[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getUniversalClient();
        const [companies, meta, google, ga4, anota] = await Promise.all([
          supabase.from("companies").select("id, name, trade_name"),
          supabase.from("meta_ads_accounts").select("account_id, account_name, company_id, last_synced_at, active"),
          supabase.from("google_ads_customers").select("customer_id, descriptive_name, company_id, last_synced_at, manager, active"),
          supabase.from("ga4_properties").select("property_id, display_name, last_synced_at, active"),
          supabase.from("anota_ai_orders").select("order_date").order("order_date", { ascending: false }).limit(1),
        ]);
        const firstErr = [companies, meta, google, ga4, anota].find((r) => r.error)?.error;
        if (firstErr) throw new Error(firstErr.message);

        const names = new Map((companies.data || []).map((c) => [c.id, c.trade_name || c.name]));
        const client = (id: string | null) => (id ? names.get(id) ?? null : null);
        const lastOrder = anota.data?.[0]?.order_date ?? null;

        setItems([
          {
            key: "meta",
            name: "Meta Ads",
            href: "/integracoes/meta-ads",
            what: "Facebook e Instagram: campanhas, conjuntos, anúncios, conversas e saldo",
            emptyText: "Nenhuma conta conectada.",
            accounts: (meta.data || [])
              .filter((a) => a.active !== false)
              .map((a) => ({ id: a.account_id, name: a.account_name, clientName: client(a.company_id), lastSyncedAt: a.last_synced_at })),
          },
          {
            key: "google-ads",
            name: "Google Ads",
            href: "/integracoes/google-ads",
            what: "Pela MCC Alien - ADM: campanhas, palavras-chave e conversões",
            emptyText: "Nenhuma conta conectada.",
            accounts: (google.data || [])
              .filter((c) => c.active !== false && !c.manager)
              .map((c) => ({ id: c.customer_id, name: c.descriptive_name, clientName: client(c.company_id), lastSyncedAt: c.last_synced_at })),
          },
          {
            key: "ga4",
            name: "Google Analytics 4",
            href: "/integracoes/google-analytics",
            what: "Visitas, usuários e conversões dos sites",
            emptyText: "Nenhuma propriedade conectada.",
            accounts: (ga4.data || [])
              .filter((p) => p.active !== false)
              .map((p) => ({ id: p.property_id, name: p.display_name, clientName: null, lastSyncedAt: p.last_synced_at })),
          },
          {
            key: "anota-ai",
            name: "Anota AI",
            href: "/integracoes/meta-ads",
            what: "Pedidos do delivery recebidos por webhook",
            emptyText: "Nenhum pedido recebido ainda.",
            accounts: lastOrder ? [{ id: "anota", name: "Último pedido recebido", clientName: null, lastSyncedAt: lastOrder }] : [],
          },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        setItems([]);
      }
    })();
  }, []);

  return (
    <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="font-display text-[28px] font-bold text-ink leading-tight">Integrações</h1>
        <p className="text-[13px] text-muted mt-0.5">
          Contas conectadas ao Alien OS. A sincronização roda sozinha todo dia às 6h, junto com a análise da Alien Max.
        </p>
      </div>

      {error && <ErrorNote message={error} />}
      {items === null && <Skeleton rows={4} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(items || []).map((it) => (
          <Panel
            key={it.key}
            title={it.name}
            meta={it.what}
            action={
              <Link href={it.href} className="text-xs text-muted hover:text-ink">
                Abrir
              </Link>
            }
          >
            {it.accounts.length === 0 ? (
              <p className="px-5 pb-5 text-[13px] text-muted">{it.emptyText}</p>
            ) : (
              <ul className="divide-y divide-line-soft border-t border-line-soft">
                {it.accounts.map((a) => {
                  const stale = a.lastSyncedAt ? Date.now() - new Date(a.lastSyncedAt).getTime() > 36 * 36e5 : true;
                  return (
                    <li key={a.id} className="px-5 py-2.5 flex items-center justify-between gap-3 text-[13px]">
                      <div className="min-w-0">
                        <p className="text-ink truncate">{a.name}</p>
                        <p className="text-[11px] text-subtle truncate">
                          {it.key === "anota-ai" ? "Webhook" : a.clientName ? `Cliente: ${a.clientName}` : "Sem cliente vinculado"}
                        </p>
                      </div>
                      <span className={`text-[11px] shrink-0 ${stale && it.key !== "anota-ai" ? "text-warning" : "text-muted"}`}>
                        {it.key === "anota-ai" ? timeAgo(a.lastSyncedAt) : `atualizado ${timeAgo(a.lastSyncedAt)}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        ))}
      </div>

      {items && (
        <section className="space-y-2">
          <h2 className="font-display text-[17px] font-bold text-ink">Ainda não disponíveis</h2>
          <p className="text-[13px] text-muted">Sem conexão real com a API por enquanto, então não mostram dados.</p>
          <div className="flex flex-wrap gap-2 pt-1">
            {NOT_AVAILABLE.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="h-8 px-3 inline-flex items-center rounded-full border border-dashed border-line-strong text-xs text-muted hover:text-ink"
              >
                {n.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
