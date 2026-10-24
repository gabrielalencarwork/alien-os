import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { IntegrationAccountItem } from "@/lib/repositories/integrationRepository";

export interface IntegrationAccountsTableProps {
  accounts: IntegrationAccountItem[];
}

export function IntegrationAccountsTable({ accounts }: IntegrationAccountsTableProps) {
  return (
    <Card className="border-line bg-surface space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-line-soft">
        <div>
          <h3 className="text-base font-bold text-ink tracking-tight">
            Contas & Propriedades Vinculadas ({accounts.length} Ativas)
          </h3>
          <p className="text-xs text-muted mt-0.5">
            CIDs de anúncios, propriedades GA4, Pixel IDs e Business Managers conectados
          </p>
        </div>

        <Badge variant="alien" size="sm">
          OAuth 2.0 Ativo
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-line bg-canvas text-[10px] font-mono uppercase text-muted">
              <th className="py-3 px-3 font-semibold">Cliente</th>
              <th className="py-3 px-3 font-semibold">Nome da Conta / BM</th>
              <th className="py-3 px-3 font-semibold">ID Externo</th>
              <th className="py-3 px-3 font-semibold">Responsável</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Última Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-canvas transition-colors">
                <td className="py-3 px-3 font-bold text-ink">
                  {acc.clientName}
                </td>
                <td className="py-3 px-3 font-medium text-ink">
                  {acc.accountName}
                </td>
                <td className="py-3 px-3 font-mono text-body">
                  {acc.accountExternalId}
                </td>
                <td className="py-3 px-3 text-muted">
                  {acc.managerName}
                </td>
                <td className="py-3 px-3">
                  <Badge variant="alien" size="sm">
                    {acc.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-mono text-muted">
                  {acc.lastSyncedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
