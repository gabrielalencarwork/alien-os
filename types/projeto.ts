/**
 * Definições de Projetos e Demandas (Alien OS)
 * Tabela Supabase: projects / tasks
 */

export type ProjectStatus = "Em Planejamento" | "Em Execução" | "Concluído" | "Em Pausa";

export interface Projeto {
  id: string; // UUID
  clientId: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  startDate: string;
  targetEndDate?: string;
  actualEndDate?: string;
  leadAssigneeId?: string;
  budgetAllocated?: number;
  createdAt: string;
  updatedAt: string;
}

export type TaskImpact = "Crítico" | "Alto Impacto" | "Médio Impacto" | "Baixo Impacto";

export interface Tarefa {
  id: string;
  projectId?: string;
  clientId: string;
  title: string;
  clientName: string;
  impact: TaskImpact;
  slaDeadline: string;
  assigneeName: string;
  category: string;
  isCompleted: boolean;
}
