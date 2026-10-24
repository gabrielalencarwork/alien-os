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
  const [clientId, setClientId] = useState(tokens?.clientId || "");
  const [clientSecret, setClientSecret] = useState(tokens?.clientSecret || "");
  const [accessToken, setAccessToken] = useState(tokens?.accessToken || "");
  const [refreshToken, setRefreshToken] = useState(tokens?.refreshToken || "");
  const [pixelId, setPixelId] = useState(tokens?.pixelId || "");
  const [businessId, setBusinessId] = useState(tokens?.businessId || "");

  // Salvar credenciais por este formulário genérico ainda não grava no banco.
  // As integrações ativas (Meta Ads, Google Ads, GA4) são configuradas nas páginas dedicadas.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-accent" />
          <div>
            <h3 className="text-base font-bold text-ink tracking-tight">
              Cofre de Credenciais & Tokens OAuth 2.0 · {providerName}
            </h3>
            <span className="text-[10px] text-muted block">
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
            <label className="font-semibold text-ink">Client ID / App ID</label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Client Secret / App Secret</label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-ink">Access Token de Curta Duração</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Refresh Token de Longa Duração (Offline Access)</label>
            <input
              type="password"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-ink">Pixel ID / Conversion Tag ID</label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Business Manager ID / Manager Account (MCC)</label>
            <input
              type="text"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none font-mono"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-line-soft flex items-center justify-between">
          <span className="text-[11px] text-muted">
            Este formulário ainda não grava credenciais. Configure Meta Ads, Google Ads e GA4 nas páginas dedicadas.
          </span>

          <Button variant="primary" size="sm" type="submit" disabled>
            Use a página dedicada da integração
          </Button>
        </div>
      </form>
    </Card>
  );
}
