"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MetaAdsAdRecord } from "@/lib/repositories/metaAdsRepository";
import { MessageSquareIcon, TrendingUpIcon, DollarIcon } from "@/components/icons";

export interface MetaAdsAdsTableWidgetProps {
  ads: MetaAdsAdRecord[];
}

export function MetaAdsAdsTableWidget({ ads }: MetaAdsAdsTableWidgetProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"conversations" | "costPerMessage" | "spend" | "ctr">("conversations");

  // Métricas agregadas de topo
  const totalConversations = useMemo(
    () => ads.reduce((acc, ad) => acc + (ad.messagingConversations || 0), 0),
    [ads]
  );

  const totalSpend = useMemo(
    () => ads.reduce((acc, ad) => acc + (ad.spend || 0), 0),
    [ads]
  );

  const avgCostPerConversation = useMemo(() => {
    return totalConversations > 0 ? totalSpend / totalConversations : 0;
  }, [totalConversations, totalSpend]);

  // Filtragem e Ordenação
  const filteredAndSortedAds = useMemo(() => {
    let result = [...ads];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (ad) =>
          ad.adName.toLowerCase().includes(q) ||
          ad.campaignName?.toLowerCase().includes(q) ||
          ad.externalAdId.includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "conversations") {
        if (b.messagingConversations !== a.messagingConversations) {
          return b.messagingConversations - a.messagingConversations;
        }
        return b.spend - a.spend;
      }
      if (sortBy === "costPerMessage") {
        const costA = a.costPerMessagingConversation > 0 ? a.costPerMessagingConversation : 999999;
        const costB = b.costPerMessagingConversation > 0 ? b.costPerMessagingConversation : 999999;
        return costA - costB;
      }
      if (sortBy === "spend") {
        return b.spend - a.spend;
      }
      if (sortBy === "ctr") {
        return b.ctr - a.ctr;
      }
      return 0;
    });

    return result;
  }, [ads, searchTerm, sortBy]);

  if (ads.length === 0) {
    return (
      <Card className="p-8 text-center space-y-3 border-[#E4E4E7] bg-white">
        <div className="w-12 h-12 rounded-2xl bg-[rgba(74,130,55,0.08)] text-[#4A8237] flex items-center justify-center mx-auto">
          <MessageSquareIcon className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#111111]">
          Nenhum Anúncio ou Criativo Sincronizado
        </h3>
        <p className="text-xs text-[#71717A] max-w-md mx-auto">
          Execute a sincronização na aba superior para importar todos os anúncios, criativos e o histórico de conversas iniciadas por mensagem (WhatsApp / Direct).
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. KPIs Rápidos de Criativos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 border-[#E4E4E7] bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span>Criativos Ativos</span>
            <span className="w-2 h-2 rounded-full bg-[#4A8237]" />
          </div>
          <div className="text-2xl font-bold text-[#111111] font-mono">
            {ads.length}
          </div>
          <span className="text-[10px] text-[#A1A1AA]">Peças monitoradas</span>
        </Card>

        <Card className="p-4 border-[rgba(74,130,55,0.2)] bg-[rgba(74,130,55,0.02)] space-y-1">
          <div className="flex items-center justify-between text-xs text-[#4A8237] font-medium">
            <span>Conversas por Mensagem</span>
            <MessageSquareIcon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-[#4A8237] font-mono">
            {totalConversations.toLocaleString("pt-BR")}
          </div>
          <span className="text-[10px] text-[#71717A]">WhatsApp / Direct / Messenger</span>
        </Card>

        <Card className="p-4 border-[#E4E4E7] bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span>Custo Médio / Conversa</span>
            <DollarIcon className="w-4 h-4 text-[#71717A]" />
          </div>
          <div className="text-2xl font-bold text-[#111111] font-mono">
            {avgCostPerConversation > 0
              ? `R$ ${avgCostPerConversation.toFixed(2)}`
              : "R$ 0,00"}
          </div>
          <span className="text-[10px] text-[#A1A1AA]">Por contato gerado</span>
        </Card>

        <Card className="p-4 border-[#E4E4E7] bg-white space-y-1">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span>Investimento em Criativos</span>
            <TrendingUpIcon className="w-4 h-4 text-[#71717A]" />
          </div>
          <div className="text-2xl font-bold text-[#111111] font-mono">
            {totalSpend > 0
              ? `R$ ${totalSpend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "R$ 0,00"}
          </div>
          <span className="text-[10px] text-[#A1A1AA]">Total gasto nas peças</span>
        </Card>
      </div>

      {/* 2. Tabela com Busca e Ordenação de Performance */}
      <Card className="border-[#E4E4E7] bg-white space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight flex items-center gap-2">
              <span>Performance por Criativo ({filteredAndSortedAds.length})</span>
              <Badge variant="alien" size="sm">
                Meta Ads
              </Badge>
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Métricas reais de conversas iniciadas no WhatsApp/Direct, investimento e custo por contato
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar criativo..."
              className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-xs outline-none focus:border-[#4A8237] text-[#111111] w-40 sm:w-52"
            />

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-xs outline-none focus:border-[#4A8237] text-[#111111] font-medium"
            >
              <option value="conversations">💬 Mais Conversas</option>
              <option value="costPerMessage">💰 Menor Custo/Conversa</option>
              <option value="spend">📈 Maior Investimento</option>
              <option value="ctr">🎯 Maior CTR</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
                <th className="py-3 px-3 font-semibold">Criativo / Anúncio</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-3 font-semibold text-right text-[#4A8237]">Conversas (WhatsApp)</th>
                <th className="py-3 px-3 font-semibold text-right">Custo / Conversa</th>
                <th className="py-3 px-3 font-semibold text-right">Investimento</th>
                <th className="py-3 px-3 font-semibold text-right">Cliques / CTR</th>
                <th className="py-3 px-3 font-semibold text-right">ID Externo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F4F4F5]">
              {filteredAndSortedAds.map((ad, idx) => {
                const hasConversations = (ad.messagingConversations || 0) > 0;

                return (
                  <tr key={ad.id} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-3 px-3 font-bold text-[#111111] flex items-center gap-3">
                      {ad.thumbnailUrl ? (
                        <img
                          src={ad.thumbnailUrl}
                          alt={ad.adName}
                          className="w-10 h-10 rounded-lg object-cover border border-[#E4E4E7] shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[10px] font-mono text-[#71717A] shrink-0">
                          #{idx + 1}
                        </div>
                      )}
                      <div className="min-w-0 max-w-xs">
                        <span className="block font-bold text-[#111111] truncate" title={ad.adName}>
                          {ad.adName}
                        </span>
                        <span className="text-[10px] font-mono text-[#71717A] block truncate">
                          {ad.campaignName || "Campanha Meta"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <Badge variant={ad.status === "ACTIVE" ? "alien" : "gray"} size="sm">
                        {ad.status}
                      </Badge>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {hasConversations ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[rgba(74,130,55,0.1)] text-[#4A8237] border border-[rgba(74,130,55,0.2)]">
                          💬 {ad.messagingConversations}
                        </span>
                      ) : (
                        <span className="font-mono text-zinc-400">0</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-[#111111]">
                      {ad.costPerMessagingConversation > 0 ? (
                        `R$ ${ad.costPerMessagingConversation.toFixed(2)}`
                      ) : hasConversations && ad.spend > 0 ? (
                        `R$ ${(ad.spend / ad.messagingConversations).toFixed(2)}`
                      ) : (
                        <span className="text-[#A1A1AA]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-semibold text-[#111111]">
                      {ad.spend > 0
                        ? `R$ ${ad.spend.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                        : "R$ 0,00"}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#52525B]">
                      <div>{ad.clicks || 0} cliques</div>
                      <div className="text-[10px] text-[#71717A]">
                        {ad.ctr > 0 ? `${ad.ctr.toFixed(2)}% CTR` : "0.0% CTR"}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[10px] text-[#71717A] text-right">
                      {ad.externalAdId}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
