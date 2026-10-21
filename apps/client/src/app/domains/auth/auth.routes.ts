import { Routes } from '@angular/router';

export default [
  {
    path: 'login',
    title: 'Sign in · Greyhoarder',
    loadComponent: () => import('./features/login/login-page'),
  },
  {
    path: 'setup',
    title: 'Set up · Greyhoarder',
    loadComponent: async () => (await import('./features/setup/setup-page')).SetupPage,
  },
] satisfies Routes;
