import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { IntegrationAccountItem } from "@/lib/repositories/integrationRepository";

export interface IntegrationAccountsTableProps {
  accounts: IntegrationAccountItem[];
}

export function IntegrationAccountsTable({ accounts }: IntegrationAccountsTableProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Contas & Propriedades Vinculadas ({accounts.length} Ativas)
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5">
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
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Cliente</th>
              <th className="py-3 px-3 font-semibold">Nome da Conta / BM</th>
              <th className="py-3 px-3 font-semibold">ID Externo</th>
              <th className="py-3 px-3 font-semibold">Responsável</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold">Última Sync</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5]">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-[#FAFAFA] transition-colors">
                <td className="py-3 px-3 font-bold text-[#111111]">
                  {acc.clientName}
                </td>
                <td className="py-3 px-3 font-medium text-[#111111]">
                  {acc.accountName}
                </td>
                <td className="py-3 px-3 font-mono text-[#52525B]">
                  {acc.accountExternalId}
                </td>
                <td className="py-3 px-3 text-[#71717A]">
                  {acc.managerName}
                </td>
                <td className="py-3 px-3">
                  <Badge variant="alien" size="sm">
                    {acc.status}
                  </Badge>
                </td>
                <td className="py-3 px-3 font-mono text-[#71717A]">
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
