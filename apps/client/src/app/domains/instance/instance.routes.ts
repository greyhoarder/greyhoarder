import { Routes } from '@angular/router';

export default [
  {
    path: 'settings',
    title: 'Settings · Greyhoarder',
    loadComponent: async () => (await import('./features/settings/settings-page')).SettingsPage,
  },
] satisfies Routes;
