"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  JourneyStageDetail,
  ChecklistItem,
  getDefaultJourneyStages,
  saveChecklistItemStatus,
} from "@/lib/abductionJourney";
import {
  CheckCircle2Icon,
  ClockIcon,
  AlertTriangleIcon,
  BotIcon,
  SparklesIcon,
  FileTextIcon,
  UsersIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
} from "@/components/icons";

export interface InteractiveAbductionJourneyProps {
  clientId: string;
  clientName: string;
}

export function InteractiveAbductionJourney({
  clientId,
  clientName,
}: InteractiveAbductionJourneyProps) {
  const [stages, setStages] = useState<JourneyStageDetail[]>(
    getDefaultJourneyStages(clientName)
  );
  const [selectedStageId, setSelectedStageId] = useState<string>("estruturacao");

  const currentStage = stages.find((s) => s.id === selectedStageId) || stages[0];

  const handleToggleChecklist = (stageId: string, itemId: string) => {
    setStages((prevStages) =>
      prevStages.map((stage) => {
        if (stage.id !== stageId) return stage;

        const updatedChecklist = stage.checklist.map((item) => {
          if (item.id !== itemId) return item;
          const nextState = !item.completed;
          saveChecklistItemStatus(clientId, stageId as any, itemId, nextState);
          return { ...item, completed: nextState };
        });

        const completedCount = updatedChecklist.filter((i) => i.completed).length;
        const newPercentage = Math.round(
          (completedCount / updatedChecklist.length) * 100
        );

        let newStatus = stage.status;
        if (newPercentage === 100) newStatus = "Concluído";
        else if (newPercentage > 0) newStatus = "Em andamento";

        return {
          ...stage,
          checklist: updatedChecklist,
          completionPercentage: newPercentage,
          status: newStatus,
        };
      })
    );
  };

  // Overall journey progress (avg of all 6 stages)
  const totalJourneyProgress = Math.round(
    stages.reduce((acc, s) => acc + s.completionPercentage, 0) / stages.length
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Card & Overall Journey Progress */}
      <Card className="border-line bg-surface relative overflow-hidden p-6 sm:p-8 space-y-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-inverse via-accent to-inverse" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-line-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="alien" showDot>
                Jornada de Abdução · 360°
              </Badge>
              <span className="text-xs font-mono text-subtle">
                Evolução da Conta
              </span>
            </div>
            <h2 className="text-2xl font-bold text-ink tracking-tight">
              Ciclo de Crescimento: {clientName}
            </h2>
            <p className="text-xs text-muted">
              Monitoramento evolutivo da assinatura do contrato até a certificação de Case Alien
            </p>
          </div>

          {/* Overall Progress Meter */}
          <div className="p-4 rounded-xl bg-inverse text-white flex items-center gap-4 border border-accent shrink-0">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
                Progresso Geral da Jornada
              </span>
              <div className="text-2xl font-extrabold font-mono text-white">
                {totalJourneyProgress}%
              </div>
            </div>
            <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${totalJourneyProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* 2. Visual Interactive Timeline Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {stages.map((stg) => {
            const isSelected = stg.id === selectedStageId;
            const isDone = stg.status === "Concluído";
            const isBlocked = !!stg.blockers && stg.blockers.length > 0;

            return (
              <button
                key={stg.id}
                type="button"
                onClick={() => setSelectedStageId(stg.id)}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                  isSelected
                    ? "border-accent bg-accent/6 shadow-xs ring-2 ring-accent/30"
                    : isDone
                    ? "border-line bg-surface hover:bg-canvas"
                    : "border-line bg-canvas hover:bg-raised"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono text-subtle">
                    Etapa 0{stg.stepNumber}
                  </span>
                  <Badge
                    variant={
                      isBlocked
                        ? "dark"
                        : isDone
                        ? "alien"
                        : stg.status === "Em andamento"
                        ? "dark"
                        : "gray"
                    }
                    size="sm"
                    className={
                      isBlocked
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : ""
                    }
                  >
                    {isBlocked ? "Bloqueado" : stg.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink line-clamp-1">
                    {stg.name}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] font-mono text-muted">
                    <span>{stg.completionPercentage}% concluído</span>
                  </div>
                </div>

                {/* Progress Bar inside stepper */}
                <div className="w-full h-1 bg-line rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isDone ? "bg-accent" : "bg-inverse"
                    }`}
                    style={{ width: `${stg.completionPercentage}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Selected Stage Deep-Dive Details */}
      <div className="space-y-6">
        {/* Stage Header Info */}
        <Card className="border-line bg-surface space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-accent font-bold">
                  ETAPA 0{currentStage.stepNumber} DE 06
                </span>
                <Badge variant="alien" size="sm">
                  {currentStage.status}
                </Badge>
              </div>
              <h3 className="text-xl font-bold text-ink">
                {currentStage.name}
              </h3>
              <p className="text-xs text-body">
                {currentStage.description}
              </p>
            </div>

            {/* Assignees */}
            <div className="p-3 rounded-xl bg-canvas border border-line space-y-1 shrink-0">
              <span className="text-[10px] font-mono uppercase text-muted block">
                Responsáveis pela Etapa
              </span>
              <div className="flex flex-wrap gap-1">
                {currentStage.assignees.map((asg) => (
                  <span
                    key={asg}
                    className="text-[10px] font-mono text-ink bg-surface px-2 py-0.5 rounded border border-line"
                  >
                    {asg}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Blockers Warning Banner */}
          {currentStage.blockers && currentStage.blockers.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangleIcon className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-amber-900">
                  Indicador de Bloqueio Detectado
                </span>
              </div>
              {currentStage.blockers.map((blk) => (
                <div key={blk.id} className="text-xs text-amber-950 pl-6">
                  <strong>{blk.title}: </strong>
                  <span>{blk.description}</span>
                </div>
              ))}
            </div>
          )}

          {/* Checklist Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                Checklist da Etapa ({currentStage.checklist.filter((i) => i.completed).length} de {currentStage.checklist.length} entregáveis concluidos)
              </h4>
              <span className="text-xs font-mono font-bold text-accent">
                {currentStage.completionPercentage}% concluído
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentStage.checklist.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleChecklist(currentStage.id, item.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${
                    item.completed
                      ? "border-accent bg-accent/6"
                      : "border-line bg-canvas hover:bg-raised"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center border shrink-0 transition-colors ${
                        item.completed
                          ? "bg-accent border-accent text-on-accent"
                          : "border-line-strong bg-surface"
                      }`}
                    >
                      {item.completed && <CheckCircle2Icon className="w-3.5 h-3.5" />}
                    </span>
                    <div className="space-y-0.5 min-w-0">
                      <span
                        className={`text-xs font-semibold block truncate ${
                          item.completed
                            ? "line-through text-muted"
                            : "text-ink"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span className="text-[10px] text-subtle block">
                        Responsável: {item.assignee}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted shrink-0">
                    {item.completed ? "Concluído" : "Pendente"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alien Max Recommendations Box */}
          {currentStage.aiRecommendations && currentStage.aiRecommendations.length > 0 && (
            <div className="p-4 rounded-xl bg-inverse text-white space-y-2">
              <div className="flex items-center gap-2">
                <BotIcon className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-white">
                  Recomendação do Alien Max para esta Etapa
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                {currentStage.aiRecommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* 4 & 5. Linked Tasks & Related Documents (Grid 2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Linked Tasks */}
          <Card className="border-line bg-surface space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line-soft">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-ink" />
                <h4 className="text-sm font-bold text-ink">
                  Tarefas Vinculadas à Etapa
                </h4>
              </div>
              <Badge variant="outline" size="sm">
                {currentStage.linkedTasks.length} Tarefas
              </Badge>
            </div>

            {currentStage.linkedTasks.length > 0 ? (
              <div className="space-y-2">
                {currentStage.linkedTasks.map((tsk) => (
                  <div
                    key={tsk.id}
                    className="p-3 rounded-xl bg-canvas border border-line flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-subtle">
                        SLA: {tsk.dueDate}
                      </span>
                      <h5 className="text-xs font-semibold text-ink">
                        {tsk.title}
                      </h5>
                    </div>
                    <Badge
                      variant={
                        tsk.status === "Concluído"
                          ? "alien"
                          : tsk.status === "Em Execução"
                          ? "dark"
                          : "gray"
                      }
                      size="sm"
                    >
                      {tsk.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-subtle py-2">
                Nenhuma tarefa pendente nesta etapa.
              </p>
            )}
          </Card>

          {/* Related Documents */}
          <Card className="border-line bg-surface space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-line-soft">
              <div className="flex items-center gap-2">
                <FileTextIcon className="w-4 h-4 text-ink" />
                <h4 className="text-sm font-bold text-ink">
                  Documentos da Etapa
                </h4>
              </div>
              <Badge variant="outline" size="sm">
                {currentStage.relatedDocuments.length} Arquivos
              </Badge>
            </div>

            {currentStage.relatedDocuments.length > 0 ? (
              <div className="space-y-2">
                {currentStage.relatedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-canvas border border-line flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-surface border border-line flex items-center justify-center font-mono text-[10px] font-bold uppercase shrink-0">
                        {doc.format}
                      </div>
                      <div className="min-w-0">
                        <h5 className="text-xs font-semibold text-ink truncate">
                          {doc.name}
                        </h5>
                        <span className="text-[10px] text-muted">
                          {doc.category}
                        </span>
                      </div>
                    </div>
                    <a
                      href={doc.url}
                      className="p-1 rounded bg-surface border border-line text-muted hover:text-ink shrink-0"
                    >
                      <ArrowUpRightIcon className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-subtle py-2">
                Nenhum documento anexado a esta etapa.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
