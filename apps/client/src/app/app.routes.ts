import { Routes } from '@angular/router';
import { setupGuard, signedInGuard } from './domains/auth/api';
import { AppShell } from './shell/app-shell';

export const routes: Routes = [
  {
    path: '',
    // Once per navigation; as a child guard it would ask the server again for every nested route.
    canActivate: [setupGuard],
    runGuardsAndResolvers: 'always',
    children: [
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
    ],
  },
  { path: '**', redirectTo: '' },
];
