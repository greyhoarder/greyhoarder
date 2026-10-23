import { Routes } from '@angular/router';

export default [
  {
    path: 'hoard',
    title: 'Hoard · Greyhoarder',
    loadComponent: async () => (await import('./features/overview/hoard-layout')).HoardLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'minis' },
      {
        path: 'minis',
        loadComponent: async () => (await import('./features/minis/minis-page')).MinisPage,
      },
      {
        path: 'boxes',
        loadComponent: async () => (await import('./features/boxes/boxes-page')).BoxesPage,
      },
    ],
  },
] satisfies Routes;
