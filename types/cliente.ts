/**
 * Definições do Domínio de Cliente e Empresa (Alien OS)
 * Preparado para Supabase PostgreSQL (Tabelas: clients, companies)
 */

import { JourneyStage } from "./timeline";
import { ServicoContratado } from "./servico";

export type HealthStatus = "Excelente" | "Atenção" | "Crítico";

export interface Empresa {
  id: string; // UUID
  legalName: string;
  tradeName: string;
  cnpj?: string;
  segment: string;
  website?: string;
  employeeCount?: number;
  createdAt: string;
}

export interface Cliente {
  id: string; // UUID ou slug amigável
  companyId?: string;
  name: string; // Nome fantasia / marca
  contactPerson: string;
  email: string;
  phone?: string;
  company: string;
  segment: string;
  alienScore: number; // 0 a 100
  journeyStage: JourneyStage;
  healthStatus: HealthStatus;
  entryDate: string;
  lastUpdate: string;
  nextMeeting: string;
  currentRoas: string;
  currentRoi: string;
  generatedRevenue: string;
  primaryObjective: string;
  accountManagerId?: string;
  contractedServices?: ServicoContratado[];
}
