/**
 * Repository Pattern: Task Repository (Alien OS)
 * Gerencia a leitura, escrita, comentários, checklists e automação de SLA da Central de Tarefas.
 * Conectado às tabelas Supabase: tasks, task_comments, task_checklists, task_attachments, task_history.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type TaskStatus = "Backlog" | "A Fazer" | "Em Andamento" | "Em Revisão" | "Concluído";
export type TaskPriority = "Baixa" | "Média" | "Alta" | "Crítica";

export interface TaskChecklistItem {
  id: string;
  taskId: string;
  title: string;
  completed: boolean;
  assigneeName?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  documentId?: string;
  documentName: string;
  fileUrl?: string;
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
  priority: TaskPriority;
  status: TaskStatus;
  startDate?: string;
  dueDate: string;
  estimatedHours: number;
  journeyStage?: string;
  tags?: string[];
  slaPercentage: number;
  checklists: TaskChecklistItem[];
  commentsCount: number;
  attachmentsCount: number;
  updatedAt: string;
}

export interface TaskStats {
  totalTasks: number;
  inProgressCount: number;
  completedCount: number;
  overdueCount: number;
  criticalCount: number;
  dueTodayCount: number;
  dueThisWeekCount: number;
  averageSlaPercentage: number; // ex: 94.2%
  averageCompletionDays: number; // ex: 1.8 dias
}

export interface AlienMaxTaskInsight {
  id: string;
  type: "Aprovação" | "Atraso" | "Gargalo" | "Sobrecarga" | "Redistribuição";
  clientName: string;
  companyId: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export const mockTaskStats: TaskStats = {
  totalTasks: 48,
  inProgressCount: 14,
  completedCount: 22,
  overdueCount: 4,
  criticalCount: 3,
  dueTodayCount: 5,
  dueThisWeekCount: 12,
  averageSlaPercentage: 94.2,
  averageCompletionDays: 1.8,
};

export const mockTasks: TaskItem[] = [
  {
    id: "tsk-101",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    projectName: "Escala Q3 Meta Ads",
    serviceName: "Gestão de Tráfego",
    title: "Subir 3 novos conjuntos de teste A/B no Meta Ads",
    description: "Configurar campanha CBO com públicos Lookalike 2% e testar vídeos UGC na primeira dobra.",
    assigneeName: "Lucas Mendes",
    priority: "Alta",
    status: "Em Andamento",
    startDate: "2026-08-01",
    dueDate: "2026-08-04",
    estimatedHours: 4.5,
    journeyStage: "Estruturação de Mídia & Tech",
    tags: ["Meta Ads", "A/B Test", "CBO"],
    slaPercentage: 92,
    checklists: [
      { id: "ck-101-1", taskId: "tsk-101", title: "Validar cópias dos anúncios", completed: true, assigneeName: "Gabriel Alencar" },
      { id: "ck-101-2", taskId: "tsk-101", title: "Configurar pixel e CAPI de servidor", completed: true, assigneeName: "Matheus Silva" },
      { id: "ck-101-3", taskId: "tsk-101", title: "Subir criativos no Gerenciador", completed: false, assigneeName: "Lucas Mendes" },
    ],
    commentsCount: 3,
    attachmentsCount: 2,
    updatedAt: "2026-08-03",
  },
  {
    id: "tsk-102",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    projectName: "Automação Klaviyo",
    serviceName: "CRM & Automação",
    title: "Ativar régua automatizada de e-mail de carrinho abandonado",
    description: "Sequência em 3 passos (15 min, 24h e 48h) com cupom dinâmico no Klaviyo.",
    assigneeName: "Lucas Mendes",
    priority: "Crítica",
    status: "Em Revisão",
    startDate: "2026-07-28",
    dueDate: "2026-08-03",
    estimatedHours: 6.0,
    journeyStage: "Estruturação de Mídia & Tech",
    tags: ["Klaviyo", "CRM", "Checkout"],
    slaPercentage: 88,
    checklists: [
      { id: "ck-102-1", taskId: "tsk-102", title: "Criar templates HTML no Klaviyo", completed: true, assigneeName: "Fernanda Lima" },
      { id: "ck-102-2", taskId: "tsk-102", title: "Testar envio simulado de e-mail", completed: true, assigneeName: "Lucas Mendes" },
    ],
    commentsCount: 5,
    attachmentsCount: 1,
    updatedAt: "2026-08-03",
  },
  {
    id: "tsk-103",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    projectName: "Funil B2B Google Search",
    serviceName: "Google Ads",
    title: "Negativar 16 termos de pesquisa amadores no Google Search",
    description: "Filtrar termos como 'grátis', 'download torrent' e 'curso' para otimizar o índice de qualidade.",
    assigneeName: "Matheus Silva",
    priority: "Média",
    status: "A Fazer",
    startDate: "2026-08-02",
    dueDate: "2026-08-05",
    estimatedHours: 2.0,
    journeyStage: "Execução & Otimização",
    tags: ["Google Ads", "Keywords", "B2B"],
    slaPercentage: 100,
    checklists: [
      { id: "ck-103-1", taskId: "tsk-103", title: "Extrair relatório de termos de pesquisa", completed: false, assigneeName: "Matheus Silva" },
    ],
    commentsCount: 1,
    attachmentsCount: 0,
    updatedAt: "2026-08-02",
  },
  {
    id: "tsk-104",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    projectName: "Branding & UGC Vídeos",
    serviceName: "Social Media",
    title: "Aprovação de roteiros de vídeos UGC de treino",
    description: "Revisão dos roteiros com o cliente antes do envio para os criadores de conteúdo.",
    assigneeName: "Fernanda Lima",
    priority: "Crítica",
    status: "Backlog",
    startDate: "2026-07-25",
    dueDate: "2026-07-30",
    estimatedHours: 3.5,
    journeyStage: "Diagnóstico & Setup",
    tags: ["UGC", "Vídeos", "Branding"],
    slaPercentage: 45,
    checklists: [
      { id: "ck-104-1", taskId: "tsk-104", title: "Enviar roteiros via WhatsApp", completed: true, assigneeName: "Fernanda Lima" },
    ],
    commentsCount: 8,
    attachmentsCount: 3,
    updatedAt: "2026-07-30",
  },
  {
    id: "tsk-105",
    companyId: "stellar-solar",
    clientName: "Stellar Solar",
    companyName: "Stellar Energia LTDA",
    projectName: "SEO & Landing Page Regional",
    serviceName: "Landing Pages",
    title: "Otimizar tempo de carregamento da Landing Page móvel",
    description: "Comprimir imagens WebP e minificar CSS/JS para atingir score 90+ no Google PageSpeed.",
    assigneeName: "Matheus Silva",
    priority: "Média",
    status: "Concluído",
    startDate: "2026-07-26",
    dueDate: "2026-08-01",
    estimatedHours: 5.0,
    journeyStage: "Execução & Otimização",
    tags: ["CRO", "PageSpeed", "Mobile"],
    slaPercentage: 100,
    checklists: [
      { id: "ck-105-1", taskId: "tsk-105", title: "Converter PNGs em WebP", completed: true, assigneeName: "Matheus Silva" },
      { id: "ck-105-2", taskId: "tsk-105", title: "Testar no Google PageSpeed", completed: true, assigneeName: "Matheus Silva" },
    ],
    commentsCount: 2,
    attachmentsCount: 1,
    updatedAt: "2026-08-01",
  },
];

export const mockAlienMaxTaskInsights: AlienMaxTaskInsight[] = [
  {
    id: "tsk-ins-1",
    type: "Aprovação",
    clientName: "Vortex Suplementos",
    companyId: "vortex-suplementos",
    title: "A campanha Meta Ads está aguardando aprovação há 4 dias",
    description: "O roteiro de vídeos UGC está travado na etapa de revisão. O Alien Max sugere notificar o cliente via WhatsApp.",
    confidenceScore: 96,
    recommendedAction: "Enviar mensagem automática de cobrança de feedback",
  },
  {
    id: "tsk-ins-2",
    type: "Atraso",
    clientName: "Vortex Suplementos",
    companyId: "vortex-suplementos",
    title: "Existem 4 tarefas críticas com SLA atrasado",
    description: "O percentual de SLA da conta caiu para 45%. Recomenda-se reagendar prazos ou focar o time nas entregáveis prioritárias.",
    confidenceScore: 94,
    recommendedAction: "Ajustar cronograma da etapa da Jornada de Abdução",
  },
  {
    id: "tsk-ins-3",
    type: "Gargalo",
    clientName: "Stellar Solar",
    companyId: "stellar-solar",
    title: "Gargalo recorrente na etapa de aprovação de Landing Page",
    description: "O tempo médio de revisão de páginas na Stellar Solar é 3.2x maior do que a média dos demais clientes.",
    confidenceScore: 91,
    recommendedAction: "Realizar reunião rápida de alinhamento de briefing com o fundador",
  },
  {
    id: "tsk-ins-4",
    type: "Sobrecarga",
    clientName: "Equipe Alien",
    companyId: "alien-team",
    title: "Sobrecarga de 18 horas identificada no setor de Social Media",
    description: "Fernanda Lima possui 7 tarefas ativas com vencimento no mesmo dia.",
    confidenceScore: 95,
    recommendedAction: "Sugestão: redistribuir 2 tarefas de criativos para Carla Ramos",
  },
];

export class TaskRepository {
  async getStats(): Promise<TaskStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockTaskStats,
          totalTasks: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockTaskStats;
  }

  async getTasks(): Promise<TaskItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("tasks").select("*");
      if (data && data.length > 0) {
        return data.map((t) => ({
          id: t.id,
          companyId: t.company_id,
          clientName: t.company_id,
          companyName: t.company_id,
          title: t.title,
          description: t.description || "",
          assigneeName: t.assignee_name,
          priority: t.priority as any,
          status: t.status as any,
          startDate: t.start_date,
          dueDate: t.due_date,
          estimatedHours: Number(t.estimated_hours) || 0,
          journeyStage: t.journey_stage,
          tags: t.tags || [],
          slaPercentage: t.sla_percentage || 100,
          checklists: [],
          commentsCount: 0,
          attachmentsCount: 0,
          updatedAt: t.updated_at.split("T")[0],
        }));
      }
    } catch {
      // Fallback
    }
    return mockTasks;
  }

  async getAlienMaxInsights(): Promise<AlienMaxTaskInsight[]> {
    return mockAlienMaxTaskInsights;
  }

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    try {
      const supabase = createBrowserClient();
      await supabase.from("tasks").update({ status: newStatus }).eq("id", taskId);
    } catch {
      // Ignora erro em modo local
    }
  }
}

export const taskRepository = new TaskRepository();
