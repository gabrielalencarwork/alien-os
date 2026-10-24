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

  const versions = document.versions && document.versions.length > 0 ? document.versions : [
    {
      id: "v-def-1",
      documentId: document.id,
      versionLabel: document.currentVersion,
      fileSize: document.fileSize,
      storagePath: document.storagePath,
      authorName: document.authorName,
      createdAt: document.updatedAt,
      notes: undefined as string | undefined,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-surface border border-line rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-line-soft">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-base font-bold text-ink tracking-tight">
                Histórico de Versionamento
              </h3>
              <span className="text-[10px] text-muted block truncate max-w-xs">
                {document.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-ink font-mono"
          >
            Fechar ✕
          </button>
        </div>

        {/* Current Active Version Banner */}
        <div className="p-3.5 rounded-xl bg-inverse text-white flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono uppercase text-accent font-bold block">
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
              className="p-3.5 rounded-xl bg-canvas border border-line space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-ink">
                  {ver.versionLabel}
                </span>
                <span className="text-[10px] font-mono text-muted">
                  {ver.createdAt}
                </span>
              </div>

              <div className="text-xs text-body">
                Autor: <strong className="text-ink">{ver.authorName}</strong>
              </div>

              {ver.notes && (
                <p className="text-[11px] text-muted italic">
                  "{ver.notes}"
                </p>
              )}

              <div className="pt-2 border-t border-line flex justify-end">
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-[10px] font-mono text-accent font-bold hover:underline"
                >
                  <span>Baixar esta versão</span>
                  <ArrowUpRightIcon className="w-3 h-3 text-accent" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-line-soft flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
