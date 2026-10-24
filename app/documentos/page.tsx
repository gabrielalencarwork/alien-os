"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  documentRepository,
  DocumentStats,
  DocumentCategorySummary,
  DocumentItem,
  AlienMaxDocumentInsight,
} from "@/lib/repositories/documentRepository";
import { DocumentMetricsGrid } from "@/components/documentos/DocumentMetricsGrid";
import { CategoryGridWidget } from "@/components/documentos/CategoryGridWidget";
import { DocumentTableWidget } from "@/components/documentos/DocumentTableWidget";
import { AlienMaxDocumentAdvisorWidget } from "@/components/documentos/AlienMaxDocumentAdvisorWidget";
import { DocumentUploadModal } from "@/components/documentos/DocumentUploadModal";
import { DocumentVersionsModal } from "@/components/documentos/DocumentVersionsModal";
import { PlusIcon, FileTextIcon } from "@/components/icons";

export default function DocumentosPage() {
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [categories, setCategories] = useState<DocumentCategorySummary[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [insights, setInsights] = useState<AlienMaxDocumentInsight[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Modals State
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedVersionDoc, setSelectedVersionDoc] = useState<DocumentItem | null>(null);

  const loadDocumentData = useCallback(async () => {
    try {
      const [statRes, catRes, docRes, insightRes] = await Promise.all([
        documentRepository.getStats(),
        documentRepository.getCategorySummaries(),
        documentRepository.getDocuments(),
        documentRepository.getAlienMaxInsights(),
      ]);

      setStats(statRes);
      setCategories(catRes);
      setDocuments(docRes);
      setInsights(insightRes);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocumentData();
  }, [loadDocumentData]);

  return (
    <PageContainer>
      <div className="space-y-6 pt-2 pb-12">
        {/* 1. Top Header Banner */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E4E4E7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="alien" showDot>
                  Sprint 13 · Central de Documentos
                </Badge>
                <span className="text-xs font-mono text-[#A1A1AA]">
                  Supabase Storage Ready
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
                Central Inteligente de Documentos
              </h1>
              <p className="text-sm text-[#52525B]">
                Repositório único da agência para armazenamento, organização por categorias, versionamento e vinculo operacional
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsUploadModalOpen(true)}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Upload de Arquivo
              </Button>
            </div>
          </div>
        </section>

        {loading || !stats ? (
          <div className="p-8 bg-white border border-[#E4E4E7] rounded-xl text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
            <span>Carregando repositório de documentos do Supabase Storage...</span>
          </div>
        ) : (
          <>
            {/* 2. Top Metrics Grid */}
            <section>
              <DocumentMetricsGrid stats={stats} />
            </section>

            {/* 3. Central Category Library Grid */}
            <section>
              <CategoryGridWidget
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            </section>

            {/* 4. Main 2-Column Grid (Files Table + Alien Max Advisor) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Files Table (2 Cols) */}
              <div className="lg:col-span-2">
                <DocumentTableWidget
                  documents={documents}
                  selectedCategory={selectedCategory}
                  onOpenVersionsModal={setSelectedVersionDoc}
                />
              </div>

              {/* Alien Max Document Advisor (1 Col) */}
              <div>
                <AlienMaxDocumentAdvisorWidget insights={insights} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={loadDocumentData}
      />

      {/* Versions Modal */}
      <DocumentVersionsModal
        document={selectedVersionDoc}
        onClose={() => setSelectedVersionDoc(null)}
      />
    </PageContainer>
  );
}
