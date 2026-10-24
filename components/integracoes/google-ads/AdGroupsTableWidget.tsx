import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GoogleAdsAdGroupRecord } from "@/lib/repositories/googleAdsRepository";

export interface AdGroupsTableWidgetProps {
  adGroups: GoogleAdsAdGroupRecord[];
}

export function AdGroupsTableWidget({ adGroups }: AdGroupsTableWidgetProps) {
  if (adGroups.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2 border-line bg-surface">
        <h3 className="text-sm font-bold text-ink">
          Nenhum Grupo de Anúncios Sincronizado
        </h3>
        <p className="text-xs text-muted">
          Execute a sincronização do Google Ads para importar os Grupos de Anúncios ativos no Supabase.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Grupos de Anúncios (Ad Groups · {adGroups.length} Ativos)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            Segmentações e conjuntos de palavras-chave vinculados a cada campanha
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Nível AdGroup
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Nome do Grupo de Anúncios</th>
              <th className="py-3 px-3 font-semibold">Campanha Vinculada</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Tipo</th>
              <th className="py-3 px-3 font-semibold text-right">ID Externo</th>
              <th className="py-3 px-3 font-semibold text-right">Data de Criação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {adGroups.map((ag) => (
              <tr key={ag.id} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-bold text-ink">
                  {ag.adGroupName}
                </td>
                <td className="py-3 px-3 font-medium text-ink max-w-xs truncate">
                  {ag.campaignName || "Campanha Vinculada"}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={ag.status === "ENABLED" ? "alien" : "gray"} size="sm">
                    {ag.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-medium text-body">
                  {ag.type}
                </td>
                <td className="py-3 px-3 font-mono text-muted text-right">
                  {ag.externalAdGroupId}
                </td>
                <td className="py-3 px-3 font-mono text-muted text-right">
                  {ag.createdAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
