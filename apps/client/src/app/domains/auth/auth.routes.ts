import { Routes } from '@angular/router';
import { signedOutGuard } from './features/session/guards/session.guard';
import { setupDoneGuard, setupOpenGuard } from './features/setup/guards/setup.guard';

export default [
  {
    path: 'login',
    title: 'Sign in · Greyhoarder',
    canActivate: [setupDoneGuard, signedOutGuard],
    loadComponent: () => import('./features/login/login-page'),
  },
  {
    path: 'setup',
    title: 'Set up · Greyhoarder',
    canActivate: [setupOpenGuard],
    loadComponent: async () => (await import('./features/setup/setup-page')).SetupPage,
  },
] satisfies Routes;
