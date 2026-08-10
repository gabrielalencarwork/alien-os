import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AlienMaxTaskInsight } from "@/lib/repositories/taskRepository";
import { BotIcon, ArrowUpRightIcon } from "@/components/icons";

export interface AlienMaxTaskAdvisorWidgetProps {
  insights: AlienMaxTaskInsight[];
}

export function AlienMaxTaskAdvisorWidget({ insights }: AlienMaxTaskAdvisorWidgetProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#111111] text-white flex items-center justify-center border border-[#4A8237]">
            <BotIcon className="w-4 h-4 text-[#4A8237]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111] tracking-tight">
              Alien Max · Consultor Operacional
            </h3>
            <span className="text-[10px] text-[#71717A] block">
              Gargalos, SLA & Carga de Trabalho
            </span>
          </div>
        </div>

        <Badge variant="alien" size="sm">
          IA Autônoma
        </Badge>
      </div>

      <p className="text-xs text-[#52525B] leading-relaxed">
        O Alien Max apenas recomenda. <strong className="text-[#111111]">Nenhuma redistribuição ou alteração de tarefa é feita sem aprovação.</strong>
      </p>

      <div className="space-y-3">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2 hover:border-[#4A8237] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#111111]">
                {ins.clientName}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono text-[#4A8237] font-bold">
                  {ins.confidenceScore}% Confiança
                </span>
                <Badge variant="dark" size="sm">
                  {ins.type}
                </Badge>
              </div>
            </div>

            <h4 className="text-xs font-bold text-[#111111]">
              {ins.title}
            </h4>

            <p className="text-[11px] text-[#71717A] leading-relaxed">
              {ins.description}
            </p>

            <div className="pt-2 border-t border-[#E4E4E7] space-y-2">
              <div className="text-[10px] text-[#52525B]">
                <strong className="text-[#111111]">Ação Sugerida: </strong>
                {ins.recommendedAction}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-[11px]"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                iconPosition="right"
              >
                Otimizar Operação
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
