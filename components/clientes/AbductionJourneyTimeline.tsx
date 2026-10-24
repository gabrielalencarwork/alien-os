import React from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { ABDUCTION_STAGES, JourneyStage } from "@/types";
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
    <Card className="border-line bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-line-soft">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-ink tracking-tight">
              Jornada de Abdução
            </h3>
            <Badge variant="alien" size="sm" showDot>
              Estágio Atual: {currentStage}
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Metodologia proprietária em 8 etapas para crescimento previsível e escala de clientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-muted hidden sm:block">
            Progresso: <span className="font-semibold text-ink">{currentStageIndex + 1} / 8</span>
          </div>

          {clientId && (
            <Link href={`/clientes/${clientId}/jornada`}>
              <Button
                variant="outline"
                size="sm"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-accent" />}
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
        <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 bg-line -translate-y-1/2 z-0" />

        {/* Active Progress Bar (Desktop) */}
        <div
          className="hidden lg:block absolute top-1/2 left-4 h-0.5 bg-accent -translate-y-1/2 z-0 transition-all duration-300"
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
                    ? "bg-inverse text-white border-ink shadow-sm"
                    : isCompleted
                    ? "bg-canvas border-line text-ink"
                    : "bg-canvas/50 border-line-soft text-subtle"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold mb-1.5 ${
                    isCurrent
                      ? "bg-accent text-on-accent"
                      : isCompleted
                      ? "bg-accent/15 text-accent"
                      : "bg-line text-muted"
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
                      ? "text-accent"
                      : isCompleted
                      ? "text-accent"
                      : "text-subtle"
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
