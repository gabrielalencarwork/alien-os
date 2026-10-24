"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { GrowthType, GrowthStatus, GROWTH_TYPES, growthRepository } from "@/lib/repositories/growthRepository";
import { ClientSelect } from "@/components/ClientSelect";
import { SparklesIcon } from "@/components/icons";

export interface GrowthExperimentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
}

export function GrowthExperimentCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: GrowthExperimentCreateModalProps) {
  const [title, setTitle] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [type, setType] = useState<GrowthType>("Criativo");
  const [status] = useState<GrowthStatus>("Planejado");
  const [primaryMetric, setPrimaryMetric] = useState("");
  const [estimatedRevenueImpact, setEstimatedRevenueImpact] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [hypothesis, setHypothesis] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await growthRepository.createExperiment({
        companyId,
        title,
        type,
        priority: "Alta",
        status,
        primaryMetric,
        estimatedRevenueImpact,
        hypothesis,
      });
      setTitle("");
      setHypothesis("");
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
      <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-line-soft">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Criar Novo Experimento no Growth Lab
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
            <label className="font-semibold text-ink">Título do Experimento *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Teste de Criativo UGC de Depoimento na Primeira Dobra"
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Cliente Vinculado</label>
              <ClientSelect value={companyId} onChange={setCompanyId} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Categoria de Teste</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GrowthType)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                {GROWTH_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Hipótese Formada *</label>
            <textarea
              rows={2}
              required
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Se alterarmos [variável], esperamos [resultado] porque [motivação]..."
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Métrica Principal</label>
              <input
                type="text"
                value={primaryMetric}
                onChange={(e) => setPrimaryMetric(e.target.value)}
                placeholder="Taxa de conversão, CTR ou ROAS"
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Impacto Estimado (R$)</label>
              <input
                type="number"
                value={estimatedRevenueImpact}
                onChange={(e) => setEstimatedRevenueImpact(Number(e.target.value))}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none font-mono"
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
            <Button variant="primary" size="sm" type="submit" disabled={saving}>
              {saving ? "Registrando Teste..." : "Lançar Experimento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
