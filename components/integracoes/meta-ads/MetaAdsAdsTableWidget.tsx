import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { MetaAdsAdRecord } from "@/lib/repositories/metaAdsRepository";

export interface MetaAdsAdsTableWidgetProps {
  ads: MetaAdsAdRecord[];
}

export function MetaAdsAdsTableWidget({ ads }: MetaAdsAdsTableWidgetProps) {
  if (ads.length === 0) {
    return (
      <Card className="p-8 text-center space-y-2 border-[#E4E4E7] bg-white">
        <h3 className="text-sm font-bold text-[#111111]">
          Nenhum Anúncio Individual Sincronizado
        </h3>
        <p className="text-xs text-[#71717A]">
          Execute a sincronização do Meta Ads para importar os criativos e anúncios ativos no Supabase.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Anúncios & Criativos ({ads.length} Ativos)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Formatos de Vídeo Reels/UGC, Carrossel e Imagem Única do Instagram & Facebook
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Criativos Meta
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Anúncio</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Creative ID</th>
              <th className="py-3 px-3 font-semibold text-right">ID Externo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-bold text-[#111111] flex items-center gap-3">
                  {ad.thumbnailUrl && (
                    <img
                      src={ad.thumbnailUrl}
                      alt={ad.adName}
                      className="w-8 h-8 rounded-lg object-cover border border-[#E4E4E7]"
                    />
                  )}
                  <div>
                    <span className="block font-bold text-[#111111]">{ad.adName}</span>
                    <span className="text-[10px] font-mono text-[#71717A]">Vídeo UGC / Carrossel</span>
                  </div>
                </td>

                <td className="py-3 px-3">
                  <Badge variant={ad.status === "ACTIVE" ? "alien" : "gray"} size="sm">
                    {ad.status}
                  </Badge>
                </td>

                <td className="py-3 px-3 font-mono text-[#71717A]">
                  {ad.creativeId || "crt-default"}
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
