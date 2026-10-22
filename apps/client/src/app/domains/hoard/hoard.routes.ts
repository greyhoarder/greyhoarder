import { Routes } from '@angular/router';

export default [
  {
    path: 'hoard',
    title: 'Hoard · Greyhoarder',
    loadComponent: async () => (await import('./features/overview/hoard-page')).HoardPage,
  },
] satisfies Routes;
