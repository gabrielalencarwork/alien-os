import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { IntegrationLogItem } from "@/lib/repositories/integrationRepository";
import { ClockIcon, CheckCircle2Icon } from "@/components/icons";

export interface IntegrationLogsWidgetProps {
  logs: IntegrationLogItem[];
}

export function IntegrationLogsWidget({ logs }: IntegrationLogsWidgetProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Histórico Auditável de Sincronizações (Logs da API)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Registro em tempo real das chamadas, tokens renovados e eventos da integração
          </p>
        </div>

        <Badge variant="alien" size="sm">
          Logs Auditáveis
        </Badge>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {logs.map((lg) => (
          <div
            key={lg.id}
            className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-start justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="mt-0.5 w-2 h-2 rounded-full bg-[#4A8237] shrink-0" />
              <div className="space-y-0.5 min-w-0">
                <span className="font-bold text-[#111111] block">
                  {lg.message}
                </span>
                <span className="text-[10px] font-mono text-[#71717A] block">
                  Status Code: {lg.statusCode} · Evento: {lg.eventType}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-[#71717A] shrink-0">
              {lg.createdAt}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
