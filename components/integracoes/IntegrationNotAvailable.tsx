import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";

/**
 * Tela para integrações que ainda não têm conexão real com a API.
 * Antes, essas telas mostravam números de exemplo fixos; agora deixam claro que não há dados.
 */
export function IntegrationNotAvailable({ name, description }: { name: string; description: string }) {
  return (
    <PageContainer>
      <div className="max-w-xl mx-auto pt-10 space-y-4">
        <Link href="/integracoes" className="text-xs text-muted hover:text-ink">
          ← Voltar para Integrações
        </Link>
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center space-y-3">
          <h1 className="font-display text-2xl font-bold text-ink">{name}</h1>
          <p className="text-sm text-body">{description}</p>
          <p className="text-[13px] text-muted">
            Esta integração ainda não está conectada ao Alien OS, então não há dados para mostrar. Peça a implementação
            quando ela for prioridade.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
