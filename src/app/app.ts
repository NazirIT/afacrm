import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UtilisateurService } from './core/services/utilisateur/utilisateur-service';
import { ProblemeService } from './core/services/probleme/probleme-service';
import { ReclamationService } from './core/services/reclamation/reclamation-service';
import { AppelService } from './core/services/appel/appel-service';
import { Header } from './shared/header/header';
import { Sidebar } from './shared/sidebar/sidebar';
// import { Appels } from './features/components/appel/appels';
// import { Reclamations } from './features/components/reclamation/reclamations';
// import { TableauBord } from './features/components/tableau-bord/tableau-bord';

@Component({
  imports: [
    RouterOutlet
  ],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}