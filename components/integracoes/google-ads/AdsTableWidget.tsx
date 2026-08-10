import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GoogleAdsAdRecord } from "@/lib/repositories/googleAdsRepository";

export interface AdsTableWidgetProps {
  ads: GoogleAdsAdRecord[];
}

export function AdsTableWidget({ ads }: AdsTableWidgetProps) {
  if (ads.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2 border-[#E4E4E7] bg-white">
        <h3 className="text-sm font-bold text-[#111111]">
          Nenhum Anúncio Individual Sincronizado
        </h3>
        <p className="text-xs text-[#71717A]">
          Execute a sincronização do Google Ads para importar os títulos e descrições dos Anúncios Responsáveis de Pesquisa.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Anúncios Individuais ({ads.length} Ativos)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Títulos, descrições e URLs finais dos Anúncios no Google Search e Display
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Nível Anúncio (Ad)
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Título Principal</th>
              <th className="py-3 px-3 font-semibold">Descrição</th>
              <th className="py-3 px-3 font-semibold">URL Final</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">ID Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-bold text-[#111111] max-w-xs truncate">
                  {ad.headline}
                </td>
                <td className="py-3 px-3 text-[#52525B] max-w-sm truncate">
                  {ad.description}
                </td>
                <td className="py-3 px-3 font-mono text-[#4A8237] max-w-xs truncate">
                  <a href={ad.finalUrl} target="_blank" rel="noreferrer" className="hover:underline">
                    {ad.finalUrl}
                  </a>
                </td>
                <td className="py-3 px-3">
                  <Badge variant={ad.status === "ENABLED" ? "alien" : "gray"} size="sm">
                    {ad.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-mono text-[#71717A] text-right">
                  {ad.externalAdId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
