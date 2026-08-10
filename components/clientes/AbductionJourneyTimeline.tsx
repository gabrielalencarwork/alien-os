import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ABDUCTION_STAGES, JourneyStage } from "@/lib/clientsData";
import { CheckCircle2Icon, ArrowUpRightIcon } from "@/components/icons";

export interface AbductionJourneyTimelineProps {
  currentStage: JourneyStage;
  clientId?: string;
}

export function AbductionJourneyTimeline({
  currentStage,
  clientId,
}: AbductionJourneyTimelineProps) {
  const currentStageIndex = ABDUCTION_STAGES.indexOf(currentStage);

  return (
    <Card className="border-[#E4E4E7] bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#F4F4F5]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Jornada de Abdução
            </h3>
            <Badge variant="alien" size="sm" showDot>
              Estágio Atual: {currentStage}
            </Badge>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5">
            Metodologia proprietária em 8 etapas para crescimento previsível e escala de clientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-[#71717A] hidden sm:block">
            Progresso: <span className="font-semibold text-[#111111]">{currentStageIndex + 1} / 8</span>
          </div>

          {clientId && (
            <Link href={`/clientes/${clientId}/jornada`}>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                iconPosition="right"
              >
                Ver Jornada 360°
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Responsive Visual Timeline */}
      <div className="relative py-2">
        {/* Connection Bar (Desktop) */}
        <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-[#E4E4E7] -translate-y-1/2 z-0" />

        {/* Active Progress Bar (Desktop) */}
        <div
          className="hidden lg:block absolute top-1/2 left-4 h-0.5 bg-[#4A8237] -translate-y-1/2 z-0 transition-all duration-300"
          style={{
            width: `${(currentStageIndex / (ABDUCTION_STAGES.length - 1)) * 96}%`,
          }}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 relative z-10">
          {ABDUCTION_STAGES.map((stage, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stage}
                className={`flex flex-col items-center text-center p-2.5 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-[#111111] text-white border-[#111111] shadow-sm"
                    : isCompleted
                    ? "bg-[#FAFAFA] border-[#E4E4E7] text-[#111111]"
                    : "bg-[#FAFAFA]/50 border-[#F4F4F5] text-[#A1A1AA]"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mb-1.5 ${
                    isCurrent
                      ? "bg-[#4A8237] text-white"
                      : isCompleted
                      ? "bg-[rgba(74,130,55,0.15)] text-[#4A8237]"
                      : "bg-[#E4E4E7] text-[#71717A]"
                  }`}
                >
                  {isCompleted ? <CheckCircle2Icon className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <span className={`text-xs font-semibold tracking-tight ${isCurrent ? "text-white" : ""}`}>
                  {stage}
                </span>

                <span
                  className={`text-[10px] font-mono mt-1 ${
                    isCurrent
                      ? "text-[#4A8237]"
                      : isCompleted
                      ? "text-[#4A8237]"
                      : "text-[#A1A1AA]"
                  }`}
                >
                  {isCurrent ? "Em foco" : isCompleted ? "Concluído" : "Próximo"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
