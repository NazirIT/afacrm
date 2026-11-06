import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from '../../../shared/header/header';
import { Sidebar } from '../../../shared/sidebar/sidebar';

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    Header,
    Sidebar
  ],
  selector: 'app-main-layout',
  styleUrl: './main-layout.css',
  templateUrl: './main-layout.html',
})
export class MainLayout {}
