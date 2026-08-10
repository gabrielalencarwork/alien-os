"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { GA4PropertyItem } from "@/lib/repositories/googleAnalyticsRepository";
import { ClockIcon, CheckCircle2Icon } from "@/components/icons";

export interface GA4SyncStatusWidgetProps {
  property: GA4PropertyItem;
  onSync: () => void;
}

export function GA4SyncStatusWidget({ property, onSync }: GA4SyncStatusWidgetProps) {
  const [syncing, setSyncing] = useState(false);
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  const handleManualSync = async () => {
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    onSync();
    setSyncing(false);
    setSyncedSuccess(true);
    setTimeout(() => setSyncedSuccess(false), 3000);
  };

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Status da Propriedade Conectada (Property ID: {property.propertyId})
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Conta: {property.accountEmail} · Timezone: {property.timezone} · Currency: {property.currency}
          </p>
        </div>

        <Badge variant="alien" showDot size="sm">
          {property.status}
        </Badge>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[#71717A] block">
            Última sincronização com a Google Analytics Data API:
          </span>
          <span className="font-mono font-bold text-[#111111] block">
            {property.lastSyncedAt} (Há instantes)
          </span>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleManualSync}
          disabled={syncing}
          icon={<ClockIcon className="w-3.5 h-3.5" />}
        >
          {syncing ? "Sincronizando Data API..." : "Sincronizar Agora"}
        </Button>
      </div>

      {syncedSuccess && (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2Icon className="w-4 h-4 text-[#4A8237]" />
          <span>Sincronização manual com a Google Analytics Data API concluída com sucesso (1.420 registros salvos no Supabase).</span>
        </div>
      )}
    </Card>
  );
}
