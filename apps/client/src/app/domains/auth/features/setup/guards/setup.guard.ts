import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { HttpSetupAdapter } from '../../../infrastructure/http-setup-adapter';

/**
 * While no account exists, every address leads to the setup; afterwards the
 * setup leads to the login. Asks the server on every navigation, because
 * someone else may finish the setup in the meantime.
 */
export const setupGuard: CanActivateChildFn = async (_route, state) => {
  const router = inject(Router);
  const required = await inject(HttpSetupAdapter).isSetupRequired();
  const firstSegment = router.parseUrl(state.url).root.children['primary']?.segments[0]?.path;
  const isSetup = firstSegment === 'setup';

  if (required && !isSetup) {
    return router.parseUrl('/setup');
  }
  if (!required && isSetup) {
    return router.parseUrl('/login');
  }
  return true;
};
