import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { GA4TopPage } from "@/lib/repositories/googleAnalyticsRepository";

export interface GA4TopPagesWidgetProps {
  pages: GA4TopPage[];
}

export function GA4TopPagesWidget({ pages }: GA4TopPagesWidgetProps) {
  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Principais Landing Pages (Top URLs)
          </h3>
          <p className="text-xs text-muted mt-0.5">
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
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Caminho da URL</th>
              <th className="py-3 px-3 font-semibold">Título da Página</th>
              <th className="py-3 px-3 font-semibold">Views</th>
              <th className="py-3 px-3 font-semibold">Conversões</th>
              <th className="py-3 px-3 font-semibold text-right">Taxa Conv. (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {pages.map((pg, idx) => (
              <tr key={idx} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-accent">
                  {pg.path}
                </td>
                <td className="py-3 px-3 font-medium text-ink truncate max-w-xs">
                  {pg.title}
                </td>
                <td className="py-3 px-3 font-mono text-ink">
                  {pg.views.toLocaleString("pt-BR")}
                </td>
                <td className="py-3 px-3 font-mono text-ink">
                  {pg.conversions}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-accent text-right">
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
