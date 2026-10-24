"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { TaskPriority, TaskStatus, taskRepository } from "@/lib/repositories/taskRepository";
import { CheckCircle2Icon } from "@/components/icons";
import { ClientSelect } from "@/components/ClientSelect";

export interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
}

export function TaskCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: TaskCreateModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [assigneeName, setAssigneeName] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Média");
  const [status, setStatus] = useState<TaskStatus>("A Fazer");
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreating(true);
    setError(null);
    try {
      await taskRepository.createTask({
        companyId,
        title,
        description,
        assigneeName,
        priority,
        status,
        dueDate,
      });
      setTitle("");
      setDescription("");
      onCreateSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-line-soft">
          <div className="flex items-center gap-2">
            <CheckCircle2Icon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Nova Tarefa Operacional
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink font-mono"
          >
            Fechar ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-ink">Título da Tarefa *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Subir 3 novos conjuntos A/B no Meta Ads"
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Descrição & Entregáveis</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhamento técnico da tarefa, escopo e requisitos..."
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Cliente Vinculado</label>
              <ClientSelect value={companyId} onChange={setCompanyId} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Responsável</label>
              <input
                type="text"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Nome do responsável"
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Crítica">Crítica</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Status Inicial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="Backlog">Backlog</option>
                <option value="A Fazer">A Fazer</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Em Revisão">Em Revisão</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Prazo Final</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              />
            </div>
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
            <Button variant="primary" size="sm" type="submit" disabled={creating}>
              {creating ? "Criando Tarefa..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
