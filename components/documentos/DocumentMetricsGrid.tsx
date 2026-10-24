import React from "react";
import { Card } from "@/components/Card";
import { DocumentStats } from "@/lib/repositories/documentRepository";
import { FileTextIcon, ClockIcon, AlertTriangleIcon, CheckCircle2Icon } from "@/components/icons";

export interface DocumentMetricsGridProps {
  stats: DocumentStats;
}

export function DocumentMetricsGrid({ stats }: DocumentMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
      {/* Total de Documentos */}
      <Card padding="sm" className="space-y-1 bg-inverse text-white border-ink">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold block">
          Total Arquivos
        </span>
        <div className="text-xl font-bold font-mono text-white tracking-tight">
          {stats.totalDocuments}
        </div>
        <span className="text-[10px] text-zinc-300 font-mono block">
          Repositório Central
        </span>
      </Card>

      {/* Espaço Utilizado */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Storage Utilizado
        </span>
        <div className="text-lg font-bold font-mono text-ink tracking-tight">
          {stats.usedStorageGb} GB
        </div>
        <span className="text-[10px] text-muted font-mono block">
          de {stats.totalStorageGb} GB (42%)
        </span>
      </Card>

      {/* Enviados este mês */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Uploads no Mês
        </span>
        <div className="text-xl font-bold font-mono text-accent">
          +{stats.uploadedThisMonth}
        </div>
        <span className="text-[10px] text-muted">Arquivos novos</span>
      </Card>

      {/* Últimos Uploads */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Recentes (7 dias)
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.recentUploadsCount}
        </div>
        <span className="text-[10px] text-muted">Atividades de mídia</span>
      </Card>

      {/* Documentos Pendentes */}
      <Card padding="sm" className="space-y-1 bg-amber-50/50 border-amber-200">
        <span className="text-[10px] font-mono uppercase text-amber-800 font-semibold block">
          Pendentes
        </span>
        <div className="text-xl font-bold font-mono text-amber-950">
          {stats.pendingDocumentsCount}
        </div>
        <span className="text-[10px] text-amber-800">Aguardando aprovação</span>
      </Card>

      {/* Contratos Vencendo */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Contratos a Vencer
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.expiringContractsCount}
        </div>
        <span className="text-[10px] text-accent font-semibold">Alerta de renovação</span>
      </Card>

      {/* Briefings Pendentes */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Briefings Pendentes
        </span>
        <div className="text-xl font-bold font-mono text-ink">
          {stats.pendingBriefingsCount}
        </div>
        <span className="text-[10px] text-muted">Onboarding</span>
      </Card>

      {/* Versões Atualizadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-subtle block">
          Versões Novas
        </span>
        <div className="text-xl font-bold font-mono text-accent">
          {stats.updatedVersionsCount}
        </div>
        <span className="text-[10px] text-muted">v2, v3 & Final</span>
      </Card>
    </div>
  );
}
