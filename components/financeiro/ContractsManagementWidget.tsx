"use client";

import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Contract } from "@/lib/repositories/financialRepository";
import { FileTextIcon, PlusIcon, ArrowUpRightIcon } from "@/components/icons";

export interface ContractsManagementWidgetProps {
  contracts: Contract[];
}

export function ContractsManagementWidget({ contracts }: ContractsManagementWidgetProps) {
  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <div className="flex items-center gap-2">
            <FileTextIcon className="w-4 h-4 text-[#111111]" />
            <h3 className="text-base font-bold text-[#111111] tracking-tight">
              Módulo de Gestão de Contratos (Contracts)
            </h3>
            <Badge variant="alien" size="sm">
              Tabela contracts
            </Badge>
          </div>
          <p className="text-xs text-[#71717A] mt-0.5">
            Controle de termos contratuais, vigência, renovação e arquivos PDF oficiais
          </p>
        </div>

        <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
          Novo Contrato
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E4E4E7] bg-[#FAFAFA] text-[10px] font-mono uppercase text-[#71717A]">
              <th className="py-3 px-3 font-semibold">Número do Contrato</th>
              <th className="py-3 px-3 font-semibold">Cliente & Empresa</th>
              <th className="py-3 px-3 font-semibold">Valor Mensal</th>
              <th className="py-3 px-3 font-semibold">Data de Início</th>
              <th className="py-3 px-3 font-semibold">Vigência</th>
              <th className="py-3 px-3 font-semibold">Renovação</th>
              <th className="py-3 px-3 font-semibold">Status</th>
              <th className="py-3 px-3 font-semibold text-right">PDF Contrato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F4F4F5] text-xs">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-[#71717A]">
                  Nenhum contrato cadastrado no momento.
                </td>
              </tr>
            ) : (
              contracts.map((ct) => (
                <tr key={ct.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#111111]">
                    {ct.contractNumber}
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-bold text-[#111111] block">{ct.clientName}</span>
                    <span className="text-[10px] text-[#71717A] block">{ct.companyName}</span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-[#4A8237]">
                    R$ {ct.monthlyValue.toLocaleString("pt-BR")} /mês
                  </td>

                  <td className="py-3 px-3 font-mono text-[#52525B]">
                    {ct.startDate}
                  </td>

                  <td className="py-3 px-3 text-[#52525B]">
                    {ct.durationMonths} meses
                  </td>

                  <td className="py-3 px-3 font-mono font-medium text-[#111111]">
                    {ct.renewalDate}
                  </td>

                  <td className="py-3 px-3">
                    <Badge
                      variant={
                        ct.status === "Ativo"
                          ? "alien"
                          : ct.status === "Em Renovação"
                          ? "dark"
                          : "gray"
                      }
                      size="sm"
                    >
                      {ct.status}
                    </Badge>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <a
                      href={ct.pdfUrl || "#"}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#4A8237] hover:underline"
                    >
                      <span>Download PDF</span>
                      <ArrowUpRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
