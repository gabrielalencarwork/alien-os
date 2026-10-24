"use client";

import React, { useState } from "react";
import { NextActionsPanel } from "@/components/central/NextActionsPanel";
import { ClientResultsPanel } from "@/components/central/ClientResultsPanel";
import { TodayPanel } from "@/components/central/TodayPanel";
import { CommercialPanels } from "@/components/central/CommercialPanel";
import { greeting, longToday } from "@/lib/format";

/**
 * Central do Dia — a tela inicial do Alien OS.
 * Só o que pede decisão hoje: próximas ações da Alien Max, resultados dos clientes,
 * tarefas e reuniões, prospecção e financeiro.
 */
export default function CentralDoDia() {
  // Quando uma ação vira tarefa, o painel "Hoje" recarrega.
  const [tasksVersion, setTasksVersion] = useState(0);

  return (
    <main className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="font-display text-[28px] sm:text-[32px] font-bold text-ink leading-tight" suppressHydrationWarning>
          {greeting()}, Gabriel.
        </h1>
        <p className="text-[13px] text-muted mt-0.5 first-letter:uppercase" suppressHydrationWarning>
          {longToday()}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <NextActionsPanel onActionsChanged={() => setTasksVersion((v) => v + 1)} />
          <ClientResultsPanel />
        </div>
        <div className="space-y-6 min-w-0">
          <TodayPanel refreshKey={tasksVersion} />
          <CommercialPanels />
        </div>
      </div>
    </main>
  );
}
