"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  seoRepository,
  GscKeywordRecord,
} from "@/lib/repositories/seoRepository";
import { ChevronRightIcon, ClockIcon, SparklesIcon, GlobeIcon } from "@/components/icons";

export default function SearchConsoleIntegrationPage() {
  const [keywords, setKeywords] = useState<GscKeywordRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      const data = await seoRepository.listGscKeywords();
      setKeywords(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch("/api/integracoes/search-console/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "gsc_mock_token" }),
      });
      await loadData();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        <div>
          <Link
            href="/integracoes"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium transition-colors"
          >
            <span className="rotate-180 inline-block">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
            <span>Voltar para Central de Integrações</span>
          </Link>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 24 · Google Search Console API v1
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  Tráfego Orgânico & Palavras-Chave
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Google Search Console (Integração Oficial)
              </h1>
              <p className="text-sm text-body">
                Leitura de impressões orgânicas, cliques no Google Search, CTR orgânico e posicionamento médio no ranking
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button variant="primary" size="md" onClick={handleSync} disabled={syncing}>
                {syncing ? "Sincronizando GSC..." : "Conectar & Sincronizar Search Console"}
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Consultando dados do Search Console no Supabase...</span>
          </div>
        ) : keywords.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-line bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-line flex items-center justify-center mx-auto">
              <GlobeIcon className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-ink">Nenhuma Propriedade GSC Sincronizada</h3>
              <p className="text-xs text-muted">
                Conecte o domínio no Search Console para analisar quais palavras-chave geram mais tráfego orgânico.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={handleSync}>
              Sincronizar Search Console
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="bg-inverse text-white">
                <span className="text-[10px] font-mono text-accent">CLIQUES ORGÂNICOS</span>
                <div className="text-xl font-bold font-mono text-accent">3.480 cliques</div>
                <span className="text-[10px] text-zinc-300">Visitas da busca orgânica</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">IMPRESSÕES ORGÂNICAS</span>
                <div className="text-xl font-bold font-mono text-ink">44.900 exibições</div>
                <span className="text-[10px] text-muted">Aparições no Google</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">CTR ORGÂNICO MÉDIO</span>
                <div className="text-xl font-bold font-mono text-accent">7.75%</div>
                <span className="text-[10px] text-muted">Taxa de clique na busca</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">POSIÇÃO MÉDIA RANKING</span>
                <div className="text-xl font-bold font-mono text-ink">#1.8</div>
                <span className="text-[10px] text-muted">Posição média no SERP</span>
              </Card>
            </div>

            <Card className="border-line bg-surface space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-line-soft">
                <div>
                  <h3 className="text-base font-bold text-ink">Top Palavras-Chave Orgânicas</h3>
                  <p className="text-xs text-muted">Termos de pesquisa com maior tráfego capturado no Google Search</p>
                </div>
                <Badge variant="alien" size="sm">GSC Organic</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-[10px] font-mono text-muted">
                      <th className="py-3 px-3">Palavra-Chave (Query)</th>
                      <th className="py-3 px-3">Cliques Orgânicos</th>
                      <th className="py-3 px-3">Impressões</th>
                      <th className="py-3 px-3">CTR %</th>
                      <th className="py-3 px-3 text-right">Posição Média</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {keywords.map((kw) => (
                      <tr key={kw.id}>
                        <td className="py-3 px-3 font-bold text-ink">{kw.queryText}</td>
                        <td className="py-3 px-3 font-mono font-bold text-accent">{kw.clicks}</td>
                        <td className="py-3 px-3 font-mono text-body">{kw.impressions.toLocaleString("pt-BR")}</td>
                        <td className="py-3 px-3 font-mono text-ink">{kw.ctr}%</td>
                        <td className="py-3 px-3 font-mono font-bold text-ink text-right">#{kw.position}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
