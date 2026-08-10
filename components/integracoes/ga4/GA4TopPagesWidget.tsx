import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GA4TopPage } from "@/lib/repositories/googleAnalyticsRepository";

export interface GA4TopPagesWidgetProps {
  pages: GA4TopPage[];
}

export function GA4TopPagesWidget({ pages }: GA4TopPagesWidgetProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Principais Landing Pages (Top URLs)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Páginas com maior volume de visualizações e taxa de conversão
          </p>
        </div>

        <Badge variant="dark" size="sm">
          Analytics CRO
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Caminho da URL</th>
              <th className="py-3 px-3 font-semibold">Título da Página</th>
              <th className="py-3 px-3 font-semibold">Views</th>
              <th className="py-3 px-3 font-semibold">Conversões</th>
              <th className="py-3 px-3 font-semibold text-right">Taxa Conv. (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {pages.map((pg, idx) => (
              <tr key={idx} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">
                  {pg.path}
                </td>
                <td className="py-3 px-3 font-medium text-[#111111] truncate max-w-xs">
                  {pg.title}
                </td>
                <td className="py-3 px-3 font-mono text-[#111111]">
                  {pg.views.toLocaleString("pt-BR")}
                </td>
                <td className="py-3 px-3 font-mono text-[#111111]">
                  {pg.conversions}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-[#4A8237] text-right">
                  {pg.conversionRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
