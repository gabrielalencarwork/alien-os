"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, SparklesIcon } from "@/components/icons";

export interface GoogleAdsKeywordRecord {
  id: string;
  keywordText: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
  campaignName: string;
  adGroupName: string;
  status: "ENABLED" | "PAUSED";
  qualityScore: number;
  impressions: number;
  clicks: number;
  ctr: number;
  averageCpc: number;
  cost: number;
  conversions: number;
  roas: number;
}

export function GoogleAdsKeywordsTable() {
  const sampleKeywords: GoogleAdsKeywordRecord[] = [
    {
      id: "kw-1",
      keywordText: "consulta medica presencial",
      matchType: "EXACT",
      campaignName: "Sim Saúde - Pesquisa Consultas Especializadas",
      adGroupName: "Consultas Agendamento Imediato",
      status: "ENABLED",
      qualityScore: 9,
      impressions: 42100,
      clicks: 2840,
      ctr: 6.75,
      averageCpc: 1.45,
      cost: 4118.0,
      conversions: 182,
      roas: 7.95,
    },
    {
      id: "kw-2",
      keywordText: "exame de sangue checkup completo",
      matchType: "PHRASE",
      campaignName: "Sim Saúde - Performance Max Exames e Checkup",
      adGroupName: "Checkup Geral e Exames Laboratoriais",
      status: "ENABLED",
      qualityScore: 8,
      impressions: 28400,
      clicks: 1920,
      ctr: 6.76,
      averageCpc: 1.5,
      cost: 2880.0,
      conversions: 110,
      roas: 7.25,
    },
    {
      id: "kw-3",
      keywordText: "clinica medica sp zona sul",
      matchType: "PHRASE",
      campaignName: "Sim Saúde - Pesquisa Consultas Especializadas",
      adGroupName: "Consultas Agendamento Imediato",
      status: "ENABLED",
      qualityScore: 10,
      impressions: 18900,
      clicks: 1410,
      ctr: 7.46,
      averageCpc: 1.38,
      cost: 1945.8,
      conversions: 94,
      roas: 8.42,
    },
    {
      id: "kw-4",
      keywordText: "agendar consulta cardiologista",
      matchType: "EXACT",
      campaignName: "Sim Saúde - Pesquisa Consultas Especializadas",
      adGroupName: "Consultas Agendamento Imediato",
      status: "ENABLED",
      qualityScore: 9,
      impressions: 14200,
      clicks: 980,
      ctr: 6.9,
      averageCpc: 1.62,
      cost: 1587.6,
      conversions: 68,
      roas: 7.6,
    },
    {
      id: "kw-5",
      keywordText: "checkup medico executivo preco",
      matchType: "BROAD",
      campaignName: "Sim Saúde - Performance Max Exames e Checkup",
      adGroupName: "Checkup Geral e Exames Laboratoriais",
      status: "ENABLED",
      qualityScore: 7,
      impressions: 11300,
      clicks: 720,
      ctr: 6.37,
      averageCpc: 1.75,
      cost: 1260.0,
      conversions: 42,
      roas: 6.2,
    },
  ];

  return (
    <Card className="border-[#E4E4E7] bg-white overflow-hidden space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[#111111] flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-[#4A8237]" />
              Palavras-Chave de Pesquisa Ativas
            </h3>
            <Badge variant="alien" size="sm">
              {sampleKeywords.length} Palavras Ativas
            </Badge>
          </div>
          <p className="text-xs text-[#71717A]">
            Monitoramento de termos de busca, Índices de Qualidade (QS 1-10) e desempenho de conversão.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] font-semibold">
              <th className="py-2.5 px-3">Palavra-Chave</th>
              <th className="py-2.5 px-3">Correspondência</th>
              <th className="py-2.5 px-3">Campanha & Grupo</th>
              <th className="py-2.5 px-3 text-center">QS</th>
              <th className="py-2.5 px-3 text-right">Impressões</th>
              <th className="py-2.5 px-3 text-right">Cliques</th>
              <th className="py-2.5 px-3 text-right">CTR</th>
              <th className="py-2.5 px-3 text-right">CPC Médio</th>
              <th className="py-2.5 px-3 text-right">Custo Total</th>
              <th className="py-2.5 px-3 text-right">Conversões</th>
              <th className="py-2.5 px-3 text-right">ROAS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-[#111111]">
            {sampleKeywords.map((kw) => (
              <tr key={kw.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-semibold text-[#111111]">
                  <div className="flex items-center gap-1.5">
                    <span>"{kw.keywordText}"</span>
                  </div>
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
                <td className="py-3 px-3 max-w-xs truncate">
                  <div className="text-[11px] font-medium text-[#111111]">{kw.campaignName}</div>
                  <div className="text-[10px] text-[#71717A]">{kw.adGroupName}</div>
                </td>
                <td className="py-3 px-3 text-center">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      kw.qualityScore >= 8
                        ? "bg-emerald-100 text-emerald-800"
                        : kw.qualityScore >= 6
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {kw.qualityScore}/10
                  </span>
                </td>
                <td className="py-3 px-3 text-right font-mono">{kw.impressions.toLocaleString("pt-BR")}</td>
                <td className="py-3 px-3 text-right font-mono font-semibold">{kw.clicks.toLocaleString("pt-BR")}</td>
                <td className="py-3 px-3 text-right font-mono text-[#4A8237] font-semibold">{kw.ctr}%</td>
                <td className="py-3 px-3 text-right font-mono">
                  R$ {kw.averageCpc.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold">
                  R$ {kw.cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-[#111111]">{kw.conversions}</td>
                <td className="py-3 px-3 text-right font-mono font-bold text-[#4A8237]">
                  {kw.roas}x
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
