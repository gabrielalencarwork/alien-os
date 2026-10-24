import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { TrophyIcon, ArrowUpRightIcon } from "./icons";

export interface AlienCase {
  id: string;
  client: string;
  segment: string;
  metricHighlight: string;
  metricLabel: string;
  strategySummary: string;
  date: string;
}

export interface AlienCasesCardProps {
  cases: AlienCase[];
}

export function AlienCasesCard({ cases }: AlienCasesCardProps) {
  return (
    <Card className="border-line bg-surface">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center">
            <TrophyIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink tracking-tight">
              Últimos Alien Cases
            </h3>
            <p className="text-xs text-muted">
              Histórias de sucesso recentes e estratégias validadas em produção
            </p>
          </div>
        </div>

        <Badge variant="alien" size="sm">
          Benchmarking Interno
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cases.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl bg-canvas border border-line flex flex-col justify-between hover:border-line-strong transition-all group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-ink">
                  {item.client}
                </span>
                <span className="text-[10px] font-mono text-subtle">
                  {item.date}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-line text-center space-y-0.5">
                <div className="text-2xl font-bold text-accent tracking-tight">
                  {item.metricHighlight}
                </div>
                <div className="text-[11px] text-muted font-medium">
                  {item.metricLabel}
                </div>
              </div>

              <p className="text-xs text-body leading-relaxed line-clamp-3">
                {item.strategySummary}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-subtle bg-raised px-2 py-0.5 rounded">
                {item.segment}
              </span>
              <span className="inline-flex items-center gap-1 text-accent font-medium group-hover:underline cursor-pointer">
                <span>Ver Playbook</span>
                <ArrowUpRightIcon className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
