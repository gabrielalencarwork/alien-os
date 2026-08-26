"use client";

import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ShieldCheckIcon, SparklesIcon } from "@/components/icons";

export interface GoogleAdsNegativeKeywordRecord {
  id: string;
  negativeText: string;
  matchType: "EXACT" | "PHRASE" | "BROAD";
  scope: string; // ex: "Conta Inteira (Lista Geral)" ou "Campanha Pesquisa"
  addedDate: string;
  savedAmount: number;
}

export function GoogleAdsNegativeKeywordsTable() {
  const negatives: GoogleAdsNegativeKeywordRecord[] = [
    {
      id: "neg-1",
      negativeText: "gratis",
      matchType: "BROAD",
      scope: "Lista Negativa Global (MCC Alien OS)",
      addedDate: "2026-06-15",
      savedAmount: 1450.0,
    },
    {
      id: "neg-2",
      negativeText: "gratuito",
      matchType: "BROAD",
      scope: "Lista Negativa Global (MCC Alien OS)",
      addedDate: "2026-06-15",
      savedAmount: 1120.0,
    },
    {
      id: "neg-3",
      negativeText: "sus atendimento",
      matchType: "PHRASE",
      scope: "Sim Saúde - Pesquisa Consultas",
      addedDate: "2026-07-01",
      savedAmount: 890.0,
    },
    {
      id: "neg-4",
      negativeText: "vagas de emprego",
      matchType: "PHRASE",
      scope: "Lista Negativa Global (MCC Alien OS)",
      addedDate: "2026-07-10",
      savedAmount: 640.0,
    },
    {
      id: "neg-5",
      negativeText: "concurso publico",
      matchType: "PHRASE",
      scope: "Lista Negativa Global (MCC Alien OS)",
      addedDate: "2026-07-10",
      savedAmount: 430.0,
    },
    {
      id: "neg-6",
      negativeText: "baixar pdf",
      matchType: "BROAD",
      scope: "Sim Saúde - Performance Max Exames",
      addedDate: "2026-08-01",
      savedAmount: 310.0,
    },
  ];

  const totalSaved = negatives.reduce((acc, curr) => acc + curr.savedAmount, 0);

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
              {negatives.length} Negativações Ativas
            </Badge>
          </div>
          <p className="text-xs text-[#71717A]">
            Filtros de pesquisa para bloquear cliques irrelevantes e evitar desperdício de orçamento.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-emerald-900 shrink-0">
          <SparklesIcon className="w-4 h-4 text-[#4A8237]" />
          <span>Economia Estimada: R$ {totalSaved.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[#71717A] font-semibold">
              <th className="py-2.5 px-3">Palavra Negativada</th>
              <th className="py-2.5 px-3">Correspondência</th>
              <th className="py-2.5 px-3">Escopo da Negativação</th>
              <th className="py-2.5 px-3 text-center">Data de Inclusão</th>
              <th className="py-2.5 px-3 text-right">Verba Salva (Est.)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-[#111111]">
            {negatives.map((neg) => (
              <tr key={neg.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-semibold text-rose-700">
                  <div className="flex items-center gap-1.5">
                    <span>-{neg.negativeText}</span>
                  </div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                    {neg.matchType === "EXACT" ? "[Exata]" : neg.matchType === "PHRASE" ? '"Frase"' : "Ampla"}
                  </span>
                </td>
                <td className="py-3 px-3 font-medium text-[#111111]">{neg.scope}</td>
                <td className="py-3 px-3 text-center font-mono text-[#71717A]">
                  {new Date(neg.addedDate).toLocaleDateString("pt-BR")}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-[#4A8237]">
                  + R$ {neg.savedAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
