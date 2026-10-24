import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ProviderSlug } from "@/lib/core/marketingCore";
import { BotIcon, ArrowUpRightIcon } from "@/components/icons";

export interface UniversalMediaInsight {
  id: string;
  providerSlug: ProviderSlug;
  type: string;
  campaignName: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export interface AlienMaxMediaAdvisorProps {
  insights: UniversalMediaInsight[];
  activeProvider?: ProviderSlug;
}

export function AlienMaxMediaAdvisor({
  insights,
  activeProvider = "google-ads",
}: AlienMaxMediaAdvisorProps) {
  const filteredInsights = insights.filter(
    (ins) => !activeProvider || ins.providerSlug === activeProvider || ins.providerSlug === "google-ads"
  );

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-inverse text-white flex items-center justify-center border border-accent">
            <BotIcon className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Alien Max · Consultor Multimídia (Marketing Core)
            </h3>
            <span className="text-[10px] text-muted block font-mono">
              Provedor Ativo: {activeProvider.toUpperCase()}
            </span>
          </div>
        </div>

        <Badge variant="alien" size="sm">
          IA Autônoma Universal
        </Badge>
      </div>

      <p className="text-xs text-body leading-relaxed">
        O Alien Max analisa métricas comuns e específicas de cada plataforma (Google, Meta, TikTok, LinkedIn) e <strong className="text-ink">apenas recomenda ações para o gestor.</strong>
      </p>

      <div className="space-y-3">
        {filteredInsights.length === 0 ? (
          <div className="p-4 rounded-xl bg-canvas text-center text-xs text-muted">
            Nenhum diagnóstico pendente para a plataforma selecionada.
          </div>
        ) : (
          filteredInsights.map((ins) => (
            <div
              key={ins.id}
              className="p-3.5 rounded-xl bg-canvas border border-line space-y-2 hover:border-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink truncate max-w-[140px]">
                  {ins.campaignName}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-mono text-accent font-bold">
                    {ins.confidenceScore}% Confiança
                  </span>
                  <Badge variant="dark" size="sm">
                    {ins.providerSlug}
                  </Badge>
                </div>
              </div>

              <h4 className="text-xs font-bold text-ink">
                {ins.title}
              </h4>

              <p className="text-[11px] text-muted leading-relaxed">
                {ins.description}
              </p>

              <div className="pt-2 border-t border-line space-y-2">
                <div className="text-[10px] text-body">
                  <strong className="text-ink">Ação Sugerida: </strong>
                  {ins.recommendedAction}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-between text-[11px]"
                  icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />}
                  iconPosition="right"
                >
                  Aplicar Diagnóstico
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
