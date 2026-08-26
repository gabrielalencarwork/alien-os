"use client";

import { useState } from "react";
import { CalendarIcon, ChevronDownIcon } from "@/components/icons";

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export interface GoogleAdsDateRangeSelectorProps {
  onRangeChange?: (preset: DateRangePreset, customStart?: string, customEnd?: string) => void;
}

export function GoogleAdsDateRangeSelector({ onRangeChange }: GoogleAdsDateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<DateRangePreset>("last30days");
  const [startDate, setStartDate] = useState<string>("2026-07-27");
  const [endDate, setEndDate] = useState<string>("2026-08-25");
  const [showCustom, setShowCustom] = useState<boolean>(false);

  const presets: Array<{ id: DateRangePreset; label: string }> = [
    { id: "today", label: "Hoje" },
    { id: "yesterday", label: "Ontem" },
    { id: "last7days", label: "Últimos 7 dias" },
    { id: "last30days", label: "Últimos 30 dias" },
    { id: "thisMonth", label: "Este Mês" },
    { id: "lastMonth", label: "Mês Passado" },
    { id: "custom", label: "Personalizado" },
  ];

  const handleSelect = (preset: DateRangePreset) => {
    setSelectedPreset(preset);
    if (preset === "custom") {
      setShowCustom(true);
    } else {
      setShowCustom(false);
      onRangeChange?.(preset);
    }
  };

  const handleApplyCustom = () => {
    onRangeChange?.("custom", startDate, endDate);
  };

  return (
    <div className="bg-white border border-[#E4E4E7] rounded-xl p-3 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#111111]">
          <CalendarIcon className="w-4 h-4 text-[#4A8237]" />
          <span>Período de Análise das Métricas:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {presets.map((p) => {
            const isActive = selectedPreset === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelect(p.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all shrink-0 ${
                  isActive
                    ? "bg-[#111111] text-white shadow-xs"
                    : "bg-[#FAFAFA] text-[#52525B] hover:bg-[#F4F4F5] hover:text-[#111111]"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {showCustom && (
        <div className="pt-2 border-t border-[#F4F4F5] flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[#71717A] font-medium">De:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-[#111111] font-mono outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[#71717A] font-medium">Até:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-[#FAFAFA] border border-[#E4E4E7] rounded-lg text-[#111111] font-mono outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCustom}
            className="px-4 py-1.5 bg-[#4A8237] text-white rounded-lg font-semibold hover:bg-[#3D6E2E] transition-colors"
          >
            Filtrar Período
          </button>
        </div>
      )}
    </div>
  );
}
