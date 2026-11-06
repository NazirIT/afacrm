import { Component, inject } from '@angular/core';
import { ConnexionService } from '../../core/services/connexion/connexion-service';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  selector: 'app-connexion-admin',
  styleUrl: './connexion-admin.css',
  templateUrl: './connexion-admin.html',
})
export class ConnexionAdmin {
  private connexionService = inject(ConnexionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  chargement = false;
  erreur = '';

  connexionForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  seConnecter(): void {
    if (this.connexionForm.invalid) {
      this.connexionForm.markAllAsTouched();
      return;
    }
    this.chargement = true;
    this.erreur = '';

    const identifiants = this.connexionForm.getRawValue();

    this.connexionService.seConnecter({
      username: identifiants.username!,
      password: identifiants.password!
    }).subscribe({
      next: () => {
        // Vérification stricte du rôle Administrateur
        this.connexionService.getUser().subscribe({
          next: (user) => {
            this.chargement = false;
            if (!user || user.role !== 'ADMIN') {
              this.erreur = "Accès refusé : ce compte ne dispose pas des droits d'administration.";
              this.connexionService.seDeconnecter('admin');
              return;
            }
            this.router.navigate(['/admin/dashboard']);
          },
          error: (err) => {
            this.chargement = false;
            this.erreur = "Impossible de vérifier les privilèges de ce compte.";
            this.connexionService.seDeconnecter('admin');
          }
        });
      },
      error: (error) => {
        this.chargement = false;
        this.erreur = "Nom d'utilisateur ou mot de passe incorrect.";
        console.error('Erreur connexion admin:', error);
      }
    });
  }
}
