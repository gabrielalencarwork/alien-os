"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { calculateGrowthScenario } from "@/lib/alienMaxIntelligence";
import { TrendingUpIcon, SparklesIcon, ArrowUpRightIcon } from "@/components/icons";

export function GrowthSimulatorWidget() {
  const [currentBudget, setCurrentBudget] = useState<number>(30000);
  const [currentRoas, setCurrentRoas] = useState<number>(4.2);
  const [targetBudget, setTargetBudget] = useState<number>(55000);

  const scenario = calculateGrowthScenario(currentBudget, currentRoas, targetBudget);

  return (
    <Card className="border-line bg-surface space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="w-4 h-4 text-accent" />
            <h3 className="text-base font-bold text-ink tracking-tight">
              Simulador de Crescimento & Escala de Mídia
            </h3>
            <Badge variant="alien" size="sm" showDot>
              Modelagem Alien Max
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Simule cenários de aumento de investimento e projete o faturamento incremental e nível de confiança
          </p>
        </div>

        <Badge variant="dark" size="sm">
          {scenario.confidenceScore}% de Confiança
        </Badge>
      </div>

      {/* Sliders Input Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 rounded-2xl bg-canvas border border-line">
        {/* Slider 1: Orçamento Atual */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-ink flex justify-between">
            <span>Orçamento Atual / Mês</span>
            <span className="font-mono text-accent font-bold">
              R$ {currentBudget.toLocaleString("pt-BR")}
            </span>
          </label>
          <input
            type="range"
            min="5000"
            max="150000"
            step="5000"
            value={currentBudget}
            onChange={(e) => setCurrentBudget(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <span className="text-[10px] text-muted block">
            Faturamento Atual: R$ {scenario.currentRevenue.toLocaleString("pt-BR")}
          </span>
        </div>

        {/* Slider 2: ROAS Atual */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-ink flex justify-between">
            <span>ROAS Histórico Atual</span>
            <span className="font-mono text-accent font-bold">
              {currentRoas.toFixed(1)}x
            </span>
          </label>
          <input
            type="range"
            min="1.5"
            max="8.0"
            step="0.1"
            value={currentRoas}
            onChange={(e) => setCurrentRoas(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <span className="text-[10px] text-muted block">
            Eficiência atual da conta
          </span>
        </div>

        {/* Slider 3: Orçamento Alvo para Escala */}
        <div className="space-y-2 text-xs">
          <label className="font-semibold text-ink flex justify-between">
            <span>Orçamento Alvo de Escala</span>
            <span className="font-mono text-ink font-bold">
              R$ {targetBudget.toLocaleString("pt-BR")}
            </span>
          </label>
          <input
            type="range"
            min="10000"
            max="300000"
            step="5000"
            value={targetBudget}
            onChange={(e) => setTargetBudget(Number(e.target.value))}
            className="w-full accent-ink"
          />
          <span className="text-[10px] text-muted block">
            Aumento de {Math.round(((targetBudget - currentBudget) / currentBudget) * 100)}% no investimento
          </span>
        </div>
      </div>

      {/* Projections Display Output Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Receita Incremental Projetada */}
        <div className="p-4 rounded-xl bg-inverse text-white space-y-1 relative overflow-hidden">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
            Receita Incremental Estimada
          </span>
          <div className="text-2xl font-extrabold font-mono text-white tracking-tight">
            +R$ {scenario.incrementalRevenue.toLocaleString("pt-BR")}
          </div>
          <span className="text-[11px] text-zinc-300 font-mono block">
            Faturamento Total Projetado: R$ {scenario.projectedRevenue.toLocaleString("pt-BR")}
          </span>
        </div>

        {/* ROAS Projetado pós-escala */}
        <div className="p-4 rounded-xl bg-canvas border border-line space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted font-medium block">
            ROAS Projetado Ajustado
          </span>
          <div className="text-2xl font-bold font-mono text-accent tracking-tight">
            {scenario.projectedRoas}x
          </div>
          <span className="text-[11px] text-muted font-mono block">
            Considera curva de rendimento decrescente
          </span>
        </div>

        {/* Análise de Risco da IA */}
        <div className="p-4 rounded-xl bg-accent/6 border border-accent/20 space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
            Diagnóstico de Risco Alien Max
          </span>
          <p className="text-xs text-ink leading-relaxed">
            {scenario.riskAnalysis}
          </p>
        </div>
      </div>
    </Card>
  );
}
