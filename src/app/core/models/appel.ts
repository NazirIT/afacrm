import { Reclamation } from "./reclamation";
import { Utilisateur } from "./utilisateur";

export type Canal = 'APPEL_TELEPHONE' | 'WHATSAPP' | 'EMAIL' | 'ORAL';

export interface Appel {
  reclamation: Reclamation;
  id?: number; 
  nom_client: string;
  prenom_client: string;
  numero_appelant: string;
  date_heure?: Date;
  duree: string; // "HH:MM:SS"
  resume: string;
  canal: Canal;
  agent: Utilisateur;
}