import { Appel } from "./appel";
import { Probleme } from "./probleme";
import { Utilisateur } from "./utilisateur";

export type Statut = 'ouverte' | 'en_cours' | 'resolue' | 'cloturee';
export type Urgence = 'faible' | 'moyenne' | 'haute' | 'critique';

export interface Reclamation {
  id?: number;
  description: string;
  date_ouverture: string;
  date_limite: string | null;
  date_resolution: string | null;
  statut: Statut;
  urgence: Urgence;
  agent: Utilisateur | null;
  probleme: Probleme ;
  appel: Partial<Appel>
}