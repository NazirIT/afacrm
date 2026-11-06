import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { ConnexionService } from '../services/connexion/connexion-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const connexionInterceptor: HttpInterceptorFn = (req, next) => {
  const connexionService = inject(ConnexionService);
  const authReq = req.clone({ withCredentials: true });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // Login / refresh / logout : on propage l'erreur, on ne rejoue rien
      if (req.url.includes('/token/')) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        return connexionService.refreshToken().pipe(
          switchMap(() => next(authReq)),
          catchError((refreshError: HttpErrorResponse) => {
            // Pas de seDeconnecter() ici : il appelle /token/logout/ puis redirige
            connexionService.seDeconnecter();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};