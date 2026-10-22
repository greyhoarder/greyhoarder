import { Routes } from '@angular/router';

export default [
  {
    path: 'dashboard',
    title: 'Dashboard · Greyhoarder',
    loadComponent: async () => (await import('./features/dashboard/dashboard-page')).DashboardPage,
  },
] satisfies Routes;
