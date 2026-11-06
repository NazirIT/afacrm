import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AppelService } from '../../../core/services/appel/appel-service';
import { ReclamationService } from '../../../core/services/reclamation/reclamation-service';
import { Appel } from '../../../core/models/appel';
import { Reclamation, Statut, Urgence } from '../../../core/models/reclamation';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  imports: [CommonModule, FormsModule, RouterLink],
  selector: 'app-client',
  standalone: true,
  styleUrl: './client.css',
  templateUrl: './client.html',
})
export class Client implements OnInit {
  private appelService = inject(AppelService);
  private reclamationService = inject(ReclamationService);
  private cdr = inject(ChangeDetectorRef);

  appels: Appel[] = [];
  reclamations: Reclamation[] = [];
  chargement = false;
  erreur = '';

  // Recherche dans la liste des clients
  recherche = '';
  messageRecherche = '';
  clientsRecherches: Appel[] = [];

  // Détails & Modification client / réclamation
  clientSelectionne: Appel | null = null;
  reclamationEnCours: Reclamation | null = null;
  statutSelectionne: Statut = 'ouverte';
  prioriteSelectionnee: Urgence = 'moyenne';
  popupDetailsOuvert = false;
  sauvegardeEnCours = false;
  messageSucces = '';
  erreurModification = '';

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = '';

    this.appelService.listeAppels().subscribe({
      next: (data) => {
        this.appels = data;
        this.chargement = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur appels', err);
        this.erreur = 'Impossible de charger la liste des clients.';
        this.chargement = false;
        this.cdr.detectChanges();
      }
    });

    this.reclamationService.listeReclamations().subscribe({
      next: (recs) => {
        this.reclamations = recs;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur réclamations', err)
    });
  }

  get clients(): Appel[] {
    const parNumero = new Map<string, Appel>();

    for (const a of this.appels) {
      const telephone = a.numero_appelant?.trim();
      if (!telephone) continue;

      if (!parNumero.has(telephone)) {
        parNumero.set(telephone, a);
      }
    }
    return [...parNumero.values()];
  }

  nombreClients(): number {
    return this.clients.length;
  }

  rechercherClients(valeur: string): void {
    this.recherche = (valeur ?? '').trim();
    const terme = this.recherche.toLowerCase();
    this.messageRecherche = '';

    if (!terme) {
      this.clientsRecherches = [];
      return;
    }

    this.clientsRecherches = this.clients.filter(c =>
      (c.nom_client ?? '').toLowerCase().includes(terme) ||
      (c.prenom_client ?? '').toLowerCase().includes(terme) ||
      (c.numero_appelant ?? '').includes(terme) ||
      (c.resume ?? '').toLowerCase().includes(terme)
    );

    this.messageRecherche = this.clientsRecherches.length > 0
      ? `${this.clientsRecherches.length} client(s) trouvé(s).`
      : 'Aucun client trouvé.';

    this.cdr.detectChanges();
  }

  getReclamationClient(client: Appel): Reclamation | undefined {
    return this.reclamations.find(r => {
      if (r.appel && typeof r.appel === 'object') {
        return r.appel.numero_appelant === client.numero_appelant || r.appel.id === client.id;
      }
      return r.appel === client.id;
    });
  }

  ouvrirDetails(client: Appel): void {
    this.clientSelectionne = client;
    this.messageSucces = '';
    this.erreurModification = '';

    const rec = this.getReclamationClient(client);
    if (rec) {
      this.reclamationEnCours = { ...rec };
      this.statutSelectionne = rec.statut;
      this.prioriteSelectionnee = rec.urgence;
    } else {
      this.reclamationEnCours = null;
    }

    this.popupDetailsOuvert = true;
  }

  fermerDetails(): void {
    this.popupDetailsOuvert = false;
    this.clientSelectionne = null;
    this.reclamationEnCours = null;
    this.messageSucces = '';
    this.erreurModification = '';
  }

  enregistrerModifications(): void {
    if (!this.reclamationEnCours || !this.reclamationEnCours.id) {
      return;
    }

    this.sauvegardeEnCours = true;
    this.messageSucces = '';
    this.erreurModification = '';

    this.reclamationService.mettreAJourReclamation(this.reclamationEnCours.id, {
      statut: this.statutSelectionne,
      urgence: this.prioriteSelectionnee
    }).subscribe({
      next: (reclamationMaj) => {
        this.sauvegardeEnCours = false;
        this.messageSucces = 'Statut et priorité mis à jour avec succès !';
        this.reclamationEnCours = { ...reclamationMaj };

        // Mettre à jour dans la liste locale des réclamations
        const index = this.reclamations.findIndex(r => r.id === reclamationMaj.id);
        if (index !== -1) {
          this.reclamations[index] = reclamationMaj;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur mise à jour réclamation', err);
        this.erreurModification = 'Échec de la mise à jour.';
        this.sauvegardeEnCours = false;
        this.cdr.detectChanges();
      }
    });
  }
}
