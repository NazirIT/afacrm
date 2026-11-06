import { inject, Injectable } from '@angular/core';
import { Probleme } from '../../models/probleme';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environment/environment';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProblemeService {
        
    private http = inject(HttpClient);
    private url = `${environment.API_URL}/problemes/`;
    
    listeProblemes(): Observable<Probleme[]>{
        return this.http.get<Probleme[]>(this.url);
    }
    detailProbleme(id: number): Observable<Probleme>{
        return this.http.get<Probleme>(`${this.url}${id}`);
    }
    creerProbleme(probleme: Probleme): Observable<Probleme>{
        return this.http.post<Probleme>(this.url,probleme);
    }
    modifierProbleme(id:number, probleme: Probleme): Observable<Probleme>{
        return this.http.put<Probleme>(`${this.url}${id}`,probleme);
    }
    supprimerProbleme(id:number): Observable<void>{
        return this.http.delete<void>(`${this.url}${id}`);
    }
    
}
