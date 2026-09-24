/**
 * Repositório de Clientes & CRUD de Empresas (Alien OS Data Access Layer)
 * Gerencia integrações assíncronas com o Supabase.
 * Sem dados fictícios / mocks.
 */

import { Cliente } from "@/types";
import { getUniversalClient } from "@/lib/supabase/universal";

function getSupabase() {
  return getUniversalClient();
}

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
      const supabase = getUniversalClient();
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      // Mapeia registros da tabela `companies` para a interface `Cliente`
      return data.map((item) => ({
        id: item.id || item.slug,
        name: item.trade_name || item.name || "Cliente",
        company: item.legal_name || item.trade_name || item.name || "Empresa",
        contactPerson: item.email || "Responsável Operacional",
        email: item.email || "",
        segment: item.segment || "Geral",
        alienScore: item.alien_score || 80,
        journeyStage: item.journey_stage || "Recepção",
        healthStatus: item.health_status || "Excelente",
        entryDate: item.entry_date || (item.created_at ? new Date(item.created_at).toLocaleDateString("pt-BR") : "Hoje"),
        lastUpdate: "Agora mesmo",
        nextMeeting: "A agendar",
        currentRoas: "0.0x",
        currentRoi: "0.0x",
        generatedRevenue: "R$ 0",
        primaryObjective: item.primary_objective || "Início da Jornada de Abdução",
        contractedServices: [],
        activities: [],
        documents: [],
      })) as Cliente[];
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<Cliente | null> {
    try {
      const supabase = getUniversalClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase.from("companies").select("*");
      if (isUuid) {
        query = query.eq("id", id);
      } else {
        const cleanName = decodeURIComponent(id).replace(/-/g, " ").trim();
        query = query.or(`trade_name.ilike.%${cleanName}%,name.ilike.%${cleanName}%`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        console.error("Erro na busca de empresa em companies:", error);
        return null;
      }

      if (!data) {
        console.warn("Nenhuma empresa encontrada com o id:", id);
        return null;
      }

      // Buscar scores reais com fallback seguro
      let score = 80;
      let health = "Excelente";

      try {
        const [scoreResult, healthResult] = await Promise.allSettled([
          supabase
            .from("alien_scores")
            .select("score")
            .eq("company_id", data.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("health_scores")
            .select("status")
            .eq("company_id", data.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        if (scoreResult.status === "fulfilled" && scoreResult.value?.data?.score) {
          score = scoreResult.value.data.score;
        }
        if (healthResult.status === "fulfilled" && healthResult.value?.data?.status) {
          health = healthResult.value.data.status;
        }
      } catch (scoreErr) {
        console.warn("Aviso ao buscar scores (tabela pode não existir ainda):", scoreErr);
      }

      const clientName = data.trade_name || data.name || "Cliente";
      const legalName = data.legal_name || data.trade_name || data.name || clientName;

      return {
        id: data.id,
        name: clientName,
        company: legalName,
        contactPerson: data.contact_person || "Responsável Operacional",
        email: data.email || "",
        segment: data.segment || "Geral",
        alienScore: score,
        journeyStage: (data.journey_stage as any) || "Recepção",
        healthStatus: (health as any) || "Excelente",
        entryDate: data.entry_date ? String(data.entry_date) : "Hoje",
        lastUpdate: "Agora mesmo",
        nextMeeting: "A agendar",
        currentRoas: "0.0x",
        currentRoi: "0.0x",
        generatedRevenue: "R$ 0",
        primaryObjective: data.primary_objective || "Início da Jornada de Abdução",
        contractedServices: [],
        activities: [],
        documents: [],
      };
    } catch (err) {
      console.error("Erro inesperado em clientRepository.getById:", err);
      return null;
    }
  }

  async search(query: string, stageFilter = "Todos"): Promise<Cliente[]> {
    const clients = await this.getAll();
    if (!query && stageFilter === "Todos") return clients;
    const q = (query || "").toLowerCase();

    return clients.filter((c) => {
      const matchesText =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.segment.toLowerCase().includes(q);

      if (stageFilter === "Todos") return matchesText;
      if (stageFilter === "Alien Cases") return matchesText && c.journeyStage === "Case";
      return matchesText && c.journeyStage === stageFilter;
    });
  }

  async createCompany(formData: WizardFormData): Promise<Cliente> {
    // 1. Tentar primeiro via API Server-side (contorna restrições de permissão RLS do navegador e usa service role se configurado)
    try {
      if (typeof window !== "undefined") {
        const res = await fetch("/api/clientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await res.json();
        if (res.ok && result?.company?.id) {
          return {
            id: result.company.id,
            name: result.company.name,
            company: result.company.company || result.company.name,
            contactPerson: "Responsável Operacional",
            email: formData.email || "",
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
            primaryObjective: "Jornada de Abdução iniciada via Cadastro Inteligente",
            contractedServices: [],
          };
        } else {
          console.warn("API /api/clientes retornou erro, acionando fallback direto no Supabase:", result?.error);
        }
      }
    } catch (apiErr: any) {
      console.warn("Falha de rede em /api/clientes, tentando inserção direta no Supabase:", apiErr);
    }

    // 2. Fallback direto no Supabase (com sanitização rigorosa de caracteres para evitar character varying(255))
    const supabase = getUniversalClient();
    const tradeName = (formData.tradeName || "").trim();
    const legalName = (formData.legalName || tradeName).trim();
    const cleanCnpj = formData.cnpj?.trim() ? formData.cnpj.trim().slice(0, 20) : null;
    const sanitizedWebsite = formData.website?.trim() ? formData.website.trim().slice(0, 255) : null;
    const sanitizedTradeName = tradeName.slice(0, 255);
    const sanitizedLegalName = legalName.slice(0, 255);
    const sanitizedEmail = formData.email?.trim() ? formData.email.trim().slice(0, 255) : null;

    let company: any = null;
    let companyErr: any = null;

    // Tentativa 1: Inserir com dados estruturados
    const try1 = await supabase
      .from("companies")
      .insert({
        trade_name: sanitizedTradeName,
        name: sanitizedTradeName,
        legal_name: sanitizedLegalName,
        cnpj: cleanCnpj,
        segment: (formData.segment || "Geral").slice(0, 100),
        website: sanitizedWebsite,
        email: sanitizedEmail,
        primary_objective: "Jornada de Abdução iniciada via Cadastro Inteligente",
        active: true,
      })
      .select()
      .single();

    if (!try1.error && try1.data) {
      company = try1.data;
    } else {
      console.warn("Fallback direto Try 1 falhou:", try1.error?.message);
      // Tentativa 2: Payload canônico estrito
      const try2 = await supabase
        .from("companies")
        .insert({
          name: sanitizedTradeName,
          active: true,
        })
        .select()
        .single();

      company = try2.data;
      companyErr = try2.error;
    }

    if (companyErr || !company) {
      throw new Error(companyErr?.message || "Não foi possível cadastrar a empresa no banco de dados.");
    }

    const companyId = company.id;

    // Criar registros auxiliares seguros (scores e timeline)
    try {
      await Promise.allSettled([
        supabase.from("alien_scores").insert({ company_id: companyId, score: 80 }),
        supabase.from("health_scores").insert({ company_id: companyId, status: "Excelente" }),
        supabase.from("timeline").insert({
          company_id: companyId,
          title: "Início da Jornada",
          activity_type: "Reunião realizada",
          description: `Empresa ${sanitizedTradeName} cadastrada no Alien OS.`,
          author_name: "Alien Onboarding",
          journey_stage: "Recepção",
        }),
      ]);
    } catch (auxErr) {
      console.warn("Aviso ao criar registros auxiliares do cliente:", auxErr);
    }

    return {
      id: companyId,
      name: company.trade_name || company.name || sanitizedTradeName,
      company: company.legal_name || company.trade_name || company.name || sanitizedLegalName,
      contactPerson: "Responsável Operacional",
      email: formData.email || "",
      segment: formData.segment || "Geral",
      alienScore: 80,
      journeyStage: "Recepção",
      healthStatus: "Excelente",
      entryDate: "Hoje",
      lastUpdate: "Agora mesmo",
      nextMeeting: "A agendar",
      currentRoas: "0.0x",
      currentRoi: "0.0x",
      generatedRevenue: "R$ 0",
      primaryObjective: "Jornada de Abdução iniciada via Cadastro Inteligente",
      contractedServices: [],
    };
  }
}

export const clientRepository: IClientRepository = new SupabaseClientRepository();

export async function createCompanyOnboarding(data: WizardFormData): Promise<Cliente> {
  return clientRepository.createCompany(data);
}
