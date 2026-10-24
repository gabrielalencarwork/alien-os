"use client";

import React, { useEffect, useState } from "react";
import { ClientSelect } from "@/components/ClientSelect";
import { metaAdsRepository } from "@/lib/repositories/metaAdsRepository";
import { googleAdsRepository } from "@/lib/repositories/googleAdsRepository";

export interface AccountClientLinkerProps {
  provider: "meta" | "google";
  /** act_... (Meta) ou customer_id (Google) */
  accountId: string;
  companyId: string | null;
  onSaved?: () => void;
}

/**
 * Define a qual cliente do Alien OS uma conta de anúncios pertence.
 * É esse vínculo que o Alien Max usa para não misturar dados de clientes.
 */
export function AccountClientLinker({ provider, accountId, companyId, onSaved }: AccountClientLinkerProps) {
  const [value, setValue] = useState(companyId ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(companyId ?? "");
    setStatus("idle");
  }, [companyId, accountId]);

  const handleChange = async (newCompanyId: string) => {
    setValue(newCompanyId);
    setStatus("saving");
    setError(null);
    try {
      if (provider === "meta") {
        await metaAdsRepository.setAccountCompany(accountId, newCompanyId || null);
      } else {
        await googleAdsRepository.setCustomerCompany(accountId, newCompanyId || null);
      }
      setStatus("saved");
      onSaved?.();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
      <span className="font-semibold text-[#111111] shrink-0">Cliente desta conta:</span>
      <div className="w-full sm:w-64">
        <ClientSelect value={value} onChange={handleChange} />
      </div>
      {status === "saving" && <span className="text-[#71717A]">Salvando...</span>}
      {status === "saved" && <span className="text-[#4A8237] font-semibold">Vínculo salvo</span>}
      {status === "error" && <span className="text-red-600">{error}</span>}
    </div>
  );
}
