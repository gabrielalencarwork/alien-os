"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GA4DailyMetric } from "@/lib/repositories/googleAnalyticsRepository";

export interface GA4TrafficChartProps {
  metrics: GA4DailyMetric[];
}

export function GA4TrafficChart({ metrics }: GA4TrafficChartProps) {
  const maxSessions = Math.max(...metrics.map((m) => m.sessionsCount), 3000);

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Tendência Diária de Sessões e Conversões (Google Analytics Data API)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Sincronização contínua de volume de visitas nos últimos 30 dias
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Live Data Sync
        </Badge>
      </div>

      {/* Bar Chart Visual */}
      <div className="pt-2">
        <div className="h-44 flex items-end justify-between gap-2 px-2 border-b border-[#E4E4E7] pb-2">
          {metrics.map((m) => {
            const heightPercent = Math.round((m.sessionsCount / maxSessions) * 100);

            return (
              <div
                key={m.date}
                className="flex-1 flex flex-col items-center gap-1 group relative cursor-pointer"
              >
                {/* Tooltip Hover */}
                <div className="absolute -top-12 bg-[#111111] text-white text-[10px] font-mono px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  <div>{m.date}</div>
                  <div className="text-[#4A8237] font-bold">{m.sessionsCount} Sessões</div>
                  <div>R$ {m.revenueAmount.toLocaleString("pt-BR")}</div>
                </div>

                <div
                  className="w-full bg-[#111111] group-hover:bg-[#4A8237] rounded-t-md transition-all"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-[#71717A] pt-2 px-2">
          <span>{metrics[0]?.date || "Início"}</span>
          <span>Série Temporal (Google Analytics 4)</span>
          <span>{metrics[metrics.length - 1]?.date || "Hoje"}</span>
        </div>
      </div>
    </Card>
  );
}
