import { Routes } from '@angular/router';
import { signedOutGuard } from './features/session/guards/session.guard';

export default [
  {
    path: 'login',
    title: 'Sign in · Greyhoarder',
    canActivate: [signedOutGuard],
    loadComponent: () => import('./features/login/login-page'),
  },
  {
    path: 'setup',
    title: 'Set up · Greyhoarder',
    loadComponent: async () => (await import('./features/setup/setup-page')).SetupPage,
  },
] satisfies Routes;
