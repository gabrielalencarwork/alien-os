/**
 * Dados cadastrais do cliente (tabela companies): leitura e edição.
 */

import { getUniversalClient } from "@/lib/supabase/universal";

export interface ClientProfile {
  tradeName: string;
  legalName: string;
  cnpj: string;
  segment: string;
  website: string;
  phone: string;
  email: string;
  city: string;
  state: string;
}

export class ClientProfileRepository {
  async get(companyId: string): Promise<ClientProfile> {
    const { data, error } = await getUniversalClient().from("companies").select("*").eq("id", companyId).maybeSingle();
    if (error) throw new Error(`Não foi possível carregar o cliente: ${error.message}`);
    if (!data) throw new Error("Cliente não encontrado.");
    return {
      tradeName: data.trade_name || data.name || "",
      legalName: data.legal_name || "",
      cnpj: data.cnpj || "",
      segment: data.segment || "",
      website: data.website || "",
      phone: data.phone || "",
      email: data.email || "",
      city: data.city || "",
      state: data.state || "",
    };
  }

  async update(companyId: string, p: ClientProfile): Promise<void> {
    const name = p.tradeName.trim();
    if (!name) throw new Error("Informe o nome do cliente.");
    const clean = (v: string) => v.trim() || null;
    const { error } = await getUniversalClient()
      .from("companies")
      .update({
        name,
        trade_name: name,
        legal_name: clean(p.legalName),
        cnpj: clean(p.cnpj.replace(/\D/g, "")),
        segment: p.segment.trim() || "Geral",
        website: clean(p.website),
        phone: clean(p.phone),
        email: clean(p.email),
        city: clean(p.city),
        state: clean(p.state.toUpperCase()),
        updated_at: new Date().toISOString(),
      })
      .eq("id", companyId);
    if (error) {
      const dup = /duplicate key|unique/i.test(error.message);
      throw new Error(dup ? "Já existe outro cliente com esse CNPJ." : `Não foi possível salvar: ${error.message}`);
    }
  }
}

export const clientProfileRepository = new ClientProfileRepository();
