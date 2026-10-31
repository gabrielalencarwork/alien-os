import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { RiskRadarAlert } from "@/lib/ai/alienMaxEngine";
import { AlertTriangleIcon, ArrowUpRightIcon } from "@/components/icons";

export interface AlienMaxRiskRadarWidgetProps {
  alerts: RiskRadarAlert[];
}

export function AlienMaxRiskRadarWidget({ alerts }: AlienMaxRiskRadarWidgetProps) {
  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink tracking-tight">
              Radar de Risco & Otimização Autônoma
            </h3>
            <span className="text-[10px] text-muted block">
              Prevenção de Churn, Fadiga e Desperdício de Mídia
            </span>
          </div>
        </div>

        <Badge variant="dark" size="sm">
          {alerts.length} Alertas Ativos
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="p-3.5 rounded-xl bg-canvas border border-line space-y-2 hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink truncate max-w-[180px]">
                {alt.affectedItem}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant={
                    alt.severity === "CRITICAL"
                      ? "danger"
                      : alt.severity === "HIGH"
                      ? "warning"
                      : "gray"
                  }
                  size="sm"
                >
                  {alt.severity}
                </Badge>
              </div>
            </div>

            <h4 className="text-xs font-bold text-ink">{alt.title}</h4>
            <p className="text-[11px] text-muted leading-relaxed">{alt.description}</p>

            <div className="pt-2 border-t border-line space-y-2">
              <div className="text-[10px] text-body">
                <strong className="text-ink">Ação Recomendada: </strong>
                {alt.actionRecommendation}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-[11px]"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />}
                iconPosition="right"
              >
                Resolver Alerta
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
