import { Routes } from '@angular/router';
import { setupGuard } from './domains/auth/api';

export const routes: Routes = [
  {
    path: '',
    canActivateChild: [setupGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: '', loadChildren: () => import('./domains/auth/auth.routes') },
    ],
  },
  { path: '**', redirectTo: '' },
];
