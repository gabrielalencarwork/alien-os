"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { MeetingItem, meetingRepository } from "@/lib/repositories/meetingRepository";
import { taskRepository } from "@/lib/repositories/taskRepository";
import { FileTextIcon, CheckCircle2Icon, PlusIcon } from "@/components/icons";

export interface MeetingNotesModalProps {
  meeting: MeetingItem | null;
  onClose: () => void;
}

export function MeetingNotesModal({
  meeting,
  onClose,
}: MeetingNotesModalProps) {
  const [summary, setSummary] = useState(meeting?.notes?.summary || "");
  const [decisions, setDecisions] = useState(meeting?.notes?.decisions || "");
  const [nextSteps, setNextSteps] = useState(meeting?.notes?.nextSteps || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskCreated, setTaskCreated] = useState(false);

  if (!meeting) return null;

  const handleSaveNotes = async () => {
    if (!summary.trim()) {
      setError("Preencha o resumo da reunião antes de salvar a ata.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await meetingRepository.saveMeetingNotes({
        meetingId: meeting.id,
        companyId: meeting.companyId,
        summary,
        decisions,
        nextSteps,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateTask = async () => {
    if (!nextSteps.trim()) {
      setError("Preencha os próximos passos para gerar a tarefa.");
      return;
    }
    setError(null);
    try {
      const due = new Date();
      due.setDate(due.getDate() + 7);
      await taskRepository.createTask({
        companyId: meeting.companyId,
        title: `Próximos passos: ${meeting.title}`,
        description: nextSteps,
        priority: "Média",
        status: "A Fazer",
        dueDate: due.toISOString().split("T")[0],
      });
      setTaskCreated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-line-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-accent" />
              <h3 className="text-base font-bold text-ink tracking-tight">
                Ata Oficial da Reunião
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted block">
              {meeting.title} · {meeting.clientName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink font-mono"
          >
            Fechar ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-ink">Resumo Executivo da Reunião</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Decisões Tomadas</label>
            <textarea
              rows={2}
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Próximos Passos & Entregáveis</label>
            <textarea
              rows={2}
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          {/* Automações Geradas */}
          <div className="p-3.5 rounded-xl bg-accent/6 border border-accent/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-accent font-bold">
                Automação Nativa do Alien OS:
              </span>
              {taskCreated ? (
                <Badge variant="alien" size="sm">
                  Tarefa Criada na Central!
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateTask}
                  icon={<PlusIcon className="w-3.5 h-3.5 text-accent" />}
                >
                  Gerar Tarefa no Módulo Tarefas
                </Button>
              )}
            </div>
            <p className="text-[10px] text-body">
              Cria uma tarefa no módulo Tarefas com os próximos passos desta reunião (prazo de 7 dias, editável depois).
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line-soft">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={handleSaveNotes} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Ata"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
