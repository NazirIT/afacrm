import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Utilisateur } from '../../models/utilisateur';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

export interface DashboardStats {
  total_utilisateurs: number;
  total_problemes: number;
  total_reclamations: number;
  total_appels: number;
  reclamations_par_statut: { statut: string; total: number }[];
  reclamations_par_urgence: { urgence: string; total: number }[];
  utilisateurs_par_role: { role: string; total: number }[];
}

@Injectable({
    providedIn: 'root'
})
export class UtilisateurService {

    private http = inject(HttpClient);
    private url = `${environment.API_URL}/utilisateurs/`;

    listeUtilisateurs(filtres?: { role?: string; q?: string }): Observable<Utilisateur[]>{
        let params = new HttpParams();
        if (filtres?.role) {
            params = params.set('role', filtres.role);
        }
        if (filtres?.q) {
            params = params.set('q', filtres.q);
        }
        return this.http.get<Utilisateur[]>(this.url, { params });
    }
    detailUtilisateur(id: number): Observable<Utilisateur>{
        return this.http.get<Utilisateur>(`${this.url}${id}/`);
    }
    creerUtilisateur(utilisateur: Utilisateur): Observable<Utilisateur>{
        return this.http.post<Utilisateur>(this.url, utilisateur);
    }
    modifierUtilisateur(id:number, utilisateur: Utilisateur): Observable<Utilisateur>{
        return this.http.put<Utilisateur>(`${this.url}${id}/`,utilisateur);
    }
    supprimerUtilisateur(id:number): Observable<void>{
        return this.http.delete<void>(`${this.url}${id}/`);
    }
    utilisateurConnecte(): Observable<Utilisateur> {
        return this.http.get<Utilisateur>(
            `${this.url}me/`,
            { withCredentials: true }
        );
    }
    statistiquesGlobales(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${environment.API_URL}/dashboard/stats/`);
    }

}
