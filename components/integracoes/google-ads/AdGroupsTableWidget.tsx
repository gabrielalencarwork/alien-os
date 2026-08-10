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
      <Card className="p-8 text-center space-y-2 border-[#E4E4E7] bg-white">
        <h3 className="text-sm font-bold text-[#111111]">
          Nenhum Grupo de Anúncios Sincronizado
        </h3>
        <p className="text-xs text-[#71717A]">
          Execute a sincronização do Google Ads para importar os Grupos de Anúncios ativas no Supabase.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Grupos de Anúncios (Ad Groups · {adGroups.length} Ativos)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Nível intermediário entre a Campanha e os Anúncios Individuais
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Nível AdGroup
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Nome do Grupo de Anúncios</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Tipo</th>
              <th className="py-3 px-3 font-semibold">ID Externo</th>
              <th className="py-3 px-3 font-semibold text-right">Data de Criação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {adGroups.map((ag) => (
              <tr key={ag.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-bold text-[#111111]">
                  {ag.adGroupName}
                </td>
                <td className="py-3 px-3">
                  <Badge variant={ag.status === "ENABLED" ? "alien" : "gray"} size="sm">
                    {ag.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-medium text-[#52525B]">
                  {ag.type}
                </td>
                <td className="py-3 px-3 font-mono text-[#71717A]">
                  {ag.externalAdGroupId}
                </td>
                <td className="py-3 px-3 font-mono text-[#71717A] text-right">
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
