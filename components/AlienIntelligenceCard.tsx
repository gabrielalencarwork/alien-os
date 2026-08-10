import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { BotIcon, ArrowUpRightIcon, SparklesIcon } from "./icons";

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  nextAction: string;
  impactBadge?: string;
  category?: string;
}

export interface AlienIntelligenceCardProps {
  recommendations: AIRecommendation[];
}

export function AlienIntelligenceCard({ recommendations }: AlienIntelligenceCardProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white relative overflow-hidden">
      {/* Top subtle glow banner */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] via-[#4A8237] to-[#111111]" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#111111] text-white flex items-center justify-center shrink-0 border border-[#4A8237]">
            <BotIcon className="w-5 h-5 text-[#4A8237]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#111111] tracking-tight">
                Alien Intelligence
              </h2>
              <Badge variant="alien" size="sm" showDot>
                Autônomo · Ativo
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Recomendações estratégicas geradas por IA baseadas na performance em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="gray" size="sm">
            <SparklesIcon className="w-3 h-3 inline mr-1 text-[#4A8237]" />
            5 Oportunidades encontradas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between hover:border-[#D4D4D8] transition-all duration-200 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold">
                  {rec.category || "Oportunidade"}
                </span>
                {rec.impactBadge && (
                  <Badge variant="alien" size="sm">
                    {rec.impactBadge}
                  </Badge>
                )}
              </div>

              <h3 className="text-sm font-semibold text-[#111111] tracking-tight group-hover:text-[#4A8237] transition-colors">
                {rec.title}
              </h3>

              <p className="text-xs text-[#71717A] leading-relaxed">
                {rec.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E4E4E7] space-y-3">
              <div className="text-[11px] text-[#52525B]">
                <span className="font-semibold text-[#111111]">Próxima ação: </span>
                <span>{rec.nextAction}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between group-hover:bg-white"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                iconPosition="right"
              >
                Ver análise
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
