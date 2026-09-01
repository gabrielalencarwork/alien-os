"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { DocumentItem } from "@/lib/repositories/documentRepository";
import {
  SearchIcon,
  FileTextIcon,
  ClockIcon,
  ArrowUpRightIcon,
  ChevronRightIcon,
} from "@/components/icons";

export interface DocumentTableWidgetProps {
  documents: DocumentItem[];
  selectedCategory: string;
  onOpenVersionsModal: (doc: DocumentItem) => void;
}

export function DocumentTableWidget({
  documents,
  selectedCategory,
  onOpenVersionsModal,
}: DocumentTableWidgetProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<string>("Todos");

  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(0) + " KB";
  };

  const filteredDocs = documents.filter((doc: any) => {
    const docName = doc.title || doc.name || "";
    const docAuthor = doc.uploadedBy || doc.authorName || "";
    const docType = doc.fileFormat || doc.fileType || "";

    const matchesCategory =
      selectedCategory === "Todas" || doc.category === selectedCategory;

    const matchesType =
      fileTypeFilter === "Todos" || docType.toLowerCase() === fileTypeFilter.toLowerCase();

    const matchesSearch =
      docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      docAuthor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.projectName && doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesType && matchesSearch;
  });

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Tabela de Arquivos & Repositório ({filteredDocs.length} Documentos)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
            Busca inteligente por nome, cliente, projeto, categoria, responsável e extensão
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {["Todos", "PDF", "Figma", "ZIP", "PNG", "MP4", "DOCX"].map((ft) => (
            <button
              key={ft}
              type="button"
              onClick={() => setFileTypeFilter(ft)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors whitespace-nowrap ${
                fileTypeFilter === ft
                  ? "bg-[#111111] text-white"
                  : "bg-[#F4F4F5] text-[#52525B] hover:text-[#111111]"
              }`}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar arquivos por nome, cliente ou tag..."
          className="w-full pl-9 pr-4 py-2 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
        />
      </div>

      {/* Documents Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Nome do Arquivo</th>
              <th className="py-3 px-3 font-semibold">Cliente & Projeto</th>
              <th className="py-3 px-3 font-semibold">Categoria</th>
              <th className="py-3 px-3 font-semibold">Versão</th>
              <th className="py-3 px-3 font-semibold">Responsável</th>
              <th className="py-3 px-3 font-semibold">Data</th>
              <th className="py-3 px-3 font-semibold">Tamanho</th>
              <th className="py-3 px-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-xs">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-[#71717A]">
                  Nenhum documento encontrado.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-[#FAFAFA] transition-colors">
                  {/* File Icon + Name */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-[#FAFAFA] border border-[#E4E4E7] flex items-center justify-center font-mono text-[10px] font-bold text-[#111111] uppercase shrink-0">
                        {doc.fileFormat || doc.fileType || "DOC"}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-[#111111] block truncate">
                          {doc.title || doc.name}
                        </span>
                        <span className="text-[10px] text-[#71717A] block font-mono truncate">
                          {doc.storagePath || "Supabase Storage"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cliente & Projeto */}
                  <td className="py-3 px-3">
                    <span className="font-bold text-[#111111] block">{doc.clientName}</span>
                    <span className="text-[10px] text-[#71717A] block">
                      {doc.projectName || "Geral"}
                    </span>
                  </td>

                  {/* Categoria */}
                  <td className="py-3 px-3">
                    <Badge variant="dark" size="sm">
                      {doc.category}
                    </Badge>
                  </td>

                  {/* Versão */}
                  <td className="py-3 px-3">
                    <button
                      type="button"
                      onClick={() => onOpenVersionsModal(doc)}
                      className="font-mono text-xs font-bold text-[#4A8237] hover:underline"
                    >
                      v{doc.currentVersion || 1}
                    </button>
                  </td>

                  {/* Responsável */}
                  <td className="py-3 px-3 text-[#52525B]">
                    {doc.uploadedBy || doc.authorName || "Equipe Alien"}
                  </td>

                  {/* Data */}
                  <td className="py-3 px-3 font-mono text-[#71717A]">
                    {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("pt-BR") : "Hoje"}
                  </td>

                  {/* Tamanho */}
                  <td className="py-3 px-3 font-mono text-[#52525B]">
                    {formatBytes(doc.fileSize)}
                  </td>

                  {/* Ações */}
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenVersionsModal(doc)}
                        className="text-[11px] font-mono text-[#71717A] hover:text-[#111111] underline"
                      >
                        Histórico
                      </button>
                      <a
                        href={doc.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] font-mono font-bold text-[#4A8237] hover:underline"
                      >
                        <span>Download</span>
                        <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                      </a>
                    </div>
                  </td>
                </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
