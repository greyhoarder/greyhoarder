import { Routes } from '@angular/router';

export default [
  {
    path: 'hoard/add/box',
    title: 'Add box · Greyhoarder',
    loadComponent: async () => (await import('./features/add-box/add-box-page')).AddBoxPage,
  },
  {
    path: 'hoard/minis/:id',
    title: 'Mini · Greyhoarder',
    loadComponent: async () => (await import('./features/mini-detail/mini-detail-page')).MiniDetailPage,
  },
  {
    path: 'hoard/boxes/:id',
    title: 'Box · Greyhoarder',
    loadComponent: async () => (await import('./features/box-detail/box-detail-page')).BoxDetailPage,
  },
  {
    path: 'hoard',
    title: 'Hoard · Greyhoarder',
    loadComponent: async () => (await import('./features/overview/hoard-layout')).HoardLayout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'minis' },
      {
        path: 'minis',
        loadComponent: async () => (await import('./features/mini-list/mini-list-page')).MiniListPage,
      },
      {
        path: 'boxes',
        loadComponent: async () => (await import('./features/box-list/box-list-page')).BoxListPage,
      },
    ],
  },
] satisfies Routes;
