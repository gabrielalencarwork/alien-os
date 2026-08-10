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
      <Card padding="sm" className="space-y-1 bg-[#111111] text-white border-[#111111]">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A8237] font-semibold block">
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
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Storage Utilizado
        </span>
        <div className="text-lg font-bold font-mono text-[#111111] tracking-tight">
          {stats.usedStorageGb} GB
        </div>
        <span className="text-[10px] text-[#71717A] font-mono block">
          de {stats.totalStorageGb} GB (42%)
        </span>
      </Card>

      {/* Enviados este mês */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Uploads no Mês
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          +{stats.uploadedThisMonth}
        </div>
        <span className="text-[10px] text-[#71717A]">Arquivos novos</span>
      </Card>

      {/* Últimos Uploads */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Recentes (7 dias)
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.recentUploadsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Atividades de mídia</span>
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
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Contratos a Vencer
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.expiringContractsCount}
        </div>
        <span className="text-[10px] text-[#4A8237] font-semibold">Alerta de renovação</span>
      </Card>

      {/* Briefings Pendentes */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Briefings Pendentes
        </span>
        <div className="text-xl font-bold font-mono text-[#111111]">
          {stats.pendingBriefingsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">Onboarding</span>
      </Card>

      {/* Versões Atualizadas */}
      <Card padding="sm" className="space-y-1">
        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
          Versões Novas
        </span>
        <div className="text-xl font-bold font-mono text-[#4A8237]">
          {stats.updatedVersionsCount}
        </div>
        <span className="text-[10px] text-[#71717A]">v2, v3 & Final</span>
      </Card>
    </div>
  );
}
