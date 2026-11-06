import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AppelService } from '../../../core/services/appel/appel-service';
import { Appel,Canal } from '../../../core/models/appel';
import { ReclamationService } from '../../../core/services/reclamation/reclamation-service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Reclamation } from '../../../core/models/reclamation';
import { Probleme } from '../../../core/models/probleme';
import { ProblemeService } from '../../../core/services/probleme/probleme-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [
    CommonModule,
    FormsModule
  ],
  selector: 'app-appels',
  styleUrl: './appels.css',
  templateUrl: './appels.html',
})
export class Appels implements OnInit {
  private appelService = inject(AppelService);
  private reclamationService = inject(ReclamationService);
  private problemeService = inject(ProblemeService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  rechercheEnCours = false;
  clientTrouve = false;
  clientIntrouvable = false;

  popupReclamationOuvert = false;
  enregistrementReclamation = false;
  messageReclamation = '';
  erreurReclamation = '';
  
  // Gestion des IDs et des listes pour le croisement des données
  appelEnCoursId: number | null | undefined = null;
  appelEnCoursObjet: Appel | null = null; // Stocke l'appel complet en cours

  reclamations: Reclamation[] = []; 
  problemes: Probleme[] = [];
  appels: Appel[] = [];
  
  nouvelleReclamation: Partial<Reclamation> = {
    description: '',
    date_ouverture: new Date().toISOString(),
    date_limite: null,
    date_resolution: null,
    statut: 'ouverte',
    urgence: 'moyenne',
    probleme: {
      type_probleme: '',
      delai_standard: ''
    }
  };

  appel: Partial<Appel>= {
    nom_client: '',
    prenom_client: '',
    numero_appelant: '',
    canal: 'APPEL_TELEPHONE',
    resume: ''
  };

  chargement = false;
  erreur = '';
  message = '';

  ngOnInit(): void {
    this.problemeService.listeProblemes().subscribe({
      next: (data) => this.problemes = data,
      error: (err) => console.error('Erreur problèmes', err)
    });

    this.chargerReclamations();

    this.appelService.listeAppels().subscribe({
      next: (data) => this.appels = data,
      error: (err) => console.error('Erreur appels', err)
    });

    this.route.queryParams.subscribe(params => {
      if (params['popup'] === 'reclamation') {
        this.ouvrirPopupReclamation();
      }
    });
  }

  chargerReclamations(): void {
    this.reclamationService.listeReclamations().subscribe({
      next: (data) => {
        this.reclamations = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur réclamations', err)
    });
  }

  rechercherClient(numero: string): void {
    this.clientTrouve = false;
    this.clientIntrouvable = false;
    const telephone = numero?.trim();

    if (!telephone || telephone.length < 9) {
      this.appel.nom_client = '';
      this.appel.prenom_client = '';
      return;
    }

    this.rechercheEnCours = true;
    this.appelService.listeAppels().subscribe({
      next: (appels) => {
        const appelTrouve = appels.find((a) => a.numero_appelant === telephone);
        if (appelTrouve) {
          this.appel.nom_client = appelTrouve.nom_client;
          this.appel.prenom_client = appelTrouve.prenom_client;
          this.clientTrouve = true;
        } else {
          this.appel.nom_client = '';
          this.appel.prenom_client = '';
          this.clientIntrouvable = true;
        }
        this.rechercheEnCours = false;
      },
      error: (err) => {
        console.error('Erreur appels', err);
        this.rechercheEnCours = false;
      }
    });
  }

  enregistrerAppel(formulaire: NgForm): void {
    if (formulaire.invalid || this.chargement) return;

    this.erreur = '';
    this.message = '';

    if (!this.appel.nom_client?.trim() || !this.appel.prenom_client?.trim() 
        || !this.appel.numero_appelant?.trim() || !this.appel.resume?.trim()
        || !this.appel.canal?.trim()) {
      this.erreur = "Veuillez remplir tous les champs obligatoires.";
      return;
    }

    this.chargement = true;

    const donnees: Partial<Appel> = {
      nom_client: this.appel.nom_client.trim(),
      prenom_client: this.appel.prenom_client.trim(),
      numero_appelant: this.appel.numero_appelant.trim(),
      date_heure: this.appel.date_heure,
      duree: this.appel.duree || '00:00:00',
      canal: this.appel.canal,
      resume: this.appel.resume.trim(),
    };

    this.appelService.creerAppel(donnees).subscribe({
      next: (reponse: any) => {
        this.message = 'Appel enregistré avec succès.';
        
        this.appelEnCoursId = reponse?.id ?? null;
        this.appelEnCoursObjet = reponse; 

        formulaire.resetForm();
        this.chargement = false;
        this.ouvrirPopupReclamation(); 
      },
      error: (err) => {
        console.error(err);
        this.erreur = "Échec de l'enregistrement de l'appel.";
        this.chargement = false;
        console.log('Détail erreur Django :', err.error);

      }
    });
  }

  ouvrirPopupReclamation() {
    this.popupReclamationOuvert = true;
    this.messageReclamation = '';
    this.erreurReclamation = '';
  }

  fermerPopupReclamation() {
    this.popupReclamationOuvert = false;
  }

  getAppelAssocie(idReclamation: number): Appel | undefined {
    return this.appels.find(appel => {
      const relation = appel.reclamation;
      if (relation === null || relation === undefined) return false;

      const id = typeof relation === 'object' ? relation.id : relation;
      return Number(id) === Number(idReclamation);
    });
  }

  enregistrerReclamation(): void {
    this.messageReclamation = '';
    this.erreurReclamation = '';

    const typeProbleme = this.nouvelleReclamation.probleme?.type_probleme?.trim();
    const description = this.nouvelleReclamation.description?.trim();

    if (!typeProbleme || !description) {
      this.erreurReclamation = 'Veuillez saisir un type de problème et une description';
      return;
    }

    this.enregistrementReclamation = true;

    const donnees: any = {
      probleme: this.nouvelleReclamation.probleme?.id || typeProbleme, 
      description: description,
      urgence: this.nouvelleReclamation.urgence || 'moyenne',
      statut: this.nouvelleReclamation.statut || 'ouverte',
      appel: this.appelEnCoursId 
    };

    this.reclamationService.creerReclamation(donnees).subscribe({
      next: (reclamation: Reclamation) => {
        this.messageReclamation = 'Réclamation réussie avec succès.';
        this.enregistrementReclamation = false;
        
        if (this.appelEnCoursObjet) {
          this.appelEnCoursObjet.reclamation = reclamation;
          this.appels = [this.appelEnCoursObjet, ...this.appels]; 
        }

        this.reclamations = [reclamation, ...this.reclamations];

        this.appelEnCoursId = null;
        this.appelEnCoursObjet = null;
        this.nouvelleReclamation = {
          description: '',
          date_ouverture: new Date().toISOString(),
          date_limite: null,
          date_resolution: null,
          urgence: 'moyenne',
          statut: 'ouverte',
          probleme: { type_probleme: '', delai_standard: '' }
        };

        this.cdr.detectChanges();
        this.fermerPopupReclamation();
      },
      error: (erreur: any) => {
        console.error(erreur);
        this.erreurReclamation = "Impossible d'enregistrer la réclamation.";
        this.enregistrementReclamation = false;
      }
    });
  }
}
