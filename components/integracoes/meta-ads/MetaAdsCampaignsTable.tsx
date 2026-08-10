import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MetaAdsCampaignRecord } from "@/lib/repositories/metaAdsRepository";

export interface MetaAdsCampaignsTableProps {
  campaigns: MetaAdsCampaignRecord[];
}

export function MetaAdsCampaignsTable({ campaigns }: MetaAdsCampaignsTableProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Campanhas Meta Ads ({campaigns.length} Ativas)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
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
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Nome da Campanha</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Objetivo</th>
              <th className="py-3 px-3 font-semibold">Orçamento/dia</th>
              <th className="py-3 px-3 font-semibold">Custo R$</th>
              <th className="py-3 px-3 font-semibold">Conversões</th>
              <th className="py-3 px-3 font-semibold">Receita R$</th>
              <th className="py-3 px-3 font-semibold text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {campaigns.map((cmp) => (
              <tr key={cmp.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-bold text-[#111111]">
                  {cmp.campaignName}
                  <span className="text-[10px] font-mono text-[#71717A] block font-normal">
                    ID: {cmp.externalCampaignId}
                  </span>
                </td>

                <td className="py-3 px-3">
                  <Badge variant={cmp.status === "ACTIVE" ? "alien" : "gray"} size="sm">
                    {cmp.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-medium text-[#52525B]">
                  {cmp.objective}
                </td>

                <td className="py-3 px-3 font-mono text-[#111111]">
                  R$ {cmp.dailyBudget.toFixed(2)}
                </td>

                <td className="py-3 px-3 font-mono font-semibold text-[#111111]">
                  R$ {cmp.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>

                <td className="py-3 px-3 font-mono text-[#111111]">
                  {cmp.conversions}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">
                  R$ {cmp.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-[#4A8237] text-right">
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
