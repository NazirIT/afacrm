import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UtilisateurService, DashboardStats } from '../../../core/services/utilisateur/utilisateur-service';
import { AppelService } from '../../../core/services/appel/appel-service';
import { ReclamationService } from '../../../core/services/reclamation/reclamation-service';
import { Utilisateur } from '../../../core/models/utilisateur';
import { Appel } from '../../../core/models/appel';
import { Reclamation } from '../../../core/models/reclamation';

export interface PerformanceAgent {
  agent: Utilisateur;
  totalAppels: number;
  totalReclamations: number;
  reclamationsEnAttente: number;
  reclamationsEnCours: number;
  reclamationsResolues: number;
  reclamationsCloturees: number;
  tauxResolution: number;
  dernierAppelDate?: Date | string | null;
  dernierClientNom?: string;
  dernierAppelResume?: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  providers: [DatePipe],
  selector: 'app-dashboard-admin',
  styleUrl: './dashboard-admin.css',
  templateUrl: './dashboard-admin.html',
})
export class DashboardAdmin implements OnInit {
  private utilisateurService = inject(UtilisateurService);
  private appelService = inject(AppelService);
  private reclamationService = inject(ReclamationService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);

  today = new Date();
  chargement = true;
  erreur = '';

  agents: Utilisateur[] = [];
  appels: Appel[] = [];
  reclamations: Reclamation[] = [];
  statsBackend: DashboardStats | null = null;

  // Filtres
  agentFiltreId: number | 'all' = 'all';
  rechercheAgent: string = '';
  ongletActif: 'tous' | 'appels' | 'reclamations' = 'tous';

  // Agent sélectionné pour voir le détail modal
  agentDetails: PerformanceAgent | null = null;
  modalDetailsOuvert = false;

  ngOnInit(): void {
    this.utilisateurService.utilisateurConnecte().subscribe({
      next: (user) => {
        if (!user || user.role !== 'ADMIN') {
          this.router.navigate(['/login']);
          return;
        }
        this.chargerDonnees();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  chargerDonnees(): void {
    this.chargement = true;
    this.erreur = '';

    let agentsOk = false;
    let appelsOk = false;
    let reclamationsOk = false;

    const verifierFin = () => {
      if (agentsOk && appelsOk && reclamationsOk) {
        this.chargement = false;
        this.cdr.detectChanges();
      }
    };

    // 1. Agents
    this.utilisateurService.listeUtilisateurs({ role: 'AGENT' }).subscribe({
      next: (donnees) => {
        this.agents = donnees;
        agentsOk = true;
        verifierFin();
      },
      error: (err) => {
        console.error('Erreur chargement agents:', err);
        // Si filtre role échoue, charger tous les utilisateurs et filtrer
        this.utilisateurService.listeUtilisateurs().subscribe({
          next: (tous) => {
            this.agents = tous.filter(u => u.role === 'AGENT');
            agentsOk = true;
            verifierFin();
          },
          error: (e) => {
            this.erreur = 'Impossible de charger la liste des agents.';
            agentsOk = true;
            verifierFin();
          }
        });
      }
    });

    // 2. Appels
    this.appelService.listeAppels().subscribe({
      next: (donnees) => {
        this.appels = donnees;
        appelsOk = true;
        verifierFin();
      },
      error: (err) => {
        console.error('Erreur chargement appels:', err);
        this.erreur = 'Impossible de charger les appels.';
        appelsOk = true;
        verifierFin();
      }
    });

    // 3. Réclamations
    this.reclamationService.listeReclamations().subscribe({
      next: (donnees) => {
        this.reclamations = donnees;
        reclamationsOk = true;
        verifierFin();
      },
      error: (err) => {
        console.error('Erreur chargement réclamations:', err);
        this.erreur = (this.erreur ? this.erreur + ' ' : '') + 'Impossible de charger les réclamations.';
        reclamationsOk = true;
        verifierFin();
      }
    });

    // 4. Statistiques globales (en tâche de fond)
    this.utilisateurService.statistiquesGlobales().subscribe({
      next: (stats) => {
        this.statsBackend = stats;
      },
      error: () => {}
    });
  }

  // Calcul du tableau comparatif des agents
  get performancesAgents(): PerformanceAgent[] {
    return this.agents.map((agent) => {
      const appelsAgent = this.appels.filter(a => a.agent && a.agent.id === agent.id);
      const recsAgent = this.reclamations.filter(r => r.agent && r.agent.id === agent.id);

      const enAttente = recsAgent.filter(r => r.statut === 'ouverte').length;
      const enCours = recsAgent.filter(r => r.statut === 'en_cours').length;
      const resolues = recsAgent.filter(r => r.statut === 'resolue').length;
      const cloturees = recsAgent.filter(r => r.statut === 'cloturee').length;
      const totalRecs = recsAgent.length;
      const taux = totalRecs ? Math.round(((resolues + cloturees) / totalRecs) * 100) : 0;

      const dernierAppel = appelsAgent.length > 0 ? appelsAgent[0] : null;

      return {
        agent,
        totalAppels: appelsAgent.length,
        totalReclamations: totalRecs,
        reclamationsEnAttente: enAttente,
        reclamationsEnCours: enCours,
        reclamationsResolues: resolues,
        reclamationsCloturees: cloturees,
        tauxResolution: taux,
        dernierAppelDate: dernierAppel?.date_heure || null,
        dernierClientNom: dernierAppel ? `${dernierAppel.prenom_client} ${dernierAppel.nom_client}`.trim() : undefined,
        dernierAppelResume: dernierAppel?.resume || undefined
      };
    });
  }

  // Filtrage par nom/prénom/username d'agent
  get agentsFiltres(): PerformanceAgent[] {
    const query = this.rechercheAgent.trim().toLowerCase();
    if (!query) {
      return this.performancesAgents;
    }
    return this.performancesAgents.filter(p => {
      const nomComplet = `${p.agent.first_name} ${p.agent.last_name} ${p.agent.username} ${p.agent.email}`.toLowerCase();
      return nomComplet.includes(query);
    });
  }

  // Appels filtrés selon l'agent sélectionné
  get appelsAffiches(): Appel[] {
    if (this.agentFiltreId === 'all') {
      return this.appels;
    }
    const id = Number(this.agentFiltreId);
    return this.appels.filter(a => a.agent && a.agent.id === id);
  }

  // Réclamations filtrées selon l'agent sélectionné
  get reclamationsAffichees(): Reclamation[] {
    if (this.agentFiltreId === 'all') {
      return this.reclamations;
    }
    const id = Number(this.agentFiltreId);
    return this.reclamations.filter(r => r.agent && r.agent.id === id);
  }

  // Métriques globales ou filtrées
  get totalAppelsActifs(): number {
    return this.appelsAffiches.length;
  }

  get totalReclamationsActives(): number {
    return this.reclamationsAffichees.length;
  }

  get totalEnAttente(): number {
    return this.reclamationsAffichees.filter(r => r.statut === 'ouverte').length;
  }

  get totalEnCours(): number {
    return this.reclamationsAffichees.filter(r => r.statut === 'en_cours').length;
  }

  get totalResolues(): number {
    return this.reclamationsAffichees.filter(r => r.statut === 'resolue').length;
  }

  get totalCloturees(): number {
    return this.reclamationsAffichees.filter(r => r.statut === 'cloturee').length;
  }

  get pourcentageGlobalResolution(): number {
    if (!this.totalReclamationsActives) return 0;
    return Math.round(((this.totalResolues + this.totalCloturees) / this.totalReclamationsActives) * 100);
  }

  get pourcentageAttente(): number {
    if (!this.totalReclamationsActives) return 0;
    return Math.round((this.totalEnAttente / this.totalReclamationsActives) * 100);
  }

  get pourcentageEnCours(): number {
    if (!this.totalReclamationsActives) return 0;
    return Math.round((this.totalEnCours / this.totalReclamationsActives) * 100);
  }

  get pourcentageResolues(): number {
    if (!this.totalReclamationsActives) return 0;
    return Math.round((this.totalResolues / this.totalReclamationsActives) * 100);
  }

  get pourcentageCloturees(): number {
    if (!this.totalReclamationsActives) return 0;
    return Math.round((this.totalCloturees / this.totalReclamationsActives) * 100);
  }

  // Nom de l'agent actuellement filtré
  get nomAgentFiltre(): string {
    if (this.agentFiltreId === 'all') {
      return 'Tous les agents';
    }
    const agentTrouve = this.agents.find(a => a.id === Number(this.agentFiltreId));
    return agentTrouve ? `${agentTrouve.first_name} ${agentTrouve.last_name}` : 'Agent sélectionné';
  }

  selectionnerAgent(agentId: number | 'all'): void {
    this.agentFiltreId = agentId;
  }

  ouvrirDetailsAgent(perf: PerformanceAgent): void {
    this.agentDetails = perf;
    this.modalDetailsOuvert = true;
  }

  fermerDetailsAgent(): void {
    this.modalDetailsOuvert = false;
    this.agentDetails = null;
  }
}
