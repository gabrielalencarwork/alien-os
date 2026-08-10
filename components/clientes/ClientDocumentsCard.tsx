"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { DocumentItem } from "@/lib/clientsData";
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
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Documentos & Repositório do Cliente
          </h3>
          <p className="text-xs text-[#71717A]">
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
                ? "bg-[#111111] text-white"
                : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111] hover:bg-[#E4E4E7]"
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
            className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-between gap-3 hover:border-[#D4D4D8] transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-white border border-[#E4E4E7] flex items-center justify-center text-[#111111] shrink-0 font-mono text-xs uppercase font-bold">
                {doc.format}
              </div>
              <div className="min-w-0 space-y-0.5">
                <h4 className="text-xs font-bold text-[#111111] truncate group-hover:text-[#4A8237] transition-colors">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-[#71717A]">
                  <span className="font-mono text-[#4A8237] font-bold">v1.0</span>
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
              className="p-1.5 rounded-lg bg-white border border-[#E4E4E7] text-[#71717A] hover:text-[#111111] hover:bg-[#F4F4F5] transition-colors shrink-0"
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
