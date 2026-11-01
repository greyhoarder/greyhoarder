import { Routes } from '@angular/router';
import { administratorGuard, signedOutGuard } from './features/session/guards/session.guard';
import { setupDoneGuard, setupOpenGuard } from './features/setup/guards/setup.guard';

export default [
  {
    path: 'login',
    title: 'Sign in · Greyhoarder',
    canActivate: [setupDoneGuard, signedOutGuard],
    loadComponent: async () => (await import('./features/login/login-page')).LoginPage,
  },
  {
    path: 'setup',
    title: 'Set up · Greyhoarder',
    canActivate: [setupOpenGuard],
    loadComponent: async () => (await import('./features/setup/setup-page')).SetupPage,
  },
] satisfies Routes;

/** The accounts of the instance, inside the settings. */
export const usersRoutes = [
  {
    path: 'users',
    canActivate: [administratorGuard],
    title: 'Users · Greyhoarder',
    loadComponent: async () => (await import('./features/users/users-page')).UsersPage,
  },
  {
    path: 'users/add',
    canActivate: [administratorGuard],
    title: 'Add user · Greyhoarder',
    loadComponent: async () => (await import('./features/users/add-user-page')).AddUserPage,
  },
] satisfies Routes;

/** The pages of the signed-in user, inside the shell. */
export const profileRoutes = [
  {
    path: 'profile',
    title: 'Profile · Greyhoarder',
    loadComponent: async () => (await import('./features/session/profile/profile-page')).ProfilePage,
  },
  {
    path: 'profile/password',
    title: 'Change password · Greyhoarder',
    loadComponent: async () => (await import('./features/session/profile/change-password-page')).ChangePasswordPage,
  },
] satisfies Routes;
