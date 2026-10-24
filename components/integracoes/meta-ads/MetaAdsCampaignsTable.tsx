import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MetaAdsCampaignRecord } from "@/lib/repositories/metaAdsRepository";

export interface MetaAdsCampaignsTableProps {
  campaigns: MetaAdsCampaignRecord[];
}

export function MetaAdsCampaignsTable({ campaigns }: MetaAdsCampaignsTableProps) {
  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Campanhas Meta Ads ({campaigns.length} Ativas)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Sincronização em tempo real das campanhas de CBO Advantage+, Vendas e Retargeting
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Meta Marketing API
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Nome da Campanha</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Objetivo</th>
              <th className="py-3 px-3 font-semibold">Orçamento/dia</th>
              <th className="py-3 px-3 font-semibold">Custo R$</th>
              <th className="py-3 px-3 font-semibold text-accent">Conversas</th>
              <th className="py-3 px-3 font-semibold">Conversões</th>
              <th className="py-3 px-3 font-semibold">Receita R$</th>
              <th className="py-3 px-3 font-semibold text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {campaigns.map((cmp) => (
              <tr key={cmp.id} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-bold text-ink">
                  {cmp.campaignName}
                  <span className="text-[10px] font-mono text-muted block font-normal">
                    ID: {cmp.externalCampaignId}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <Badge variant={cmp.status === "ACTIVE" ? "alien" : "gray"} size="sm">
                    {cmp.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-medium text-body">
                  {cmp.objective}
                </td>

                <td className="py-3 px-3 font-mono text-ink">
                  R$ {cmp.dailyBudget.toFixed(2)}
                </td>

                <td className="py-3 px-3 font-mono font-semibold text-ink">
                  R$ {cmp.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-accent">
                  {cmp.messagingConversations > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-accent/8 px-2 py-0.5 rounded text-xs">
                      {cmp.messagingConversations}
                    </span>
                  ) : (
                    <span className="text-subtle">0</span>
                  )}
                </td>

                <td className="py-3 px-3 font-mono text-ink">
                  {cmp.conversions}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-accent">
                  R$ {cmp.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-accent text-right">
                  {cmp.roas}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
