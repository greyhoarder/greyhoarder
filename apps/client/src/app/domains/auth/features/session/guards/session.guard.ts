import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { CurrentSession } from '../current-session';

/** Lets only signed-in users through and sends everyone else to the login. */
export const signedInGuard: CanActivateChildFn = async () => {
  const router = inject(Router);
  const user = await inject(CurrentSession).refresh();
  return user ? true : router.parseUrl('/login');
};

/** Sends those who are no administrators to the settings they may see. */
export const administratorGuard: CanActivateFn = () =>
  inject(CurrentSession).user()?.role === 'admin' ? true : inject(Router).parseUrl('/settings/general');

/** Keeps signed-in users away from the login; `/` leads them on into the app. */
export const signedOutGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const user = await inject(CurrentSession).refresh();
  return user ? router.parseUrl('/') : true;
};
