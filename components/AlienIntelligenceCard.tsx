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
    <Card className="border-line bg-surface relative overflow-hidden">
      {/* Top subtle glow banner */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inverse via-accent to-inverse" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-line-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-inverse text-white flex items-center justify-center shrink-0 border border-accent">
            <BotIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink tracking-tight">
                Alien Intelligence
              </h2>
              <Badge variant="alien" size="sm" showDot>
                Autônomo · Ativo
              </Badge>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Recomendações estratégicas geradas por IA baseadas na performance em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="gray" size="sm">
            <SparklesIcon className="w-3 h-3 inline mr-1 text-accent" />
            5 Oportunidades encontradas
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-xl bg-canvas border border-line flex flex-col justify-between hover:border-line-strong transition-all duration-200 group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-accent font-semibold">
                  {rec.category || "Oportunidade"}
                </span>
                {rec.impactBadge && (
                  <Badge variant="alien" size="sm">
                    {rec.impactBadge}
                  </Badge>
                )}
              </div>

              <h3 className="text-sm font-semibold text-ink tracking-tight group-hover:text-accent transition-colors">
                {rec.title}
              </h3>

              <p className="text-xs text-muted leading-relaxed">
                {rec.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-line space-y-3">
              <div className="text-[11px] text-body">
                <span className="font-semibold text-ink">Próxima ação: </span>
                <span>{rec.nextAction}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between group-hover:bg-surface"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />}
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
