"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TaskItem, TaskStatus } from "@/lib/repositories/taskRepository";
import { CheckCircle2Icon, ClockIcon, MessageSquareIcon, PaperclipIcon } from "@/components/icons";

export interface TaskDetailModalProps {
  task: TaskItem | null;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export function TaskDetailModal({
  task,
  onClose,
  onStatusChange,
}: TaskDetailModalProps) {
  const [newComment, setNewComment] = useState("");

  if (!task) return null;

  const handleStatusSelect = (status: TaskStatus) => {
    onStatusChange(task.id, status);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="alien" size="sm">
                {task.clientName}
              </Badge>
              <Badge
                variant={
                  task.priority === "Crítica"
                    ? "dark"
                    : task.priority === "Alta"
                    ? "alien"
                    : "gray"
                }
                size="sm"
              >
                Prioridade {task.priority}
              </Badge>
              <span className="text-[10px] font-mono text-accent font-bold">
                SLA {task.slaPercentage}%
              </span>
            </div>
            <h2 className="text-lg font-bold text-ink tracking-tight">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink font-mono"
          >
            Fechar ✕
          </button>
        </div>

        {/* Status Selector Bar */}
        <div className="p-3 rounded-xl bg-canvas border border-line space-y-2">
          <span className="text-[10px] font-mono uppercase text-muted font-semibold block">
            Mudar Status da Tarefa:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(["Backlog", "A Fazer", "Em Andamento", "Em Revisão", "Aguardando Cliente", "Concluído"] as TaskStatus[]).map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusSelect(st)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    task.status === st
                      ? "bg-inverse text-white shadow-xs"
                      : "bg-surface border border-line text-body hover:text-ink"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>
        </div>

        {/* Task Meta Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-canvas border border-line">
            <span className="text-[10px] font-mono uppercase text-subtle block">Responsável</span>
            <span className="font-bold text-ink">{task.assigneeName}</span>
          </div>
          <div className="p-3 rounded-xl bg-canvas border border-line">
            <span className="text-[10px] font-mono uppercase text-subtle block">Prazo Final</span>
            <span className="font-bold font-mono text-ink">{task.dueDate}</span>
          </div>
          <div className="p-3 rounded-xl bg-canvas border border-line">
            <span className="text-[10px] font-mono uppercase text-subtle block">Est. Horas</span>
            <span className="font-bold font-mono text-ink">{task.estimatedHours}h</span>
          </div>
          <div className="p-3 rounded-xl bg-canvas border border-line">
            <span className="text-[10px] font-mono uppercase text-subtle block">Jornada Stage</span>
            <span className="font-medium text-accent truncate block">{task.journeyStage || "Etapa Mídia"}</span>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <h4 className="text-xs font-mono uppercase text-muted font-semibold">
            Descrição do Escopo
          </h4>
          <p className="text-xs text-ink leading-relaxed p-3.5 rounded-xl bg-canvas border border-line">
            {task.description || "Sem descrição."}
          </p>
        </div>

        {/* Checklists */}
        {task.checklists && task.checklists.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase text-muted font-semibold">
              Checklist de Entregáveis ({task.checklists.filter((i) => i.completed).length}/{task.checklists.length})
            </h4>
            <div className="space-y-2">
              {task.checklists.map((chk) => (
                <div
                  key={chk.id}
                  className="p-3 rounded-xl bg-canvas border border-line flex items-center gap-3 text-xs"
                >
                  <span
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      chk.completed ? "bg-accent border-accent text-on-accent" : "border-line bg-surface"
                    }`}
                  >
                    {chk.completed && <CheckCircle2Icon className="w-3 h-3" />}
                  </span>
                  <span className={chk.completed ? "line-through text-muted" : "text-ink font-medium"}>
                    {chk.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Discussion Comments */}
        <div className="space-y-3 pt-2 border-t border-line-soft">
          <h4 className="text-xs font-mono uppercase text-muted font-semibold">
            Discussão da Equipe & Comentários
          </h4>
          <div className="p-3 rounded-xl bg-canvas border border-line space-y-2">
            <div className="text-xs font-semibold text-ink">
              Gabriel Alencar <span className="text-[10px] text-subtle font-normal">· Hoje às 11:20</span>
            </div>
            <p className="text-xs text-body">
              "Vídeos UGC aprovados pelo cliente. Pode subir os conjuntos CBO."
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setNewComment("");
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Escreva um comentário sobre esta tarefa..."
              className="flex-1 px-3.5 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
            />
            <Button variant="primary" size="sm" type="submit">
              Comentar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
