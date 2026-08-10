/**
 * Engine e Dados da Jornada de Abdução (Alien OS)
 * Módulo de acompanhamento evolutivo de clientes desde a assinatura até se tornarem Cases Alien.
 * Conectado às tabelas Supabase: timeline, tasks, documents, ai_insights, health_scores.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type JourneyStageId =
  | "onboarding"
  | "diagnostico"
  | "estruturacao"
  | "execucao"
  | "escala"
  | "case";

export type StageStatus = "Concluído" | "Em andamento" | "Pendente" | "Bloqueado";

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignee: string;
}

export interface LinkedTask {
  id: string;
  title: string;
  status: "Concluído" | "Em Execução" | "Pendente";
  dueDate: string;
}

export interface RelatedDocument {
  id: string;
  name: string;
  category: string;
  format: string;
  url: string;
}

export interface JourneyStageDetail {
  id: JourneyStageId;
  stepNumber: number;
  name: string;
  description: string;
  status: StageStatus;
  completionPercentage: number;
  assignees: string[];
  checklist: ChecklistItem[];
  linkedTasks: LinkedTask[];
  relatedDocuments: RelatedDocument[];
  aiRecommendations: string[];
  blockers?: {
    id: string;
    title: string;
    description: string;
    severity: "Crítico" | "Atenção";
  }[];
}

export function getDefaultJourneyStages(clientName: string): JourneyStageDetail[] {
  return [
    {
      id: "onboarding",
      stepNumber: 1,
      name: "Assinatura & Onboarding",
      description: "Assinatura do contrato, alinhamento inicial e liberação dos acessos às contas de mídia.",
      status: "Concluído",
      completionPercentage: 100,
      assignees: ["Gabriel Alencar (Head)", "Carla Ramos (Onboarding)"],
      checklist: [
        { id: "ck-1", title: "Contrato de prestação de serviços assinado", completed: true, assignee: "Carla Ramos" },
        { id: "ck-2", title: "Formulário de Onboarding preenchido pelo cliente", completed: true, assignee: "Cliente" },
        { id: "ck-3", title: "Acessos ao Meta Business Manager liberados", completed: true, assignee: "Equipe Tech" },
        { id: "ck-4", title: "Acessos à conta do Google Ads configurados", completed: true, assignee: "Equipe Tech" },
      ],
      linkedTasks: [
        { id: "tk-101", title: "Reunião de Kick-off realizada", status: "Concluído", dueDate: "Finalizada" },
        { id: "tk-102", title: "Configurar grupo oficial no WhatsApp", status: "Concluído", dueDate: "Finalizada" },
      ],
      relatedDocuments: [
        { id: "dc-101", name: `Contrato de Prestação - ${clientName}.pdf`, category: "Contratos", format: "pdf", url: "#" },
        { id: "dc-102", name: `Briefing Inicial - ${clientName}.pdf`, category: "Briefings", format: "pdf", url: "#" },
      ],
      aiRecommendations: [
        "Verificar permissões de administrador no Gerenciador de Anúncios para evitar pausas em testes.",
      ],
    },
    {
      id: "diagnostico",
      stepNumber: 2,
      name: "Diagnóstico & Setup",
      description: "Escaneamento digital Alien Max v1, auditoria de pixels e implementação da DataLayer.",
      status: "Concluído",
      completionPercentage: 100,
      assignees: ["Matheus Silva (Dados)", "Gabriel Alencar (Head)"],
      checklist: [
        { id: "ck-5", title: "Escaneamento Digital Alien Max v1 executado", completed: true, assignee: "Alien Max" },
        { id: "ck-6", title: "Instalação do Pixel do Meta Ads e CAPI no servidor", completed: true, assignee: "Matheus Silva" },
        { id: "ck-7", title: "Validação da DataLayer do GA4 e eventos e-commerce", completed: true, assignee: "Matheus Silva" },
        { id: "ck-8", title: "Aprovação do mapa de palavras-chave no Google", completed: true, assignee: "Gabriel Alencar" },
      ],
      linkedTasks: [
        { id: "tk-201", title: "Relatório de Diagnóstico Inicial Alien Max", status: "Concluído", dueDate: "Finalizado" },
        { id: "tk-202", title: "Auditoria do funil de conversão móvel", status: "Concluído", dueDate: "Finalizado" },
      ],
      relatedDocuments: [
        { id: "dc-201", name: `Relatório Diagnóstico Alien Max - ${clientName}.pdf`, category: "Apresentações", format: "pdf", url: "#" },
      ],
      aiRecommendations: [
        "Ativar rastreamento de eventos personalizados de checkout antes de liberar orçamento.",
      ],
    },
    {
      id: "estruturacao",
      stepNumber: 3,
      name: "Estruturação de Mídia & Tech",
      description: "Criação dos primeiros conjuntos de anúncios, páginas de alta conversão e réguas de CRM.",
      status: "Em andamento",
      completionPercentage: 75,
      assignees: ["Lucas Mendes (Mídia)", "Fernanda Lima (Design/UGC)"],
      checklist: [
        { id: "ck-9", title: "Desenvolvimento de 6 novos criativos em vídeo UGC", completed: true, assignee: "Fernanda Lima" },
        { id: "ck-10", title: "Criação e testes da Landing Page de alta conversão", completed: true, assignee: "Equipe Tech" },
        { id: "ck-11", title: "Estruturação da conta de Meta Ads (Topo, Meio e Fundo)", completed: true, assignee: "Lucas Mendes" },
        { id: "ck-12", title: "Ativação das réguas de e-mail de carrinho abandonado", completed: false, assignee: "Lucas Mendes" },
      ],
      linkedTasks: [
        { id: "tk-301", title: "Subir 3 conjuntos de teste A/B no Meta Ads", status: "Em Execução", dueDate: "Hoje" },
        { id: "tk-302", title: "Ajustar copy da chamada principal da Landing Page", status: "Pendente", dueDate: "Amanhã" },
      ],
      relatedDocuments: [
        { id: "dc-301", name: `Pauta de Criativos UGC - ${clientName}.docx`, category: "Briefings", format: "docx", url: "#" },
      ],
      aiRecommendations: [
        "Ativar régua automatizada no Klaviyo/CRM para recuperar até 14% do abandono de carrinho.",
      ],
      blockers: [
        {
          id: "blk-1",
          title: "Aprovação pendente dos vídeos UGC pelo cliente",
          description: "O cliente ainda não enviou a aprovação final dos roteiros de vídeo para subir as campanhas.",
          severity: "Atenção",
        },
      ],
    },
    {
      id: "execucao",
      stepNumber: 4,
      name: "Execução & Otimização",
      description: "Tração de tráfego pago, análise diária de ROAS e otimização da taxa de conversão (CRO).",
      status: "Pendente",
      completionPercentage: 25,
      assignees: ["Lucas Mendes (Mídia)", "Gabriel Alencar (Head)"],
      checklist: [
        { id: "ck-13", title: "Primeiros 14 dias de veiculação e coleta de dados", completed: true, assignee: "Lucas Mendes" },
        { id: "ck-14", title: "Otimização de orçamento por público campeão", completed: false, assignee: "Lucas Mendes" },
        { id: "ck-15", title: "Negativação de termos irrelevantes no Google Ads", completed: false, assignee: "Lucas Mendes" },
        { id: "ck-16", title: "Primeira reunião de resultados quinzenais", completed: false, assignee: "Gabriel Alencar" },
      ],
      linkedTasks: [
        { id: "tk-401", title: "Análise de frequência e taxa de clique (CTR)", status: "Pendente", dueDate: "Próxima semana" },
      ],
      relatedDocuments: [],
      aiRecommendations: [
        "Manter o ROAS alvo acima de 4.0x ajustando lances diários nas campanhas de Fundo de Funil.",
      ],
    },
    {
      id: "escala",
      stepNumber: 5,
      name: "Escala & Growth",
      description: "Aporte incremental de investimento, expansão para novos canais de tráfego e foco em LTV.",
      status: "Pendente",
      completionPercentage: 0,
      assignees: ["Gabriel Alencar (Head)", "Lucas Mendes (Mídia)"],
      checklist: [
        { id: "ck-17", title: "Escala horizontal de orçamento (+35% no budget)", completed: false, assignee: "Lucas Mendes" },
        { id: "ck-18", title: "Expansão de campanhas para TikTok Ads & Pinterest Ads", completed: false, assignee: "Lucas Mendes" },
        { id: "ck-19", title: "Otimização de LTV e recompra via WhatsApp automações", completed: false, assignee: "Equipe Tech" },
      ],
      linkedTasks: [],
      relatedDocuments: [],
      aiRecommendations: [
        "Aumentar o investimento em 20% a cada 3 dias mantendo a margem de contribuição estável.",
      ],
    },
    {
      id: "case",
      stepNumber: 6,
      name: "Case Alien (Apex)",
      description: "Cliente atinge maturidade máxima, métricas históricas de ROAS e se torna Case Oficial.",
      status: "Pendente",
      completionPercentage: 0,
      assignees: ["Gabriel Alencar (Head)", "Marketing Alien OS"],
      checklist: [
        { id: "ck-20", title: "Consolidação de 3 meses consecutivos de metas superadas", completed: false, assignee: "Gabriel Alencar" },
        { id: "ck-21", title: "Gravação de vídeo depoimento com o fundador da marca", completed: false, assignee: "Marketing Alien" },
        { id: "ck-22", title: "Publicação do estudo de caso no Portal da Alien OS", completed: false, assignee: "Marketing Alien" },
      ],
      linkedTasks: [],
      relatedDocuments: [],
      aiRecommendations: [
        "Qualificar a marca para o selo de Case Alien assim que ultrapassar R$ 300k de faturamento mensal.",
      ],
    },
  ];
}

export async function saveChecklistItemStatus(
  companyId: string,
  stageId: JourneyStageId,
  checkitemId: string,
  completed: boolean
) {
  try {
    const supabase = createBrowserClient();
    await supabase.from("timeline").insert({
      company_id: companyId,
      title: "Checklist Atualizado",
      activity_type: "Entregável",
      description: `Item de checklist (${checkitemId}) marcado como ${completed ? "Concluído" : "Pendente"}.`,
      author_name: "Operador de Growth",
      journey_stage: stageId,
    });
  } catch {
    // Ignora erro em modo local
  }
}
