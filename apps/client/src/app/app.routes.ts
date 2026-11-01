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
      { path: '', loadChildren: async () => (await import('./domains/auth/auth.routes')).profileRoutes },
      {
        path: 'settings',
        loadComponent: async () => (await import('./shell/settings/settings-layout')).SettingsLayout,
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'general' },
          { path: '', loadChildren: () => import('./domains/instance/instance.routes') },
          { path: '', loadChildren: async () => (await import('./domains/auth/auth.routes')).usersRoutes },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
