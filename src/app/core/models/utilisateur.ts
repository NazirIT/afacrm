export type Role = 'ADMIN' | 'AGENT' | 'SUPERVISEUR';

export interface Utilisateur {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  role: Role;
  password?: string;
  is_active?: boolean;
}

export interface UtilisateurInscription {
  id?: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  telephone: string;
  password: string;
}
