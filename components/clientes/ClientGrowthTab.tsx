import React from "react";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Cliente } from "@/types";
import { SparklesIcon, TrendingUpIcon, PlusIcon, ArrowUpRightIcon } from "@/components/icons";

export interface ClientGrowthTabProps {
  client: Cliente;
}

export function ClientGrowthTab({ client }: ClientGrowthTabProps) {
  const experiments = [
    {
      id: "exp-1",
      hypothesis: "Testar chamada principal focada em Frete Grátis na Landing Page móvel",
      metric: "Taxa de Conversão no Checkout",
      baseline: "2.1%",
      target: "2.8%",
      status: "Em Execução",
      confidence: "91%",
    },
    {
      id: "exp-2",
      hypothesis: "Adicionar prova social com depoimentos em vídeo na primeira dobra",
      metric: "CTR do Anúncio UGC",
      baseline: "1.8%",
      target: "3.2%",
      status: "Concluído",
      confidence: "95%",
    },
    {
      id: "exp-3",
      hypothesis: "Ativar pop-up de intenção de saída com cupom de 10% no checkout",
      metric: "Recuperação de Carrinho",
      baseline: "4.5%",
      target: "8.0%",
      status: "Pendente",
      confidence: "88%",
    },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-[#E4E4E7] bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F4F4F5]">
          <div>
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-[#4A8237]" />
              <h3 className="text-base font-bold text-[#111111] tracking-tight">
                Experimentos A/B & Testes de Aceleração: {client.name}
              </h3>
              <Badge variant="alien" size="sm" showDot>
                Metodologia Growth Sprints
              </Badge>
            </div>
            <p className="text-xs text-[#71717A] mt-0.5">
              Validação sistemática de hipóteses de conversão, copys e criativos
            </p>
          </div>

          <Button variant="primary" size="sm" icon={<PlusIcon className="w-3.5 h-3.5" />}>
            Novo Experimento
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experiments.map((exp) => (
            <div
              key={exp.id}
              className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] flex flex-col justify-between space-y-3 hover:border-[#D4D4D8] transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#71717A]">
                    {exp.metric}
                  </span>
                  <Badge
                    variant={
                      exp.status === "Concluído"
                        ? "alien"
                        : exp.status === "Em Execução"
                        ? "dark"
                        : "gray"
                    }
                    size="sm"
                  >
                    {exp.status}
                  </Badge>
                </div>

                <h4 className="text-xs font-bold text-[#111111]">
                  {exp.hypothesis}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E4E4E7]">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                      Baseline
                    </span>
                    <span className="font-mono text-[#71717A]">{exp.baseline}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block">
                      Meta Alvo
                    </span>
                    <span className="font-mono font-bold text-[#4A8237]">{exp.target}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4E4E7] flex items-center justify-between text-[11px]">
                <span className="text-[#A1A1AA]">Confiança da IA:</span>
                <span className="font-mono font-bold text-[#4A8237]">{exp.confidence}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
