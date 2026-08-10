/**
 * Definições dos Serviços Contratados (Alien OS)
 * Tabela Supabase: services / client_services
 */

export type ServiceCategory =
  | "Gestão de Tráfego"
  | "Social Media"
  | "Branding"
  | "Sites"
  | "Google Meu Negócio"
  | "Fotografia e Vídeo"
  | "Automações";

export type ServiceStatus = "Ativo" | "Em Produção" | "Pausado" | "Otimizando";

export interface Servico {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  basePrice?: number;
}

export interface ServicoContratado {
  id: string;
  clientId?: string;
  serviceId?: string;
  name: string;
  category: ServiceCategory;
  status: ServiceStatus;
  assignee: string;
  lastResults: string;
  nextAction: string;
  aiRecommendation: string;
  monthlyFee?: number;
  startDate?: string;
}
