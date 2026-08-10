import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  SparklesIcon,
  ArrowUpRightIcon,
  TrophyIcon,
  TrendingUpIcon,
} from "@/components/icons";

export function PrioritizedRecommendationsWidget() {
  const recommendations = [
    {
      id: "rec-1",
      title: "Escalar orçamento no Meta Ads em 35%",
      client: "Aura Health",
      impact: "R$ 48k/mês extra",
      priority: "Alto Impacto",
      action: "Aprovar aumento de budget",
    },
    {
      id: "rec-2",
      title: "Ativar régua automatizada de Klaviyo no checkout",
      client: "Lumina Skincare",
      impact: "+14% conversão",
      priority: "Alto Impacto",
      action: "Publicar fluxo ativo",
    },
    {
      id: "rec-3",
      title: "Testar landing page com Proposta de Valor B2B",
      client: "Fintech Velocity",
      impact: "+22% leads qualificados",
      priority: "Médio Impacto",
      action: "Iniciar teste A/B",
    },
  ];

  const opportunities = [
    {
      id: "opp-1",
      company: "Aura Health",
      metric: "ROAS 5.2x",
      growthPotential: "Alta capacidade de escala sem perda de margem",
      recommendedUpsell: "Aporte extra de R$ 30.000 em Mídias Pago",
    },
    {
      id: "opp-2",
      company: "Vortex Suplementos",
      metric: "ROAS 4.8x",
      growthPotential: "Expansão para Google Shopping e TikTok Ads",
      recommendedUpsell: "Contratação do pacote de Vídeos & UGC",
    },
  ];

  const cases = [
    {
      id: "cs-1",
      company: "Lumina Skincare",
      achievement: "Cresceu de R$ 120k para R$ 450k/mês com o Alien OS",
      status: "Elegível para Case",
      nextAction: "Gravar depoimento em vídeo",
    },
    {
      id: "cs-2",
      company: "Aura Health",
      achievement: "Mapeou o menor CAC histórico (R$ 18,50) no segmento",
      status: "Elegível para Case",
      nextAction: "Publicar artigo de estudo no Blog",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4. Recomendações Priorizadas */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#4A8237]" />
            <h3 className="text-base font-bold text-[#111111]">
              Recomendações Priorizadas por Impacto
            </h3>
          </div>
          <Badge variant="alien" size="sm">
            Alien Max Recomenda
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between space-y-3 hover:border-[#D4D4D8] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {rec.client}
                  </span>
                  <Badge variant="alien" size="sm">
                    {rec.priority}
                  </Badge>
                </div>

                <h4 className="text-xs font-bold text-[#111111]">
                  {rec.title}
                </h4>

                <div className="text-[11px] font-mono font-bold text-[#4A8237]">
                  Impacto Estimado: {rec.impact}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                iconPosition="right"
              >
                {rec.action}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* 5 e 6. Oportunidades & Cases Alien (Grid 2 colunas) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5. Oportunidades de Escala */}
        <Card className="border-[#E4E4E7] bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F5]">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-[#4A8237]" />
              <h3 className="text-sm font-bold text-[#111111]">
                Oportunidades de Escala
              </h3>
            </div>
            <Badge variant="alien" size="sm">
              Potencial de Receita
            </Badge>
          </div>

          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">
                    {opp.company}
                  </span>
                  <span className="text-xs font-mono font-bold text-[#4A8237]">
                    {opp.metric}
                  </span>
                </div>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {opp.growthPotential}
                </p>
                <div className="text-[11px] text-[#111111] pt-1">
                  <strong className="text-[#4A8237]">Próximo Aporte: </strong>
                  {opp.recommendedUpsell}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 6. Cases Alien */}
        <Card className="border-[#E4E4E7] bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#F4F4F5]">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-[#111111]">
                Cases Alien (Vitrine de Sucesso)
              </h3>
            </div>
            <Badge variant="dark" size="sm">
              Elegíveis para Mídia
            </Badge>
          </div>

          <div className="space-y-3">
            {cases.map((cs) => (
              <div
                key={cs.id}
                className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">
                    {cs.company}
                  </span>
                  <Badge variant="alien" size="sm">
                    {cs.status}
                  </Badge>
                </div>
                <p className="text-xs text-[#52525B] leading-relaxed font-medium">
                  {cs.achievement}
                </p>
                <div className="text-[11px] text-[#71717A] pt-1">
                  <strong className="text-[#111111]">Próximo Passo: </strong>
                  {cs.nextAction}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
