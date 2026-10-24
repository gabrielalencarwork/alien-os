import React from "react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { ZapIcon, ArrowUpRightIcon } from "./icons";

export interface ScaleClient {
  id: string;
  name: string;
  segment: string;
  currentRoas: string;
  growthPotential: string;
  suggestedBudgetIncrease: string;
  scaleStrategy: string;
}

export interface ScaleClientsCardProps {
  clients: ScaleClient[];
}

export function ScaleClientsCard({ clients }: ScaleClientsCardProps) {
  return (
    <Card className="border-line bg-surface">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
            <ZapIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink tracking-tight">
              Prontos para escalar
            </h3>
            <p className="text-xs text-muted">
              Contas com métricas validadas e alto potencial de tração imediata
            </p>
          </div>
        </div>

        <Badge variant="alien" size="sm" showDot>
          {clients.length} contas em aceleração
        </Badge>
      </div>

      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="p-4 rounded-lg bg-canvas border border-line flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-accent/30 transition-colors"
          >
            <div className="space-y-1 min-w-[200px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-ink">
                  {client.name}
                </span>
                <span className="text-xs text-subtle">· {client.segment}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">ROAS Consolidado:</span>
                <span className="font-mono font-bold text-accent">
                  {client.currentRoas}
                </span>
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <div className="text-xs text-accent font-semibold">
                Potencial: {client.growthPotential} ({client.suggestedBudgetIncrease})
              </div>
              <div className="text-xs text-body">
                <span className="font-semibold text-ink">Estratégia: </span>
                <span>{client.scaleStrategy}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="sm"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5" />}
                iconPosition="right"
              >
                Aprovar Escala
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
