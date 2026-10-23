"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { MeetingType, MEETING_TYPES, meetingRepository } from "@/lib/repositories/meetingRepository";
import { ClockIcon } from "@/components/icons";
import { ClientSelect } from "@/components/ClientSelect";

export interface MeetingCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
}

export function MeetingCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: MeetingCreateModalProps) {
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [type, setType] = useState<MeetingType>("Reunião Estratégica");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [startTime, setStartTime] = useState("14:00");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingLink, setMeetingLink] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await meetingRepository.createMeeting({
        companyId,
        title,
        type,
        date,
        startTime,
        durationMinutes,
        meetingLink,
        description,
      });
      setTitle("");
      setDescription("");
      setMeetingLink("");
      onCreateSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-[#4A8237]" />
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              Agendar Reunião / Compromisso
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#71717A] hover:text-[#111111] font-mono"
          >
            Fechar ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Título do Agendamento *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Reunião de Alinhamento de ROAS & Escala Q3"
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Cliente Vinculado</label>
              <ClientSelect value={companyId} onChange={setCompanyId} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Tipo de Reunião</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MeetingType)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                {MEETING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Data</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Hora de Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Duração (Min)</label>
              <select
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value={30}>30 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
                <option value={120}>2 horas</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Link da Reunião (Google Meet / Teams)</label>
            <input
              type="text"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              placeholder="https://meet.google.com/..."
              className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Pauta & Objetivos</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pauta da reunião, tópicos a serem discutidos..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F5]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
