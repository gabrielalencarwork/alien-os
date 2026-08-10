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
            className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
          >
            <span className="rotate-180 inline-block">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
            <span>Voltar para Central de Integrações</span>
          </Link>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 24 · Google Search Console API v1
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Tráfego Orgânico & Palavras-Chave
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Google Search Console (Integração Oficial)
              </h1>
              <p className="text-sm text-[#52525B]">
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
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Consultando dados do Search Console no Supabase...</span>
          </div>
        ) : keywords.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <GlobeIcon className="w-6 h-6 text-[#4A8237]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#111111]">Nenhuma Propriedade GSC Sincronizada</h3>
              <p className="text-xs text-[#71717A]">
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
              <Card padding="sm" className="bg-[#111111] text-white">
                <span className="text-[10px] font-mono text-[#4A8237]">CLIQUES ORGÂNICOS</span>
                <div className="text-xl font-bold font-mono text-[#4A8237]">3.480 cliques</div>
                <span className="text-[10px] text-zinc-300">Visitas da busca orgânica</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">IMPRESSÕES ORGÂNICAS</span>
                <div className="text-xl font-bold font-mono text-[#111111]">44.900 exibições</div>
                <span className="text-[10px] text-[#71717A]">Aparições no Google</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">CTR ORGÂNICO MÉDIO</span>
                <div className="text-xl font-bold font-mono text-[#4A8237]">7.75%</div>
                <span className="text-[10px] text-[#71717A]">Taxa de clique na busca</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">POSIÇÃO MÉDIA RANKING</span>
                <div className="text-xl font-bold font-mono text-[#111111]">#1.8</div>
                <span className="text-[10px] text-[#71717A]">Posição média no SERP</span>
              </Card>
            </div>

            <Card className="border-[#E4E4E7] bg-white space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F5]">
                <div>
                  <h3 className="text-base font-bold text-[#111111]">Top Palavras-Chave Orgânicas</h3>
                  <p className="text-xs text-[#71717A]">Termos de pesquisa com maior tráfego capturado no Google Search</p>
                </div>
                <Badge variant="alien" size="sm">GSC Organic</Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono text-[#71717A]">
                      <th className="py-3 px-3">Palavra-Chave (Query)</th>
                      <th className="py-3 px-3">Cliques Orgânicos</th>
                      <th className="py-3 px-3">Impressões</th>
                      <th className="py-3 px-3">CTR %</th>
                      <th className="py-3 px-3 text-right">Posição Média</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F5]">
                    {keywords.map((kw) => (
                      <tr key={kw.id}>
                        <td className="py-3 px-3 font-bold text-[#111111]">{kw.queryText}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">{kw.clicks}</td>
                        <td className="py-3 px-3 font-mono text-[#52525B]">{kw.impressions.toLocaleString("pt-BR")}</td>
                        <td className="py-3 px-3 font-mono text-[#111111]">{kw.ctr}%</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#111111] text-right">#{kw.position}</td>
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
