"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  socialMediaRepository,
  SocialMediaCampaignRecord,
} from "@/lib/repositories/socialMediaRepository";
import { ChevronRightIcon, ClockIcon, SparklesIcon, VideoIcon } from "@/components/icons";

export default function TikTokAdsIntegrationPage() {
  const [campaigns, setCampaigns] = useState<SocialMediaCampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      const data = await socialMediaRepository.listTikTokCampaigns();
      setCampaigns(data);
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
      await fetch("/api/integracoes/tiktok-ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: "tiktok_mock_access_token",
          accountId: "tk_7294019283",
          accountName: "Alien Marketing TikTok Business",
        }),
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
                  Sprint 23 · TikTok Business API v1.3
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  Spark Ads & Retenção de Vídeo UGC
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                TikTok Ads (Integração Oficial)
              </h1>
              <p className="text-sm text-body">
                Métricas de vídeo virais, alcance de topo de funil e conversões em e-commerce via TikTok Business API
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button variant="primary" size="md" onClick={handleSync} disabled={syncing}>
                {syncing ? "Sincronizando TikTok..." : "Conectar & Sincronizar TikTok Ads"}
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Consultando dados do TikTok Ads no Supabase...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-line bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-line flex items-center justify-center mx-auto">
              <VideoIcon className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-ink">Nenhuma Campanha do TikTok Sincronizada</h3>
              <p className="text-xs text-muted">
                Conecte sua conta do TikTok For Business para importar métricas de Spark Ads e criativos UGC.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={handleSync}>
              Sincronizar TikTok Ads
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="bg-inverse text-white">
                <span className="text-[10px] font-mono text-accent">INVESTIMENTO</span>
                <div className="text-xl font-bold font-mono text-accent">R$ 1.187,50</div>
                <span className="text-[10px] text-zinc-300">Custo acumulado</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">RETENÇÃO 100% VÍDEO</span>
                <div className="text-xl font-bold font-mono text-ink">850 exibições</div>
                <span className="text-[10px] text-muted">Views completas</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">CONVERSÕES</span>
                <div className="text-xl font-bold font-mono text-ink">42 vendas</div>
                <span className="text-[10px] text-muted">Vendas diretas</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">ROAS TIKTOK</span>
                <div className="text-xl font-bold font-mono text-accent">2.95x</div>
                <span className="text-[10px] text-muted">Retorno Spark Ads</span>
              </Card>
            </div>

            <Card className="border-line bg-surface space-y-4">
              <h3 className="text-base font-bold text-ink">Campanhas TikTok Ads</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-[10px] font-mono text-muted">
                      <th className="py-3 px-3">Nome da Campanha</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Objetivo</th>
                      <th className="py-3 px-3">Orçamento/dia</th>
                      <th className="py-3 px-3">Conversões</th>
                      <th className="py-3 px-3 text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-3 font-bold text-ink">{c.campaignName}</td>
                        <td className="py-3 px-3"><Badge variant="alien" size="sm">{c.status}</Badge></td>
                        <td className="py-3 px-3 font-mono">{c.objective}</td>
                        <td className="py-3 px-3 font-mono">R$ {c.budget.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono">{c.conversions}</td>
                        <td className="py-3 px-3 font-mono font-bold text-accent text-right">{c.roas}x</td>
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
