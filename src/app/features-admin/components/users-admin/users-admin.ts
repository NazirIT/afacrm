import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur-service';
import { Utilisateur, Role } from '../../../core/models/utilisateur';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-users-admin',
  styleUrl: './users-admin.css',
  templateUrl: './users-admin.html',
})
export class UsersAdmin implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private router = inject(Router);

  utilisateurs: Utilisateur[] = [];
  chargement = true;
  erreur = '';
  messageSucces = '';
  recherche = '';
  filtreRole: string = 'AGENT';

  // Consultation
  utilisateurSelectionne: Utilisateur | null = null;
  modalDetailsOuvert = false;

  // Création
  modalCreationOuvert = false;
  nouvelAgent = {
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    role: 'AGENT' as Role
  };
  erreurCreation = '';
  enCoursCreation = false;

  // Modification
  modalEditionOuvert = false;
  agentEnEdition = {
    id: 0,
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    role: 'AGENT' as Role
  };
  erreurEdition = '';
  enCoursEdition = false;

  // Suppression
  modalSuppressionOuvert = false;
  agentASupprimer: Utilisateur | null = null;
  enCoursSuppression = false;
  erreurSuppression = '';

  ngOnInit(): void {
    this.utilisateurService.utilisateurConnecte().subscribe({
      next: (user) => {
        if (!user || user.role !== 'ADMIN') {
          this.router.navigate(['/login']);
          return;
        }
        this.chargerUtilisateurs();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  chargerUtilisateurs(): void {
    this.chargement = true;
    this.erreur = '';

    this.utilisateurService.listeUtilisateurs().subscribe({
      next: (donnees) => {
        this.utilisateurs = donnees;
        this.chargement = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        this.erreur = 'Impossible de charger la liste des utilisateurs.';
        this.chargement = false;
      }
    });
  }

  get totalAgents(): number {
    return this.utilisateurs.filter(u => u.role === 'AGENT').length;
  }

  get totalAdmins(): number {
    return this.utilisateurs.filter(u => u.role === 'ADMIN').length;
  }

  get utilisateursFiltres(): Utilisateur[] {
    return this.utilisateurs.filter(u => {
      const matchRole = this.filtreRole === 'TOUS' || u.role === this.filtreRole;
      const q = this.recherche.trim().toLowerCase();
      const matchRecherche = !q || 
        (u.first_name || '').toLowerCase().includes(q) ||
        (u.last_name || '').toLowerCase().includes(q) ||
        (u.username || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.telephone || '').includes(q);

      return matchRole && matchRecherche;
    });
  }

  // --- 1. LECTURE (DETAILS) ---
  ouvrirDetails(u: Utilisateur): void {
    this.utilisateurSelectionne = u;
    this.modalDetailsOuvert = true;
  }

  fermerDetails(): void {
    this.modalDetailsOuvert = false;
    this.utilisateurSelectionne = null;
  }

  // --- 2. CRÉATION (CREATE) ---
  ouvrirCreation(): void {
    this.nouvelAgent = {
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      email: '',
      telephone: '',
      role: 'AGENT'
    };
    this.erreurCreation = '';
    this.modalCreationOuvert = true;
  }

  fermerCreation(): void {
    this.modalCreationOuvert = false;
    this.erreurCreation = '';
  }

  creerAgent(): void {
    if (!this.nouvelAgent.username || !this.nouvelAgent.password || !this.nouvelAgent.first_name || !this.nouvelAgent.last_name) {
      this.erreurCreation = 'Veuillez remplir les champs obligatoires (Identifiant, Mot de passe, Prénom, Nom).';
      return;
    }

    this.enCoursCreation = true;
    this.erreurCreation = '';

    const payload: Utilisateur = {
      username: this.nouvelAgent.username.trim(),
      password: this.nouvelAgent.password,
      first_name: this.nouvelAgent.first_name.trim(),
      last_name: this.nouvelAgent.last_name.trim(),
      email: this.nouvelAgent.email.trim(),
      telephone: this.nouvelAgent.telephone.trim(),
      role: this.nouvelAgent.role
    };

    this.utilisateurService.creerUtilisateur(payload).subscribe({
      next: () => {
        this.enCoursCreation = false;
        this.fermerCreation();
        this.afficherSucces('Agent créé avec succès.');
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('Erreur lors de la création de l agent:', err);
        this.enCoursCreation = false;
        const errData = err?.error;
        if (typeof errData === 'object' && errData !== null) {
          const premiereErreur = Object.values(errData)[0];
          this.erreurCreation = Array.isArray(premiereErreur) ? premiereErreur[0] : String(premiereErreur);
        } else {
          this.erreurCreation = 'Erreur lors de la création du compte agent.';
        }
      }
    });
  }

  // --- 3. MODIFICATION (UPDATE) ---
  ouvrirEdition(u: Utilisateur): void {
    this.agentEnEdition = {
      id: u.id || 0,
      username: u.username,
      password: '',
      first_name: u.first_name,
      last_name: u.last_name,
      email: u.email || '',
      telephone: u.telephone || '',
      role: u.role
    };
    this.erreurEdition = '';
    this.modalEditionOuvert = true;
  }

  fermerEdition(): void {
    this.modalEditionOuvert = false;
    this.erreurEdition = '';
  }

  sauvegarderEdition(): void {
    if (!this.agentEnEdition.username || !this.agentEnEdition.first_name || !this.agentEnEdition.last_name) {
      this.erreurEdition = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }

    this.enCoursEdition = true;
    this.erreurEdition = '';

    const payload: Utilisateur = {
      username: this.agentEnEdition.username.trim(),
      first_name: this.agentEnEdition.first_name.trim(),
      last_name: this.agentEnEdition.last_name.trim(),
      email: this.agentEnEdition.email.trim(),
      telephone: this.agentEnEdition.telephone.trim(),
      role: this.agentEnEdition.role
    };

    if (this.agentEnEdition.password.trim()) {
      payload.password = this.agentEnEdition.password.trim();
    }

    this.utilisateurService.modifierUtilisateur(this.agentEnEdition.id, payload).subscribe({
      next: () => {
        this.enCoursEdition = false;
        this.fermerEdition();
        this.afficherSucces('Informations de l\'agent mises à jour.');
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('Erreur lors de la modification:', err);
        this.enCoursEdition = false;
        const errData = err?.error;
        if (typeof errData === 'object' && errData !== null) {
          const premiereErreur = Object.values(errData)[0];
          this.erreurEdition = Array.isArray(premiereErreur) ? premiereErreur[0] : String(premiereErreur);
        } else {
          this.erreurEdition = 'Impossible de modifier l\'agent.';
        }
      }
    });
  }

  // --- 4. SUPPRESSION (DELETE) ---
  ouvrirSuppression(u: Utilisateur): void {
    this.agentASupprimer = u;
    this.erreurSuppression = '';
    this.modalSuppressionOuvert = true;
  }

  fermerSuppression(): void {
    this.modalSuppressionOuvert = false;
    this.agentASupprimer = null;
    this.erreurSuppression = '';
  }

  executerSuppression(): void {
    if (!this.agentASupprimer?.id) return;

    this.enCoursSuppression = true;
    this.erreurSuppression = '';

    this.utilisateurService.supprimerUtilisateur(this.agentASupprimer.id).subscribe({
      next: () => {
        this.enCoursSuppression = false;
        this.fermerSuppression();
        this.afficherSucces('Agent supprimé ou désactivé avec succès.');
        this.chargerUtilisateurs();
      },
      error: (err) => {
        console.error('Erreur suppression agent:', err);
        this.enCoursSuppression = false;
        this.erreurSuppression = err?.error?.detail || 'Impossible de supprimer cet agent.';
      }
    });
  }

  private afficherSucces(msg: string): void {
    this.messageSucces = msg;
    setTimeout(() => {
      this.messageSucces = '';
    }, 4000);
  }
}
