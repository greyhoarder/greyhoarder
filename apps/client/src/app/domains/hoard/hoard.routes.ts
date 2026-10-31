import { Routes } from '@angular/router';

export default [
  {
    path: 'hoard/add/box',
    title: 'Add box · Greyhoarder',
    loadComponent: async () => (await import('./features/add-box/add-box-page')).AddBoxPage,
  },
  {
    path: 'hoard/add/sprues',
    title: 'Add sprues · Greyhoarder',
    data: { areSprues: true },
    loadComponent: async () => (await import('./features/add-box/add-box-page')).AddBoxPage,
  },
  {
    path: 'hoard/add/minis',
    title: 'Add minis · Greyhoarder',
    loadComponent: async () => (await import('./features/add-minis/add-minis-page')).AddMinisPage,
  },
  {
    path: 'hoard/add/custom',
    title: 'Add custom · Greyhoarder',
    loadComponent: async () => (await import('./features/add-custom/add-custom-page')).AddCustomPage,
  },
  {
    path: 'hoard/minis/edit',
    title: 'Edit minis · Greyhoarder',
    loadComponent: async () => (await import('./features/edit-minis/edit-minis-page')).EditMinisPage,
  },
  {
    path: 'hoard/minis/:id',
    title: 'Mini · Greyhoarder',
    loadComponent: async () => (await import('./features/mini-detail/mini-detail-page')).MiniDetailPage,
  },
  {
    path: 'hoard/boxes/:id/edit',
    title: 'Edit box · Greyhoarder',
    loadComponent: async () => (await import('./features/edit-box/edit-box-page')).EditBoxPage,
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
