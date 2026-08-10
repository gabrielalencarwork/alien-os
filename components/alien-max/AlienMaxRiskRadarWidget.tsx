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
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
            <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111] tracking-tight">
              Radar de Risco & Otimização Autônoma
            </h3>
            <span className="text-[10px] text-[#71717A] block">
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
            className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2 hover:border-[#4A8237] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111] truncate max-w-[180px]">
                {alt.affectedItem}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-[#4A8237] font-bold">
                  {alt.confidenceScore}% Confiança
                </span>
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

            <h4 className="text-xs font-bold text-[#111111]">{alt.title}</h4>
            <p className="text-[11px] text-[#71717A] leading-relaxed">{alt.description}</p>

            <div className="pt-2 border-t border-[#E4E4E7] space-y-2">
              <div className="text-[10px] text-[#52525B]">
                <strong className="text-[#111111]">Ação Recomendada: </strong>
                {alt.actionRecommendation}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-[11px]"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
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
