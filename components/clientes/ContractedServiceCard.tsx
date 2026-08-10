import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { ContractedService } from "@/lib/clientsData";
import {
  RocketIcon,
  UsersIcon,
  SparklesIcon,
  FolderIcon,
  BotIcon,
  BriefcaseIcon,
} from "@/components/icons";

export interface ContractedServiceCardProps {
  services?: ContractedService[];
}

export function ContractedServiceCard({ services = [] }: ContractedServiceCardProps) {
  const list = services || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Gestão de Tráfego":
        return <RocketIcon className="w-4 h-4" />;
      case "Social Media":
        return <UsersIcon className="w-4 h-4" />;
      case "Branding":
        return <SparklesIcon className="w-4 h-4" />;
      case "Sites":
        return <FolderIcon className="w-4 h-4" />;
      case "Automações":
        return <BotIcon className="w-4 h-4" />;
      default:
        return <BriefcaseIcon className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-[#E4E4E7] bg-white space-y-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
        <div>
          <h3 className="text-base font-bold text-[#111111] tracking-tight">
            Serviços Contratados
          </h3>
          <p className="text-xs text-[#71717A]">
            Acompanhamento de entregáveis, responsáveis e performance por frente de atuação
          </p>
        </div>

        <Badge variant="outline" size="sm">
          {list.length} serviços ativos
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((service) => (
          <div
            key={service.id}
            className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between hover:border-[#D4D4D8] transition-all space-y-4"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white border border-[#E4E4E7] flex items-center justify-center text-[#111111]">
                    {getCategoryIcon(service.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#111111]">
                      {service.name}
                    </h4>
                    <span className="text-[11px] text-[#71717A]">
                      {service.assignee}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    service.status === "Ativo"
                      ? "alien"
                      : service.status === "Otimizando"
                      ? "dark"
                      : "gray"
                  }
                  size="sm"
                  showDot
                >
                  {service.status}
                </Badge>
              </div>

              {/* Data Grid */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-[#F4F4F5] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                    Últimos Resultados
                  </span>
                  <p className="text-[#111111] font-semibold">
                    {service.lastResults}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-[#F4F4F5] space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#A1A1AA]">
                    Próxima Ação
                  </span>
                  <p className="text-[#52525B]">
                    {service.nextAction}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Recommendation Banner */}
            <div className="p-2.5 rounded-lg bg-[rgba(74,130,55,0.06)] border border-[rgba(74,130,55,0.2)] text-xs flex items-start gap-2">
              <BotIcon className="w-3.5 h-3.5 text-[#4A8237] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#4A8237] text-[11px] block">
                  Recomendação da IA:
                </span>
                <span className="text-[#111111]">
                  {service.aiRecommendation}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
