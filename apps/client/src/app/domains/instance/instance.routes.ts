import { Routes } from '@angular/router';

export default [
  {
    path: 'general',
    title: 'Settings · Greyhoarder',
    loadComponent: async () => (await import('./features/settings/settings-page')).SettingsPage,
  },
] satisfies Routes;
