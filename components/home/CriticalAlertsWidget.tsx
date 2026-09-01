"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { AlertTriangleIcon, CheckCircle2Icon, ChevronRightIcon } from "@/components/icons";
import { clientRepository } from "@/lib/repositories/clientRepository";
import { campaignRepository } from "@/lib/repositories/campaignRepository";

interface CriticalAlert {
  id: string;
  client: string;
  clientId: string;
  severity: "Crítico" | "Atenção";
  issue: string;
  suggestedFix: string;
}

export function CriticalAlertsWidget() {
  const [alerts, setAlerts] = useState<CriticalAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAlerts() {
      try {
        const [clients, campaigns] = await Promise.all([
          clientRepository.getAll(),
          campaignRepository.getCampaigns(),
        ]);

        const detectedAlerts: CriticalAlert[] = [];

        // Verifica clientes com status de atenção ou risco
        for (const c of clients) {
          if (c.healthStatus === "Atenção" || c.healthStatus === "Crítico") {
            detectedAlerts.push({
              id: `alt-cli-${c.id}`,
              client: c.name,
              clientId: c.id,
              severity: c.healthStatus === "Crítico" ? "Crítico" : "Atenção",
              issue: `Cliente em status de ${c.healthStatus}. Necessário alinhamento de escopo e entregáveis.`,
              suggestedFix: "Agendar reunião de alinhamento com o responsável da conta.",
            });
          }
        }

        // Verifica campanhas com ROAS abaixo de 2.0
        for (const cmp of campaigns) {
          if (cmp.status === "Ativa" && cmp.spentAmount > 500 && cmp.roas > 0 && cmp.roas < 1.5) {
            detectedAlerts.push({
              id: `alt-cmp-${cmp.id}`,
              client: cmp.clientName,
              clientId: cmp.companyId,
              severity: "Crítico",
              issue: `Campanha "${cmp.name}" com ROAS ${cmp.roas}x abaixo do ponto de equilíbrio.`,
              suggestedFix: "Pausar criativos com fadiga e reavaliar segmentação de público.",
            });
          }
        }

        setAlerts(detectedAlerts);
      } catch (err) {
        console.error("Erro ao carregar alertas:", err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F4F4F5]">
        <div className="flex items-center gap-2">
          <AlertTriangleIcon className="w-4 h-4 text-[#111111]" />
          <h3 className="text-base font-bold text-[#111111]">
            Alertas Críticos & Gestão de Risco
          </h3>
        </div>
        <Badge variant={alerts.length > 0 ? "dark" : "alien"} size="sm">
          {alerts.length > 0 ? `${alerts.length} Conta${alerts.length > 1 ? "s" : ""} em Atenção` : "Operação Estável"}
        </Badge>
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-[#71717A] flex items-center justify-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full border-2 border-[#4A8237] border-t-transparent animate-spin" />
          <span>Verificando saúde das contas no Supabase...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-[rgba(74,130,55,0.1)] text-[#4A8237] flex items-center justify-center shrink-0">
            <CheckCircle2Icon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#111111] block">
              Nenhum alerta crítico ou risco detectado
            </span>
            <p className="text-xs text-[#71717A] leading-relaxed">
              Todas as contas sincronizadas e clientes cadastrados estão operando dentro dos parâmetros esperados.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className="p-4 rounded-xl bg-amber-50/40 border border-amber-200/80 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#111111]">
                    {alt.client}
                  </span>
                  <Badge
                    variant="dark"
                    size="sm"
                    className={
                      alt.severity === "Crítico"
                        ? "bg-red-950 text-red-200 border-red-800"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }
                  >
                    {alt.severity}
                  </Badge>
                </div>

                <p className="text-xs text-[#111111] leading-relaxed">
                  {alt.issue}
                </p>

                <div className="text-[11px] text-[#52525B] pt-1">
                  <strong className="text-[#111111]">Solução Sugerida: </strong>
                  {alt.suggestedFix}
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/50 flex justify-end">
                <Link
                  href={`/clientes/${alt.clientId}`}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#111111] hover:text-[#4A8237] transition-colors"
                >
                  <span>Ver Detalhes do Cliente</span>
                  <ChevronRightIcon className="w-3.5 h-3.5 text-[#4A8237]" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
