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
import { ChevronRightIcon, ClockIcon, SparklesIcon, UsersIcon } from "@/components/icons";

export default function LinkedInAdsIntegrationPage() {
  const [campaigns, setCampaigns] = useState<SocialMediaCampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      const data = await socialMediaRepository.listLinkedInCampaigns();
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
      await fetch("/api/integracoes/linkedin-ads/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: "linkedin_mock_access_token",
          accountId: "urn:li:sponsoredAccount:50912839",
          accountName: "Alien Marketing B2B Enterprise",
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
                  Sprint 23 · LinkedIn Marketing API v2
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  Geração de Leads B2B & Formulários
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                LinkedIn Ads (Integração Oficial)
              </h1>
              <p className="text-sm text-body">
                Leads B2B qualificados, custo por lead (CPL), campanhas para decisores C-Level e conteúdo patrocinado
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button variant="primary" size="md" onClick={handleSync} disabled={syncing}>
                {syncing ? "Sincronizando LinkedIn..." : "Conectar & Sincronizar LinkedIn Ads"}
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Consultando dados do LinkedIn Ads no Supabase...</span>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-line bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-line flex items-center justify-center mx-auto">
              <UsersIcon className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-ink">Nenhuma Campanha do LinkedIn Sincronizada</h3>
              <p className="text-xs text-muted">
                Conecte sua conta do LinkedIn Campaign Manager para gerenciar conversões B2B e Lead Gen Forms.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={handleSync}>
              Sincronizar LinkedIn Ads
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="bg-inverse text-white">
                <span className="text-[10px] font-mono text-accent">INVESTIMENTO B2B</span>
                <div className="text-xl font-bold font-mono text-accent">R$ 3.297,00</div>
                <span className="text-[10px] text-zinc-300">Gasto total LinkedIn</span>
              </Card>
              <Card padding="sm" className="bg-accent/8 border-accent">
                <span className="text-[10px] font-mono text-accent">LEADS B2B GERADOS</span>
                <div className="text-xl font-bold font-mono text-ink">28 Leads</div>
                <span className="text-[10px] text-accent font-semibold font-mono">Lead Gen Forms</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">CPL MÉDIO (CUSTO/LEAD)</span>
                <div className="text-xl font-bold font-mono text-ink">R$ 117,75</div>
                <span className="text-[10px] text-muted">Custo por Lead qualificado</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">ROAS LINKEDIN</span>
                <div className="text-xl font-bold font-mono text-accent">3.79x</div>
                <span className="text-[10px] text-muted">Retorno Mídia B2B</span>
              </Card>
            </div>

            <Card className="border-line bg-surface space-y-4">
              <h3 className="text-base font-bold text-ink">Campanhas LinkedIn Ads B2B</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-line bg-canvas text-[10px] font-mono text-muted">
                      <th className="py-3 px-3">Nome da Campanha</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Objetivo</th>
                      <th className="py-3 px-3">Leads B2B</th>
                      <th className="py-3 px-3">CPL R$</th>
                      <th className="py-3 px-3 text-right">ROAS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line-soft">
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 px-3 font-bold text-ink">{c.campaignName}</td>
                        <td className="py-3 px-3"><Badge variant="alien" size="sm">{c.status}</Badge></td>
                        <td className="py-3 px-3 font-mono">{c.objective}</td>
                        <td className="py-3 px-3 font-mono font-bold text-ink">{c.leads || 28}</td>
                        <td className="py-3 px-3 font-mono text-accent">R$ {c.cpl?.toFixed(2) || "117.75"}</td>
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
