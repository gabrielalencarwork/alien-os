import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();

    if (!formData?.tradeName?.trim()) {
      return NextResponse.json(
        { error: "O Nome Fantasia é obrigatório." },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const tradeName = formData.tradeName.trim();
    const legalName = (formData.legalName?.trim() || tradeName);
    const cnpj = formData.cnpj?.trim() ? formData.cnpj.trim().slice(0, 20) : null;
    const segment = formData.segment?.trim() || "Geral";
    const rawWebsite = formData.website?.trim() || null;
    const email = formData.email?.trim() || null;
    const phone = (formData.phone || formData.whatsapp)?.trim() || null;
    const city = formData.city?.trim() || null;
    const state = formData.state?.trim() || null;
    const employeeCount = formData.employeeCount?.trim() || null;
    const selectedServices: string[] = Array.isArray(formData.selectedServices) ? formData.selectedServices : [];

    // 1. Inserir empresa na tabela `companies` com cascata de resiliência a schemas e limites de VARCHAR
    let company: any = null;
    let companyErr: any = null;

    // Tentativa 1: Payload estendido completo com todos os dados
    const fullPayload: Record<string, any> = {
      name: tradeName,
      trade_name: tradeName,
      legal_name: legalName,
      cnpj,
      segment,
      website: rawWebsite,
      email,
      phone,
      city,
      state,
      employee_count: employeeCount,
      primary_objective: "Jornada de Abdução iniciada via Cadastro Inteligente",
      active: true,
    };

    const firstTry = await supabase.from("companies").insert(fullPayload).select().single();

    if (!firstTry.error && firstTry.data) {
      company = firstTry.data;
    } else {
      console.warn("Tentativa 1 falhou em companies:", firstTry.error?.message);

      // Tentativa 2: Se o erro for de tamanho de caractere (VARCHAR 255 em website, email, etc.)
      const isLengthError =
        firstTry.error?.message?.includes("too long") ||
        firstTry.error?.message?.includes("character varying") ||
        firstTry.error?.code === "22001";

      const sanitizedWebsite = rawWebsite ? rawWebsite.slice(0, 255) : null;
      const sanitizedLegalName = legalName.slice(0, 255);
      const sanitizedTradeName = tradeName.slice(0, 255);

      const safePayload: Record<string, any> = {
        name: sanitizedTradeName,
        trade_name: sanitizedTradeName,
        legal_name: sanitizedLegalName,
        cnpj,
        segment: segment.slice(0, 100),
        website: sanitizedWebsite,
        email: email ? email.slice(0, 255) : null,
        primary_objective: "Jornada de Abdução iniciada via Cadastro Inteligente",
        active: true,
      };

      const secondTry = await supabase.from("companies").insert(safePayload).select().single();

      if (!secondTry.error && secondTry.data) {
        company = secondTry.data;
      } else {
        console.warn("Tentativa 2 falhou em companies:", secondTry.error?.message);

        // Tentativa 3: Payload estrito canonical (id gerado, name, active) - garante 100% de compatibilidade
        const canonicalPayload = {
          name: sanitizedTradeName,
          active: true,
        };

        const canonTry = await supabase.from("companies").insert(canonicalPayload).select().single();

        if (!canonTry.error && canonTry.data) {
          company = canonTry.data;
        } else {
          companyErr = canonTry.error || secondTry.error || firstTry.error;
        }
      }
    }

    if (companyErr || !company) {
      console.error("Erro crítico ao inserir em companies no Supabase:", companyErr);
      return NextResponse.json(
        { error: companyErr?.message || "Não foi possível cadastrar a empresa no banco de dados." },
        { status: 500 }
      );
    }

    const companyId = company.id;

    // 2. Inserir DNA da marca inicial
    try {
      await supabase.from("alien_dna").insert({
        company_id: companyId,
        brand_voice: "Inovadora & Orientada a Dados",
        value_proposition: "Aceleração de receitas previsíveis com o método Alien OS",
      });
    } catch (e) {
      console.warn("Aviso ao inserir alien_dna:", e);
    }

    // 3. Inserir Alien Score inicial
    try {
      await supabase.from("alien_scores").insert({
        company_id: companyId,
        score: 80,
        media_score: 80,
        tech_score: 80,
        sales_score: 80,
        evaluation_notes: "Pontuação inicial atribuída no Onboarding",
      });
    } catch (e) {
      console.warn("Aviso ao inserir alien_scores:", e);
    }

    // 4. Inserir Health Score inicial
    try {
      await supabase.from("health_scores").insert({
        company_id: companyId,
        status: "Excelente",
        risk_level: "Baixo",
        mitigation_plan: "Acompanhamento da Recepção",
      });
    } catch (e) {
      console.warn("Aviso ao inserir health_scores:", e);
    }

    // 5. Inserir primeiro marco na Timeline
    try {
      await supabase.from("timeline").insert({
        company_id: companyId,
        title: "Início da Jornada",
        activity_type: "Reunião realizada",
        description: `Empresa ${tradeName} cadastrada no Alien OS.`,
        author_name: "Alien Onboarding",
        journey_stage: "Recepção",
      });
    } catch (e) {
      console.warn("Aviso ao inserir timeline:", e);
    }

    // 6. Ativar serviços contratados se a tabela company_services estiver disponível
    if (selectedServices.length > 0) {
      try {
        const servicesPayload = selectedServices.map((srv) => ({
          company_id: companyId,
          service_name: srv,
          status: "Ativo",
          active: true,
        }));
        await supabase.from("company_services").insert(servicesPayload);
      } catch (e) {
        console.warn("Aviso ao inserir company_services:", e);
      }
    }

    return NextResponse.json({
      success: true,
      company: {
        id: companyId,
        name: company.trade_name || company.name || tradeName,
        company: company.legal_name || company.name || legalName,
        segment: company.segment || segment,
      },
    });
  } catch (err: any) {
    console.error("Erro inesperado em /api/clientes:", err);
    return NextResponse.json(
      { error: err?.message || "Erro interno do servidor ao cadastrar empresa." },
      { status: 500 }
    );
  }
}

