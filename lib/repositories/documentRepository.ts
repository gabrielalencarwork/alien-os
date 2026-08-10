/**
 * Repository Pattern: Document Repository (Alien OS)
 * Gerencia a leitura, versionamento, uploads e busca inteligente da Central de Documentos.
 * Conectado às tabelas Supabase: documents, document_versions, folders, storage_links.
 */

import { createBrowserClient } from "@/lib/supabase/client";

export type DocumentCategory =
  | "Contratos"
  | "Briefings"
  | "Branding"
  | "Identidade Visual"
  | "Logos"
  | "Sites"
  | "Landing Pages"
  | "Criativos"
  | "Social Media"
  | "Google Ads"
  | "Meta Ads"
  | "Vídeos"
  | "Fotografias"
  | "Relatórios"
  | "Apresentações"
  | "Outros";

export type FileType =
  | "pdf"
  | "png"
  | "jpg"
  | "svg"
  | "ai"
  | "psd"
  | "docx"
  | "xlsx"
  | "pptx"
  | "zip"
  | "mp4";

export interface DocumentVersion {
  id: string;
  documentId: string;
  versionLabel: string;
  fileSize: number;
  storagePath: string;
  authorName: string;
  createdAt: string;
  notes?: string;
}

export interface DocumentItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  serviceName?: string;
  name: string;
  category: DocumentCategory;
  fileType: FileType;
  fileSize: number; // Bytes
  currentVersion: string;
  storagePath: string;
  authorName: string;
  linkedType: "Cliente" | "Projeto" | "Serviço" | "Campanha" | "Reunião";
  linkedId?: string;
  updatedAt: string;
  versions?: DocumentVersion[];
  notes?: string;
}

export interface DocumentCategorySummary {
  category: DocumentCategory;
  filesCount: number;
  lastUpdated: string;
  totalSize: number; // Bytes
}

export interface DocumentStats {
  totalDocuments: number;
  usedStorageGb: number; // GB
  totalStorageGb: number;
  uploadedThisMonth: number;
  recentUploadsCount: number;
  pendingDocumentsCount: number;
  expiringContractsCount: number;
  pendingBriefingsCount: number;
  updatedVersionsCount: number;
}

export interface AlienMaxDocumentInsight {
  id: string;
  type: "Contrato" | "Briefing" | "Branding" | "Duplicado" | "Sem Categoria";
  clientName: string;
  companyId: string;
  title: string;
  description: string;
  confidenceScore: number;
  recommendedAction: string;
}

export const mockDocumentStats: DocumentStats = {
  totalDocuments: 148,
  usedStorageGb: 42.8,
  totalStorageGb: 100,
  uploadedThisMonth: 24,
  recentUploadsCount: 8,
  pendingDocumentsCount: 3,
  expiringContractsCount: 2,
  pendingBriefingsCount: 1,
  updatedVersionsCount: 12,
};

export const mockCategorySummaries: DocumentCategorySummary[] = [
  { category: "Contratos", filesCount: 18, lastUpdated: "Hoje", totalSize: 45000000 },
  { category: "Briefings", filesCount: 14, lastUpdated: "Ontem", totalSize: 28000000 },
  { category: "Branding", filesCount: 22, lastUpdated: "29/07", totalSize: 180000000 },
  { category: "Identidade Visual", filesCount: 16, lastUpdated: "28/07", totalSize: 320000000 },
  { category: "Logos", filesCount: 25, lastUpdated: "26/07", totalSize: 120000000 },
  { category: "Sites", filesCount: 9, lastUpdated: "24/07", totalSize: 450000000 },
  { category: "Landing Pages", filesCount: 12, lastUpdated: "Hoje", totalSize: 290000000 },
  { category: "Criativos", filesCount: 34, lastUpdated: "Hoje", totalSize: 850000000 },
  { category: "Social Media", filesCount: 19, lastUpdated: "Ontem", totalSize: 410000000 },
  { category: "Google Ads", filesCount: 8, lastUpdated: "22/07", totalSize: 65000000 },
  { category: "Meta Ads", filesCount: 15, lastUpdated: "Hoje", totalSize: 980000000 },
  { category: "Vídeos", filesCount: 11, lastUpdated: "27/07", totalSize: 4200000000 },
  { category: "Fotografias", filesCount: 28, lastUpdated: "25/07", totalSize: 1900000000 },
  { category: "Relatórios", filesCount: 17, lastUpdated: "30/07", totalSize: 85000000 },
  { category: "Apresentações", filesCount: 10, lastUpdated: "28/07", totalSize: 140000000 },
  { category: "Outros", filesCount: 6, lastUpdated: "15/07", totalSize: 35000000 },
];

export const mockDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    companyId: "aura-health",
    clientName: "Aura Health",
    companyName: "Aura Suplementos LTDA",
    projectName: "Redesenho de E-commerce",
    serviceName: "Gestão de Tráfego",
    name: "Contrato_Prestacao_Servicos_Aura.pdf",
    category: "Contratos",
    fileType: "pdf",
    fileSize: 2450000,
    currentVersion: "v1.2 (Final)",
    storagePath: "clientes/aura-health/contratos/Contrato_Aura.pdf",
    authorName: "Gabriel Alencar",
    linkedType: "Cliente",
    updatedAt: "2026-07-29",
    versions: [
      { id: "v-1", documentId: "doc-1", versionLabel: "v1.0", fileSize: 2400000, storagePath: "", authorName: "Gabriel Alencar", createdAt: "2025-01-15", notes: "Minuta inicial" },
      { id: "v-2", documentId: "doc-1", versionLabel: "v1.2 (Final)", fileSize: 2450000, storagePath: "", authorName: "Gabriel Alencar", createdAt: "2025-01-18", notes: "Assinado com aditivo" },
    ],
  },
  {
    id: "doc-2",
    companyId: "lumina-skincare",
    clientName: "Lumina Skincare",
    companyName: "Lumina Cosméticos S/A",
    projectName: "Branding Q3",
    serviceName: "Branding",
    name: "Manual_Identidade_Visual_Lumina.pdf",
    category: "Branding",
    fileType: "pdf",
    fileSize: 18400000,
    currentVersion: "v2.0",
    storagePath: "clientes/lumina-skincare/branding/Manual_Lumina.pdf",
    authorName: "Fernanda Lima",
    linkedType: "Projeto",
    updatedAt: "2026-07-31",
    versions: [
      { id: "v-3", documentId: "doc-2", versionLabel: "v1.0", fileSize: 16000000, storagePath: "", authorName: "Fernanda Lima", createdAt: "2025-03-05", notes: "Versão prévia" },
      { id: "v-4", documentId: "doc-2", versionLabel: "v2.0", fileSize: 18400000, storagePath: "", authorName: "Fernanda Lima", createdAt: "2026-07-31", notes: "Atualização de paleta de cores" },
    ],
  },
  {
    id: "doc-3",
    companyId: "nexus-saas",
    clientName: "Nexus SaaS",
    companyName: "Nexus Tech LTDA",
    projectName: "Funil de Vendas B2B",
    serviceName: "Google Ads",
    name: "Briefing_Novo_Site_Nexus.docx",
    category: "Briefings",
    fileType: "docx",
    fileSize: 1200000,
    currentVersion: "v1.0",
    storagePath: "clientes/nexus-saas/sites/Briefing_Nexus.docx",
    authorName: "Matheus Silva",
    linkedType: "Cliente",
    updatedAt: "2026-07-28",
  },
  {
    id: "doc-4",
    companyId: "vortex-suplementos",
    clientName: "Vortex Suplementos",
    companyName: "Vortex Nutrição Eireli",
    projectName: "Campanha UGC TikTok",
    serviceName: "TikTok Ads",
    name: "Video_UGC_Vortex_Treino.mp4",
    category: "Vídeos",
    fileType: "mp4",
    fileSize: 84000000,
    currentVersion: "v1.1",
    storagePath: "clientes/vortex-suplementos/videos/UGC_Vortex.mp4",
    authorName: "Lucas Mendes",
    linkedType: "Campanha",
    updatedAt: "2026-07-30",
  },
  {
    id: "doc-5",
    companyId: "stellar-solar",
    clientName: "Stellar Solar",
    companyName: "Stellar Energia LTDA",
    projectName: "Captura de Leads Regional",
    serviceName: "Landing Pages",
    name: "Logo_Vetor_Stellar.svg",
    category: "Logos",
    fileType: "svg",
    fileSize: 340000,
    currentVersion: "v1.0",
    storagePath: "clientes/stellar-solar/branding/Logo_Stellar.svg",
    authorName: "Fernanda Lima",
    linkedType: "Cliente",
    updatedAt: "2026-07-25",
  },
];

export const mockAlienMaxDocumentInsights: AlienMaxDocumentInsight[] = [
  {
    id: "doc-ins-1",
    type: "Contrato",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    title: "O contrato de prestação de serviços expira em 12 dias",
    description: "O contrato CT-2025-072 anexado está na versão v1.0. O Alien Max recomenda solicitar a renovação assinada.",
    confidenceScore: 95,
    recommendedAction: "Gerar minuta de aditivo contratual no módulo Financeiro",
  },
  {
    id: "doc-ins-2",
    type: "Briefing",
    clientName: "Nexus SaaS",
    companyId: "nexus-saas",
    title: "O briefing do novo site ainda não foi concluído",
    description: "O arquivo Briefing_Novo_Site_Nexus.docx está pendente de preenchimento da seção de integrações de CRM.",
    confidenceScore: 92,
    recommendedAction: "Notificar o responsável pelo onboarding do cliente",
  },
  {
    id: "doc-ins-3",
    type: "Branding",
    clientName: "Aura Health",
    companyId: "aura-health",
    title: "A identidade visual não é atualizada há mais de 1 ano",
    description: "O manual de marca de 2025 necessita de revisão para novos formatos de anúncios em vídeo vertical (9:16).",
    confidenceScore: 88,
    recommendedAction: "Apresentar proposta de atualização de Brandbook",
  },
];

export class DocumentRepository {
  async getStats(): Promise<DocumentStats> {
    try {
      const supabase = createBrowserClient();
      const { count } = await supabase.from("documents").select("*", { count: "exact", head: true });
      if (count !== null && count > 0) {
        return {
          ...mockDocumentStats,
          totalDocuments: count,
        };
      }
    } catch {
      // Fallback local
    }
    return mockDocumentStats;
  }

  async getCategorySummaries(): Promise<DocumentCategorySummary[]> {
    return mockCategorySummaries;
  }

  async getDocuments(): Promise<DocumentItem[]> {
    try {
      const supabase = createBrowserClient();
      const { data } = await supabase.from("documents").select("*");
      if (data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          companyId: d.company_id,
          clientName: d.company_id,
          companyName: d.company_id,
          name: d.name,
          category: d.category as any,
          fileType: d.file_type as any,
          fileSize: Number(d.file_size),
          currentVersion: d.current_version,
          storagePath: d.storage_path,
          authorName: d.author_name,
          linkedType: d.linked_type as any,
          updatedAt: d.updated_at.split("T")[0],
          notes: d.notes,
        }));
      }
    } catch {
      // Fallback
    }
    return mockDocuments;
  }

  async getAlienMaxInsights(): Promise<AlienMaxDocumentInsight[]> {
    return mockAlienMaxDocumentInsights;
  }
}

export const documentRepository = new DocumentRepository();
