"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ShieldCheckIcon } from "@/components/icons";
import { GoogleAdsKeywordRecord } from "@/lib/repositories/googleAdsRepository";

export interface GoogleAdsNegativeKeywordsTableProps {
  negativeKeywords: GoogleAdsKeywordRecord[];
}

export function GoogleAdsNegativeKeywordsTable({ negativeKeywords }: GoogleAdsNegativeKeywordsTableProps) {
  if (!negativeKeywords || negativeKeywords.length === 0) {
    return (
      <Card className="p-8 text-center space-y-3 border-[#E4E4E7] bg-white">
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldCheckIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-[#111111]">
            Nenhuma Palavra Negativada Sincronizada
          </h3>
          <p className="text-xs text-[#71717A]">
            Execute a sincronização do Google Ads para importar as palavras-chave negativas configuradas a nível de campanha ou grupo para proteger o orçamento da sua conta.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-[#E4E4E7] bg-white overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-[#4A8237]" />
              Palavras-Chave Negativadas & Proteção de Verba
            </h3>
            <Badge variant="alien" size="sm">
              {negativeKeywords.length} Negativações Ativas
            </Badge>
          </div>
          <p className="text-xs text-[#71717A]">
            Termos negativos importados via Google Ads API para bloquear buscas irrelevantes e economizar investimento.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] font-semibold text-[11px]">
              <th className="py-2.5 px-3">Palavra Negativada</th>
              <th className="py-2.5 px-3">Correspondência</th>
              <th className="py-2.5 px-3">Escopo (Campanha / Grupo)</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 font-mono text-right">ID Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-[#111111]">
            {negativeKeywords.map((neg) => {
              const scope = neg.adGroupName
                ? `${neg.campaignName || "Campanha"} > ${neg.adGroupName}`
                : neg.campaignName
                ? `Campanha: ${neg.campaignName}`
                : "Nível da Conta";

              return (
                <tr key={neg.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3 px-3 font-semibold text-rose-700">
                    <span>-{neg.keywordText}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      {neg.matchType === "EXACT" ? "[Exata]" : neg.matchType === "PHRASE" ? '"Frase"' : "Ampla"}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-[#111111] max-w-sm truncate">
                    {scope}
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant={neg.status === "ENABLED" ? "alien" : "gray"} size="sm">
                      {neg.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 font-mono text-[#71717A] text-right">
                    {neg.externalCriterionId}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
