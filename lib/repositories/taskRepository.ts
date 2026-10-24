/**
 * Repository Pattern: Task Repository (Alien OS)
 * Gerencia o quadro de tarefas, SLA operacional, sprints e checklist de entregas da agência.
 * Conectado às tabelas Supabase: tasks, task_checklists, companies.
 * Sem dados mockados.
 */

import { createBrowserClient } from "@/lib/supabase/client";

// Valores canônicos — os mesmos documentados na migration da tabela `tasks`.
export type TaskPriority = "Baixa" | "Média" | "Alta" | "Crítica";
export type TaskStatus =
  | "Backlog"
  | "A Fazer"
  | "Em Andamento"
  | "Em Revisão"
  | "Aguardando Cliente"
  | "Concluído"
  | "Cancelado";

function normalizeKey(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    : "";
}

const STATUS_MAP: Record<string, TaskStatus> = {
  "backlog": "Backlog",
  "a fazer": "A Fazer",
  "todo": "A Fazer",
  "to_do": "A Fazer",
  "pending": "A Fazer",
  "in_progress": "Em Andamento",
  "doing": "Em Andamento",
  "review": "Em Revisão",
  "done": "Concluído",
  "completed": "Concluído",
  "canceled": "Cancelado",
  "cancelled": "Cancelado",
  "em andamento": "Em Andamento",
  "em revisao": "Em Revisão",
  "aguardando cliente": "Aguardando Cliente",
  "concluido": "Concluído",
  "concluida": "Concluído",
  "cancelado": "Cancelado",
  "cancelada": "Cancelado",
};

const PRIORITY_MAP: Record<string, TaskPriority> = {
  "baixa": "Baixa",
  "media": "Média",
  "alta": "Alta",
  "critica": "Crítica",
  "urgente": "Crítica",
  "low": "Baixa",
  "medium": "Média",
  "high": "Alta",
  "urgent": "Crítica",
  "critical": "Crítica",
};

/** Converte variações antigas gravadas no banco ("Concluída", "Urgente"...) para o valor canônico. */
export function normalizeTaskStatus(value: unknown): TaskStatus {
  return STATUS_MAP[normalizeKey(value)] ?? "A Fazer";
}

export function normalizeTaskPriority(value: unknown): TaskPriority {
  return PRIORITY_MAP[normalizeKey(value)] ?? "Média";
}

const isDone = (t: TaskItem) => t.status === "Concluído" || t.status === "Cancelado";

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
}

export interface TaskItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  serviceName?: string;
  title: string;
  description: string;
  assigneeName: string;
  assigneeAvatar?: string;
  priority: TaskPriority;
  status: TaskStatus;
  startDate: string;
  dueDate: string;
  estimatedHours: number;
  journeyStage: string;
  tags: string[];
  slaPercentage: number;
  checklists: TaskChecklistItem[];
  commentsCount: number;
  attachmentsCount: number;
  updatedAt: string;
}

export interface TaskStats {
  totalTasks: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  overdueCount: number;
  criticalCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  averageSlaPercentage: number;
  averageCompletionDays: number;
}

export interface AlienMaxTaskInsight {
  id: string;
  type: "Atraso" | "Gargalo" | "Sobrecarga" | "SLA em Risco" | "Otimização";
  clientName: string;
  companyId: string;
  taskTitle: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export interface NewTaskInput {
  companyId?: string;
  title: string;
  description?: string;
  assigneeName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  estimatedHours?: number;
}

export class TaskRepository {
  async getStats(): Promise<TaskStats> {
    const emptyStats: TaskStats = {
      totalTasks: 0,
      pendingCount: 0,
      inProgressCount: 0,
      completedCount: 0,
      overdueCount: 0,
      criticalCount: 0,
      dueTodayCount: 0,
      dueThisWeekCount: 0,
      averageSlaPercentage: 0,
      averageCompletionDays: 0,
    };

    const tasks = await this.getTasks();
    if (tasks.length === 0) return emptyStats;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const weekEnd = new Date(today);
    weekEnd.setDate(today.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    const open = tasks.filter((t) => !isDone(t));
    const overdue = open.filter((t) => t.dueDate && t.dueDate < todayStr).length;

    return {
      totalTasks: tasks.length,
      pendingCount: tasks.filter((t) => t.status === "A Fazer" || t.status === "Backlog").length,
      inProgressCount: tasks.filter((t) => t.status === "Em Andamento" || t.status === "Em Revisão").length,
      completedCount: tasks.filter((t) => t.status === "Concluído").length,
      overdueCount: overdue,
      criticalCount: open.filter((t) => t.priority === "Crítica").length,
      dueTodayCount: open.filter((t) => t.dueDate === todayStr).length,
      dueThisWeekCount: open.filter((t) => t.dueDate >= todayStr && t.dueDate <= weekEndStr).length,
      // SLA = % de tarefas em aberto que não estão atrasadas.
      averageSlaPercentage: open.length > 0 ? Math.round(((open.length - overdue) / open.length) * 100) : 100,
      // Ainda não há data de conclusão no banco para calcular este tempo médio.
      averageCompletionDays: 0,
    };
  }

  async getTasks(): Promise<TaskItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("tasks")
        .select("*, companies(trade_name, legal_name)")
        .eq("active", true)
        .order("due_date", { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          companyId: t.company_id,
          clientName: t.companies?.trade_name || t.companies?.legal_name || "Sem cliente",
          companyName: t.companies?.legal_name || t.companies?.trade_name || "",
          projectId: t.project_id || undefined,
          title: t.title,
          description: t.description || "",
          assigneeName: t.assignee_name || "Não atribuído",
          priority: normalizeTaskPriority(t.priority),
          status: normalizeTaskStatus(t.status),
          startDate: t.start_date || "",
          dueDate: t.due_date || "",
          estimatedHours: Number(t.estimated_hours) || 0,
          journeyStage: t.journey_stage || "Geral",
          tags: t.tags || [],
          slaPercentage: t.sla_percentage ?? 100,
          checklists: [],
          commentsCount: 0,
          attachmentsCount: 0,
          updatedAt: t.updated_at ? t.updated_at.split("T")[0] : "",
        }));
      }
    } catch (err) {
      console.error("Erro ao ler tasks no Supabase:", err);
    }
    return [];
  }

  async getAlienMaxInsights(): Promise<AlienMaxTaskInsight[]> {
    const tasks = await this.getTasks();
    const insights: AlienMaxTaskInsight[] = [];
    const now = new Date().toISOString().split("T")[0];

    for (const t of tasks) {
      if (!isDone(t) && t.dueDate && t.dueDate < now) {
        insights.push({
          id: `tsk-ins-${t.id}`,
          type: "Atraso",
          clientName: t.clientName,
          companyId: t.companyId,
          taskTitle: t.title,
          title: `Tarefa em atraso: "${t.title}"`,
          description: `O prazo estipulado venceu em ${t.dueDate}.`,
          confidenceScore: 99,
          recommendedAction: "Priorizar entrega ou renegociar prazo.",
        });
      }
    }

    return insights;
  }

  async createTask(input: NewTaskInput): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase.from("tasks").insert({
      company_id: input.companyId || null,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      assignee_name: input.assigneeName?.trim() || "Não Atribuído",
      priority: input.priority,
      status: input.status,
      due_date: input.dueDate,
      start_date: new Date().toISOString().split("T")[0],
      estimated_hours: input.estimatedHours ?? 0,
    });
    if (error) {
      console.error("Erro ao criar tarefa:", error);
      throw new Error(`Não foi possível criar a tarefa: ${error.message}`);
    }
  }

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId);
    if (error) {
      console.error("Erro ao atualizar status da tarefa:", error);
      throw new Error(`Não foi possível atualizar a tarefa: ${error.message}`);
    }
  }
}

export const taskRepository = new TaskRepository();
