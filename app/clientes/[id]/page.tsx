import React from "react";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { ClientGrowthWorkspaceView } from "@/components/clientes/ClientGrowthWorkspaceView";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = await clientRepository.getById(id);

  if (!client) {
    notFound();
  }

  return (
    <PageContainer>
      <ClientGrowthWorkspaceView client={client} />
    </PageContainer>
  );
}
