import React from "react";
import { Badge } from "@/components/Badge";
import { IntegrationStatus } from "@/lib/repositories/integrationRepository";

export interface IntegrationStatusBadgeProps {
  status: IntegrationStatus;
}

export function IntegrationStatusBadge({ status }: IntegrationStatusBadgeProps) {
  if (status === "Conectado") {
    return (
      <Badge variant="alien" showDot size="sm">
        Conectado
      </Badge>
    );
  }

  if (status === "Token Expirando") {
    return (
      <Badge variant="gray" size="sm" className="bg-amber-100 text-amber-800 border-amber-200">
        Token Expirando
      </Badge>
    );
  }

  if (status === "Erro de Autenticação") {
    return (
      <Badge variant="dark" size="sm" className="bg-red-950 text-red-200 border-red-800">
        Erro de Autenticação
      </Badge>
    );
  }

  return (
    <Badge variant="outline" size="sm">
      {status}
    </Badge>
  );
}
