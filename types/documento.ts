/**
 * Definições de Documentos e Ativos (Alien OS)
 * Tabela Supabase: documents / storage buckets: client-files
 */

export type DocumentCategory = "Briefings" | "Contratos" | "Arquivos" | "Apresentações";

export type FileFormat = "pdf" | "figma" | "doc" | "sheet" | "img" | "video";

export interface Documento {
  id: string; // UUID
  clientId: string;
  name: string;
  category: DocumentCategory;
  size: string;
  sizeBytes?: number;
  updatedAt: string;
  format: FileFormat;
  url: string; // Storage Bucket Public/Signed URL
  uploadedBy?: string;
}
