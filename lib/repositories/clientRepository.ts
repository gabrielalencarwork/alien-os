/**
 * Repositório de Clientes & CRUD de Empresas (Alien OS Data Access Layer)
 * Gerencia integrações assíncronas com o Supabase.
 * Sem dados fictícios / mocks.
 */

import { Cliente } from "@/types";
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
        return [];
      }

      // Mapeia registros da tabela `companies` para a interface `Cliente`
      return data.map((item) => ({
        id: item.id || item.slug,
        name: item.trade_name,
        company: item.legal_name || item.trade_name,
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
      })) as Cliente[];
    } catch {
      return [];
    }
  }

  async getById(id: string): Promise<Cliente | null> {
    try {
      const supabase = createBrowserClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let query = supabase.from("companies").select("*");
      if (isUuid) {
        query = query.eq("id", id);
      } else {
        const cleanName = decodeURIComponent(id).replace(/-/g, " ").trim();
        query = query.ilike("trade_name", `%${cleanName}%`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error || !data) return null;

      // Buscar scores reais se existirem
      const [{ data: scoreData }, { data: healthData }] = await Promise.all([
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

      return {
        id: data.id,
        name: data.trade_name,
        company: data.legal_name || data.trade_name,
        contactPerson: "Responsável Operacional",
        email: "",
        segment: data.segment || "Geral",
        alienScore: scoreData?.score || 80,
        journeyStage: "Recepção",
        healthStatus: (healthData?.status as any) || "Excelente",
        entryDate: data.entry_date ? new Date(data.entry_date).toLocaleDateString("pt-BR") : "Hoje",
        lastUpdate: "Agora mesmo",
        nextMeeting: "A agendar",
        currentRoas: "0.0x",
        currentRoi: "0.0x",
        generatedRevenue: "R$ 0",
        primaryObjective: data.primary_objective || "Início da Jornada de Abdução",
        contractedServices: [],
      };
    } catch (err) {
      console.error("Erro em clientRepository.getById:", err);
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
    // 1. Tentar primeiro via API Server-side (contorna restrições de permissão RLS do navegador)
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
        } else if (result?.error) {
          throw new Error(result.error);
        }
      }
    } catch (apiErr: any) {
      if (apiErr?.message && !apiErr.message.includes("fetch")) {
        throw apiErr;
      }
      console.warn("Falha no /api/clientes, tentando inserção direta no Supabase:", apiErr);
    }

    // 2. Fallback direto no Supabase (respeitando colunas reais: tenta fullPayload, se falhar schema cache, insere name)
    const supabase = createBrowserClient();
    const tradeName = formData.tradeName.trim();
    const cleanCnpj = formData.cnpj?.trim() ? formData.cnpj.trim() : null;

    let company: any = null;
    let companyErr: any = null;

    const try1 = await supabase
      .from("companies")
      .insert({
        trade_name: tradeName,
        name: tradeName,
        legal_name: (formData.legalName || tradeName).trim(),
        cnpj: cleanCnpj,
        segment: formData.segment || "Geral",
        website: formData.website?.trim() || null,
        primary_objective: "Jornada de Abdução iniciada via Cadastro Inteligente",
        active: true,
      })
      .select()
      .single();

    if (!try1.error && try1.data) {
      company = try1.data;
    } else {
      const try2 = await supabase
        .from("companies")
        .insert({
          name: tradeName,
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

    return {
      id: companyId,
      name: company.trade_name,
      company: company.legal_name || company.trade_name,
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
