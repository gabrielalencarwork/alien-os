import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AlienMaxFinancialInsight } from "@/lib/repositories/financialRepository";
import { BotIcon, SparklesIcon, ArrowUpRightIcon } from "@/components/icons";

export interface AlienMaxFinancialAdvisorWidgetProps {
  insights: AlienMaxFinancialInsight[];
}

export function AlienMaxFinancialAdvisorWidget({
  insights,
}: AlienMaxFinancialAdvisorWidgetProps) {
  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-inverse text-white flex items-center justify-center border border-accent">
            <BotIcon className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Alien Max · Consultor Financeiro
            </h3>
            <span className="text-[10px] text-muted block">
              Análise Preditiva & Inteligência Autônoma
            </span>
          </div>
        </div>

        <Badge variant="alien" size="sm">
          IA Consultiva
        </Badge>
      </div>

      <p className="text-xs text-body leading-relaxed">
        O Alien Max apenas recomenda. <strong className="text-ink">A decisão final de cobrança e reajuste é 100% da equipe.</strong>
      </p>

      <div className="space-y-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="p-3.5 rounded-xl bg-canvas border border-line space-y-2 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                {ins.clientName}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge variant="dark" size="sm">
                  {ins.type}
                </Badge>
              </div>
            </div>

            <h4 className="text-xs font-bold text-ink">
              {ins.title}
            </h4>

            <p className="text-[11px] text-muted leading-relaxed">
              {ins.description}
            </p>

            <div className="text-[11px] font-mono font-bold text-accent pt-1">
              Impacto Financeiro: {ins.estimatedRevenueImpact}
            </div>

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
                Executar Recomendação
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
