import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConnexionService } from '../../core/services/connexion/connexion-service';
import { Router } from '@angular/router';
import { UtilisateurInscription } from '../../core/models/utilisateur';

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  selector: 'app-connexion',
  styleUrl: './connexion.css',
  templateUrl: './connexion.html',
})
export class Connexion {

  private fb = inject(FormBuilder);
  private connexionService = inject(ConnexionService);
  private router = inject(Router);
  
  afficherInscription = false;

  chargement = false;
  erreur = '';
  success = '';

  erreurInscris = '';
  successInscris = '';

  connexionForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  inscriptionForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: ['', Validators.required],
  });

  inscrire(): void{
    if (this.inscriptionForm.invalid) {
      this.inscriptionForm.markAllAsTouched();
      return;
    }

    const donnees = this.inscriptionForm.getRawValue();

    if (donnees.password !== donnees.confirmation) {
      this.erreur = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const utilisateur: UtilisateurInscription = {
      username: donnees.username!,
      first_name: donnees.first_name!,
      last_name: donnees.last_name!,
      email: donnees.email!,
      telephone: donnees.telephone!,
      password: donnees.password!
    };

    this.chargement = true;
    this.erreurInscris = '';
    this.successInscris = '';

        this.connexionService.creerUtilisateur(utilisateur).subscribe({
      next: (reponse) => {
        this.chargement = false;
        this.successInscris = 'Utilisateur créé avec succès.';

        console.log('Utilisateur créé :', reponse);
      },
      error: (error) => {
        this.chargement = false;
        this.erreur = 'Erreur lors de la création du compte.';
        console.error(error);
      }
    });
  }

  inscriptionRemplie(): boolean {
    const donnees = this.inscriptionForm.getRawValue();

    return !!(
      donnees.first_name?.trim() &&
      donnees.last_name?.trim() &&
      donnees.username?.trim() &&
      donnees.email?.trim() &&
      donnees.telephone?.trim() &&
      donnees.password &&
      donnees.confirmation
    );
  }
  
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
      next: (reponse) => {
        this.chargement = false;

        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.chargement = false;
        this.erreur = 'Nom d\'utilisateur ou mot de passe incorrect.';
        console.error(error);
      }
    });
  }

  seDeconnecter(): void {
    this.connexionService.seDeconnecter();
  }

}
