"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TaskPriority, TaskStatus } from "@/lib/repositories/taskRepository";
import { PlusIcon, CheckCircle2Icon } from "@/components/icons";

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (taskTitle: string) => void;
}

export function TaskCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("Aura Health");
  const [assigneeName, setAssigneeName] = useState("Lucas Mendes");
  const [priority, setPriority] = useState<TaskPriority>("Média");
  const [status, setStatus] = useState<TaskStatus>("A Fazer");
  const [dueDate, setDueDate] = useState("2026-08-07");
  const [estimatedHours, setEstimatedHours] = useState(4.0);
  const [creating, setCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setCreating(false);

    onCreateSuccess(title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="w-5 h-5 text-[#4A8237]" />
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              Nova Tarefa Operacional
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
            <label className="font-semibold text-[#111111]">Título da Tarefa *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Subir 3 novos conjuntos A/B no Meta Ads"
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Descrição & Entregáveis</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhamento técnico da tarefa, escopo e requisitos..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Cliente Vinculado</label>
              <select
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value="Aura Health">Aura Health</option>
                <option value="Lumina Skincare">Lumina Skincare</option>
                <option value="Nexus SaaS">Nexus SaaS</option>
                <option value="Vortex Suplementos">Vortex Suplementos</option>
                <option value="Stellar Solar">Stellar Solar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Responsável</label>
              <select
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value="Gabriel Alencar">Gabriel Alencar</option>
                <option value="Lucas Mendes">Lucas Mendes</option>
                <option value="Matheus Silva">Matheus Silva</option>
                <option value="Fernanda Lima">Fernanda Lima</option>
                <option value="Carla Ramos">Carla Ramos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Status Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value="Backlog">Backlog</option>
                <option value="A Fazer">A Fazer</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Em Revisão">Em Revisão</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Prazo Final</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F5]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={creating}>
              {creating ? "Criando Tarefa..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
