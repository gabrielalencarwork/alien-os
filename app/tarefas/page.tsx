"use client";

import React, { useState, useEffect } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  taskRepository,
  TaskStats,
  TaskItem,
  AlienMaxTaskInsight,
  TaskStatus,
} from "@/lib/repositories/taskRepository";
import { TaskMetricsGrid } from "@/components/tarefas/TaskMetricsGrid";
import { TaskKanbanWidget } from "@/components/tarefas/TaskKanbanWidget";
import { TaskListWidget } from "@/components/tarefas/TaskListWidget";
import { TaskCalendarWidget } from "@/components/tarefas/TaskCalendarWidget";
import { TaskCreateModal } from "@/components/tarefas/TaskCreateModal";
import { TaskDetailModal } from "@/components/tarefas/TaskDetailModal";
import { AlienMaxTaskAdvisorWidget } from "@/components/tarefas/AlienMaxTaskAdvisorWidget";
import {
  PlusIcon,
  LayoutDashboardIcon,
  BriefcaseIcon,
  ClockIcon,
  CheckCircle2Icon,
} from "@/components/icons";

export default function TarefasPage() {
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxTaskInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode state (kanban, list, calendar)
  const [viewMode, setViewMode] = useState<"kanban" | "list" | "calendar">("kanban");

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);

  useEffect(() => {
    async function loadTaskData() {
      try {
        const [statRes, taskRes, insightRes] = await Promise.all([
          taskRepository.getStats(),
          taskRepository.getTasks(),
          taskRepository.getAlienMaxInsights(),
        ]);

        setStats(statRes);
        setTasks(taskRes);
        setInsights(insightRes);
      } finally {
        setLoading(false);
      }
    }
    loadTaskData();
  }, []);

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    taskRepository.updateTaskStatus(taskId, newStatus);
  };

  const handleTaskCreateSuccess = (title: string) => {
    const newTask: TaskItem = {
      id: `tsk-${Date.now()}`,
      companyId: "aura-health",
      clientName: "Aura Health",
      companyName: "Aura Suplementos LTDA",
      title: title,
      description: "Nova tarefa cadastrada no sistema",
      assigneeName: "Lucas Mendes",
      priority: "Média",
      status: "A Fazer",
      dueDate: "2026-08-07",
      estimatedHours: 4.0,
      journeyStage: "Execução & Otimização",
      slaPercentage: 100,
      checklists: [],
      commentsCount: 0,
      attachmentsCount: 0,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    setTasks((prev) => [newTask, ...prev]);
  };

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Header Banner & View Switcher */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 14 · Central de Tarefas
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Ambiente Operacional Principal
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Central de Tarefas & Operação
              </h1>
              <p className="text-sm text-[#52525B]">
                Gestão diária de entregas conectada a clientes, projetos, mídias e etapas da Jornada de Abdução
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* 3 View Switchers */}
              <div className="p-1 rounded-xl bg-white border border-[#E4E4E7] flex items-center gap-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewMode("kanban")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "kanban"
                      ? "bg-[#111111] text-white"
                      : "text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <LayoutDashboardIcon className="w-3.5 h-3.5" />
                  <span>Kanban</span>
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
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "calendar"
                      ? "bg-[#111111] text-white"
                      : "text-[#52525B] hover:text-[#111111]"
                  }`}
                >
                  <ClockIcon className="w-3.5 h-3.5" />
                  <span>Calendário</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Nova Tarefa
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando tarefas operacionais do Supabase...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <TaskMetricsGrid stats={stats} />
            </section>

            {/* 3. Main 2-Column Layout (Kanban/List/Calendar + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary Workspace (2 Cols) */}
              <div className="lg:col-span-2 space-y-6">
                {viewMode === "kanban" && (
                  <TaskKanbanWidget
                    tasks={tasks}
                    onOpenDetailModal={setSelectedTask}
                    onStatusChange={handleStatusChange}
                  />
                )}

                {viewMode === "list" && (
                  <TaskListWidget
                    tasks={tasks}
                    onOpenDetailModal={setSelectedTask}
                  />
                )}

                {viewMode === "calendar" && (
                  <TaskCalendarWidget
                    tasks={tasks}
                    onOpenDetailModal={setSelectedTask}
                  />
                )}
              </div>

              {/* Alien Max Task Advisor (1 Col) */}
              <div>
                <AlienMaxTaskAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <TaskCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateSuccess={handleTaskCreateSuccess}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
      />
    </PageContainer>
  );
}
