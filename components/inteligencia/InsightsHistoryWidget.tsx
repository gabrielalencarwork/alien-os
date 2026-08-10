"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getInsightsHistory, InsightRecord } from "@/lib/alienMaxIntelligence";
import { SparklesIcon, SearchIcon, ClockIcon } from "@/components/icons";

export function InsightsHistoryWidget() {
  const [insights] = useState<InsightRecord[]>(getInsightsHistory());
  const [filterCategory, setFilterCategory] = useState<string>("Todos");

  const categories = ["Todos", "Tráfego Pago", "UX & Checkout", "Mídia & Criativos"];

  const filteredInsights =
    filterCategory === "Todos"
      ? insights
      : insights.filter((i) => i.category === filterCategory);

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-[#111111]" />
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Histórico Consolidado de Insights da IA
            </h3>
            <Badge variant="alien" size="sm">
              Tabela ai_insights
            </Badge>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5">
            Registro cronológico de todas as oportunidades e diagnósticos autônomos gerados para a carteira
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterCategory === cat
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredInsights.map((ins) => (
          <div
            key={ins.id}
            className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#D4D4D8] transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#111111]">
                  {ins.companyName}
                </span>
                <span className="text-[10px] font-mono text-[#71717A]">
                  · {ins.timestamp}
                </span>
                <Badge variant="alien" size="sm">
                  {ins.category}
                </Badge>
              </div>

              <h4 className="text-xs font-semibold text-[#111111]">
                {ins.title}
              </h4>

              <p className="text-xs text-[#71717A] leading-relaxed">
                {ins.summary}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#E4E4E7]">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                  Impacto Estimado
                </span>
                <span className="text-sm font-mono font-bold text-[#4A8237]">
                  {ins.impactScore}/100 pts
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
