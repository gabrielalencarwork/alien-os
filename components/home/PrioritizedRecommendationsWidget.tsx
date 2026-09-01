"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  SparklesIcon,
  ArrowUpRightIcon,
  TrendingUpIcon,
  ChevronRightIcon,
} from "@/components/icons";
import { googleAdsRepository } from "@/lib/repositories/googleAdsRepository";
import { metaAdsRepository } from "@/lib/repositories/metaAdsRepository";
import { campaignRepository } from "@/lib/repositories/campaignRepository";

interface HomeRecommendation {
  id: string;
  title: string;
  client: string;
  impact: string;
  priority: "Alto Impacto" | "Médio Impacto" | "Oportunidade";
  action: string;
}

export function PrioritizedRecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<HomeRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecommendations() {
      try {
        const [gadsInsights, metaInsights, campaigns] = await Promise.all([
          googleAdsRepository.getAlienMaxInsights(),
          metaAdsRepository.getAlienMaxInsights(),
          campaignRepository.getCampaigns(),
        ]);

        const recs: HomeRecommendation[] = [];

        // Filtra insights reais de Google Ads (ignorando o item de empty)
        for (const ins of gadsInsights) {
          if (ins.id !== "gads-empty") {
            recs.push({
              id: ins.id,
              title: ins.title,
              client: ins.campaignName,
              impact: `Score: ${ins.confidenceScore}%`,
              priority: "Alto Impacto",
              action: ins.recommendedAction,
            });
          }
        }

        // Filtra insights reais de Meta Ads (ignorando o item de empty)
        for (const ins of metaInsights) {
          if (ins.id !== "meta-empty") {
            recs.push({
              id: ins.id,
              title: ins.title,
              client: ins.campaignName,
              impact: `Score: ${ins.confidenceScore}%`,
              priority: ins.type === "Pronta P/ Escala" ? "Alto Impacto" : "Médio Impacto",
              action: ins.recommendedAction,
            });
          }
        }

        // Oportunidades baseadas em campanhas com ROAS alto
        for (const cmp of campaigns) {
          if (cmp.roas >= 4.0 && cmp.status === "Ativa") {
            recs.push({
              id: `rec-scale-${cmp.id}`,
              title: `Oportunidade de Escala em ${cmp.platform}`,
              client: cmp.clientName,
              impact: `ROAS atual: ${cmp.roas}x`,
              priority: "Alto Impacto",
              action: `Aumentar orçamento diário em +20% (Atual: R$ ${cmp.dailyBudget})`,
            });
          }
        }

        setRecommendations(recs.slice(0, 3));
      } catch (err) {
        console.error("Erro ao carregar recomendações:", err);
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    loadRecommendations();
  }, []);

  return (
    <div className="space-y-6">
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-4 h-4 text-[#4A8237]" />
            <h3 className="text-base font-bold text-[#111111]">
              Recomendações Priorizadas Alien Max
            </h3>
          </div>
          <Link
            href="/alien-max"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:text-[#4A8237] transition-colors"
          >
            <span>Central de Inteligência</span>
            <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Processando inteligência das contas conectadas...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-8 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E4E4E7] flex items-center justify-center mx-auto text-[#4A8237]">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <span className="text-xs font-bold text-[#111111] block">
                Nenhuma recomendação pendente
              </span>
              <p className="text-xs text-[#71717A] leading-relaxed">
                Conecte suas contas de tráfego pago (Google Ads, Meta Ads) ou cadastre campanhas para gerar recomendações autônomas de ROI.
              </p>
            </div>
            <Link href="/integracoes">
              <Button variant="outline" size="sm">
                Conectar Contas de Anúncios
              </Button>
            </Link>
          </div>
        ) : (
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

                  <h4 className="text-xs font-bold text-[#111111] leading-snug">
                    {rec.title}
                  </h4>

                  <div className="flex items-center gap-1.5 text-[11px] text-[#4A8237] font-semibold">
                    <TrendingUpIcon className="w-3.5 h-3.5" />
                    <span>{rec.impact}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E4E4E7]">
                  <p className="text-[11px] text-[#52525B] leading-relaxed">
                    <strong className="text-[#111111]">Ação: </strong>
                    {rec.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
