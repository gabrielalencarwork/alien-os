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
                  Sprint 24 · MyBusiness Business Info API
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  SEO Local, Fichas GMB & Maps
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Google Business Profile (Integração Oficial)
              </h1>
              <p className="text-sm text-[#52525B]">
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
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Consultando banco de dados Supabase do Google Business...</span>
          </div>
        ) : locations.length === 0 ? (
          <Card className="p-12 text-center space-y-4 border-[#E4E4E7] bg-white">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center mx-auto">
              <MapPinIcon className="w-6 h-6 text-[#4A8237]" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-[#111111]">Nenhuma Ficha GMB Sincronizada</h3>
              <p className="text-xs text-[#71717A]">
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
              <Card padding="sm" className="bg-[#111111] text-white">
                <span className="text-[10px] font-mono text-[#4A8237]">AVALIAÇÃO MÉDIA</span>
                <div className="text-xl font-bold font-mono text-[#4A8237] flex items-center gap-1">
                  <span>4.9</span>
                  <StarIcon className="w-4 h-4 fill-[#4A8237]" />
                </div>
                <span className="text-[10px] text-zinc-300">48 avaliações de clientes</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">LIGAÇÕES DE CLIENTES</span>
                <div className="text-xl font-bold font-mono text-[#111111]">185 chamadas</div>
                <span className="text-[10px] text-[#71717A]">Cliques no telefone</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">SOLICITAÇÕES DE ROTAS</span>
                <div className="text-xl font-bold font-mono text-[#111111]">240 buscas</div>
                <span className="text-[10px] text-[#71717A]">Navegação no Google Maps</span>
              </Card>
              <Card padding="sm">
                <span className="text-[10px] font-mono text-[#71717A]">VISITAS AO SITE</span>
                <div className="text-xl font-bold font-mono text-[#4A8237]">520 acessos</div>
                <span className="text-[10px] text-[#71717A]">Tráfego vindo da ficha</span>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-[#E4E4E7] bg-white space-y-4">
                  <h3 className="text-base font-bold text-[#111111]">Ficha de Empresa Ativa</h3>
                  {locations.map((loc) => (
                    <div key={loc.id} className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#111111]">{loc.locationName}</span>
                        <Badge variant="alien" size="sm">Verificada</Badge>
                      </div>
                      <p className="text-xs text-[#52525B]">{loc.address}</p>
                      <span className="text-xs font-mono text-[#71717A] block">{loc.phoneNumber}</span>
                    </div>
                  ))}
                </Card>

                <Card className="border-[#E4E4E7] bg-white space-y-4">
                  <h3 className="text-base font-bold text-[#111111]">Avaliações Recentes de Clientes</h3>
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#111111]">{rev.reviewerName}</span>
                          <span className="text-xs font-mono text-[#4A8237]">5.0 ★★★★★</span>
                        </div>
                        <p className="text-xs text-[#52525B] leading-relaxed">{rev.comment}</p>
                        {rev.replyText && (
                          <div className="p-2.5 rounded-lg bg-white border border-[#E4E4E7] text-[11px] text-[#71717A] mt-2">
                            <strong className="text-[#111111] block mb-0.5">Resposta da Agência (Alien Max IA):</strong>
                            {rev.replyText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div>
                <Card className="border-[#E4E4E7] bg-white space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F5]">
                    <BotIcon className="w-4 h-4 text-[#4A8237]" />
                    <h3 className="text-sm font-bold text-[#111111]">Alien Max · SEO Local Advisor</h3>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Sua nota média é <strong className="text-[#111111]">4.9 estrelas</strong>. O Alien Max responde avaliações recebidas automaticamente para impulsionar a relevância no Google Maps.
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
