import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '', loadChildren: () => import('./domains/auth/auth.routes') },
  {
    path: '',
    loadChildren: async () => (await import('./domains/users/users.routes')).usersRoutes,
  },
  { path: '**', redirectTo: '' },
];
