"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import {
  ChevronRightIcon,
  CheckCircle2Icon,
  SparklesIcon,
  BriefcaseIcon,
  RocketIcon,
  UsersIcon,
  ArrowUpRightIcon,
} from "@/components/icons";
import { createCompanyOnboarding } from "@/lib/repositories/clientRepository";

export interface WizardFormData {
  // Etapa 1: Dados Cadastrais
  tradeName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;

  // Etapa 2: Perfil & Segmento
  segment: string;
  city: string;
  state: string;
  employeeCount: string;
  yearsInMarket: string;

  // Etapa 3: Serviços Contratados
  selectedServices: string[];
}

export function CompanyWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<WizardFormData>({
    tradeName: "",
    legalName: "",
    cnpj: "",
    phone: "",
    whatsapp: "",
    email: "",
    website: "",
    instagram: "",
    segment: "E-commerce Beauty",
    city: "São Paulo",
    state: "SP",
    employeeCount: "11-50 colaboradores",
    yearsInMarket: "3 anos",
    selectedServices: ["Gestão de Tráfego", "Social Media"],
  });

  const availableServices = [
    "Gestão de Tráfego",
    "Social Media",
    "Branding",
    "Sites",
    "Landing Pages",
    "Google Meu Negócio",
    "Fotografia e Vídeo",
    "Automações",
  ];

  const handleInputChange = (field: keyof WizardFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleService = (serviceName: string) => {
    setFormData((prev) => {
      const exists = prev.selectedServices.includes(serviceName);
      const updated = exists
        ? prev.selectedServices.filter((s) => s !== serviceName)
        : [...prev.selectedServices, serviceName];
      return { ...prev, selectedServices: updated };
    });
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !formData.tradeName) {
      setErrorMsg("O Nome Fantasia é obrigatório.");
      return;
    }
    setErrorMsg(null);
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const newClient = await createCompanyOnboarding(formData);
      router.push(`/clientes/${newClient.id}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao efetuar o cadastro da empresa.");
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Wizard Progress Bar */}
      <div className="bg-white border border-[#E4E4E7] rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { step: 1, label: "Dados Cadastrais" },
            { step: 2, label: "Perfil & Segmento" },
            { step: 3, label: "Serviços Contratados" },
            { step: 4, label: "Resumo & Confirmação" },
          ].map((item) => {
            const isCompleted = item.step < currentStep;
            const isCurrent = item.step === currentStep;

            return (
              <div key={item.step} className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => item.step < currentStep && setCurrentStep(item.step)}
                  className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                    isCurrent
                      ? "bg-[#111111] text-white"
                      : isCompleted
                      ? "bg-[rgba(74,130,55,0.1)] text-[#4A8237] border border-[rgba(74,130,55,0.2)]"
                      : "bg-[#F4F4F5] text-[#71717A]"
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center ${
                      isCurrent
                        ? "bg-[#4A8237] text-white"
                        : isCompleted
                        ? "bg-[#4A8237] text-white"
                        : "bg-[#E4E4E7] text-[#71717A]"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2Icon className="w-3.5 h-3.5" /> : item.step}
                  </span>
                  <span>{item.label}</span>
                </button>
                {item.step < 4 && <ChevronRightIcon className="w-4 h-4 text-[#D4D4D8]" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Step Contents */}
      <Card className="border-[#E4E4E7] bg-white p-6 sm:p-8 space-y-6">
        {/* ETAPA 1: DADOS CADASTRAIS */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div className="border-b border-[#F4F4F5] pb-3">
              <h2 className="text-lg font-bold text-[#111111]">
                Etapa 1: Dados Cadastrais da Empresa
              </h2>
              <p className="text-xs text-[#71717A]">
                Informações principais da conta e contatos de comunicação
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Nome Fantasia *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tradeName}
                  onChange={(e) => handleInputChange("tradeName", e.target.value)}
                  placeholder="Ex: Lumina Skincare"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Razão Social
                </label>
                <input
                  type="text"
                  value={formData.legalName}
                  onChange={(e) => handleInputChange("legalName", e.target.value)}
                  placeholder="Ex: Lumina Skincare Ltda"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange("cnpj", e.target.value)}
                  placeholder="00.000.000/0001-00"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="contato@empresa.com.br"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Telefone Comercial
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(11) 3456-7890"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  WhatsApp Oficial
                </label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                  placeholder="(11) 98765-4321"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Website / E-commerce
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://www.suaempresa.com.br"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Instagram (@usuario)
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="@suaempresa"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] placeholder:text-[#A1A1AA] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 2: PERFIL & SEGMENTO */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="border-b border-[#F4F4F5] pb-3">
              <h2 className="text-lg font-bold text-[#111111]">
                Etapa 2: Perfil Operacional & Segmento
              </h2>
              <p className="text-xs text-[#71717A]">
                Classificação de mercado e dimensões para calibração da IA Alien
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Segmento de Atuação
                </label>
                <select
                  value={formData.segment}
                  onChange={(e) => handleInputChange("segment", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
                >
                  <option value="E-commerce Beauty">E-commerce Beauty</option>
                  <option value="E-commerce D2C">E-commerce D2C</option>
                  <option value="B2B Software">B2B Software / SaaS</option>
                  <option value="Suplementos D2C">Suplementos D2C</option>
                  <option value="Fintech B2C">Fintech B2C</option>
                  <option value="B2B Solar">B2B Solar & Engenharia</option>
                  <option value="Gastronomia">Gastronomia & Restaurantes</option>
                  <option value="Fitness & Saúde">Fitness & Saúde</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Cidade Sede
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Ex: São Paulo"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="SP"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#111111] block">
                  Número de Funcionários
                </label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange("employeeCount", e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
                >
                  <option value="1-10 colaboradores">1-10 colaboradores</option>
                  <option value="11-50 colaboradores">11-50 colaboradores</option>
                  <option value="51-200 colaboradores">51-200 colaboradores</option>
                  <option value="200+ colaboradores">200+ colaboradores</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-[#111111] block">
                  Tempo de Mercado
                </label>
                <input
                  type="text"
                  value={formData.yearsInMarket}
                  onChange={(e) => handleInputChange("yearsInMarket", e.target.value)}
                  placeholder="Ex: 3 anos"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAFA] border border-[#E4E4E7] focus:bg-white focus:border-[#4A8237] rounded-xl text-xs text-[#111111] outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* ETAPA 3: SERVIÇOS CONTRATADOS */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="border-b border-[#F4F4F5] pb-3">
              <h2 className="text-lg font-bold text-[#111111]">
                Etapa 3: Serviços Contratados
              </h2>
              <p className="text-xs text-[#71717A]">
                Selecione todos os entregáveis contratados pelo cliente para criação dos cards operacionais
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {availableServices.map((service) => {
                const isSelected = formData.selectedServices.includes(service);

                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleToggleService(service)}
                    className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-24 ${
                      isSelected
                        ? "border-[#4A8237] bg-[rgba(74,130,55,0.06)] shadow-xs"
                        : "border-[#E4E4E7] bg-[#FAFAFA] hover:bg-[#F4F4F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-[#111111]">
                        {service}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-[#4A8237] focus:ring-[#4A8237] cursor-pointer"
                      />
                    </div>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? "text-[#4A8237] font-semibold" : "text-[#A1A1AA]"
                      }`}
                    >
                      {isSelected ? "Contratado" : "Clique para selecionar"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ETAPA 4: RESUMO & CONFIRMAÇÃO */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="border-b border-[#F4F4F5] pb-3">
              <h2 className="text-lg font-bold text-[#111111]">
                Etapa 4: Resumo e Ativação da Conta
              </h2>
              <p className="text-xs text-[#71717A]">
                Revise os dados antes de iniciar automaticamente a Jornada de Abdução
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#71717A]">
                  Dados da Empresa
                </span>
                <div className="space-y-1">
                  <div>
                    <strong className="text-[#111111]">Nome Fantasia: </strong>
                    <span>{formData.tradeName || "Não informado"}</span>
                  </div>
                  <div>
                    <strong className="text-[#111111]">Razão Social: </strong>
                    <span>{formData.legalName || "Não informada"}</span>
                  </div>
                  <div>
                    <strong className="text-[#111111]">CNPJ: </strong>
                    <span className="font-mono">{formData.cnpj || "Não informado"}</span>
                  </div>
                  <div>
                    <strong className="text-[#111111]">E-mail: </strong>
                    <span>{formData.email || "Não informado"}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#71717A]">
                  Perfil & Localização
                </span>
                <div className="space-y-1">
                  <div>
                    <strong className="text-[#111111]">Segmento: </strong>
                    <span>{formData.segment}</span>
                  </div>
                  <div>
                    <strong className="text-[#111111]">Cidade/UF: </strong>
                    <span>
                      {formData.city} / {formData.state}
                    </span>
                  </div>
                  <div>
                    <strong className="text-[#111111]">Tamanho: </strong>
                    <span>{formData.employeeCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Services Summary */}
            <div className="p-4 rounded-xl bg-[#FAFAFA] border border-[#E4E4E7] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#71717A]">
                Serviços Contratados ({formData.selectedServices.length})
              </span>
              <div className="flex flex-wrap gap-2">
                {formData.selectedServices.map((srv) => (
                  <Badge key={srv} variant="alien" size="sm">
                    {srv}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Automation Highlights */}
            <div className="p-4 rounded-xl bg-[#111111] text-white space-y-2">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-[#4A8237]" />
                <span className="text-xs font-bold text-white">
                  Automações de Onboarding Supabase
                </span>
              </div>
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                <li>Gravação da empresa na tabela <code className="text-[#4A8237]">companies</code></li>
                <li>Ativação dos serviços em <code className="text-[#4A8237]">company_services</code></li>
                <li>Criação do perfil inicial em <code className="text-[#4A8237]">alien_dna</code></li>
                <li>Geração do Alien Score (80 pts) e Health Score ("Excelente")</li>
                <li>Registro do 1º marco na <code className="text-[#4A8237]">timeline</code>: "Empresa iniciou a Jornada de Abdução."</li>
              </ul>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="pt-4 border-t border-[#F4F4F5] flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrevStep}
            disabled={currentStep === 1 || submitting}
          >
            Voltar
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNextStep}
              icon={<ChevronRightIcon className="w-4 h-4" />}
              iconPosition="right"
            >
              Avançar
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={submitting}
              icon={
                submitting ? (
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <ArrowUpRightIcon className="w-4 h-4" />
                )
              }
              iconPosition="right"
            >
              {submitting ? "Cadastrando no Supabase..." : "Concluir e Cadastrar Empresa"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
