import React from "react";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { getClientById } from "@/lib/clientsData";
import { ClientGrowthWorkspaceView } from "@/components/clientes/ClientGrowthWorkspaceView";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <PageContainer>
      <ClientGrowthWorkspaceView client={client} />
    </PageContainer>
  );
}
