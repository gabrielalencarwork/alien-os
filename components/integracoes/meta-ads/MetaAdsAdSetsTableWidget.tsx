import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MetaAdsAdSetRecord } from "@/lib/repositories/metaAdsRepository";

export interface MetaAdsAdSetsTableWidgetProps {
  adSets: MetaAdsAdSetRecord[];
}

export function MetaAdsAdSetsTableWidget({ adSets }: MetaAdsAdSetsTableWidgetProps) {
  if (adSets.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2 border-line bg-surface">
        <h3 className="text-sm font-bold text-ink">
          Nenhum Conjunto de Anúncios Sincronizado
        </h3>
        <p className="text-xs text-muted">
          Execute a sincronização do Meta Ads para importar os Ad Sets ativos no Supabase.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Conjuntos de Anúncios (Ad Sets · {adSets.length} Ativos)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Públicos-alvo, posicionamentos de Feed/Stories e estratégia de lances
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Ad Sets Meta
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Nome do Ad Set</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Evento de Cobrança</th>
              <th className="py-3 px-3 font-semibold">Estratégia de Lance</th>
              <th className="py-3 px-3 font-semibold text-right">ID Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {adSets.map((as) => (
              <tr key={as.id} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-bold text-ink">
                  {as.adSetName}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={as.status === "ACTIVE" ? "alien" : "gray"} size="sm">
                    {as.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-medium text-body">
                  {as.billingEvent}
                </td>
                <td className="py-3 px-3 font-mono text-muted">
                  {as.bidStrategy}
                </td>
                <td className="py-3 px-3 font-mono text-muted text-right">
                  {as.externalAdSetId}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
