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
    const cnpj = formData.cnpj?.trim() ? formData.cnpj.trim() : null;
    const segment = formData.segment?.trim() || "Geral";
    const website = formData.website?.trim() || null;

    // 1. Inserir empresa na tabela `companies` com fallback inteligente de schema
    let company: any = null;
    let companyErr: any = null;

    // Tentativa 1: Payload com campos estendidos (caso existam trade_name, cnpj, etc.)
    const fullPayload: Record<string, any> = {
      name: tradeName,
      trade_name: tradeName,
      legal_name: legalName,
      cnpj,
      segment,
      website,
      primary_objective: "Jornada de Abdução iniciada via Cadastro Inteligente",
      active: true,
    };

    const firstTry = await supabase.from("companies").insert(fullPayload).select().single();

    if (!firstTry.error && firstTry.data) {
      company = firstTry.data;
    } else if (
      firstTry.error?.message?.includes("schema cache") ||
      firstTry.error?.message?.includes("column") ||
      firstTry.error?.code === "PGRST204"
    ) {
      // Tentativa 2: Payload compatível com a tabela canonical (id, name, active)
      console.warn("Schema simplificado de companies detectado no Supabase. Inserindo com campos compatíveis:", firstTry.error.message);
      const canonTry = await supabase
        .from("companies")
        .insert({
          name: tradeName,
          active: true,
        })
        .select()
        .single();

      if (!canonTry.error && canonTry.data) {
        company = canonTry.data;
      } else {
        companyErr = canonTry.error;
      }
    } else {
      companyErr = firstTry.error;
    }

    if (companyErr || !company) {
      console.error("Erro ao inserir em companies no Supabase:", companyErr);
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

    return NextResponse.json({
      success: true,
      company: {
        id: companyId,
        name: company.trade_name,
        company: company.legal_name,
        segment: company.segment,
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
