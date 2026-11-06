import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  imports: [
  ],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  
  private router = inject(Router);

  seDeconnecter(): void {
    // Supprimer les tokens JWT
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');

    // Rediriger vers la connexion
    this.router.navigate(['/login']);
  }
}
