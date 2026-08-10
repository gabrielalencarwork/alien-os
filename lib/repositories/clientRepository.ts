/**
 * Repositório de Clientes & CRUD de Empresas (Alien OS Data Access Layer)
 * Gerencia integrações assíncronas com o Supabase e sincronização local.
 */

import { Cliente } from "@/types";
import { MOCK_CLIENTS } from "@/lib/clientsData";
import { createBrowserClient } from "@/lib/supabase/client";

export interface WizardFormData {
  tradeName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  instagram: string;
  segment: string;
  city: string;
  state: string;
  employeeCount: string;
  yearsInMarket: string;
  selectedServices: string[];
}

export interface IClientRepository {
  getAll(): Promise<Cliente[]>;
  getById(id: string): Promise<Cliente | null>;
  search(query: string, stageFilter?: string): Promise<Cliente[]>;
  createCompany(data: WizardFormData): Promise<Cliente>;
}

export class SupabaseClientRepository implements IClientRepository {
  async getAll(): Promise<Cliente[]> {
    try {
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return MOCK_CLIENTS as Cliente[];
      }

      // Mapeia registros da tabela `companies` para a interface `Cliente`
      return data.map((item) => ({
        id: item.id || item.slug,
        name: item.trade_name,
        company: item.legal_name || item.trade_name,
        contactPerson: item.email || "Responsável Operacional",
        email: item.email || "",
        segment: item.segment,
        alienScore: 80,
        journeyStage: "Recepção",
        healthStatus: "Excelente",
        entryDate: item.entry_date || "Hoje",
        lastUpdate: "Agora mesmo",
        nextMeeting: "A agendar",
        currentRoas: "0.0x",
        currentRoi: "0.0x",
        generatedRevenue: "R$ 0",
        primaryObjective: item.primary_objective || "Início da Jornada de Abdução",
        contractedServices: [],
      })) as Cliente[];
    } catch {
      return MOCK_CLIENTS as Cliente[];
    }
  }

  async getById(id: string): Promise<Cliente | null> {
    const client = MOCK_CLIENTS.find((c) => c.id === id);
    return (client as Cliente) || null;
  }

  async search(query: string, stageFilter = "Todos"): Promise<Cliente[]> {
    const clients = await this.getAll();
    const q = query.toLowerCase();

    return clients.filter((c) => {
      const matchesText =
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q);

      if (stageFilter === "Todos") return matchesText;
      if (stageFilter === "Alien Cases") return matchesText && c.journeyStage === "Case";
      return matchesText && c.journeyStage === stageFilter;
    });
  }

  async createCompany(formData: WizardFormData): Promise<Cliente> {
    const slugId =
      formData.tradeName.toLowerCase().replace(/[^a-z0-9]/g, "-") +
      "-" +
      Math.floor(100 + Math.random() * 900);

    const supabase = createBrowserClient();

    try {
      // 1. INSERT na tabela `companies`
      const { data: company, error: companyErr } = await supabase
        .from("companies")
        .insert({
          trade_name: formData.tradeName,
          legal_name: formData.legalName || formData.tradeName,
          cnpj: formData.cnpj,
          segment: formData.segment,
          website: formData.website,
          slug: slugId,
          primary_objective: "Jornada de Abdução iniciada via Cadastro Inteligente",
        })
        .select()
        .single();

      if (!companyErr && company) {
        const companyId = company.id;

        // 2. INSERT na tabela `company_services`
        if (formData.selectedServices.length > 0) {
          const serviceInserts = formData.selectedServices.map((srv) => ({
            company_id: companyId,
            name: srv,
            category: srv,
            status: "Ativo",
            assignee: "Equipe de Growth",
            lastResults: "Onboarding concluído",
            nextAction: "Definir pauta de diagnóstico",
          }));
          await supabase.from("company_services").insert(serviceInserts);
        }

        // 3. INSERT na tabela `alien_dna`
        await supabase.from("alien_dna").insert({
          company_id: companyId,
          brand_voice: "Inovadora & Orientada a Dados",
          value_proposition: "Aceleração de receitas previsíveis com o método Alien OS",
        });

        // 4. INSERT na tabela `alien_scores`
        await supabase.from("alien_scores").insert({
          company_id: companyId,
          score: 80,
          media_score: 80,
          tech_score: 80,
          sales_score: 80,
          evaluation_notes: "Pontuação inicial atribuída no Onboarding",
        });

        // 5. INSERT na tabela `health_scores`
        await supabase.from("health_scores").insert({
          company_id: companyId,
          status: "Excelente",
          risk_level: "Baixo",
          mitigation_plan: "Acompanhamento da Recepção",
        });

        // 6. INSERT na tabela `timeline`
        await supabase.from("timeline").insert({
          company_id: companyId,
          title: "Início da Jornada",
          activity_type: "Reunião realizada",
          description: "Empresa iniciou a Jornada de Abdução.",
          author_name: "Alien Onboarding Bot",
          journey_stage: "Recepção",
        });
      }
    } catch {
      // Ignora e continua para o fallback local se não houver conexão ativa
    }

    // Criar o objeto cliente padronizado e injetar no MOCK_CLIENTS local para disponibilidade imediata
    const newClientRecord: Cliente = {
      id: slugId,
      name: formData.tradeName,
      company: formData.legalName || formData.tradeName,
      contactPerson: formData.email || "Responsável Operacional",
      email: formData.email || "contato@empresa.com",
      segment: formData.segment,
      alienScore: 80,
      journeyStage: "Recepção",
      healthStatus: "Excelente",
      entryDate: "Hoje",
      lastUpdate: "Agora mesmo",
      nextMeeting: "A agendar",
      currentRoas: "0.0x",
      currentRoi: "0.0x",
      generatedRevenue: "R$ 0",
      primaryObjective: "Empresa iniciou a Jornada de Abdução.",
      contractedServices: formData.selectedServices.map((srv, idx) => ({
        id: `srv-new-${idx}`,
        name: srv,
        category: srv as any,
        status: "Ativo",
        assignee: "Equipe de Growth",
        lastResults: "Onboarding ativado",
        nextAction: "Reunião de diagnóstico inicial",
        aiRecommendation: "Elaborar mapeamento de canais de aquisição",
      })),
      activities: [
        {
          id: `act-onboard-${Date.now()}`,
          title: "Início da Jornada",
          type: "Reunião realizada",
          timestamp: "Hoje às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          description: "Empresa iniciou a Jornada de Abdução.",
          author: "Alien Onboarding",
        },
      ],
      aiIntelligence: {
        summary: `Empresa ${formData.tradeName} cadastrada na etapa de Recepção. Mapeamento inicial do segmento de ${formData.segment}.`,
        biggestBottleneck: "Necessidade de estruturação das primeiras campanhas de atração.",
        biggestOpportunity: "Iniciar escaneamento de palavras-chave e mapa de concorrência.",
        weeklyPriority: "Realizar a reunião de Recepção e alinhar acesso aos ativos de mídia.",
        recommendations: [
          {
            id: `rec-new-1`,
            title: "Agendar reunião de Recepção e Setup de Ativos",
            description: "Liberar permissões de gerenciador de anúncios no Meta Ads e Google Ads.",
            expectedImpact: "Setup Operacional",
            action: "Solicitar acessos à equipe cliente",
          },
        ],
      },
      documents: [
        {
          id: `doc-new-1`,
          name: `Briefing Inicial - ${formData.tradeName}.pdf`,
          category: "Briefings",
          size: "1.2 MB",
          updatedAt: "Hoje",
          format: "pdf",
          url: "#",
        },
      ],
    };

    // Adiciona no início da lista local
    MOCK_CLIENTS.unshift(newClientRecord as any);

    return newClientRecord;
  }
}

export const clientRepository: IClientRepository = new SupabaseClientRepository();

export async function createCompanyOnboarding(data: WizardFormData): Promise<Cliente> {
  return clientRepository.createCompany(data);
}
