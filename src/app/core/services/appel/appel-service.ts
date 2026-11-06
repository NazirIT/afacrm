import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Appel } from '../../models/appel';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AppelService {
   
    private http = inject(HttpClient);
    private url = `${environment.API_URL}/appels/`;

    listeAppels(filtres?: { agent?: number; q?: string }): Observable<Appel[]>{
        let params = new HttpParams();
        if (filtres?.agent) {
            params = params.set('agent', filtres.agent.toString());
        }
        if (filtres?.q) {
            params = params.set('q', filtres.q);
        }
        return this.http.get<Appel[]>(this.url, { params });
    }
    detailAppel(id: number): Observable<Appel>{
        return this.http.get<Appel>(`${this.url}${id}/`);
    }
    creerAppel(appel: Partial<Appel>): Observable<Appel>{
        return this.http.post<Appel>(this.url, appel);
    }
    modifierAppel(id: number, appel: Appel): Observable<Appel>{
        return this.http.put<Appel>(`${this.url}${id}/`,appel);
    }
    supprimerAppel(id: number): Observable<void>{
        return this.http.delete<void>(`${this.url}${id}/`);
    }

}
