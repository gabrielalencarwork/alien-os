/**
 * Repository Pattern: Document Repository (Alien OS)
 * Gerencia a leitura, upload e versionamento de documentos, briefings, criativos e contratos.
 * Conectado às tabelas Supabase: documents, document_versions, companies.
 * Sem dados mockados.
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

/** Espelha a tabela `document_versions`. */
export interface DocumentVersionItem {
  id: string;
  documentId: string;
  versionLabel: string;
  fileSize: number;
  storagePath: string;
  authorName: string;
  notes?: string;
  createdAt: string;
}

/** Espelha a tabela `documents` (campos `title`, `fileFormat` e `uploadedBy` são aliases usados pela UI). */
export interface DocumentItem {
  id: string;
  companyId: string;
  clientName: string;
  companyName: string;
  projectId?: string;
  projectName?: string;
  name: string;
  title: string;
  category: DocumentCategory;
  description: string;
  fileType: string;
  fileFormat: string;
  fileSize: number;
  storagePath: string;
  fileUrl: string;
  thumbnailUrl?: string;
  currentVersion: string;
  authorName: string;
  uploadedBy: string;
  linkedType?: string;
  createdAt: string;
  updatedAt: string;
  versionsCount: number;
  versions?: DocumentVersionItem[];
}

export interface DocumentCategorySummary {
  category: DocumentCategory;
  filesCount: number;
  lastUpdated: string;
  totalSize: number;
}

export interface DocumentStats {
  totalDocuments: number;
  usedStorageGb: number;
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

export class DocumentRepository {
  async getStats(): Promise<DocumentStats> {
    const emptyStats: DocumentStats = {
      totalDocuments: 0,
      usedStorageGb: 0,
      totalStorageGb: 100,
      uploadedThisMonth: 0,
      recentUploadsCount: 0,
      pendingDocumentsCount: 0,
      expiringContractsCount: 0,
      pendingBriefingsCount: 0,
      updatedVersionsCount: 0,
    };

    try {
      const documents = await this.getDocuments();
      if (documents.length === 0) return emptyStats;

      const totalSize = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
      const usedGb = Number((totalSize / (1024 * 1024 * 1024)).toFixed(2));

      return {
        totalDocuments: documents.length,
        usedStorageGb: usedGb,
        totalStorageGb: 100,
        uploadedThisMonth: documents.length,
        recentUploadsCount: documents.length,
        pendingDocumentsCount: 0,
        expiringContractsCount: 0,
        pendingBriefingsCount: 0,
        updatedVersionsCount: 0,
      };
    } catch {
      return emptyStats;
    }
  }

  async getCategorySummaries(): Promise<DocumentCategorySummary[]> {
    try {
      const documents = await this.getDocuments();
      if (documents.length === 0) return [];

      const map = new Map<DocumentCategory, { count: number; size: number }>();

      for (const d of documents) {
        const cat = d.category || "Outros";
        const cur = map.get(cat) || { count: 0, size: 0 };
        map.set(cat, { count: cur.count + 1, size: cur.size + (d.fileSize || 0) });
      }

      const summaries: DocumentCategorySummary[] = [];
      map.forEach((val, cat) => {
        summaries.push({
          category: cat,
          filesCount: val.count,
          lastUpdated: "Hoje",
          totalSize: val.size,
        });
      });

      return summaries;
    } catch {
      return [];
    }
  }

  async getDocuments(category?: DocumentCategory): Promise<DocumentItem[]> {
    try {
      const supabase = createBrowserClient();
      let query = supabase
        .from("documents")
        .select("*, companies(trade_name, legal_name), document_versions(*)")
        .eq("active", true)
        .order("updated_at", { ascending: false });
      if (category) {
        query = query.eq("category", category);
      }
      const { data, error } = await query;
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((d) => {
          const versions: DocumentVersionItem[] = (d.document_versions || [])
            .map((v: Record<string, unknown>) => ({
              id: String(v.id),
              documentId: String(v.document_id),
              versionLabel: String(v.version_label || "v1.0"),
              fileSize: Number(v.file_size) || 0,
              storagePath: String(v.storage_path || ""),
              authorName: String(v.author_name || ""),
              notes: v.notes ? String(v.notes) : undefined,
              createdAt: String(v.created_at || ""),
            }))
            .sort((a: DocumentVersionItem, b: DocumentVersionItem) => b.createdAt.localeCompare(a.createdAt));
          const name = d.name || "Documento sem nome";
          const author = d.author_name || "";
          return {
            id: d.id,
            companyId: d.company_id,
            clientName: d.companies?.trade_name || d.companies?.legal_name || "Interno",
            companyName: d.companies?.legal_name || d.companies?.trade_name || "",
            projectId: d.project_id || undefined,
            name,
            title: name,
            category: (d.category || "Outros") as DocumentCategory,
            description: d.notes || "",
            fileType: d.file_type || "pdf",
            fileFormat: (d.file_type || "pdf").toUpperCase(),
            fileSize: Number(d.file_size) || 0,
            storagePath: d.storage_path || "",
            fileUrl: "",
            currentVersion: d.current_version || "v1.0",
            authorName: author,
            uploadedBy: author,
            linkedType: d.linked_type || undefined,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            versionsCount: Math.max(versions.length, 1),
            versions,
          };
        });
      }
    } catch (err) {
      console.error("Erro ao ler documents no Supabase:", err);
    }
    return [];
  }

  async getDocumentById(id: string): Promise<DocumentItem | null> {
    const documents = await this.getDocuments();
    return documents.find((d) => d.id === id) || null;
  }

  async getAlienMaxInsights(): Promise<AlienMaxDocumentInsight[]> {
    return [];
  }
}

export const documentRepository = new DocumentRepository();
