"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { MeetingItem, meetingRepository } from "@/lib/repositories/meetingRepository";
import { FileTextIcon, CheckCircle2Icon, PlusIcon } from "@/components/icons";

export interface MeetingNotesModalProps {
  meeting: MeetingItem | null;
  onClose: () => void;
}

export function MeetingNotesModal({
  meeting,
  onClose,
}: MeetingNotesModalProps) {
  const [summary, setSummary] = useState(meeting?.notes?.summary || "Alinhamento de ROAS e definição do novo orçamento de Meta Ads.");
  const [decisions, setDecisions] = useState(meeting?.notes?.decisions || "Aprovado aporte adicional de +R$ 25.000 no retargeting de topo de funil.");
  const [nextSteps, setNextSteps] = useState(meeting?.notes?.nextSteps || "Subir 3 novos conjuntos CBO no Meta Ads e criar réguas no Klaviyo.");
  const [saving, setSaving] = useState(false);
  const [taskCreated, setTaskCreated] = useState(false);

  if (!meeting) return null;

  const handleSaveNotes = async () => {
    setSaving(true);
    await meetingRepository.saveMeetingNotesAndCreateTimeline(
      meeting.id,
      meeting.companyId,
      {
        id: `nt-${Date.now()}`,
        meetingId: meeting.id,
        summary,
        decisions,
        nextSteps,
        authorName: "Gabriel Alencar",
        createdAt: new Date().toISOString(),
      }
    );
    setSaving(false);
    onClose();
  };

  const handleGenerateTask = () => {
    setTaskCreated(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileTextIcon className="w-5 h-5 text-[#4A8237]" />
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Ata Oficial da Reunião
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#71717A] block">
              {meeting.title} · {meeting.clientName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#71717A] hover:text-[#111111] font-mono"
          >
            Fechar ✕
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Resumo Executivo da Reunião</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Decisões Tomadas</label>
            <textarea
              rows={2}
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Próximos Passos & Entregáveis</label>
            <textarea
              rows={2}
              value={nextSteps}
              onChange={(e) => setNextSteps(e.target.value)}
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          {/* Automações Geradas */}
          <div className="p-3.5 rounded-xl bg-[rgba(74,130,55,0.06)] border border-[rgba(74,130,55,0.2)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-[#4A8237] font-bold">
                Automação Nátiva do Alien OS:
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
                  icon={<PlusIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                >
                  Gerar Tarefa no Módulo Tarefas
                </Button>
              )}
            </div>
            <p className="text-[10px] text-[#52525B]">
              Ao salvar a ata, um evento será publicado automaticamente na Timeline do Cliente e na Jornada de Abdução.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F5]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="button" onClick={handleSaveNotes} disabled={saving}>
              {saving ? "Salvando na Timeline..." : "Salvar Ata & Publicar Timeline"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
