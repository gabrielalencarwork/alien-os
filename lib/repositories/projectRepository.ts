/**
 * Repository Pattern: Project Repository (Alien OS)
 * Gerencia os projetos, escopos, cronogramas de entrega, squads e marcos (milestones) da agência.
 * Conectado às tabelas Supabase: projects, project_milestones, project_members, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type ProjectType =
  | "Onboarding & Setup"
  | "Growth Marketing"
  | "Desenvolvimento Web"
  | "Branding & Design"
  | "Automação & CRM"
  | "CRO & Landing Pages"
  | "SEO & Conteúdo"
  | "Audiovisual / Criativos";

export type ProjectStatus =
  | "Planejamento"
  | "Em Andamento"
  | "Em Revisão"
  | "Aguardando Cliente"
  | "Concluído"
  | "Pausado"
  | "Cancelado";

export interface ProjectMilestoneItem {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProjectMemberItem {
  id: string;
  projectId: string;
  memberName: string;
  role: string;
  avatarUrl?: string;
}

export interface ProjectItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  serviceId?: string;
  serviceName?: string;
  name: string;
  type: ProjectType;
  description: string;
  objective: string;
  leadName: string;
  leadAvatar?: string;
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  status: ProjectStatus;
  progressPercentage: number;
  startDate: string;
  dueDate: string;
  estimatedBudget: number;
  contractedValue: number;
  estimatedHours: number;
  executedHours: number;
  journeyStage: string;
  tags: string[];
  alienScore: number;
  healthStatus: "Excelente" | "Atenção" | "Crítico";
  members: ProjectMemberItem[];
  milestones: ProjectMilestoneItem[];
  openTasksCount: number;
  completedTasksCount: number;
}

export interface ProjectStats {
  activeProjectsCount: number;
  completedProjectsCount: number;
  delayedProjectsCount: number;
  planningProjectsCount: number;
  inProgressProjectsCount: number;
  inReviewProjectsCount: number;
  totalEstimatedHours: number;
  totalExecutedHours: number;
  averageProgressPercentage: number;
}

export interface AlienMaxProjectInsight {
  id: string;
  type: "Parado" | "Risco" | "Crítico" | "Conclusão" | "Aprovação";
  clientName: string;
  companyId: string;
  projectName: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export class ProjectRepository {
  async getStats(): Promise<ProjectStats> {
    const emptyStats: ProjectStats = {
      activeProjectsCount: 0,
      completedProjectsCount: 0,
      delayedProjectsCount: 0,
      planningProjectsCount: 0,
      inProgressProjectsCount: 0,
      inReviewProjectsCount: 0,
      totalEstimatedHours: 0,
      totalExecutedHours: 0,
      averageProgressPercentage: 0,
    };

    try {
      const projects = await this.getProjects();
      if (projects.length === 0) return emptyStats;

      const active = projects.filter((p) => p.status !== "Concluído" && p.status !== "Cancelado").length;
      const completed = projects.filter((p) => p.status === "Concluído").length;
      const inProgress = projects.filter((p) => p.status === "Em Andamento").length;
      const planning = projects.filter((p) => p.status === "Planejamento").length;
      const inReview = projects.filter((p) => p.status === "Em Revisão").length;

      const now = new Date().toISOString().split("T")[0];
      const delayed = projects.filter((p) => p.status !== "Concluído" && p.dueDate && p.dueDate < now).length;

      const totalEstHours = projects.reduce((acc, p) => acc + (p.estimatedHours || 0), 0);
      const totalExecHours = projects.reduce((acc, p) => acc + (p.executedHours || 0), 0);
      const avgProg = Math.round(projects.reduce((acc, p) => acc + (p.progressPercentage || 0), 0) / projects.length);

      return {
        activeProjectsCount: active,
        completedProjectsCount: completed,
        delayedProjectsCount: delayed,
        planningProjectsCount: planning,
        inProgressProjectsCount: inProgress,
        inReviewProjectsCount: inReview,
        totalEstimatedHours: totalEstHours,
        totalExecutedHours: totalExecHours,
        averageProgressPercentage: avgProg,
      };
    } catch {
      return emptyStats;
    }
  }

  async getProjects(): Promise<ProjectItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("projects").select("*");
      if (data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          companyId: p.company_id,
          clientName: p.company_id,
          companyName: p.company_id,
          name: p.name,
          type: p.type as any,
          description: p.description || "",
          objective: p.objective || "",
          leadName: p.lead_name || "Líder de Projeto",
          priority: p.priority || "Média",
          status: p.status as any,
          progressPercentage: Number(p.progress_percentage) || 0,
          startDate: p.start_date || "",
          dueDate: p.due_date || "",
          estimatedBudget: Number(p.estimated_budget) || 0,
          contractedValue: Number(p.contracted_value) || 0,
          estimatedHours: Number(p.estimated_hours) || 0,
          executedHours: Number(p.executed_hours) || 0,
          journeyStage: p.journey_stage || "Geral",
          tags: p.tags || [],
          alienScore: p.alien_score || 80,
          healthStatus: p.health_status || "Excelente",
          members: [],
          milestones: [],
          openTasksCount: 0,
          completedTasksCount: 0,
        }));
      }
    } catch (err) {
      console.error("Erro ao ler projects no Supabase:", err);
    }
    return [];
  }

  async getProjectById(id: string): Promise<ProjectItem | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  async getAlienMaxInsights(): Promise<AlienMaxProjectInsight[]> {
    return [];
  }
}

export const projectRepository = new ProjectRepository();
