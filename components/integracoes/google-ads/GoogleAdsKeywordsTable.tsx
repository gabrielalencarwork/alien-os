"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { SearchIcon } from "@/components/icons";
import { GoogleAdsKeywordRecord } from "@/lib/repositories/googleAdsRepository";

export interface GoogleAdsKeywordsTableProps {
  keywords: GoogleAdsKeywordRecord[];
}

export function GoogleAdsKeywordsTable({ keywords }: GoogleAdsKeywordsTableProps) {
  if (!keywords || keywords.length === 0) {
    return (
      <Card className="p-8 text-center space-y-3 border-line bg-surface">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-accent">
          <SearchIcon className="w-5 h-5" />
        </div>
        <div className="space-y-1 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-ink">
            Nenhuma Palavra-Chave Sincronizada
          </h3>
          <p className="text-xs text-muted">
            Execute a sincronização do Google Ads para importar as palavras-chave ativas configuradas nas campanhas de pesquisa da sua conta.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-line bg-surface overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-accent" />
              Palavras-Chave de Pesquisa Reais
            </h3>
            <Badge variant="alien" size="sm">
              {keywords.length} Palavras Ativas
            </Badge>
          </div>
          <p className="text-xs text-muted">
            Termos de busca e correspondências ativas importadas diretamente do Google Ads via API oficial.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-line bg-canvas text-muted font-semibold text-[11px]">
              <th className="py-2.5 px-3">Palavra-Chave</th>
              <th className="py-2.5 px-3">Correspondência</th>
              <th className="py-2.5 px-3">Campanha</th>
              <th className="py-2.5 px-3">Grupo de Anúncios</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 font-mono text-right">ID Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft text-ink">
            {keywords.map((kw) => (
              <tr key={kw.id} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-semibold text-ink">
                  <span>"{kw.keywordText}"</span>
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      kw.matchType === "EXACT"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : kw.matchType === "PHRASE"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {kw.matchType === "EXACT"
                      ? "[Exata]"
                      : kw.matchType === "PHRASE"
                      ? '"Frase"'
                      : "Ampla"}
                  </span>
                </td>
                <td className="py-3 px-3 text-ink font-medium max-w-xs truncate">
                  {kw.campaignName || "Campanha Vinculada"}
                </td>
                <td className="py-3 px-3 text-body max-w-xs truncate">
                  {kw.adGroupName || "Grupo de Anúncios"}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={kw.status === "ENABLED" ? "alien" : "gray"} size="sm">
                    {kw.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 text-right font-mono text-muted">
                  {kw.externalCriterionId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
