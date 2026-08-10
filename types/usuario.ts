/**
 * Definições do Domínio de Usuários e Autenticação (Alien OS)
 * Preparado para integração nativa com o Supabase Auth (auth.users)
 */

export type UserRole = "admin" | "growth_leader" | "media_manager" | "cs_manager" | "client_user";

export interface Usuario {
  id: string; // UUID v4
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends Usuario {
  phone?: string;
  preferences?: {
    notificationsEnabled: boolean;
    theme: "light" | "dark" | "system";
  };
}
