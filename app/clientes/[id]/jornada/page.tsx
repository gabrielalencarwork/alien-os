import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { getClientById } from "@/lib/clientsData";
import { InteractiveAbductionJourney } from "@/components/clientes/InteractiveAbductionJourney";
import { ChevronRightIcon } from "@/components/icons";

interface JornadaPageProps {
  params: Promise<{ id: string }>;
}

export default async function JornadaPage({ params }: JornadaPageProps) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <PageContainer>
      {/* Back Link */}
      <div className="pt-2">
        <Link
          href={`/clientes/${client.id}`}
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </span>
          <span>Voltar para Perfil de {client.name}</span>
        </Link>
      </div>

      {/* Header */}
      <section className="space-y-1 pb-4 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-2">
          <Badge variant="alien" showDot>
            Sprint 08 · Módulo de Jornada
          </Badge>
          <span className="text-xs font-mono text-[#A1A1AA]">
            Visão 360° da Conta
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          Jornada de Abdução: {client.name}
        </h1>
        <p className="text-sm text-[#52525B]">
          Acompanhamento dinâmico do ciclo de vida, entregáveis, bloqueios e avanço nas 6 etapas estratégicas
        </p>
      </section>

      {/* Interactive Abduction Journey Component */}
      <section className="pt-2">
        <InteractiveAbductionJourney clientId={client.id} clientName={client.name} />
      </section>
    </PageContainer>
  );
}
