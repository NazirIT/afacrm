import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConnexionService } from '../services/connexion/connexion-service';
import { catchError, map, of } from 'rxjs';

export const estConnecteGuard: CanActivateFn = (route, state) => {
  
  const connexionService = inject(ConnexionService);
  const router = inject(Router);
  const versLogin = router.createUrlTree(['/login']);

  if(connexionService.utilisateur()===undefined){
    return connexionService.getUser().pipe(
      map(() => true),
      catchError(() => {
        connexionService.utilisateur.set(null);
        return of(versLogin);
      })
    )
  }

  return connexionService.utilisateur() ? true : versLogin;
};
