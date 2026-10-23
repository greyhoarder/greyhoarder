import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SetupStatus } from '../setup-status';

/**
 * Sends the login to the setup while no account exists. The signed-in routes need no such
 * check: without an account nobody is signed in, so `signedInGuard` leads them here first.
 */
export const setupDoneGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await inject(SetupStatus).isRequired()) ? router.parseUrl('/setup') : true;
};

/** Keeps the setup open only while no account exists; afterwards it leads to the login. */
export const setupOpenGuard: CanActivateFn = async () => {
  const router = inject(Router);
  return (await inject(SetupStatus).isRequired()) ? true : router.parseUrl('/login');
};
