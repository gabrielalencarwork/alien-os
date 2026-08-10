"use client";

import React, { useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { CampaignObjective, CampaignPlatform, CampaignStatus } from "@/lib/repositories/campaignRepository";
import { PlusIcon, RocketIcon } from "@/components/icons";

export interface CampaignCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSuccess: (name: string) => void;
}

export function CampaignCreateModal({
  isOpen,
  onClose,
  onCreateSuccess,
}: CampaignCreateModalProps) {
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("Aura Health");
  const [platform, setPlatform] = useState<CampaignPlatform>("Meta Ads");
  const [objective, setObjective] = useState<CampaignObjective>("Conversões");
  const [managerName, setManagerName] = useState("Lucas Mendes");
  const [status, setStatus] = useState<CampaignStatus>("Ativa");
  const [dailyBudget, setDailyBudget] = useState(500);
  const [monthlyBudget, setMonthlyBudget] = useState(15000);
  const [targetRoas, setTargetRoas] = useState(5.0);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);

    onCreateSuccess(name);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <RocketIcon className="w-5 h-5 text-[#4A8237]" />
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              Criar Nova Campanha de Mídia Paga
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
            <label className="font-semibold text-[#111111]">Nome da Campanha *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Aura · CBO Advantage+ Retargeting topo & meio"
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
              <label className="font-semibold text-[#111111]">Plataforma de Mídia</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
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
              <label className="font-semibold text-[#111111]">Objetivo</label>
              <select
                value={objective}
                onChange={(e) => setObjective(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
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
              <label className="font-semibold text-[#111111]">Orçamento Diário (R$)</label>
              <input
                type="number"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Meta de ROAS</label>
              <input
                type="number"
                step="0.1"
                value={targetRoas}
                onChange={(e) => setTargetRoas(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Descrição da Estratégia</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Público-alvo, criativos, oferta e otimização..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F5]">
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
