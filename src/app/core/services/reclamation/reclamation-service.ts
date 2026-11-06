import { inject, Injectable } from '@angular/core';
import { Reclamation } from '../../models/reclamation';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ReclamationService {

    private http = inject(HttpClient);
    private url = `${environment.API_URL}/reclamations/`;

    listeReclamations(filtres?: { agent?: number; statut?: string; urgence?: string }): Observable<Reclamation[]>{
        let params = new HttpParams();
        if (filtres?.agent) {
            params = params.set('agent', filtres.agent.toString());
        }
        if (filtres?.statut) {
            params = params.set('statut', filtres.statut);
        }
        if (filtres?.urgence) {
            params = params.set('urgence', filtres.urgence);
        }
        return this.http.get<Reclamation[]>(this.url, { params });
    }
    detailReclamation(id: number): Observable<Reclamation>{
        return this.http.get<Reclamation>(`${this.url}${id}/`);
    }
    creerReclamation(reclamation: Reclamation): Observable<Reclamation>{
        return this.http.post<Reclamation>(this.url,reclamation);
    }
    modifierReclamation(id:number, reclamation: Reclamation): Observable<Reclamation>{
        return this.http.put<Reclamation>(`${this.url}${id}/`,reclamation);
    }
    mettreAJourReclamation(id: number, donnees: Partial<Reclamation>): Observable<Reclamation> {
        return this.http.patch<Reclamation>(`${this.url}${id}/`, donnees);
    }
    transfererReclamation(id: number, agentId: number, motif: string): Observable<Reclamation> {
        return this.http.post<Reclamation>(`${this.url}${id}/transferer/`, {
            agent_id: agentId,
            motif: motif
        });
    }
    supprimerReclamation(id:number): Observable<void>{
        return this.http.delete<void>(`${this.url}${id}/`);
    }
}
