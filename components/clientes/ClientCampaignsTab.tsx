import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import { RocketIcon, TrendingUpIcon, PlusIcon, ArrowUpRightIcon } from "@/components/icons";

export interface ClientCampaignsTabProps {
  client: Cliente;
}

export function ClientCampaignsTab({ client }: ClientCampaignsTabProps) {
  const campaigns = [
    {
      id: "cmp-1",
      name: "Meta Ads · Retargeting Fundo de Funil [UGC Video]",
      platform: "Meta Ads",
      status: "Ativa",
      budget: "R$ 15.000 / mês",
      spent: "R$ 8.450",
      roas: "5.2x",
      cpa: "R$ 24,50",
      ctr: "3.4%",
    },
    {
      id: "cmp-2",
      name: "Google Ads · Search Palavras-Chave Fundo de Funil",
      platform: "Google Ads",
      status: "Ativa",
      budget: "R$ 10.000 / mês",
      spent: "R$ 5.200",
      roas: "4.1x",
      cpa: "R$ 31,00",
      ctr: "6.8%",
    },
    {
      id: "cmp-3",
      name: "Meta Ads · Topo de Funil Lookalike 2%",
      platform: "Meta Ads",
      status: "Otimizando",
      budget: "R$ 8.000 / mês",
      spent: "R$ 3.100",
      roas: "3.2x",
      cpa: "R$ 42,00",
      ctr: "2.1%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Summary Header */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
          <div>
            <div className="flex items-center gap-2">
              <RocketIcon className="w-4 h-4 text-[#4A8237]" />
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Mídia & Campanhas Ativas: {client.name}
              </h3>
              <Badge variant="alien" size="sm" showDot>
                Meta Ads & Google Ads
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Monitoramento unificado de orçamento, ROAS, CPA e CTR da conta
            </p>
          </div>

          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
            Nova Campanha
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
              Investimento Mensal
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              R$ 33.000
            </div>
            <span className="text-[10px] text-[#71717A]">Meta Ads + Google Ads</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              ROAS Médio
            </span>
            <div className="text-xl font-bold font-mono text-[#4A8237]">
              {client.currentRoas}
            </div>
            <span className="text-[10px] text-[#71717A]">Mídia Consolidada</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              CPA Médio
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              R$ 28,60
            </div>
            <span className="text-[10px] text-[#71717A]">Custo por Aquisição</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
              CTR Médio
            </span>
            <div className="text-xl font-bold font-mono text-[#111111]">
              4.1%
            </div>
            <span className="text-[10px] text-[#71717A]">Taxa de Clique</span>
          </div>
        </div>
      </Card>

      {/* Campaigns Table */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <h4 className="text-xs font-mono uppercase tracking-wider text-[#71717A] font-semibold">
            Detalhamento de Campanhas em Veiculação ({campaigns.length})
          </h4>
          <span className="text-xs text-[#A1A1AA]">Conexão API Supabase / Mídia</span>
        </div>

        <div className="space-y-3">
          {campaigns.map((cmp) => (
            <div
              key={cmp.id}
              className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-3 hover:border-[#D4D4D8] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#111111]">
                    {cmp.name}
                  </span>
                  <Badge variant="dark" size="sm">
                    {cmp.platform}
                  </Badge>
                </div>
                <Badge variant={cmp.status === "Ativa" ? "alien" : "gray"} size="sm" showDot>
                  {cmp.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-[#E4E4E7]">
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                    Orçamento
                  </span>
                  <span className="font-semibold text-[#111111]">{cmp.budget}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                    Investido
                  </span>
                  <span className="font-mono text-[#111111]">{cmp.spent}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                    ROAS
                  </span>
                  <span className="font-mono font-bold text-[#4A8237]">{cmp.roas}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                    CPA / CTR
                  </span>
                  <span className="font-mono text-[#111111]">{cmp.cpa} ({cmp.ctr})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
