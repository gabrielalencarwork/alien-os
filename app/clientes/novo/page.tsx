import React from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/Badge";
import { CompanyWizard } from "@/components/clientes/CompanyWizard";
import { ChevronRightIcon } from "@/components/icons";

export default function NewCompanyPage() {
  return (
    <PageContainer>
      {/* Back Link */}
      <div className="pt-2">
        <Link
          href="/clientes"
          className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#111111] font-medium transition-colors"
        >
          <span className="rotate-180 inline-block">
            <ChevronRightIcon className="w-3.5 h-3.5" />
          </span>
          <span>Voltar para Lista de Clientes</span>
        </Link>
      </div>

      {/* Header */}
      <section className="space-y-1 pb-4 border-b border-[#E4E4E7]">
        <div className="flex items-center gap-2">
          <Badge variant="alien" showDot>
            Jornada de Abdução · Onboarding
          </Badge>
          <span className="text-xs font-mono text-[#A1A1AA]">
            Cadastro Inteligente
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[#111111]">
          Nova Empresa
        </h1>
        <p className="text-sm text-[#52525B]">
          Cadastre uma nova empresa e ative automaticamente o onboarding do Alien OS
        </p>
      </section>

      {/* Wizard Form Component */}
      <section className="pt-2">
        <CompanyWizard />
      </section>
    </PageContainer>
  );
}
