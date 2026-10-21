import { Routes } from '@angular/router';

export default [
  {
    path: 'login',
    title: 'Sign in · Greyhoarder',
    loadComponent: () => import('./login/login-page'),
  },
] satisfies Routes;
