"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { CampaignItem } from "@/lib/repositories/campaignRepository";
import { ArrowUpRightIcon, RocketIcon } from "@/components/icons";

export interface CampaignCardGridWidgetProps {
  campaigns: CampaignItem[];
}

export function CampaignCardGridWidget({ campaigns }: CampaignCardGridWidgetProps) {
  if (campaigns.length === 0) {
    return (
      <div className="p-12 text-center bg-surface border border-line rounded-2xl space-y-3">
        <div className="w-10 h-10 rounded-xl bg-canvas border border-line flex items-center justify-center mx-auto text-accent">
          <RocketIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <span className="text-xs font-bold text-ink block">
            Nenhuma campanha encontrada
          </span>
          <p className="text-xs text-muted">
            Cadastre uma nova campanha clicando em "Nova Campanha" ou sincronize suas contas em Integrações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {campaigns.map((cmp) => (
        <Link
          key={cmp.id}
          href={`/campanhas/${cmp.id}`}
          className="p-5 rounded-2xl bg-surface border border-line hover:border-accent shadow-xs hover:shadow-md transition-all space-y-4 group block"
        >
          {/* Header: Platform & Client Name */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-ink">
                {cmp.clientName}
              </span>
              <Badge variant="dark" size="sm">
                {cmp.platform}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge variant="alien" size="sm">
                ROAS {cmp.roas}x
              </Badge>
              <Badge
                variant={cmp.healthStatus === "Excelente" ? "alien" : "gray"}
                size="sm"
                className={
                  cmp.healthStatus === "Atenção"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : ""
                }
              >
                {cmp.healthStatus}
              </Badge>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-ink group-hover:text-accent transition-colors leading-tight">
              {cmp.name}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {cmp.description}
            </p>
          </div>

          {/* Performance Summary Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-canvas border border-line text-xs">
            <div>
              <span className="text-[10px] font-mono text-subtle uppercase block">Investido</span>
              <span className="font-bold text-ink font-mono">
                R$ {cmp.spentAmount.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-subtle uppercase block">Receita</span>
              <span className="font-bold text-accent font-mono">
                R$ {cmp.revenueGenerated.toLocaleString("pt-BR")}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-subtle uppercase block">CTR / CPA</span>
              <span className="font-bold text-ink font-mono">
                {cmp.ctrPercentage}% / R${cmp.cpaAmount.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-3 border-t border-line-soft flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm">
                {cmp.status}
              </Badge>
              <span className="text-[10px] text-muted">
                Gestor: <strong className="text-ink">{cmp.managerName}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted">
                Obj: <strong className="text-ink">{cmp.objective}</strong>
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
