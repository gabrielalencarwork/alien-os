"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { getClientById } from "@/lib/clientsData";
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
  const client = getClientById(id);

  if (!client) {
    notFound();
  }

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
    setScanning(true);
    try {
      const result = await runAlienMaxScan(client.id, client.name, answers);
      setReport(result);
    } finally {
      setScanning(false);
    }
  };

  return (
    <PageContainer>
      {/* Back Link */}
      <div className="pt-2">
        <Link
          href={`/clientes/${client.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </span>
          <span>Voltar para Perfil de {client.name}</span>
        </Link>
      </div>

      {/* Header */}
      <section className="space-y-1 pb-4 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-2">
          <Badge variant="alien" showDot>
            Alien Max v1 · Engine de Regras
          </Badge>
          <span className="text-xs font-mono text-[#A1A1AA]">
            Escaneamento Digital 8 Categorias
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          Escaneamento Digital: {client.name}
        </h1>
        <p className="text-sm text-[#52525B]">
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
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-white p-2 rounded-xl border border-[#E4E4E7]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-[#FAFAFA] text-[#52525B] hover:bg-[#F4F4F5]"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <Card className="border-[#E4E4E7] bg-white p-6 sm:p-8 space-y-6">
            {/* CATEGORIA 1: SITE */}
            {activeCategory === 1 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Site & Experiência Móvel
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Velocidade de carregamento e usabilidade de conversão no e-commerce / landing page
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#111111] flex justify-between">
                      <span>Velocidade de Carregamento (0-10)</span>
                      <span className="font-mono text-[#4A8237] font-bold">{answers.siteSpeed} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.siteSpeed}
                      onChange={(e) => setAnswers({ ...answers, siteSpeed: Number(e.target.value) })}
                      className="w-full accent-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Versão Mobile Totalmente Responsiva</span>
                    <input
                      type="checkbox"
                      checked={answers.siteMobile}
                      onChange={(e) => setAnswers({ ...answers, siteMobile: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Checkout em 1-Etapa Otimizado</span>
                    <input
                      type="checkbox"
                      checked={answers.siteCheckout}
                      onChange={(e) => setAnswers({ ...answers, siteCheckout: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 2: BRANDING */}
            {activeCategory === 2 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Branding & Proposta de Valor
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Consistência visual e clareza da oferta em todos os pontos de contato
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#111111] flex justify-between">
                      <span>Consistência da Identidade Visual (0-10)</span>
                      <span className="font-mono text-[#4A8237] font-bold">{answers.brandConsistency} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.brandConsistency}
                      onChange={(e) => setAnswers({ ...answers, brandConsistency: Number(e.target.value) })}
                      className="w-full accent-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Proposta Única de Valor Clara na Primeira Dobra</span>
                    <input
                      type="checkbox"
                      checked={answers.clearValueProp}
                      onChange={(e) => setAnswers({ ...answers, clearValueProp: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 3: GOOGLE MEU NEGÓCIO */}
            {activeCategory === 3 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Presença Local & Google Meu Negócio
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Otimização de mapa local, avaliações de clientes e fotos
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Perfil de Empresa Certificado no Google</span>
                    <input
                      type="checkbox"
                      checked={answers.gmbVerified}
                      onChange={(e) => setAnswers({ ...answers, gmbVerified: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#111111] flex justify-between">
                      <span>Frequência de Novas Avaliações (0-10)</span>
                      <span className="font-mono text-[#4A8237] font-bold">{answers.gmbReviews} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.gmbReviews}
                      onChange={(e) => setAnswers({ ...answers, gmbReviews: Number(e.target.value) })}
                      className="w-full accent-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 4: REDES SOCIAIS */}
            {activeCategory === 4 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Redes Sociais
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Constância de postagens e nível de engajamento orgânico
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#111111] flex justify-between">
                      <span>Regularidade de Publicações (0-10)</span>
                      <span className="font-mono text-[#4A8237] font-bold">{answers.socialRegularity} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.socialRegularity}
                      onChange={(e) => setAnswers({ ...answers, socialRegularity: Number(e.target.value) })}
                      className="w-full accent-[#4A8237]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#111111] flex justify-between">
                      <span>Taxa de Engajamento da Audiência (0-10)</span>
                      <span className="font-mono text-[#4A8237] font-bold">{answers.socialEngagement} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.socialEngagement}
                      onChange={(e) => setAnswers({ ...answers, socialEngagement: Number(e.target.value) })}
                      className="w-full accent-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 5: TRÁFEGO PAGO */}
            {activeCategory === 5 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Tráfego Pago & Mídias
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Arquitetura de pixels, API de conversões e campanhas de retargeting
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Rastreamento Server-Side (CAPI / Pixel) Ativado</span>
                    <input
                      type="checkbox"
                      checked={answers.paidTracking}
                      onChange={(e) => setAnswers({ ...answers, paidTracking: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Estrutura Completa de Retargeting Ativa</span>
                    <input
                      type="checkbox"
                      checked={answers.paidRetargeting}
                      onChange={(e) => setAnswers({ ...answers, paidRetargeting: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Testes Sistemáticos de Novos Criativos Semanalmente</span>
                    <input
                      type="checkbox"
                      checked={answers.paidCreativeTesting}
                      onChange={(e) => setAnswers({ ...answers, paidCreativeTesting: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 6: SEO */}
            {activeCategory === 6 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de SEO & Ranqueamento
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Autoridade orgânica e otimização de meta tags no Google
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#111111] flex justify-between">
                      <span>Posicionamento de Palavras-Chave de Fundo (0-10)</span>
                      <span className="font-mono text-[#4A8237] font-bold">{answers.seoRankings} / 10</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={answers.seoRankings}
                      onChange={(e) => setAnswers({ ...answers, seoRankings: Number(e.target.value) })}
                      className="w-full accent-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Meta Tags e OpenGraph Otimizados</span>
                    <input
                      type="checkbox"
                      checked={answers.seoMetaTags}
                      onChange={(e) => setAnswers({ ...answers, seoMetaTags: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 7: DADOS & ANALYTICS */}
            {activeCategory === 7 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Dados & Google Analytics 4
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Validação de receita e metas de conversão no GA4
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Google Analytics 4 Configurado sem Erros</span>
                    <input
                      type="checkbox"
                      checked={answers.ga4Configured}
                      onChange={(e) => setAnswers({ ...answers, ga4Configured: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Eventos Principais de Conversão Validados</span>
                    <input
                      type="checkbox"
                      checked={answers.conversionEventsValidated}
                      onChange={(e) => setAnswers({ ...answers, conversionEventsValidated: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIA 8: AUTOMAÇÕES & CRM */}
            {activeCategory === 8 && (
              <div className="space-y-4">
                <div className="border-b border-[#F4F4F5] pb-3">
                  <h3 className="text-base font-bold text-[#111111]">
                    Auditoria de Automações & CRM
                  </h3>
                  <p className="text-xs text-[#71717A]">
                    Réguas automatizadas de e-mail e respostas no WhatsApp
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Réguas de E-mail de Boas-Vindas & Carrinho Abandonado</span>
                    <input
                      type="checkbox"
                      checked={answers.emailFlowsActive}
                      onChange={(e) => setAnswers({ ...answers, emailFlowsActive: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7]">
                    <span className="font-semibold text-[#111111]">Bot de Resposta Instantânea no WhatsApp Ativado</span>
                    <input
                      type="checkbox"
                      checked={answers.whatsappBotActive}
                      onChange={(e) => setAnswers({ ...answers, whatsappBotActive: e.target.checked })}
                      className="rounded text-[#4A8237] focus:ring-[#4A8237]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Form Footer */}
            <div className="pt-4 border-t border-[#F4F4F5] flex items-center justify-between">
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
                    <BotIcon className="w-4 h-4 text-[#4A8237]" />
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
