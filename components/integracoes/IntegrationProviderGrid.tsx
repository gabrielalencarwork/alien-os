"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { IntegrationProviderItem } from "@/lib/repositories/integrationRepository";
import { IntegrationStatusBadge } from "./IntegrationStatusBadge";
import { ArrowUpRightIcon, SettingsIcon, CheckCircle2Icon } from "@/components/icons";

export interface IntegrationProviderGridProps {
  providers: IntegrationProviderItem[];
}

export function IntegrationProviderGrid({ providers }: IntegrationProviderGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map((prov) => (
        <div
          key={prov.id}
          className="p-5 rounded-2xl bg-white border border-[#E4E4E7] hover:border-[#4A8237] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-3">
            {/* Header: Provider Name & Category */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center font-mono font-bold text-xs text-[#111111] shrink-0 group-hover:border-[#4A8237] transition-colors">
                  {prov.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#111111] tracking-tight group-hover:text-[#4A8237] transition-colors">
                    {prov.name}
                  </h3>
                  <span className="text-[10px] font-mono text-[#71717A] block">
                    {prov.category} · API {prov.apiVersion}
                  </span>
                </div>
              </div>
              <IntegrationStatusBadge status={prov.status} />
            </div>

            {/* Description */}
            <p className="text-xs text-[#52525B] leading-relaxed line-clamp-2">
              {prov.description}
            </p>
          </div>

          {/* Footer Details & Action Button */}
          <div className="pt-3 border-t border-[#F4F4F5] flex items-center justify-between gap-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono text-[#71717A] block">
                Contas: <strong className="text-[#111111]">{prov.connectedAccountsCount} ativas</strong>
              </span>
              <span className="text-[10px] text-[#A1A1AA] block truncate">
                Sync: {prov.lastSyncedAt}
              </span>
            </div>

            <Link href={`/integracoes/${prov.slug}`}>
              <Button
                variant={prov.status === "Conectado" ? "outline" : "primary"}
                size="sm"
                icon={
                  prov.status === "Conectado" ? (
                    <SettingsIcon className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpRightIcon className="w-3.5 h-3.5" />
                  )
                }
              >
                {prov.status === "Conectado" ? "Gerenciar" : "Conectar API"}
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
