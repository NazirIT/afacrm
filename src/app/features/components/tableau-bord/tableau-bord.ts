import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppelService } from '../../../core/services/appel/appel-service';
import { ReclamationService } from '../../../core/services/reclamation/reclamation-service';
import { Appel } from '../../../core/models/appel';
import { Reclamation } from '../../../core/models/reclamation';

@Component({
  imports: [CommonModule,DatePipe],
  providers: [DatePipe],
  selector: 'app-tableau-bord',
  styleUrl: './tableau-bord.css',
  templateUrl: './tableau-bord.html',
})
export class TableauBord implements OnInit {
  
  private appelService = inject(AppelService);
  private reclamationService = inject(ReclamationService);
  private cdr = inject(ChangeDetectorRef);
  today = new Date();

  appels: Appel[] = [];
  reclamations: Reclamation[] = [];

  chargement = true;
  erreur = '';

  get nombreAppels(): number {
    return this.appels.length;
  }

  get nombreReclamations(): number {
    return this.reclamations.length;
  }

  get reclamationsEnAttente(): number {
    return this.reclamations.filter(
      reclamation => reclamation.statut === 'ouverte'
    ).length;
  }

  get reclamationsEnCours(): number {
    return this.reclamations.filter(
      reclamation => reclamation.statut === 'en_cours'
    ).length;
  }

  get reclamationsResolues(): number {
    return this.reclamations.filter(
      reclamation => reclamation.statut === 'resolue'
    ).length;
  }

  get reclamationsCloturees(): number {
    return this.reclamations.filter(
      reclamation => reclamation.statut === 'cloturee'
    ).length;
  }

  get pourcentageAttente(): number {
    return this.nombreReclamations ? Math.round((this.reclamationsEnAttente / this.nombreReclamations) * 100) : 0;
  }

  get pourcentageEnCours(): number {
    return this.nombreReclamations ? Math.round((this.reclamationsEnCours / this.nombreReclamations) * 100) : 0;
  }

  get pourcentageResolues(): number {
    return this.nombreReclamations ? Math.round((this.reclamationsResolues / this.nombreReclamations) * 100) : 0;
  }

  get pourcentageCloturees(): number {
    return this.nombreReclamations ? Math.round((this.reclamationsCloturees / this.nombreReclamations) * 100) : 0;
  }

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = '';

    let appelsCharges = false;
    let reclamationsCharges = false;

    const verifierChargement = () => {
      if (appelsCharges && reclamationsCharges) {
        this.chargement = false;
        this.cdr.detectChanges();
      }
    };

    this.appelService.listeAppels().subscribe({
      next: (donnees) => {
        this.appels = donnees;
        appelsCharges = true;
        verifierChargement();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des appels', err);
        this.erreur = 'Impossible de charger les appels.';
        appelsCharges = true;
        verifierChargement();
      }
    });

    this.reclamationService.listeReclamations().subscribe({
      next: (donnees) => {
        this.reclamations = donnees;
        reclamationsCharges = true;
        verifierChargement();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réclamations', err);
        this.erreur = this.erreur
          ? this.erreur + ' Impossible de charger les réclamations.'
          : 'Impossible de charger les réclamations.';
        reclamationsCharges = true;
        verifierChargement();
      }
    });
  }
}
