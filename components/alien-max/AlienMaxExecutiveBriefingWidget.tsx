import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ExecutiveDailyBriefing } from "@/lib/ai/alienMaxEngine";
import { BotIcon, SparklesIcon, TrendingUpIcon } from "@/components/icons";

export interface AlienMaxExecutiveBriefingWidgetProps {
  briefing: ExecutiveDailyBriefing;
}

export function AlienMaxExecutiveBriefingWidget({
  briefing,
}: AlienMaxExecutiveBriefingWidgetProps) {
  return (
    <Card className="border-accent bg-accent/3 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-inverse text-white flex items-center justify-center border border-accent">
            <BotIcon className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-ink tracking-tight">
                Briefing Diário Executivo · Alien Max
              </h3>
              <Badge variant="alien" size="sm">
                08:00 AM
              </Badge>
            </div>
            <p className="text-xs text-muted capitalize">{briefing.dateFormatted}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-muted">Saúde Agência:</span>
          <div className="px-3 py-1 rounded-lg bg-inverse text-accent font-bold font-mono text-sm border border-accent">
            {briefing.agencyHealthScore}/100 🏆
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-surface border border-line">
          <span className="text-[10px] font-mono text-muted block">INVESTIMENTO 30D</span>
          <div className="text-sm font-bold font-mono text-ink">
            R$ {briefing.totalCost30d.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-line">
          <span className="text-[10px] font-mono text-muted block">RECEITA ATRIBUÍDA</span>
          <div className="text-sm font-bold font-mono text-accent">
            R$ {briefing.totalRevenue30d.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-line">
          <span className="text-[10px] font-mono text-muted block">ROAS CONSOLIDADO</span>
          <div className="text-sm font-bold font-mono text-accent">{briefing.averageRoas}x</div>
        </div>
        <div className="p-3 rounded-xl bg-surface border border-line">
          <span className="text-[10px] font-mono text-muted block">CAMPANHAS ATIVAS</span>
          <div className="text-sm font-bold font-mono text-ink">
            {briefing.activeCampaignsCount} ativas
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-ink block flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-accent" /> Destaques da Operação:
        </span>
        <ul className="space-y-1.5 text-xs text-body">
          {briefing.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
