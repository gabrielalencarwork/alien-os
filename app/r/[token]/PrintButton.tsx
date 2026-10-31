"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden h-8 px-3 rounded-lg border border-line text-xs text-muted hover:text-ink hover:border-line-strong"
    >
      Salvar em PDF
    </button>
  );
}
