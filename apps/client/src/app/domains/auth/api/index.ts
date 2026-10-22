/** Sends every navigation to the setup while the instance has no account yet. */
export { setupGuard } from '../features/setup/guards/setup.guard';
/** Lets only signed-in users into the routes below it. */
export { signedInGuard } from '../features/session/guards/session.guard';
/** The signed-in user, set by `signedInGuard`, and signing out. */
export { CurrentSession } from '../features/session/current-session';
