import { Routes } from '@angular/router';
import { signedInGuard } from './domains/auth/api';
import { AppShell } from './shell/app-shell';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '', loadChildren: () => import('./domains/auth/auth.routes') },
  {
    path: '',
    component: AppShell,
    canActivate: [signedInGuard],
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', loadChildren: () => import('./domains/dashboard/dashboard.routes') },
      { path: '', loadChildren: () => import('./domains/hoard/hoard.routes') },
    ],
  },
  { path: '**', redirectTo: '' },
];
