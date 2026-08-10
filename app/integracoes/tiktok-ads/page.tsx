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
                  Sprint 23 · TikTok Business API v1.3
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Spark Ads & Retenção de Vídeo UGC
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                TikTok Ads (Integração Oficial)
              </h1>
              <p className="text-sm text-[#52525B]">
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
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Consultando dados do TikTok Ads no Supabase...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <VideoIcon className="w-6 h-6 text-[#4A8237]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#111111]">Nenhuma Campanha do TikTok Sincronizada</h3>
              <p className="text-xs text-[#71717A]">
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
              <Card padding="sm" className="bg-[#111111] text-white">
                <span className="text-[10px] font-mono text-[#4A8237]">INVESTIMENTO</span>
                <div className="text-xl font-bold font-mono text-[#4A8237]">R$ 1.187,50</div>
                <span className="text-[10px] text-zinc-300">Custo acumulado</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">RETENÇÃO 100% VÍDEO</span>
                <div className="text-xl font-bold font-mono text-[#111111]">850 exibições</div>
                <span className="text-[10px] text-[#71717A]">Views completas</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">CONVERSÕES</span>
                <div className="text-xl font-bold font-mono text-[#111111]">42 vendas</div>
                <span className="text-[10px] text-[#71717A]">Vendas diretas</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">ROAS TIKTOK</span>
                <div className="text-xl font-bold font-mono text-[#4A8237]">2.95x</div>
                <span className="text-[10px] text-[#71717A]">Retorno Spark Ads</span>
              </Card>
            </div>

            <Card className="border-[#E4E4E7] bg-white space-y-4">
              <h3 className="text-base font-bold text-[#111111]">Campanhas TikTok Ads</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono text-[#71717A]">
                      <th className="py-3 px-3">Nome da Campanha</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Objetivo</th>
                      <th className="py-3 px-3">Orçamento/dia</th>
                      <th className="py-3 px-3">Conversões</th>
                      <th className="py-3 px-3 text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F5]">
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-3 font-bold text-[#111111]">{c.campaignName}</td>
                        <td className="py-3 px-3"><Badge variant="alien" size="sm">{c.status}</Badge></td>
                        <td className="py-3 px-3 font-mono">{c.objective}</td>
                        <td className="py-3 px-3 font-mono">R$ {c.budget.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono">{c.conversions}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#4A8237] text-right">{c.roas}x</td>
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
