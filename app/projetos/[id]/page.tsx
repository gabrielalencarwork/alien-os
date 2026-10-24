"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  projectRepository,
  ProjectItem,
} from "@/lib/repositories/projectRepository";
import {
  ChevronRightIcon,
  LayoutDashboardIcon,
  CheckCircle2Icon,
  FileTextIcon,
  ClockIcon,
  WalletIcon,
  RocketIcon,
  BotIcon,
  SparklesIcon,
} from "@/components/icons";

export default function ProjectWorkspacePage({
  params,
}: {
  params: { id: string };
}) {
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "tarefas"
    | "documentos"
    | "agenda"
    | "financeiro"
    | "campanhas"
    | "timeline"
    | "alien-max"
  >("dashboard");

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await projectRepository.getProjectById(params.id);
        setProject(res);
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [params.id]);

  if (loading || !project) {
    return (
      <PageContainer>
        <div className="p-8 text-center text-xs text-muted flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span>Carregando workspace do projeto...</span>
        </div>
      </PageContainer>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboardIcon className="w-3.5 h-3.5" /> },
    { id: "tarefas", label: "Tarefas", icon: <CheckCircle2Icon className="w-3.5 h-3.5" />, badge: `${project.openTasksCount}` },
    { id: "documentos", label: "Documentos", icon: <FileTextIcon className="w-3.5 h-3.5" />, badge: `${project.documentsCount}` },
    { id: "agenda", label: "Agenda", icon: <ClockIcon className="w-3.5 h-3.5" />, badge: `${project.meetingsCount}` },
    { id: "financeiro", label: "Financeiro", icon: <WalletIcon className="w-3.5 h-3.5" /> },
    { id: "campanhas", label: "Campanhas", icon: <RocketIcon className="w-3.5 h-3.5" /> },
    { id: "timeline", label: "Timeline", icon: <SparklesIcon className="w-3.5 h-3.5" /> },
    { id: "alien-max", label: "Alien Max", icon: <BotIcon className="w-3.5 h-3.5" />, badge: "IA" },
  ];

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* Back Link */}
        <div>
          <Link
            href="/projetos"
            className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink font-medium transition-colors"
          >
            <span className="rotate-180 inline-block">
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </span>
            <span>Voltar para Central de Projetos</span>
          </Link>
        </div>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-line">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="alien" showDot>
                {project.status}
              </Badge>
              <Badge variant="dark" size="sm">
                Alien Score {project.alienScore}/100
              </Badge>
              <Badge variant="outline" size="sm">
                Prioridade {project.priority}
              </Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
                {project.name}
              </h1>
              <p className="text-sm text-body">
                Cliente: <strong className="text-ink">{project.clientName}</strong> · Responsável:{" "}
                <span className="font-semibold text-ink">{project.leadName}</span> · Prazo:{" "}
                <span className="font-mono text-ink">{project.dueDate}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button variant="primary" size="sm">
              Atualizar Status
            </Button>
          </div>
        </div>

        {/* 8 Tabs Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar bg-surface p-2 rounded-xl border border-line">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs px-3.5 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? "bg-inverse text-white shadow-xs"
                    : "bg-canvas text-body hover:text-ink hover:bg-raised"
                }`}
              >
                <span className={isActive ? "text-accent" : "text-muted"}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Workspace View */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card padding="sm" className="space-y-1 bg-inverse text-white">
                <span className="text-[10px] font-mono uppercase text-accent font-semibold block">
                  Progresso do Projeto
                </span>
                <div className="text-2xl font-bold font-mono text-white">
                  {project.progressPercentage}%
                </div>
                <span className="text-[10px] text-zinc-300">Conclusão total</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-subtle block">
                  Horas Executadas
                </span>
                <div className="text-2xl font-bold font-mono text-ink">
                  {project.executedHours}h / {project.estimatedHours}h
                </div>
                <span className="text-[10px] text-muted">Capacidade reservada</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-subtle block">
                  Valor Contratado
                </span>
                <div className="text-2xl font-bold font-mono text-accent">
                  R$ {project.contractedValue.toLocaleString("pt-BR")}
                </div>
                <span className="text-[10px] text-muted">Receita do projeto</span>
              </Card>

              <Card padding="sm" className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-subtle block">
                  Rentabilidade Est.
                </span>
                <div className="text-2xl font-bold font-mono text-ink">
                  {project.profitabilityPercentage !== undefined ? `${project.profitabilityPercentage}%` : "—"}
                </div>
                <span className="text-[10px] text-muted">Margem de contribuição</span>
              </Card>
            </div>

            {/* Scope & Objectives */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="space-y-3">
                <h3 className="text-sm font-bold text-ink border-b border-line-soft pb-2">
                  Escopo & Descrição Técnica
                </h3>
                <p className="text-xs text-body leading-relaxed">
                  {project.description}
                </p>
              </Card>

              <Card className="space-y-3">
                <h3 className="text-sm font-bold text-ink border-b border-line-soft pb-2">
                  Objetivo Estratégico & KPIs
                </h3>
                <p className="text-xs text-body leading-relaxed">
                  {project.objective}
                </p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "tarefas" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-ink">
              Central de Tarefas Vinculadas ao Projeto ({project.openTasksCount} Ativas)
            </h3>
            <p className="text-xs text-muted">
              Sincronização ao vivo com a Central de Tarefas do Alien OS.
            </p>
          </Card>
        )}

        {activeTab === "documentos" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-ink">
              Repositório de Documentos do Projeto ({project.documentsCount} Arquivos)
            </h3>
            <p className="text-xs text-muted">
              Estruturado no Supabase Storage sob <code className="font-mono text-accent">clientes/{project.companyId}/projetos/</code>.
            </p>
          </Card>
        )}

        {activeTab === "agenda" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-ink">
              Reuniões Agendadas do Projeto ({project.meetingsCount} Encontros)
            </h3>
            <p className="text-xs text-muted">
              Integrado com a Agenda Inteligente do Alien OS.
            </p>
          </Card>
        )}

        {activeTab === "financeiro" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-ink">
              Performance Financeira & Rentabilidade do Projeto
            </h3>
            <p className="text-xs text-muted">
              Contratado: R$ {project.contractedValue.toLocaleString("pt-BR")} · Rentabilidade: {project.profitabilityPercentage !== undefined ? `${project.profitabilityPercentage}%` : "sem custos registrados"}
            </p>
          </Card>
        )}

        {activeTab === "timeline" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-ink">
              Timeline de Eventos do Projeto
            </h3>
            <p className="text-xs text-muted">
              Publicação automática no histórico da empresa {project.clientName}.
            </p>
          </Card>
        )}

        {activeTab === "alien-max" && (
          <Card className="p-8 text-center space-y-2">
            <h3 className="text-sm font-bold text-ink">
              Console Consultivo Alien Max · Projeto {project.name}
            </h3>
            <p className="text-xs text-muted">
              Diagnóstico autônomo de gargalos e estimativas de conclusão.
            </p>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
