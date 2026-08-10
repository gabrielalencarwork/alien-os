"use client";

import React from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { DocumentItem } from "@/lib/repositories/documentRepository";
import { FileTextIcon, ClockIcon, ArrowUpRightIcon } from "@/components/icons";

export interface DocumentVersionsModalProps {
  document: DocumentItem | null;
  onClose: () => void;
}

export function DocumentVersionsModal({
  document,
  onClose,
}: DocumentVersionsModalProps) {
  if (!document) return null;

  const versions = document.versions || [
    {
      id: "v-def-1",
      documentId: document.id,
      versionLabel: "v1.0",
      fileSize: document.fileSize,
      storagePath: document.storagePath,
      authorName: document.authorName,
      createdAt: document.updatedAt,
      notes: "Versão inicial publicada no repositório",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white border border-[#E4E4E7] rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-[#4A8237]" />
            <div>
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Histórico de Versionamento
              </h3>
              <span className="text-[10px] text-[#71717A] block truncate max-w-xs">
                {document.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#71717A] hover:text-[#111111] font-mono"
          >
            Fechar ✕
          </button>
        </div>

        {/* Current Active Version Banner */}
        <div className="p-3.5 rounded-xl bg-[#111111] text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono uppercase text-[#4A8237] font-bold block">
              Versão Ativa Atual
            </span>
            <div className="text-sm font-bold font-mono text-white">
              {document.currentVersion}
            </div>
          </div>
          <Badge variant="alien" size="sm">
            Em Uso
          </Badge>
        </div>

        {/* Versions Timeline List */}
        <div className="space-y-3 max-h-72 overflow-y-auto">
          {versions.map((ver, idx) => (
            <div
              key={ver.id || idx}
              className="p-3.5 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#111111]">
                  {ver.versionLabel}
                </span>
                <span className="text-[10px] font-mono text-[#71717A]">
                  {ver.createdAt}
                </span>
              </div>

              <div className="text-xs text-[#52525B]">
                Autor: <strong className="text-[#111111]">{ver.authorName}</strong>
              </div>

              {ver.notes && (
                <p className="text-[11px] text-[#71717A] italic">
                  "{ver.notes}"
                </p>
              )}

              <div className="pt-2 border-t border-[#E4E4E7] flex justify-end">
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-[#4A8237] font-bold hover:underline"
                >
                  <span>Baixar esta versão</span>
                  <ArrowUpRightIcon className="w-3 h-3 text-[#4A8237]" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[#F4F4F5] flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
