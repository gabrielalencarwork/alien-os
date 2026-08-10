import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AlertTriangleIcon, ChevronRightIcon } from "@/components/icons";

export function CriticalAlertsWidget() {
  const alerts = [
    {
      id: "alt-1",
      client: "Nexus SaaS",
      clientId: "nexus-saas",
      severity: "Crítico",
      issue: "Queda de 22% no ROAS de Meta Ads nos últimos 3 dias.",
      suggestedFix: "Trocar conjunto de anúncios saturado e ajustar orçamento.",
    },
    {
      id: "alt-2",
      client: "Stellar Solar",
      clientId: "stellar-solar",
      severity: "Atenção",
      issue: "Custo por Lead (CPL) subiu para R$ 42,00 no Google Search.",
      suggestedFix: "Negativar 14 termos irrelevantes detectados pelo Alien Max.",
    },
  ];

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
          <h3 className="text-base font-bold text-[#111111]">
            Alertas Críticos (Atenção Imediata)
          </h3>
        </div>
        <Badge variant="dark" size="sm">
          2 Contas em Risco
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 flex flex-col justify-between space-y-3"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#111111]">
                  {alt.client}
                </span>
                <Badge
                  variant="dark"
                  size="sm"
                  className={
                    alt.severity === "Crítico"
                      ? "bg-red-950 text-red-200 border-red-800"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  }
                >
                  {alt.severity}
                </Badge>
              </div>

              <p className="text-xs text-[#111111] leading-relaxed">
                {alt.issue}
              </p>

              <div className="text-[11px] text-[#52525B] pt-1">
                <strong className="text-[#111111]">Solução Sugerida: </strong>
                {alt.suggestedFix}
              </div>
            </div>

            <div className="pt-2 border-t border-amber-200/50 flex justify-end">
              <Link
                href={`/clientes/${alt.clientId}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:text-[#4A8237] transition-colors"
              >
                <span>Resolver Alerta</span>
                <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
