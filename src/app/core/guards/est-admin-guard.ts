import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ConnexionService } from '../services/connexion/connexion-service';
import { catchError, map, of } from 'rxjs';

export const estAdminGuard: CanActivateFn = (route, state) => {
  const connexionService = inject(ConnexionService);
  const router = inject(Router);
  const versLogin = router.createUrlTree(['/login']);

  const verifierRoleAdmin = (user: any) => {
    if (user && user.role === 'ADMIN') {
      return true;
    }
    // Redirige vers la page de connexion agent
    return versLogin;
  };

  const userActuel = connexionService.utilisateur();

  if (userActuel === undefined) {
    return connexionService.getUser().pipe(
      map((utilisateur) => verifierRoleAdmin(utilisateur)),
      catchError(() => {
        connexionService.utilisateur.set(null);
        return of(versLogin);
      })
    );
  }

  return verifierRoleAdmin(userActuel);
};
