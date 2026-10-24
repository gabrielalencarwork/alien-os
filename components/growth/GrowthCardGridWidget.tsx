"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { GrowthExperimentItem } from "@/lib/repositories/growthRepository";
import { ArrowUpRightIcon, SparklesIcon } from "@/components/icons";

export interface GrowthCardGridWidgetProps {
  experiments: GrowthExperimentItem[];
}

export function GrowthCardGridWidget({ experiments }: GrowthCardGridWidgetProps) {
  if (experiments.length === 0) {
    return (
      <div className="p-12 text-center bg-surface border border-line rounded-2xl space-y-3">
        <div className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center mx-auto text-accent">
          <SparklesIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <span className="text-xs font-bold text-ink block">
            Nenhum experimento cadastrado
          </span>
          <p className="text-xs text-muted">
            Crie sua primeira hipótese de crescimento clicando em "Novo Experimento".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {experiments.map((exp) => (
        <Link
          key={exp.id}
          href={`/growth/${exp.id}`}
          className="p-5 rounded-2xl bg-surface border border-line hover:border-accent shadow-xs hover:shadow-md transition-all space-y-4 group block"
        >
          {/* Header: Client & Alien Max Probability */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink">
                {exp.clientName}
              </span>
              <Badge variant="dark" size="sm">
                {exp.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono text-accent font-bold">
                Prob. IA {exp.alienMaxProbability}%
              </span>
              <Badge
                variant={exp.status === "Validado" ? "alien" : "gray"}
                size="sm"
                className={
                  exp.status === "Rodando"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : ""
                }
              >
                {exp.status}
              </Badge>
            </div>
          </div>

          {/* Title & Hypothesis */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors leading-tight">
              {exp.title}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed italic">
              "{exp.hypothesis}"
            </p>
          </div>

          {/* Impact & Confidence Summary Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-canvas border border-line text-xs">
            <div>
              <span className="text-[10px] font-mono text-subtle uppercase block">Rec. Estimada</span>
              <span className="font-bold text-ink font-mono">
                R$ {exp.estimatedRevenueImpact.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-subtle uppercase block">Rec. Confirmada</span>
              <span className="font-bold text-accent font-mono">
                R$ {exp.confirmedRevenueImpact.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-subtle uppercase block">Confiança</span>
              <span className="font-bold text-ink font-mono">
                {exp.statisticalConfidencePercentage}% (95% IC)
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-line-soft flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted">
                Resp: <strong className="text-ink">{exp.ownerName}</strong>
              </span>
              <Badge variant="outline" size="sm">
                Prioridade {exp.priority}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted">
                Término: <strong className="text-ink">{exp.endDate || "Em andamento"}</strong>
              </span>
              <div className="w-6 h-6 rounded-lg bg-canvas border border-line text-muted group-hover:text-accent group-hover:border-accent flex items-center justify-center transition-colors">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
