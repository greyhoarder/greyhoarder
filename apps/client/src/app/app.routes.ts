import { Routes } from '@angular/router';
import { setupGuard, signedInGuard } from './domains/auth/api';
import { AppShell } from './shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [setupGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: '', loadChildren: () => import('./domains/auth/auth.routes') },
      {
        path: '',
        component: AppShell,
        canActivateChild: [signedInGuard],
        children: [{ path: '', loadChildren: () => import('./domains/dashboard/dashboard.routes') }],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
