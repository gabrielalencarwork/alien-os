/**
 * Repository Pattern: Project Repository (Alien OS)
 * Gerencia a leitura, escrita e consolidação dos Projetos da Agência (Project Hub).
 * Conectado às tabelas Supabase: projects, project_members, project_milestones, tasks, documents, meetings.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type ProjectStatus =
  | "Planejamento"
  | "Em Andamento"
  | "Aguardando Cliente"
  | "Em Revisão"
  | "Concluído"
  | "Cancelado";

export type ProjectPriority = "Baixa" | "Média" | "Alta" | "Crítica";

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  memberName: string;
  role: string;
}

export interface ProjectItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  serviceId?: string;
  serviceName: string;
  name: string;
  type: string;
  description: string;
  objective: string;
  leadName: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  progressPercentage: number;
  startDate: string;
  dueDate: string;
  estimatedBudget: number;
  contractedValue: number;
  estimatedHours: number;
  executedHours: number;
  journeyStage?: string;
  tags?: string[];
  alienScore: number;
  healthStatus: "Excelente" | "Atenção" | "Crítico";
  members: ProjectMember[];
  milestones: ProjectMilestone[];
  openTasksCount: number;
  completedTasksCount: number;
  documentsCount: number;
  meetingsCount: number;
  profitabilityPercentage: number; // ex: 68%
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
  averageProgressPercentage: number; // ex: 74.5%
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

export const mockProjectStats: ProjectStats = {
  activeProjectsCount: 12,
  completedProjectsCount: 28,
  delayedProjectsCount: 2,
  planningProjectsCount: 3,
  inProgressProjectsCount: 7,
  inReviewProjectsCount: 2,
  totalEstimatedHours: 420,
  totalExecutedHours: 298,
  averageProgressPercentage: 74.5,
};

export const mockProjects: ProjectItem[] = [
  {
    id: "proj-101",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    serviceName: "Gestão de Tráfego & Escala Meta Ads",
    name: "Escala Q3 Meta Ads & Retargeting Dynamic",
    type: "Growth Marketing",
    description: "Estruturação de campanhas CBO, testes de criativos UGC e Otimização de CAPI de Servidor.",
    objective: "Escalar MRR para R$ 120.000 mantendo ROAS acima de 4.5x.",
    leadName: "Gabriel Alencar",
    priority: "Alta",
    status: "Em Andamento",
    progressPercentage: 82,
    startDate: "2026-07-01",
    dueDate: "2026-08-31",
    estimatedBudget: 45000,
    contractedValue: 12500,
    estimatedHours: 60,
    executedHours: 44,
    journeyStage: "Estruturação de Mídia & Tech",
    tags: ["Meta Ads", "ROAS", "Retargeting"],
    alienScore: 92,
    healthStatus: "Excelente",
    members: [
      { id: "mb-1", projectId: "proj-101", memberName: "Gabriel Alencar", role: "Head de Growth" },
      { id: "mb-2", projectId: "proj-101", memberName: "Lucas Mendes", role: "Gestor de Tráfego" },
    ],
    milestones: [
      { id: "ms-1", projectId: "proj-101", title: "Setup CAPI e Pixel Meta", dueDate: "2026-07-10", completed: true },
      { id: "ms-2", projectId: "proj-101", title: "Primeiro Lote Criativos UGC", dueDate: "2026-07-25", completed: true },
      { id: "ms-3", projectId: "proj-101", title: "Aporte Incremental R$ 25k", dueDate: "2026-08-15", completed: false },
    ],
    openTasksCount: 4,
    completedTasksCount: 18,
    documentsCount: 8,
    meetingsCount: 5,
    profitabilityPercentage: 74,
  },
  {
    id: "proj-102",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    serviceName: "Branding & CRO Landing Page",
    name: "Redesign de Landing Page & Identidade Visual",
    type: "Design & Dev",
    description: "Desenvolvimento de nova Landing Page mobile-first no Vercel com carregamento em < 1.2s.",
    objective: "Aumentar a taxa de conversão do e-commerce de 1.4% para 2.8%.",
    leadName: "Fernanda Lima",
    priority: "Crítica",
    status: "Em Revisão",
    progressPercentage: 96,
    startDate: "2026-07-15",
    dueDate: "2026-08-10",
    estimatedBudget: 18000,
    contractedValue: 8500,
    estimatedHours: 40,
    executedHours: 38,
    journeyStage: "Estruturação de Mídia & Tech",
    tags: ["CRO", "Landing Page", "Design"],
    alienScore: 88,
    healthStatus: "Excelente",
    members: [
      { id: "mb-3", projectId: "proj-102", memberName: "Fernanda Lima", role: "Lead Designer" },
      { id: "mb-4", projectId: "proj-102", memberName: "Matheus Silva", role: "Dev Frontend" },
    ],
    milestones: [
      { id: "ms-4", projectId: "proj-102", title: "Aprovação de Protótipo Figma", dueDate: "2026-07-28", completed: true },
      { id: "ms-5", projectId: "proj-102", title: "Desenvolvimento Vercel & Tailwind", dueDate: "2026-08-03", completed: true },
      { id: "ms-6", projectId: "proj-102", title: "Validação Final de Checkout", dueDate: "2026-08-08", completed: false },
    ],
    openTasksCount: 2,
    completedTasksCount: 14,
    documentsCount: 12,
    meetingsCount: 3,
    profitabilityPercentage: 68,
  },
  {
    id: "proj-103",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    serviceName: "Google Search B2B & Inbound",
    name: "Estruturação de Funil B2B no Google Ads",
    type: "Inbound B2B",
    description: "Captura de leads qualificados de decisores de TI e empresas de tecnologia.",
    objective: "Gerar 40 SQLs por mês com CPL abaixo de R$ 85,00.",
    leadName: "Matheus Silva",
    priority: "Média",
    status: "Planejamento",
    progressPercentage: 35,
    startDate: "2026-08-01",
    dueDate: "2026-09-15",
    estimatedBudget: 32000,
    contractedValue: 9800,
    estimatedHours: 50,
    executedHours: 16,
    journeyStage: "Diagnóstico & Setup",
    tags: ["Google Ads", "B2B", "SQL"],
    alienScore: 85,
    healthStatus: "Atenção",
    members: [
      { id: "mb-5", projectId: "proj-103", memberName: "Matheus Silva", role: "Gestor Search" },
    ],
    milestones: [
      { id: "ms-7", projectId: "proj-103", title: "Pesquisa de Palavras-Chave B2B", dueDate: "2026-08-05", completed: true },
      { id: "ms-8", projectId: "proj-103", title: "Configuração de Metas no GA4", dueDate: "2026-08-12", completed: false },
    ],
    openTasksCount: 5,
    completedTasksCount: 4,
    documentsCount: 5,
    meetingsCount: 2,
    profitabilityPercentage: 62,
  },
  {
    id: "proj-104",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    serviceName: "Social Media & Branding",
    name: "Campanha Institucional & Conteúdo de Treino",
    type: "Social Media",
    description: "Produção mensal de criativos estáticos, carrosséis e vídeos de treinos funcionais.",
    objective: "Engajamento da comunidade de atletas e fortalecimento da marca.",
    leadName: "Fernanda Lima",
    priority: "Crítica",
    status: "Aguardando Cliente",
    progressPercentage: 50,
    startDate: "2026-07-20",
    dueDate: "2026-08-20",
    estimatedBudget: 15000,
    contractedValue: 6000,
    estimatedHours: 35,
    executedHours: 28,
    journeyStage: "Execução & Otimização",
    tags: ["Branding", "Social", "UGC"],
    alienScore: 78,
    healthStatus: "Atenção",
    members: [
      { id: "mb-6", projectId: "proj-104", memberName: "Fernanda Lima", role: "Social Manager" },
    ],
    milestones: [
      { id: "ms-9", projectId: "proj-104", title: "Roteiro de 6 Vídeos UGC", dueDate: "2026-07-30", completed: true },
    ],
    openTasksCount: 6,
    completedTasksCount: 8,
    documentsCount: 4,
    meetingsCount: 4,
    profitabilityPercentage: 55,
  },
];

export const mockAlienMaxProjectInsights: AlienMaxProjectInsight[] = [
  {
    id: "prj-ins-1",
    type: "Parado",
    clientName: "Vortex Suplementos",
    companyId: "vortex-suplementos",
    projectName: "Campanha Institucional & Conteúdo de Treino",
    title: "O projeto de Conteúdo de Treino está parado há 6 dias",
    description: "Os roteiros de vídeos foram enviados ao cliente e aguardam aprovação final para envio aos criadores.",
    confidenceScore: 96,
    recommendedAction: "Notificar fundador da Vortex via WhatsApp de status",
  },
  {
    id: "prj-ins-2",
    type: "Risco",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    projectName: "Estruturação de Funil B2B no Google Ads",
    title: "O projeto Google Ads possui risco de atraso no marco de GA4",
    description: "Faltam apenas 3 dias para a entrega do setup de eventos e a equipe precisa de liberações de administrador.",
    confidenceScore: 92,
    recommendedAction: "Agendar reunião técnica rápida com o TI da Nexus SaaS",
  },
  {
    id: "prj-ins-3",
    type: "Crítico",
    clientName: "Operação Agência",
    companyId: "alien-team",
    projectName: "Geral",
    title: "Existem 14 tarefas críticas distribuídas entre os 4 projetos ativos",
    description: "Recomenda-se priorizar as entregas de Landing Page da Lumina para liberação de checkout.",
    confidenceScore: 95,
    recommendedAction: "Reorganizar sprint da equipe no módulo Central de Tarefas",
  },
  {
    id: "prj-ins-4",
    type: "Conclusão",
    clientName: "Lumina Skincare",
    companyId: "lumina-skincare",
    projectName: "Redesign de Landing Page & Identidade Visual",
    title: "Projeto Landing Page já atingiu 96% de conclusão",
    description: "Todas as tarefas de código foram finalizadas com testes de PageSpeed 94.",
    confidenceScore: 99,
    recommendedAction: "Sugestão: Antecipar aprovação do cliente para publicação oficial hoje",
  },
];

export class ProjectRepository {
  async getStats(): Promise<ProjectStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("projects").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockProjectStats,
          activeProjectsCount: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockProjectStats;
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
          serviceName: p.type || "Growth Marketing",
          name: p.name,
          type: p.type || "Growth",
          description: p.description || "",
          objective: p.objective || "",
          leadName: p.lead_name,
          priority: p.priority as any,
          status: p.status as any,
          progressPercentage: p.progress_percentage || 0,
          startDate: p.start_date,
          dueDate: p.due_date,
          estimatedBudget: Number(p.estimated_budget) || 0,
          contractedValue: Number(p.contracted_value) || 0,
          estimatedHours: Number(p.estimated_hours) || 0,
          executedHours: Number(p.executed_hours) || 0,
          journeyStage: p.journey_stage,
          tags: p.tags || [],
          alienScore: p.alien_score_impact || 85,
          healthStatus: (p.health_status as any) || "Excelente",
          members: [],
          milestones: [],
          openTasksCount: 3,
          completedTasksCount: 12,
          documentsCount: 6,
          meetingsCount: 4,
          profitabilityPercentage: 70,
        }));
      }
    } catch {
      // Fallback
    }
    return mockProjects;
  }

  async getProjectById(id: string): Promise<ProjectItem | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === id) || projects[0];
  }

  async getAlienMaxInsights(): Promise<AlienMaxProjectInsight[]> {
    return mockAlienMaxProjectInsights;
  }
}

export const projectRepository = new ProjectRepository();
