"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { DocumentCategory, FileType } from "@/lib/repositories/documentRepository";
import { FileTextIcon } from "@/components/icons";
import { ClientSelect } from "@/components/ClientSelect";

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const [fileName, setFileName] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Criativos");
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [linkedType, setLinkedType] = useState<"Cliente" | "Projeto" | "Serviço" | "Campanha" | "Reunião">("Cliente");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  // O envio real de arquivos para o Supabase Storage ainda não foi implementado.
  // Em vez de simular sucesso (o que esconderia o problema), o envio fica desativado.
  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-line-soft">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-bold text-ink tracking-tight">
              Upload para Supabase Storage
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink font-mono"
          >
            Fechar ✕
          </button>
        </div>

        <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-ink">Nome do Arquivo *</label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="ex: Contrato_Prestacao_Aura_v2.pdf"
              className="w-full px-3.5 py-2.5 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Cliente Vinculado</label>
              <ClientSelect value={companyId} onChange={setCompanyId} />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="Contratos">Contratos</option>
                <option value="Briefings">Briefings</option>
                <option value="Branding">Branding</option>
                <option value="Identidade Visual">Identidade Visual</option>
                <option value="Logos">Logos</option>
                <option value="Sites">Sites</option>
                <option value="Landing Pages">Landing Pages</option>
                <option value="Criativos">Criativos</option>
                <option value="Social Media">Social Media</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Meta Ads">Meta Ads</option>
                <option value="Vídeos">Vídeos</option>
                <option value="Fotografias">Fotografias</option>
                <option value="Relatórios">Relatórios</option>
                <option value="Apresentações">Apresentações</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-ink">Tipo de Extensão</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="pdf">PDF</option>
                <option value="png">PNG</option>
                <option value="jpg">JPG</option>
                <option value="svg">SVG</option>
                <option value="ai">AI (Illustrator)</option>
                <option value="psd">PSD (Photoshop)</option>
                <option value="docx">DOCX (Word)</option>
                <option value="xlsx">XLSX (Excel)</option>
                <option value="pptx">PPTX (PowerPoint)</option>
                <option value="zip">ZIP</option>
                <option value="mp4">MP4 (Vídeo)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-ink">Vinculação Inteligente</label>
              <select
                value={linkedType}
                onChange={(e) => setLinkedType(e.target.value as any)}
                className="w-full px-3 py-2 bg-canvas border border-line rounded-xl text-xs text-ink outline-none"
              >
                <option value="Cliente">Cliente</option>
                <option value="Projeto">Projeto</option>
                <option value="Serviço">Serviço</option>
                <option value="Campanha">Campanha</option>
                <option value="Reunião">Reunião</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-ink">Observações de Versionamento</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o que mudou nesta versão (ex: 'Ajuste de logo no rodapé')..."
              className="w-full p-3 bg-canvas border border-line focus:bg-surface focus:border-accent rounded-xl text-xs text-ink outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-canvas border border-line space-y-1">
            <span className="text-[10px] font-mono uppercase text-accent font-semibold block">
              Endereço no Supabase Storage:
            </span>
            <span className="text-[10px] font-mono text-muted block truncate">
              clientes/{companyId || "interno"}/{category.toLowerCase().replace(/\s+/g, "-")}/
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            O envio de arquivos para o Supabase Storage ainda não está ativo. Esta função será
            liberada na próxima atualização do Alien OS.
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line-soft">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled>
              Upload indisponível
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
