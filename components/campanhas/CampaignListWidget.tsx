"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { CampaignItem } from "@/lib/repositories/campaignRepository";
import { SearchIcon, ChevronRightIcon } from "@/components/icons";

export interface CampaignListWidgetProps {
  campaigns: CampaignItem[];
}

export function CampaignListWidget({ campaigns }: CampaignListWidgetProps) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("Todas");

  const filteredCampaigns = campaigns.filter((cmp) => {
    const matchesPlatform = platformFilter === "Todas" || cmp.platform === platformFilter;
    const matchesSearch =
      cmp.name.toLowerCase().includes(search.toLowerCase()) ||
      cmp.clientName.toLowerCase().includes(search.toLowerCase()) ||
      cmp.managerName.toLowerCase().includes(search.toLowerCase()) ||
      cmp.platform.toLowerCase().includes(search.toLowerCase());

    return matchesPlatform && matchesSearch;
  });

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Tabela Consolidada de Performance ({filteredCampaigns.length} Campanhas)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Métricas de mídia paga estilo Meta Ads Manager / Triple Whale com atribuição de vendas e ROAS
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["Todas", "Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads"].map((pl) => (
            <button
              key={pl}
              type="button"
              onClick={() => setPlatformFilter(pl)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                platformFilter === pl
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111]"
              }`}
            >
              {pl}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por campanha, cliente, mídia ou gestor..."
          className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Nome da Campanha</th>
              <th className="py-3 px-3 font-semibold">Cliente</th>
              <th className="py-3 px-3 font-semibold">Plataforma</th>
              <th className="py-3 px-3 font-semibold">Investimento</th>
              <th className="py-3 px-3 font-semibold">Receita</th>
              <th className="py-3 px-3 font-semibold">ROAS</th>
              <th className="py-3 px-3 font-semibold">CTR</th>
              <th className="py-3 px-3 font-semibold">CPA / CPL</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">Workspace</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-xs">
            {filteredCampaigns.map((cmp) => (
              <tr key={cmp.id} className="hover:bg-[#FAFAFA] transition-colors group">
                <td className="py-3 px-3">
                  <Link
                    href={`/campanhas/${cmp.id}`}
                    className="font-bold text-[#111111] group-hover:text-[#4A8237] transition-colors block"
                  >
                    {cmp.name}
                  </Link>
                  <span className="text-[10px] text-[#71717A] block truncate max-w-xs">
                    Gestor: {cmp.managerName}
                  </span>
                </td>

                <td className="py-3 px-3 font-bold text-[#111111]">
                  {cmp.clientName}
                </td>

                <td className="py-3 px-3">
                  <Badge variant="dark" size="sm">
                    {cmp.platform}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-mono font-bold text-[#111111]">
                  R$ {cmp.spentAmount.toLocaleString("pt-BR")}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">
                  R$ {cmp.revenueGenerated.toLocaleString("pt-BR")}
                </td>

                <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">
                  {cmp.roas}x
                </td>

                <td className="py-3 px-3 font-mono">
                  {cmp.ctrPercentage}%
                </td>

                <td className="py-3 px-3 font-mono text-[#52525B]">
                  R${cmp.cpaAmount.toFixed(0)} / R${cmp.cplAmount.toFixed(0)}
                </td>

                <td className="py-3 px-3">
                  <Badge variant={cmp.status === "Ativa" ? "alien" : "gray"} size="sm">
                    {cmp.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 text-right">
                  <Link
                    href={`/campanhas/${cmp.id}`}
                    className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[#4A8237] group-hover:underline"
                  >
                    <span>Métricas</span>
                    <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
