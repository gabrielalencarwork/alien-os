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
      <Card className="p-8 text-center space-y-2 border-line bg-surface">
        <h3 className="text-sm font-bold text-ink">
          Nenhum Anúncio Individual Sincronizado
        </h3>
        <p className="text-xs text-muted">
          Execute a sincronização do Google Ads para importar os títulos e descrições dos Anúncios Responsáveis de Pesquisa.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Anúncios Individuais ({ads.length} Ativos)
          </h3>
          <p className="text-xs text-muted mt-0.5">
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
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Título Principal</th>
              <th className="py-3 px-3 font-semibold">Descrição</th>
              <th className="py-3 px-3 font-semibold">Campanha</th>
              <th className="py-3 px-3 font-semibold">Grupo de Anúncios</th>
              <th className="py-3 px-3 font-semibold">URL Final</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">ID Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-bold text-ink max-w-xs truncate">
                  {ad.headline}
                </td>
                <td className="py-3 px-3 text-body max-w-sm truncate">
                  {ad.description || "—"}
                </td>
                <td className="py-3 px-3 text-ink font-medium max-w-xs truncate">
                  {ad.campaignName || "Campanha Vinculada"}
                </td>
                <td className="py-3 px-3 text-body max-w-xs truncate">
                  {ad.adGroupName || "Grupo de Anúncios"}
                </td>
                <td className="py-3 px-3 font-mono text-accent max-w-xs truncate">
                  {ad.finalUrl ? (
                    <a href={ad.finalUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      {ad.finalUrl}
                    </a>
                  ) : (
                    <span className="text-subtle">—</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={ad.status === "ENABLED" ? "alien" : "gray"} size="sm">
                    {ad.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-mono text-muted text-right">
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
