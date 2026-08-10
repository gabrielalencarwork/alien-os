"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { GrowthType, GrowthStatus } from "@/lib/repositories/growthRepository";
import { PlusIcon, SparklesIcon } from "@/components/icons";

export interface GrowthExperimentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (title: string) => void;
}

export function GrowthExperimentCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: GrowthExperimentCreateModalProps) {
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("Aura Health");
  const [type, setType] = useState<GrowthType>("Criativo");
  const [ownerName, setOwnerName] = useState("Gabriel Alencar");
  const [priority, setPriority] = useState("Alta");
  const [status, setStatus] = useState<GrowthStatus>("Rodando");
  const [primaryMetric, setPrimaryMetric] = useState("Taxa de Conversão (CRO)");
  const [estimatedRevenueImpact, setEstimatedRevenueImpact] = useState(30000);
  const [hypothesis, setHypothesis] = useState("");
  const [problemIdentified, setProblemIdentified] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);

    onCreateSuccess(title);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-[#4A8237]" />
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              Criar Novo Experimento no Growth Lab
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
            <label className="font-semibold text-[#111111]">Título do Experimento *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Teste de Criativo UGC de Depoimento na Primeira Dobra"
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
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
              <label className="font-semibold text-[#111111]">Categoria de Teste</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value="Criativo">Criativo</option>
                <option value="Copy">Copy</option>
                <option value="Headline">Headline</option>
                <option value="Landing Page">Landing Page</option>
                <option value="Oferta">Oferta</option>
                <option value="Funil">Funil</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="TikTok">TikTok</option>
                <option value="SEO">SEO</option>
                <option value="Automação">Automação</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Hipótese Formada *</label>
            <textarea
              rows={2}
              required
              value={hypothesis}
              onChange={(e) => setHypothesis(e.target.value)}
              placeholder="Se alterarmos [variável], esperamos [resultado] porque [motivação]..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Métrica Principal</label>
              <input
                type="text"
                value={primaryMetric}
                onChange={(e) => setPrimaryMetric(e.target.value)}
                placeholder="Taxa de conversão, CTR ou ROAS"
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Impacto Estimado (R$)</label>
              <input
                type="number"
                value={estimatedRevenueImpact}
                onChange={(e) => setEstimatedRevenueImpact(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F5]">
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
