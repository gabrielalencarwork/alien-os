"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { CampaignObjective, CampaignPlatform, CampaignStatus, campaignRepository } from "@/lib/repositories/campaignRepository";
import { ClientSelect } from "@/components/ClientSelect";
import { PlusIcon, RocketIcon } from "@/components/icons";

export interface CampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
}

export function CampaignCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: CampaignCreateModalProps) {
  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [platform, setPlatform] = useState<CampaignPlatform>("Meta Ads");
  const [objective, setObjective] = useState<CampaignObjective>("Conversões");
  const [status] = useState<CampaignStatus>("Planejada");
  const [dailyBudget, setDailyBudget] = useState(0);
  const [targetRoas, setTargetRoas] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      await campaignRepository.createCampaign({
        companyId,
        name,
        platform,
        objective,
        status,
        dailyBudget,
        description,
      });
      setName("");
      setDescription("");
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
            <RocketIcon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Criar Nova Campanha de Mídia Paga
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
            <label className="font-semibold text-ink">Nome da Campanha *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Aura · CBO Advantage+ Retargeting topo & meio"
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Cliente Vinculado</label>
              <ClientSelect value={companyId} onChange={setCompanyId} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Plataforma de Mídia</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="Meta Ads">Meta Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="TikTok Ads">TikTok Ads</option>
                <option value="LinkedIn Ads">LinkedIn Ads</option>
                <option value="Pinterest Ads">Pinterest Ads</option>
                <option value="Microsoft Ads">Microsoft Ads</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Objetivo</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as any)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="Conversões">Conversões</option>
                <option value="Vendas">Vendas</option>
                <option value="Leads">Leads</option>
                <option value="Tráfego">Tráfego</option>
                <option value="Engajamento">Engajamento</option>
                <option value="Remarketing">Remarketing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Orçamento Diário (R$)</label>
              <input
                type="number"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Meta de ROAS</label>
              <input
                type="number"
                step="0.1"
                value={targetRoas}
                onChange={(e) => setTargetRoas(Number(e.target.value))}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Descrição da Estratégia</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Público-alvo, criativos, oferta e otimização..."
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
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
              {saving ? "Criando Campanha..." : "Lançar Campanha"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
