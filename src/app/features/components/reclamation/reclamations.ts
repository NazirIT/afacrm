import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Reclamation } from '../../../core/models/reclamation';
import { ReclamationService } from '../../../core/services/reclamation/reclamation-service';
import { UtilisateurService } from '../../../core/services/utilisateur/utilisateur-service';
import { Utilisateur } from '../../../core/models/utilisateur';
import { Appel } from '../../../core/models/appel';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  imports: [
    CommonModule,
    FormsModule,
    DatePipe
  ],
  selector: 'app-reclamations',
  styleUrl: './reclamations.css',
  templateUrl: './reclamations.html',
})
export class Reclamations implements OnInit {

  private reclamationService = inject(ReclamationService);
  private utilisateurService = inject(UtilisateurService);
  private cdr = inject(ChangeDetectorRef);

  reclamations: Reclamation[] = [];
  chargement = true;
  erreur = '';
  recherche = '';
  filtreActif = 'toutes';
  reclamationsRecherchees: Reclamation[] = [];
  messageRecherche = '';

  // Détails réclamation
  reclamationSelectionnee: Reclamation | null = null;
  popupDetailsOuvert = false;

  // Transfert à un autre agent
  popupTransfertOuvert = false;
  reclamationATransferer: Reclamation | null = null;
  agentCibleId: number | null = null;
  motifTransfert = '';
  transfertEnCours = false;
  erreurTransfert = '';
  succesTransfert = '';

  agentsDisponibles: Utilisateur[] = [];
  utilisateurConnecte: Utilisateur | null = null;
  
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

  changerFiltre(filtre: string) {
    this.filtreActif = filtre;
  }

  get reclamationsFiltrees(): Reclamation[] {
    switch (this.filtreActif) {
      case 'attente':
        return this.reclamations.filter(r => r.statut === 'ouverte');
      case 'cours':
        return this.reclamations.filter(r => r.statut === 'en_cours');
      case 'resolues':
        return this.reclamations.filter(r => r.statut === 'resolue');
      case 'cloturees':
        return this.reclamations.filter(r => r.statut === 'cloturee');
      default:
        return this.reclamations;
    }
  }

  get agentsEligibles(): Utilisateur[] {
    const agentActuelId = this.reclamationATransferer?.agent?.id;
    return this.agentsDisponibles.filter(a => a.id !== agentActuelId);
  }

  getAppel(reclamation: Reclamation): Partial<Appel> | null {
    if (reclamation.appel && typeof reclamation.appel === 'object') {
      return reclamation.appel as Partial<Appel>;
    }
    return null;
  }
  
  rechercherReclamations(terme: string): void {
    this.recherche = (terme ?? '').trim().toLowerCase();
    this.messageRecherche = '';

    if (!this.recherche) {
      this.reclamationsRecherchees = [];
      return;
    }

    this.messageRecherche = 'Recherche en cours...';

    this.reclamationsRecherchees = this.reclamations.filter(reclamation => {
      const appel = this.getAppel(reclamation);
      const prob = reclamation.probleme?.type_probleme ?? '';
      const desc = reclamation.description ?? '';
      const ref = `rec-${reclamation.id}`;

      return (appel?.nom_client ?? '').toLowerCase().includes(this.recherche)
        || (appel?.prenom_client ?? '').toLowerCase().includes(this.recherche)
        || (appel?.numero_appelant ?? '').includes(this.recherche)
        || prob.toLowerCase().includes(this.recherche)
        || desc.toLowerCase().includes(this.recherche)
        || ref.includes(this.recherche);
    });

    this.messageRecherche = this.reclamationsRecherchees.length > 0
      ? `${this.reclamationsRecherchees.length} réclamation(s) trouvée(s).`
      : 'Aucune réclamation correspondante.';

    this.cdr.detectChanges();
  }

  ngOnInit(): void {
    this.chargerDonnees();
    this.chargerAgents();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = '';
    
    this.reclamationService.listeReclamations().subscribe({
      next: (donnees) => {
        this.reclamations = donnees;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réclamations', err);
        this.erreur = 'Impossible de charger les réclamations.';
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerAgents(): void {
    this.utilisateurService.utilisateurConnecte().subscribe({
      next: (user) => {
        this.utilisateurConnecte = user;
      },
      error: () => {}
    });

    this.utilisateurService.listeUtilisateurs({ role: 'AGENT' }).subscribe({
      next: (agents) => {
        this.agentsDisponibles = agents;
      },
      error: (err) => {
        console.error('Impossible de charger la liste des agents', err);
      }
    });
  }

  ouvrirDetails(reclamation: Reclamation): void {
    this.reclamationSelectionnee = reclamation;
    this.popupDetailsOuvert = true;
  }

  fermerDetails(): void {
    this.popupDetailsOuvert = false;
    this.reclamationSelectionnee = null;
  }

  ouvrirTransfert(reclamation: Reclamation): void {
    this.reclamationATransferer = reclamation;
    this.agentCibleId = null;
    this.motifTransfert = '';
    this.erreurTransfert = '';
    this.succesTransfert = '';
    this.popupTransfertOuvert = true;
  }

  fermerTransfert(): void {
    this.popupTransfertOuvert = false;
    this.reclamationATransferer = null;
    this.agentCibleId = null;
    this.motifTransfert = '';
    this.erreurTransfert = '';
  }

  confirmerTransfert(): void {
    if (!this.reclamationATransferer?.id || !this.agentCibleId) {
      this.erreurTransfert = 'Veuillez sélectionner un agent cible plus compétent.';
      return;
    }

    this.transfertEnCours = true;
    this.erreurTransfert = '';

    this.reclamationService.transfererReclamation(
      this.reclamationATransferer.id,
      this.agentCibleId,
      this.motifTransfert
    ).subscribe({
      next: () => {
        this.transfertEnCours = false;
        this.succesTransfert = 'Réclamation transférée avec succès !';
        setTimeout(() => {
          this.fermerTransfert();
          this.chargerDonnees();
        }, 1200);
      },
      error: (err) => {
        console.error('Erreur lors du transfert:', err);
        this.transfertEnCours = false;
        this.erreurTransfert = err?.error?.detail || 'Impossible de transférer la réclamation.';
      }
    });
  }

  modifierDetails(reclamation: Reclamation): void {
    // Réservé pour édition rapide
  }

  supprimerDetails(reclamation: Reclamation): void {
    // Réservé pour suppression
  }
}
