import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environment/environment';
import { Router } from '@angular/router';
import { Utilisateur, UtilisateurInscription } from '../../models/utilisateur';

interface TokenResponse {
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnexionService {
  
  private http = inject(HttpClient);
  private url = `${environment.API_URL}/utilisateurs/`;
  private urlToken = `${environment.API_URL}/token/`;
  private router = inject(Router);
  private httpOptions = { withCredentials: true };
  utilisateur = signal<Utilisateur | null | undefined >(undefined);
  
  creerUtilisateur(utilisateur: UtilisateurInscription): Observable<any> {
    return this.http.post(
      this.url,
      utilisateur,
      this.httpOptions
    );
  }
  seConnecter(identifiants: {
    username: string;
    password: string;
  }): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.url}token/`,
      identifiants,
      // {withCredentials: true}
      this.httpOptions
    ).pipe(
      tap(() => this.utilisateur.set(undefined)) 
    );
  }

  getUser(): Observable<Utilisateur> {
    return this.http.get<Utilisateur>(`${this.url}me/`, this.httpOptions).pipe(
      tap(u => this.utilisateur.set(u))
    );
  }
  
  seDeconnecter(urlRedirect: string = 'login'): void {
    this.utilisateur.set(null);
    this.http.post(`${this.url}token/logout/`, {}, this.httpOptions)
    .subscribe({
      next: () => {
        this.router.navigate([urlRedirect]);
      },
      error: () => {
        this.router.navigate([urlRedirect]);
      }
    });
  }
  refreshToken(): Observable<any> {
    // Le navigateur envoie TOUT SEUL le cookie refresh caché grâce à this.httpOptions !
    return this.http.post<any>(
      `${this.url}token/refresh/`, 
      {}, 
      this.httpOptions
    );
  }

}
