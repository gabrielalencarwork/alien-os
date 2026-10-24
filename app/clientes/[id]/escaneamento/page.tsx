"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { Cliente } from "@/types";
import {
  runAlienMaxScan,
  ScanAnswers,
  AlienMaxReportResult,
} from "@/lib/alienMaxEngine";
import { AlienMaxReport } from "@/components/clientes/AlienMaxReport";
import {
  BotIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowUpRightIcon,
  CheckCircle2Icon,
} from "@/components/icons";

interface ScanPageProps {
  params: Promise<{ id: string }>;
}

export default function EscaneamentoPage({ params }: ScanPageProps) {
  const { id } = use(params);
  const [client, setClient] = useState<Cliente | null>(null);
  const [loadingClient, setLoadingClient] = useState(true);

  useEffect(() => {
    async function loadClient() {
      try {
        const data = await clientRepository.getById(id);
        setClient(data);
      } finally {
        setLoadingClient(false);
      }
    }
    loadClient();
  }, [id]);

  const [report, setReport] = useState<AlienMaxReportResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number>(1);

  const [answers, setAnswers] = useState<ScanAnswers>({
    siteSpeed: 8,
    siteMobile: true,
    siteCheckout: false,
    brandConsistency: 7,
    clearValueProp: true,
    gmbVerified: true,
    gmbReviews: 6,
    socialRegularity: 7,
    socialEngagement: 6,
    paidTracking: true,
    paidRetargeting: false,
    paidCreativeTesting: true,
    seoRankings: 5,
    seoMetaTags: true,
    ga4Configured: true,
    conversionEventsValidated: false,
    emailFlowsActive: false,
    whatsappBotActive: false,
  });

  const categories = [
    { id: 1, name: "Site", icon: "🌐" },
    { id: 2, name: "Branding", icon: "✨" },
    { id: 3, name: "Google Meu Negócio", icon: "📍" },
    { id: 4, name: "Redes Sociais", icon: "📱" },
    { id: 5, name: "Tráfego Pago", icon: "🚀" },
    { id: 6, name: "SEO", icon: "🔍" },
    { id: 7, name: "Dados & Analytics", icon: "📊" },
    { id: 8, name: "Automações & CRM", icon: "🤖" },
  ];

  const handleRunScan = async () => {
    if (!client) return;
    setScanning(true);
    try {
      const result = await runAlienMaxScan(client.id, client.name, answers);
      setReport(result);
    } finally {
      setScanning(false);
    }
  };

  if (loadingClient) {
    return (
      <PageContainer>
        <div className="p-12 text-center text-xs text-muted flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Carregando dados do cliente...</span>
        </div>
      </PageContainer>
    );
  }

  if (!client) {
    notFound();
  }

  return (
    <PageContainer>
      {/* Back Link */}
      <div className="pt-2">
        <Link
          href={`/clientes/${client.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </span>
          <span>Voltar para Perfil de {client.name}</span>
        </Link>
      </div>

      {/* Header */}
      <section className="space-y-1 pb-4 border-b border-line">
        <div className="flex items-center gap-2">
          <Badge variant="alien" showDot>
            Alien Max v1 · Engine de Regras
          </Badge>
          <span className="text-xs font-mono text-subtle">
            Escaneamento Digital 8 Categorias
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Escaneamento Digital: {client.name}
        </h1>
        <p className="text-sm text-body">
          Auditoria estratégica baseada em dados para calcular o Alien Score e gerar o roadmap de Growth
        </p>
      </section>

      {report ? (
        /* Diagnostic Report Display */
        <AlienMaxReport report={report} onResetScan={() => setReport(null)} />
      ) : (
        /* Questionnaire Form */
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-surface p-2 rounded-xl border border-line">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-inverse text-white shadow-xs"
                    : "bg-canvas text-body hover:bg-raised"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <Card className="border-line bg-surface p-6 sm:p-8 space-y-6">
            {/* CATEGORIA 1: SITE */}
            {activeCategory === 1 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Site & Experiência Móvel
                  </h3>
                  <p className="text-xs text-muted">
                    Velocidade de carregamento e usabilidade de conversão no e-commerce / landing page
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink flex justify-between">
                      <span>Velocidade de Carregamento (0-10)</span>
                      <span className="font-mono text-accent font-bold">{answers.siteSpeed} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.siteSpeed}
                      onChange={(e) => setAnswers({ ...answers, siteSpeed: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Versão Mobile Totalmente Responsiva</span>
                    <input
                      type="checkbox"
                      checked={answers.siteMobile}
                      onChange={(e) => setAnswers({ ...answers, siteMobile: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Checkout em 1-Etapa Otimizado</span>
                    <input
                      type="checkbox"
                      checked={answers.siteCheckout}
                      onChange={(e) => setAnswers({ ...answers, siteCheckout: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 2: BRANDING */}
            {activeCategory === 2 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Branding & Proposta de Valor
                  </h3>
                  <p className="text-xs text-muted">
                    Consistência visual e clareza da oferta em todos os pontos de contato
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink flex justify-between">
                      <span>Consistência da Identidade Visual (0-10)</span>
                      <span className="font-mono text-accent font-bold">{answers.brandConsistency} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.brandConsistency}
                      onChange={(e) => setAnswers({ ...answers, brandConsistency: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Proposta Única de Valor Clara na Primeira Dobra</span>
                    <input
                      type="checkbox"
                      checked={answers.clearValueProp}
                      onChange={(e) => setAnswers({ ...answers, clearValueProp: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 3: GOOGLE MEU NEGÓCIO */}
            {activeCategory === 3 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Presença Local & Google Meu Negócio
                  </h3>
                  <p className="text-xs text-muted">
                    Otimização de mapa local, avaliações de clientes e fotos
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Perfil de Empresa Certificado no Google</span>
                    <input
                      type="checkbox"
                      checked={answers.gmbVerified}
                      onChange={(e) => setAnswers({ ...answers, gmbVerified: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink flex justify-between">
                      <span>Frequência de Novas Avaliações (0-10)</span>
                      <span className="font-mono text-accent font-bold">{answers.gmbReviews} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.gmbReviews}
                      onChange={(e) => setAnswers({ ...answers, gmbReviews: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 4: REDES SOCIAIS */}
            {activeCategory === 4 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Redes Sociais
                  </h3>
                  <p className="text-xs text-muted">
                    Constância de postagens e nível de engajamento orgânico
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink flex justify-between">
                      <span>Regularidade de Publicações (0-10)</span>
                      <span className="font-mono text-accent font-bold">{answers.socialRegularity} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.socialRegularity}
                      onChange={(e) => setAnswers({ ...answers, socialRegularity: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink flex justify-between">
                      <span>Taxa de Engajamento da Audiência (0-10)</span>
                      <span className="font-mono text-accent font-bold">{answers.socialEngagement} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.socialEngagement}
                      onChange={(e) => setAnswers({ ...answers, socialEngagement: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 5: TRÁFEGO PAGO */}
            {activeCategory === 5 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Tráfego Pago & Mídias
                  </h3>
                  <p className="text-xs text-muted">
                    Arquitetura de pixels, API de conversões e campanhas de retargeting
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Rastreamento Server-Side (CAPI / Pixel) Ativado</span>
                    <input
                      type="checkbox"
                      checked={answers.paidTracking}
                      onChange={(e) => setAnswers({ ...answers, paidTracking: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Estrutura Completa de Retargeting Ativa</span>
                    <input
                      type="checkbox"
                      checked={answers.paidRetargeting}
                      onChange={(e) => setAnswers({ ...answers, paidRetargeting: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Testes Sistemáticos de Novos Criativos Semanalmente</span>
                    <input
                      type="checkbox"
                      checked={answers.paidCreativeTesting}
                      onChange={(e) => setAnswers({ ...answers, paidCreativeTesting: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 6: SEO */}
            {activeCategory === 6 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de SEO & Ranqueamento
                  </h3>
                  <p className="text-xs text-muted">
                    Autoridade orgânica e otimização de meta tags no Google
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink flex justify-between">
                      <span>Posicionamento de Palavras-Chave de Fundo (0-10)</span>
                      <span className="font-mono text-accent font-bold">{answers.seoRankings} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.seoRankings}
                      onChange={(e) => setAnswers({ ...answers, seoRankings: Number(e.target.value) })}
                      className="w-full accent-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Meta Tags e OpenGraph Otimizados</span>
                    <input
                      type="checkbox"
                      checked={answers.seoMetaTags}
                      onChange={(e) => setAnswers({ ...answers, seoMetaTags: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 7: DADOS & ANALYTICS */}
            {activeCategory === 7 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Dados & Google Analytics 4
                  </h3>
                  <p className="text-xs text-muted">
                    Validação de receita e metas de conversão no GA4
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Google Analytics 4 Configurado sem Erros</span>
                    <input
                      type="checkbox"
                      checked={answers.ga4Configured}
                      onChange={(e) => setAnswers({ ...answers, ga4Configured: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Eventos Principais de Conversão Validados</span>
                    <input
                      type="checkbox"
                      checked={answers.conversionEventsValidated}
                      onChange={(e) => setAnswers({ ...answers, conversionEventsValidated: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 8: AUTOMAÇÕES & CRM */}
            {activeCategory === 8 && (
              <div className="space-y-4">
                <div className="border-b border-line-soft pb-3">
                  <h3 className="text-base font-bold text-ink">
                    Auditoria de Automações & CRM
                  </h3>
                  <p className="text-xs text-muted">
                    Réguas automatizadas de e-mail e respostas no WhatsApp
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Réguas de E-mail de Boas-Vindas & Carrinho Abandonado</span>
                    <input
                      type="checkbox"
                      checked={answers.emailFlowsActive}
                      onChange={(e) => setAnswers({ ...answers, emailFlowsActive: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-canvas border border-line">
                    <span className="font-semibold text-ink">Bot de Resposta Instantânea no WhatsApp Ativado</span>
                    <input
                      type="checkbox"
                      checked={answers.whatsappBotActive}
                      onChange={(e) => setAnswers({ ...answers, whatsappBotActive: e.target.checked })}
                      className="rounded text-accent focus:ring-accent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Form Footer */}
            <div className="pt-4 border-t border-line-soft flex items-center justify-between">
              <div className="flex items-center gap-2">
                {activeCategory > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveCategory(activeCategory - 1)}
                  >
                    Anterior
                  </Button>
                )}
                {activeCategory < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveCategory(activeCategory + 1)}
                  >
                    Próxima Categoria
                  </Button>
                )}
              </div>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleRunScan}
                disabled={scanning}
                icon={
                  scanning ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <BotIcon className="w-4 h-4 text-accent" />
                  )
                }
                iconPosition="left"
              >
                {scanning ? "Executando Diagnóstico..." : "Gerar Diagnóstico Alien Max v1"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
