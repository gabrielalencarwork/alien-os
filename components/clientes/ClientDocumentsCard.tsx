"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { Documento as DocumentItem } from "@/types";
import { DocumentUploadModal } from "@/components/documentos/DocumentUploadModal";
import { ArrowUpRightIcon, PlusIcon } from "@/components/icons";

export interface ClientDocumentsCardProps {
  documents?: DocumentItem[];
}

export function ClientDocumentsCard({ documents = [] }: ClientDocumentsCardProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const categories = ["Todos", "Briefings", "Contratos", "Arquivos", "Apresentações"];
  const docList = documents || [];

  const filteredDocs =
    activeCategory === "Todos"
      ? docList
      : docList.filter((doc) => doc.category === activeCategory);

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Documentos & Repositório do Cliente
          </h3>
          <p className="text-xs text-muted">
            Repositório centralizado com versionamento e suporte a Supabase Storage
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUploadOpen(true)}
          icon={<PlusIcon className="w-3.5 h-3.5" />}
        >
          Enviar Documento
        </Button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeCategory === cat
                ? "bg-inverse text-white"
                : "bg-raised text-body hover:text-ink hover:bg-line"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-3.5 rounded-xl bg-canvas border border-line flex items-center justify-between gap-3 hover:border-line-strong transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-surface border border-line flex items-center justify-center text-ink shrink-0 font-mono text-xs uppercase font-bold">
                {doc.format}
              </div>
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-xs font-bold text-ink truncate group-hover:text-accent transition-colors">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-muted">
                  <span className="font-mono text-accent font-bold">v1.0</span>
                  <span>·</span>
                  <span>{doc.category}</span>
                  <span>·</span>
                  <span>{doc.size}</span>
                  <span>·</span>
                  <span>{doc.updatedAt}</span>
                </div>
              </div>
            </div>

            <a
              href={doc.url}
              aria-label={`Visualizar documento ${doc.name}`}
              className="p-1.5 rounded-lg bg-surface border border-line text-muted hover:text-ink hover:bg-raised transition-colors shrink-0"
            >
              <ArrowUpRightIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </div>

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => {}}
      />
    </Card>
  );
}
