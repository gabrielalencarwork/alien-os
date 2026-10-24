import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GA4TrafficSource } from "@/lib/repositories/googleAnalyticsRepository";

export interface GA4SourcesWidgetProps {
  sources: GA4TrafficSource[];
}

export function GA4SourcesWidget({ sources }: GA4SourcesWidgetProps) {
  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Origem / Mídia de Tráfego (Source / Medium)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Canais geradores de sessões, leads e faturamento no e-commerce
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Atribuição GA4
        </Badge>
      </div>

      <div className="space-y-3">
        {sources.map((src, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-canvas border border-line flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <span className="font-mono font-bold text-ink block truncate">
                {src.sourceMedium}
              </span>
              <span className="text-[10px] text-muted block">
                {src.sessions.toLocaleString("pt-BR")} Sessões · {src.users.toLocaleString("pt-BR")} Usuários
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono font-bold text-accent block">
                R$ {src.revenue.toLocaleString("pt-BR")}
              </span>
              <span className="text-[10px] text-muted block font-mono">
                {src.conversions} Conversões
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
