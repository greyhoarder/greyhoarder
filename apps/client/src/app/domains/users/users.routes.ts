import type { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: 'setup',
    title: 'Set up · Greyhoarder',
    loadComponent: async () =>
      (await import('./features/setup/setup-page')).SetupPage,
  },
];
