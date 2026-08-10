"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  projectRepository,
  ProjectStats,
  ProjectItem,
  AlienMaxProjectInsight,
} from "@/lib/repositories/projectRepository";
import { ProjectMetricsGrid } from "@/components/projetos/ProjectMetricsGrid";
import { ProjectCardGridWidget } from "@/components/projetos/ProjectCardGridWidget";
import { ProjectListWidget } from "@/components/projetos/ProjectListWidget";
import { ProjectCreateModal } from "@/components/projetos/ProjectCreateModal";
import { AlienMaxProjectAdvisorWidget } from "@/components/projetos/AlienMaxProjectAdvisorWidget";
import {
  PlusIcon,
  LayoutDashboardIcon,
  BriefcaseIcon,
  RocketIcon,
} from "@/components/icons";

export default function ProjetosPage() {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxProjectInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // View Mode ('cards' | 'list')
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    async function loadProjectData() {
      try {
        const [statRes, projRes, insightRes] = await Promise.all([
          projectRepository.getStats(),
          projectRepository.getProjects(),
          projectRepository.getAlienMaxInsights(),
        ]);

        setStats(statRes);
        setProjects(projRes);
        setInsights(insightRes);
      } finally {
        setLoading(false);
      }
    }
    loadProjectData();
  }, []);

  const handleCreateSuccess = (name: string) => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      companyId: "aura-health",
      clientName: "Aura Health",
      companyName: "Aura Suplementos LTDA",
      serviceName: "Gestão de Tráfego",
      name: name,
      type: "Growth Marketing",
      description: "Novo projeto criado no Project Hub",
      objective: "Escalar métricas operacionais do cliente",
      leadName: "Gabriel Alencar",
      priority: "Alta",
      status: "Em Andamento",
      progressPercentage: 10,
      startDate: new Date().toISOString().split("T")[0],
      dueDate: "2026-08-30",
      estimatedBudget: 25000,
      contractedValue: 12000,
      estimatedHours: 50,
      executedHours: 5,
      alienScore: 90,
      healthStatus: "Excelente",
      members: [],
      milestones: [],
      openTasksCount: 2,
      completedTasksCount: 0,
      documentsCount: 1,
      meetingsCount: 1,
      profitabilityPercentage: 72,
    };

    setProjects((prev) => [newProj, ...prev]);
  };

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Banner & View Toggle */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 16 · Project Hub
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Núcleo Operacional do Alien OS
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Central de Projetos (Project Hub)
              </h1>
              <p className="text-sm text-[#52525B]">
                Gestão unificada de projetos conectando CRM, Clientes, Agenda, Tarefas, Documentos, Financeiro e Timeline
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* View Switcher Toggle */}
              <div className="p-1 rounded-xl bg-white border border-[#E4E4E7] flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "cards"
                      ? "bg-[#111111] text-white"
                      : "text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <LayoutDashboardIcon className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "list"
                      ? "bg-[#111111] text-white"
                      : "text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <BriefcaseIcon className="w-3.5 h-3.5" />
                  <span>Lista</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Novo Projeto
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando projetos da agência do Supabase...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <ProjectMetricsGrid stats={stats} />
            </section>

            {/* 3. Main 2-Column Layout (Project Feed + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary View (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {viewMode === "cards" && (
                  <ProjectCardGridWidget projects={projects} />
                )}

                {viewMode === "list" && (
                  <ProjectListWidget projects={projects} />
                )}
              </div>

              {/* Alien Max Project Advisor (1 Col) */}
              <div>
                <AlienMaxProjectAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <ProjectCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleCreateSuccess}
      />
    </PageContainer>
  );
}
