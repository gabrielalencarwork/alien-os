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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {experiments.map((exp) => (
        <Link
          key={exp.id}
          href={`/growth/${exp.id}`}
          className="p-5 rounded-2xl bg-white border border-[#E4E4E7] hover:border-[#4A8237] shadow-xs hover:shadow-md transition-all space-y-4 group block"
        >
          {/* Header: Client & Alien Max Probability */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#111111]">
                {exp.clientName}
              </span>
              <Badge variant="dark" size="sm">
                {exp.type}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono text-[#4A8237] font-bold">
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
            <h3 className="text-base font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors leading-tight">
              {exp.title}
            </h3>
            <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed italic">
              "{exp.hypothesis}"
            </p>
          </div>

          {/* Impact & Confidence Summary Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] text-xs">
            <div>
              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">Rec. Estimada</span>
              <span className="font-bold text-[#111111] font-mono">
                R$ {exp.estimatedRevenueImpact.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">Rec. Confirmada</span>
              <span className="font-bold text-[#4A8237] font-mono">
                R$ {exp.confirmedRevenueImpact.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-[#A1A1AA] uppercase block">Confiança</span>
              <span className="font-bold text-[#111111] font-mono">
                {exp.statisticalConfidencePercentage}% (95% IC)
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#71717A]">
                Resp: <strong className="text-[#111111]">{exp.ownerName}</strong>
              </span>
              <Badge variant="outline" size="sm">
                Prioridade {exp.priority}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#71717A]">
                Término: <strong className="text-[#111111]">{exp.endDate || "Em andamento"}</strong>
              </span>
              <div className="w-6 h-6 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] text-[#71717A] group-hover:text-[#4A8237] group-hover:border-[#4A8237] flex items-center justify-center transition-colors">
                <ArrowUpRightIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
