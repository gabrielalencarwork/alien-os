import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { AlertTriangleIcon, ArrowUpRightIcon } from "./icons";

export interface AttentionClient {
  id: string;
  name: string;
  segment: string;
  riskLevel: "Alto" | "Médio" | "Baixo";
  metricIssue: string;
  recommendedAction: string;
  currentRoas: string;
}

export interface AttentionClientsCardProps {
  clients: AttentionClient[];
}

export function AttentionClientsCard({ clients }: AttentionClientsCardProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
            <AlertTriangleIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#111111] tracking-tight">
              Clientes em atenção
            </h3>
            <p className="text-xs text-[#71717A]">
              Contas que requerem ajuste de rota imediato ou otimização de campanha
            </p>
          </div>
        </div>

        <Badge variant="outline" size="sm">
          {clients.length} contas monitoradas
        </Badge>
      </div>

      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 rounded-lg bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 transition-colors"
          >
            <div className="space-y-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#111111]">
                  {client.name}
                </span>
                <span className="text-xs text-[#A1A1AA]">· {client.segment}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#71717A]">ROAS Atual:</span>
                <span className="font-mono font-medium text-[#111111]">
                  {client.currentRoas}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-xs text-amber-700 font-medium">
                Alerta: {client.metricIssue}
              </div>
              <div className="text-xs text-[#52525B]">
                <span className="font-semibold text-[#111111]">Ação recomendada: </span>
                <span>{client.recommendedAction}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Badge
                variant={client.riskLevel === "Alto" ? "dark" : "gray"}
                size="sm"
                className={
                  client.riskLevel === "Alto"
                    ? "bg-red-950 text-red-200 border-red-800"
                    : "bg-amber-100 text-amber-800 border-amber-200"
                }
              >
                Risco {client.riskLevel}
              </Badge>

              <Button variant="outline" size="sm" icon={<ArrowUpRightIcon className="w-3.5 h-3.5" />}>
                Intervir
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
