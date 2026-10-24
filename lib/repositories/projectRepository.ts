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

export type ProjectPriority = "Baixa" | "Média" | "Alta" | "Crítica";

export interface NewProjectInput {
  companyId?: string;
  name: string;
  type?: string;
  leadName?: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  dueDate: string;
  contractedValue?: number;
  estimatedHours?: number;
  description?: string;
  objective?: string;
}

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
  priority: ProjectPriority;
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
  documentsCount: number;
  meetingsCount: number;
  /** Só existe quando há custo registrado para calcular a margem. */
  profitabilityPercentage?: number;
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
      const { data, error } = await supabase
        .from("projects")
        .select("*, companies(trade_name, legal_name)")
        .eq("active", true)
        .order("due_date", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          companyId: p.company_id,
          clientName: p.companies?.trade_name || p.companies?.legal_name || "Interno",
          companyName: p.companies?.legal_name || p.companies?.trade_name || "",
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
          alienScore: Number(p.alien_score_impact) || 0,
          healthStatus: p.health_status || "Excelente",
          members: [],
          milestones: [],
          openTasksCount: 0,
          completedTasksCount: 0,
          documentsCount: 0,
          meetingsCount: 0,
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

  async createProject(input: NewProjectInput): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("projects").insert({
      company_id: input.companyId || null,
      name: input.name.trim(),
      type: input.type || undefined,
      lead_name: input.leadName?.trim() || undefined,
      priority: input.priority,
      status: input.status,
      due_date: input.dueDate,
      contracted_value: input.contractedValue ?? 0,
      estimated_hours: input.estimatedHours ?? 0,
      description: input.description?.trim() || null,
      objective: input.objective?.trim() || null,
    });
    if (error) {
      console.error("Erro ao criar projeto:", error);
      throw new Error(`Não foi possível criar o projeto: ${error.message}`);
    }
  }
}

export const projectRepository = new ProjectRepository();
