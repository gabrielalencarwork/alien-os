"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { IntegrationTokenItem } from "@/lib/repositories/integrationRepository";
import { SettingsIcon, CheckCircle2Icon } from "@/components/icons";

export interface IntegrationConfigurationFormProps {
  tokens?: IntegrationTokenItem;
  providerName: string;
}

export function IntegrationConfigurationForm({
  tokens,
  providerName,
}: IntegrationConfigurationFormProps) {
  const [clientId, setClientId] = useState(tokens?.clientId || "app_1313894637612937");
  const [clientSecret, setClientSecret] = useState(tokens?.clientSecret || "••••••••••••••••••••••••");
  const [accessToken, setAccessToken] = useState(tokens?.accessToken || "EAAX...••••••••••••");
  const [refreshToken, setRefreshToken] = useState(tokens?.refreshToken || "EAAY...••••••••••••");
  const [pixelId, setPixelId] = useState(tokens?.pixelId || "1313894637612937");
  const [businessId, setBusinessId] = useState(tokens?.businessId || "bm_aura_health_998");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-[#4A8237]" />
          <div>
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Cofre de Credenciais & Tokens OAuth 2.0 · {providerName}
            </h3>
            <span className="text-[10px] text-[#71717A] block">
              Ambiente preparado para recepção de chaves das APIs oficiais
            </span>
          </div>
        </div>

        <Badge variant="alien" size="sm">
          Criptografia AES-256
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Client ID / App ID</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Client Secret / App Secret</label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Access Token de Curta Duração</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Refresh Token de Longa Duração (Offline Access)</label>
            <input
              type="password"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Pixel ID / Conversion Tag ID</label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Business Manager ID / Manager Account (MCC)</label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none font-mono"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between">
          <span className="text-[11px] text-[#71717A]">
            {savedSuccess ? (
              <span className="text-[#4A8237] font-bold flex items-center gap-1">
                <CheckCircle2Icon className="w-3.5 h-3.5" /> Credenciais salvas com sucesso!
              </span>
            ) : (
              "Credenciais salvas serão validadas na Sprint 20 com conexão real."
            )}
          </span>

          <Button variant="primary" size="sm" type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Credenciais API"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
