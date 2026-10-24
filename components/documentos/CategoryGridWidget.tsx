"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { DocumentCategorySummary, DocumentCategory } from "@/lib/repositories/documentRepository";
import { FileTextIcon, ChevronRightIcon } from "@/components/icons";

export interface CategoryGridWidgetProps {
  categories: DocumentCategorySummary[];
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export function CategoryGridWidget({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryGridWidgetProps) {
  const formatBytes = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + " GB";
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(0) + " MB";
    return (bytes / 1024).toFixed(0) + " KB";
  };

  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line-soft">
        <div>
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-ink" />
            <h3 className="text-base font-bold text-ink tracking-tight">
              Biblioteca Central de Categorias ({categories.length} Categorias)
            </h3>
            <Badge variant="alien" size="sm">
              Organização por Pastas
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Explore os arquivos da agência organizados por área técnica, mídias e entregáveis
          </p>
        </div>

        {selectedCategory !== "Todas" && (
          <button
            type="button"
            onClick={() => onSelectCategory("Todas")}
            className="text-xs text-accent font-semibold hover:underline"
          >
            Limpar Filtro de Categoria
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.category;

          return (
            <button
              key={cat.category}
              type="button"
              onClick={() => onSelectCategory(cat.category)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between h-28 relative ${
                isSelected
                  ? "border-accent bg-accent/6 ring-2 ring-accent/30 shadow-xs"
                  : "border-line bg-canvas hover:bg-raised hover:border-line-strong"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="w-6 h-6 rounded-md bg-surface border border-line flex items-center justify-center font-mono text-[10px] font-bold text-ink">
                  {cat.filesCount}
                </span>
                <span className="text-[9px] font-mono text-subtle">
                  {cat.lastUpdated}
                </span>
              </div>

              <div className="space-y-0.5 mt-2">
                <h4 className="text-xs font-bold text-ink truncate">
                  {cat.category}
                </h4>
                <span className="text-[10px] font-mono text-muted block">
                  {formatBytes(cat.totalSize)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
