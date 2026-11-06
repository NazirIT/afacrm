import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { UtilisateurService } from '../../core/services/utilisateur/utilisateur-service';
import { ConnexionService } from '../../core/services/connexion/connexion-service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive
  ],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
  host: {
    '[class.collapsed]': 'isCollapsed'
  }
})
export class Sidebar implements OnInit {
  isCollapsed: boolean = false;
  utilisateurConnecte: any = null;
  private authService = inject(UtilisateurService);
  private connexionService = inject(ConnexionService);
  private router = inject(Router);

  get estAdmin(): boolean {
    const role = this.utilisateurConnecte?.role || this.connexionService.utilisateur()?.role;
    return role === 'ADMIN';
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  confirmerDeconnexion(): void {
    const confirmation = confirm('Voulez-vous vraiment vous déconnecter ?');
    if (confirmation) {
      const redirectUrl = this.estAdmin ? 'admin' : 'login';
      this.connexionService.seDeconnecter(redirectUrl);
    }
  }

  ngOnInit(): void {
    this.authService.utilisateurConnecte().subscribe({
      next: (utilisateur) => {
        this.utilisateurConnecte = utilisateur;
        this.connexionService.utilisateur.set(utilisateur);
      },
      error: (erreur) => {
        console.error("Erreur de recuperation du profil", erreur);
      }
    });
  }
}
