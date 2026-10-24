"use client";

import { useState } from "react";
import { CalendarIcon } from "@/components/icons";

export type MetaDateRangePreset =
  | "allTime"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "last7days"
  | "yesterday"
  | "today"
  | "custom";

export interface MetaAdsDateRangeSelectorProps {
  onRangeChange?: (preset: MetaDateRangePreset, customStart?: string, customEnd?: string) => void;
  defaultPreset?: MetaDateRangePreset;
}

export function MetaAdsDateRangeSelector({
  onRangeChange,
  defaultPreset = "allTime",
}: MetaAdsDateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<MetaDateRangePreset>(defaultPreset);
  const [startDate, setStartDate] = useState<string>("2026-01-01");
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [showCustom, setShowCustom] = useState<boolean>(false);

  const presets: Array<{ id: MetaDateRangePreset; label: string }> = [
    { id: "today", label: "Hoje" },
    { id: "yesterday", label: "Ontem" },
    { id: "last7days", label: "Últimos 7 dias" },
    { id: "last30days", label: "Últimos 30 dias" },
    { id: "thisMonth", label: "Este Mês" },
    { id: "lastMonth", label: "Mês Passado" },
    { id: "allTime", label: "Todo o Histórico" },
    { id: "custom", label: "Personalizado" },
  ];

  const handleSelect = (preset: MetaDateRangePreset) => {
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
    <div className="bg-surface border border-line rounded-xl p-3 shadow-xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink">
          <CalendarIcon className="w-4 h-4 text-accent" />
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
                    ? "bg-inverse text-white shadow-xs"
                    : "bg-canvas text-body hover:bg-raised hover:text-ink"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {showCustom && (
        <div className="pt-2 border-t border-line-soft flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-muted font-medium">De:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 bg-canvas border border-line rounded-lg text-ink font-mono outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-muted font-medium">Até:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 bg-canvas border border-line rounded-lg text-ink font-mono outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCustom}
            className="px-4 py-1.5 bg-accent text-on-accent rounded-lg font-semibold hover:bg-accent-hover transition-colors"
          >
            Filtrar Período
          </button>
        </div>
      )}
    </div>
  );
}
