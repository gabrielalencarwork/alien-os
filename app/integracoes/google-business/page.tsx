"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  seoRepository,
  GmbLocationRecord,
  GmbReviewRecord,
} from "@/lib/repositories/seoRepository";
import { ChevronRightIcon, ClockIcon, SparklesIcon, MapPinIcon, PhoneIcon, StarIcon, BotIcon } from "@/components/icons";

export default function GoogleBusinessIntegrationPage() {
  const [locations, setLocations] = useState<GmbLocationRecord[]>([]);
  const [reviews, setReviews] = useState<GmbReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadData = async () => {
    try {
      const [locRes, revRes] = await Promise.all([
        seoRepository.listGmbLocations(),
        seoRepository.listGmbReviews(),
      ]);
      setLocations(locRes);
      setReviews(revRes);
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
      await fetch("/api/integracoes/google-business/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "gmb_mock_token" }),
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
                  Sprint 24 · MyBusiness Business Info API
                </Badge>
                <span className="text-xs font-mono text-subtle">
                  SEO Local, Fichas GMB & Maps
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                Google Business Profile (Integração Oficial)
              </h1>
              <p className="text-sm text-body">
                Gestão de presença no Google Maps, ligações de clientes, solicitações de rotas e avaliações respondidas por IA
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button variant="primary" size="md" onClick={handleSync} disabled={syncing}>
                {syncing ? "Sincronizando GMB..." : "Conectar & Sincronizar Fichas Google"}
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="p-8 bg-surface border border-line rounded-xl text-center text-xs text-muted flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <span>Consultando banco de dados Supabase do Google Business...</span>
          </div>
        ) : locations.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-line bg-surface">
            <div className="w-12 h-12 rounded-2xl bg-canvas border border-line flex items-center justify-center mx-auto">
              <MapPinIcon className="w-6 h-6 text-accent" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-ink">Nenhuma Ficha GMB Sincronizada</h3>
              <p className="text-xs text-muted">
                Conecte sua conta do Google Meu Negócio para monitorar a reputação local e chamadas telefônicas.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={handleSync}>
              Sincronizar Google Business
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="bg-inverse text-white">
                <span className="text-[10px] font-mono text-accent">AVALIAÇÃO MÉDIA</span>
                <div className="text-xl font-bold font-mono text-accent flex items-center gap-1">
                  <span>4.9</span>
                  <StarIcon className="w-4 h-4 fill-accent" />
                </div>
                <span className="text-[10px] text-zinc-300">48 avaliações de clientes</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">LIGAÇÕES DE CLIENTES</span>
                <div className="text-xl font-bold font-mono text-ink">185 chamadas</div>
                <span className="text-[10px] text-muted">Cliques no telefone</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">SOLICITAÇÕES DE ROTAS</span>
                <div className="text-xl font-bold font-mono text-ink">240 buscas</div>
                <span className="text-[10px] text-muted">Navegação no Google Maps</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-muted">VISITAS AO SITE</span>
                <div className="text-xl font-bold font-mono text-accent">520 acessos</div>
                <span className="text-[10px] text-muted">Tráfego vindo da ficha</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-line bg-surface space-y-4">
                  <h3 className="text-base font-bold text-ink">Ficha de Empresa Ativa</h3>
                  {locations.map((loc) => (
                    <div key={loc.id} className="p-4 rounded-xl bg-canvas border border-line space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-ink">{loc.locationName}</span>
                        <Badge variant="alien" size="sm">Verificada</Badge>
                      </div>
                      <p className="text-xs text-body">{loc.address}</p>
                      <span className="text-xs font-mono text-muted block">{loc.phoneNumber}</span>
                    </div>
                  ))}
                </Card>

                <Card className="border-line bg-surface space-y-4">
                  <h3 className="text-base font-bold text-ink">Avaliações Recentes de Clientes</h3>
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 rounded-xl bg-canvas border border-line space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-ink">{rev.reviewerName}</span>
                          <span className="text-xs font-mono text-accent">5.0 ★★★★★</span>
                        </div>
                        <p className="text-xs text-body leading-relaxed">{rev.comment}</p>
                        {rev.replyText && (
                          <div className="p-2.5 rounded-lg bg-surface border border-line text-[11px] text-muted mt-2">
                            <strong className="text-ink block mb-0.5">Resposta da Agência (Alien Max IA):</strong>
                            {rev.replyText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <Card className="border-line bg-surface space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-line-soft">
                    <BotIcon className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-bold text-ink">Alien Max · SEO Local Advisor</h3>
                  </div>
                  <p className="text-xs text-body leading-relaxed">
                    Sua nota média é <strong className="text-ink">4.9 estrelas</strong>. O Alien Max responde avaliações recebidas automaticamente para impulsionar a relevância no Google Maps.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Gerar Respostas com IA
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
