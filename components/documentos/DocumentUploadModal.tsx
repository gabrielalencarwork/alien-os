"use client";

import React, { useState } from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { DocumentCategory, FileType } from "@/lib/repositories/documentRepository";
import { PlusIcon, FileTextIcon } from "@/components/icons";

export interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newDocName: string) => void;
}

export function DocumentUploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: DocumentUploadModalProps) {
  const [fileName, setFileName] = useState("");
  const [clientName, setClientName] = useState("Aura Health");
  const [category, setCategory] = useState<DocumentCategory>("Criativos");
  const [fileType, setFileType] = useState<FileType>("pdf");
  const [linkedType, setLinkedType] = useState<"Cliente" | "Projeto" | "Serviço" | "Campanha" | "Reunião">("Cliente");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleSimulateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    setUploading(true);
    // Simula upload para o Supabase Storage
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUploading(false);
    onUploadSuccess(fileName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-[#4A8237]" />
            <h3 className="text-lg font-bold text-[#111111] tracking-tight">
              Upload para Supabase Storage
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#71717A] hover:text-[#111111] font-mono"
          >
            Fechar ✕
          </button>
        </div>

        <form onSubmit={handleSimulateUpload} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#111111]">Nome do Arquivo *</label>
            <input
              type="text"
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="ex: Contrato_Prestacao_Aura_v2.pdf"
              className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Cliente Vinculado</label>
              <select
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
              >
                <option value="Aura Health">Aura Health</option>
                <option value="Lumina Skincare">Lumina Skincare</option>
                <option value="Nexus SaaS">Nexus SaaS</option>
                <option value="Vortex Suplementos">Vortex Suplementos</option>
                <option value="Stellar Solar">Stellar Solar</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#111111]">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
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
              <label className="font-semibold text-[#111111]">Tipo de Extensão</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
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
              <label className="font-semibold text-[#111111]">Vinculação Inteligente</label>
              <select
                value={linkedType}
                onChange={(e) => setLinkedType(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#FAFAFA] border border-[#E4E4E7] rounded-xl text-xs text-[#111111] outline-none"
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
            <label className="font-semibold text-[#111111]">Observações de Versionamento</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o que mudou nesta versão (ex: 'Ajuste de logo no rodapé')..."
              className="w-full p-3 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none"
            />
          </div>

          <div className="p-3 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1">
            <span className="text-[10px] font-mono uppercase text-[#4A8237] font-semibold block">
              Endereço no Supabase Storage:
            </span>
            <span className="text-[10px] font-mono text-[#71717A] block truncate">
              clientes/{clientName.toLowerCase().replace(/\s+/g, "-")}/{category.toLowerCase().replace(/\s+/g, "-")}/
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F4F4F5]">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={uploading}>
              {uploading ? "Enviando pro Storage..." : "Concluir Upload"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
