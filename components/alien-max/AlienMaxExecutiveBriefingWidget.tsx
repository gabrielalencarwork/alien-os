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
    <Card className="border-[#4A8237] bg-[rgba(74,130,55,0.03)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#111111] text-white flex items-center justify-center border border-[#4A8237]">
            <BotIcon className="w-5 h-5 text-[#4A8237]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Briefing Diário Executivo · Alien Max
              </h3>
              <Badge variant="alien" size="sm">
                08:00 AM
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] capitalize">{briefing.dateFormatted}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#71717A]">Saúde Agência:</span>
          <div className="px-3 py-1 rounded-lg bg-[#111111] text-[#4A8237] font-bold font-mono text-sm border border-[#4A8237]">
            {briefing.agencyHealthScore}/100 🏆
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-white border border-[#E4E4E7]">
          <span className="text-[10px] font-mono text-[#71717A] block">INVESTIMENTO 30D</span>
          <div className="text-sm font-bold font-mono text-[#111111]">
            R$ {briefing.totalCost30d.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E4E4E7]">
          <span className="text-[10px] font-mono text-[#71717A] block">RECEITA ATRIBUÍDA</span>
          <div className="text-sm font-bold font-mono text-[#4A8237]">
            R$ {briefing.totalRevenue30d.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E4E4E7]">
          <span className="text-[10px] font-mono text-[#71717A] block">ROAS CONSOLIDADO</span>
          <div className="text-sm font-bold font-mono text-[#4A8237]">{briefing.averageRoas}x</div>
        </div>
        <div className="p-3 rounded-xl bg-white border border-[#E4E4E7]">
          <span className="text-[10px] font-mono text-[#71717A] block">CAMPANHAS ATIVAS</span>
          <div className="text-sm font-bold font-mono text-[#111111]">
            {briefing.activeCampaignsCount} ativas
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold text-[#111111] block flex items-center gap-1.5">
          <SparklesIcon className="w-3.5 h-3.5 text-[#4A8237]" /> Destaques da Operação:
        </span>
        <ul className="space-y-1.5 text-xs text-[#52525B]">
          {briefing.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-[#4A8237] font-bold">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
