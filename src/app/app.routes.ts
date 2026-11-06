import { Routes } from '@angular/router';
import { TableauBord } from './features/components/tableau-bord/tableau-bord';
import { Appels } from './features/components/appel/appels';
import { Client } from './features/components/client/client';
import { Reclamations } from './features/components/reclamation/reclamations';
import { Connexion } from './features/connexion/connexion';
import { MainLayout } from './features/layout/main-layout/main-layout';
import { ConnexionAdmin } from './features-admin/connexion-admin/connexion-admin';
import { DashboardAdmin } from './features-admin/components/dashboard-admin/dashboard-admin';
import { UsersAdmin } from './features-admin/components/users-admin/users-admin';
import { estConnecteGuard } from './core/guards/est-connecte-guard';
import { estAdminGuard } from './core/guards/est-admin-guard';

export const routes: Routes = [
    {
        path: '', 
        redirectTo: 'login', 
        pathMatch: 'full'
    },
    { 
        path: 'login', 
        component: Connexion
    },
    { 
        path: 'admin', 
        component: ConnexionAdmin
    },
    {
        path: '', 
        component: MainLayout,
        canActivate: [estConnecteGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: TableauBord },
            { path: 'appel', component: Appels },
            { path: 'client', component: Client },
            { path: 'reclamation', component: Reclamations },
            // Routes de supervision Administrateur
            { 
                path: 'admin/dashboard', 
                component: DashboardAdmin, 
                canActivate: [estAdminGuard] 
            },
            { 
                path: 'admin/users', 
                component: UsersAdmin, 
                canActivate: [estAdminGuard] 
            }
        ]
    },
    { 
        path: '**',
        redirectTo: 'login'
    }
];
