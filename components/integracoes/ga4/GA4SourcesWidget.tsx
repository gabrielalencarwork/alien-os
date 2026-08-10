import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GA4TrafficSource } from "@/lib/repositories/googleAnalyticsRepository";

export interface GA4SourcesWidgetProps {
  sources: GA4TrafficSource[];
}

export function GA4SourcesWidget({ sources }: GA4SourcesWidgetProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Origem / Mídia de Tráfego (Source / Medium)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
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
            className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <span className="font-mono font-bold text-[#111111] block truncate">
                {src.sourceMedium}
              </span>
              <span className="text-[10px] text-[#71717A] block">
                {src.sessions.toLocaleString("pt-BR")} Sessões · {src.users.toLocaleString("pt-BR")} Usuários
              </span>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono font-bold text-[#4A8237] block">
                R$ {src.revenue.toLocaleString("pt-BR")}
              </span>
              <span className="text-[10px] text-[#71717A] block font-mono">
                {src.conversions} Conversões
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
