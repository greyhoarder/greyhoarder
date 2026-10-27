import { Routes } from '@angular/router';
import { signedInGuard } from './domains/auth/api';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '', loadChildren: () => import('./domains/auth/auth.routes') },
  {
    path: '',
    loadComponent: async () => (await import('./shell/app-shell')).AppShell,
    canActivate: [signedInGuard],
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', loadChildren: () => import('./domains/dashboard/dashboard.routes') },
      { path: '', loadChildren: () => import('./domains/hoard/hoard.routes') },
    ],
  },
  { path: '**', redirectTo: '' },
];
