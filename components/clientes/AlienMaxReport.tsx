import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { AlienMaxReportResult } from "@/lib/alienMaxEngine";
import {
  BotIcon,
  SparklesIcon,
  TrendingUpIcon,
  CheckCircle2Icon,
  AlertTriangleIcon,
  ArrowUpRightIcon,
  ZapIcon,
} from "@/components/icons";

export interface AlienMaxReportProps {
  report: AlienMaxReportResult;
  onResetScan?: () => void;
}

export function AlienMaxReport({ report, onResetScan }: AlienMaxReportProps) {
  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <Card className="border-[#E4E4E7] bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#111111] via-[#4A8237] to-[#111111]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#111111] text-white flex items-center justify-center border border-[#4A8237] shrink-0">
              <BotIcon className="w-6 h-6 text-[#4A8237]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#111111] tracking-tight">
                  Relatório de Diagnóstico · Alien Max v1
                </h2>
                <Badge variant="alien" size="sm" showDot>
                  Consultor de Growth
                </Badge>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Escaneamento estratégico gerado para <strong className="text-[#111111]">{report.clientName}</strong> em {report.createdAt}
              </p>
            </div>
          </div>

          {onResetScan && (
            <Button variant="outline" size="sm" onClick={onResetScan}>
              Refazer Escaneamento
            </Button>
          )}
        </div>

        {/* Core Scores Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {/* Alien Score Meter */}
          <div className="p-4 rounded-xl bg-[#111111] text-white space-y-2 relative overflow-hidden">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
              Alien Score Operacional
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                {report.alienScore}
              </span>
              <span className="text-xs text-zinc-400 font-mono">/ 100 pts</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              Maturidade digital consolidada em mídias, dados e conversão.
            </p>
          </div>

          {/* Health Score */}
          <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] font-medium block">
              Health Score da Conta
            </span>
            <div className="flex items-center gap-2">
              <Badge
                variant={report.healthScore === "Excelente" ? "alien" : "dark"}
                size="md"
                showDot
                className={
                  report.healthScore === "Atenção"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : report.healthScore === "Crítico"
                    ? "bg-red-950 text-red-200 border-red-800"
                    : ""
                }
              >
                Saúde {report.healthScore}
              </Badge>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Indicador de retenção e estabilidade de entregáveis.
            </p>
          </div>

          {/* Opportunity Score */}
          <div className="p-4 rounded-xl bg-[rgba(74,130,55,0.06)] border border-[rgba(74,130,55,0.2)] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
              Opportunity Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#4A8237] tracking-tight font-mono">
                +{report.opportunityScore} pts
              </span>
            </div>
            <p className="text-[11px] text-[#111111]">
              Potencial de receita incremental identificada nas 8 verticais.
            </p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-4 p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#111111] font-bold block">
            Diagnóstico Inicial do Alien Max
          </span>
          <p className="text-xs text-[#52525B] leading-relaxed">
            {report.executiveSummary}
          </p>
        </div>
      </Card>

      {/* Category Breakdowns */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <h3 className="text-base font-bold text-[#111111]">
            Maturidade por Vertical de Growth
          </h3>
          <Badge variant="gray" size="sm">
            8 Categorias Escaneadas
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(report.categoryScores).map(([key, val]) => (
            <div key={key} className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#71717A] capitalize block">
                {key === "gmb" ? "Google Meu Negócio" : key}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-[#111111]">{val}%</span>
                <div className="w-12 h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#4A8237] rounded-full"
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strong vs Weak Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strong Points */}
        <Card className="border-[#E4E4E7] bg-white space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F5]">
            <CheckCircle2Icon className="w-4 h-4 text-[#4A8237]" />
            <h3 className="text-sm font-bold text-[#111111]">
              Pontos Fortes da Operação
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-[#52525B]">
            {report.strongPoints.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A8237] mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Weak Points */}
        <Card className="border-[#E4E4E7] bg-white space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#F4F4F5]">
            <AlertTriangleIcon className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-[#111111]">
              Gargalos & Pontos Fracos Detectados
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-[#52525B]">
            {report.weakPoints.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Priorities & Actionable Next Steps */}
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div>
            <h3 className="text-base font-bold text-[#111111]">
              Próximos Passos & Prioridades de Execução
            </h3>
            <p className="text-xs text-[#71717A]">
              Roteiro tático recomendado pelo Alien Max v1 para alavancar a receita
            </p>
          </div>
          <Badge variant="alien" size="sm">
            Pronto para Execução
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {report.nextSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between space-y-3 hover:border-[#D4D4D8] transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#A1A1AA]">
                    Ação #{idx + 1}
                  </span>
                  <Badge variant={step.impact === "Crítico" ? "dark" : "alien"} size="sm">
                    {step.impact}
                  </Badge>
                </div>
                <h4 className="text-xs font-bold text-[#111111]">
                  {step.title}
                </h4>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  {step.description}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between"
                icon={<ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />}
                iconPosition="right"
              >
                Aprovar Ação
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
