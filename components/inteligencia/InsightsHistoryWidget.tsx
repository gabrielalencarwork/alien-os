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
    <Card className="border-line bg-surface space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-ink" />
            <h3 className="text-base font-bold text-ink tracking-tight">
              Histórico Consolidado de Insights da IA
            </h3>
            <Badge variant="alien" size="sm">
              Tabela ai_insights
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
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
                  ? "bg-inverse text-white"
                  : "bg-raised text-body hover:text-ink"
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
            className="p-4 rounded-xl bg-canvas border border-line flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-line-strong transition-colors"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-ink">
                  {ins.companyName}
                </span>
                <span className="text-[10px] font-mono text-muted">
                  · {ins.timestamp}
                </span>
                <Badge variant="alien" size="sm">
                  {ins.category}
                </Badge>
              </div>

              <h4 className="text-xs font-semibold text-ink">
                {ins.title}
              </h4>

              <p className="text-xs text-muted leading-relaxed">
                {ins.summary}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line">
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-subtle block">
                  Impacto Estimado
                </span>
                <span className="text-sm font-mono font-bold text-accent">
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
